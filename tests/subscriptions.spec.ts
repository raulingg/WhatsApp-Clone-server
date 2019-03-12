import { ApolloServer, gql } from "apollo-server";
import typeDefs from "../schema/typeDefs";
import { resolvers } from "../schema/resolvers";
import ApolloClient from "apollo-client";
import { WebSocketLink } from "apollo-link-ws";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import ws from 'ws';
import { db } from "../db";

const GRAPHQL_ENDPOINT = 'ws://localhost:4000/graphql';

describe('Apollo Server', () => {
  let server: ApolloServer;
  let apolloClientUser1: ApolloClient<NormalizedCacheObject>;
  let apolloClientUser2: ApolloClient<NormalizedCacheObject>;

  beforeAll(async() => {
    server = new ApolloServer({
      typeDefs: gql(typeDefs),
      resolvers: resolvers as any,
      context: async ({ req, connection }: any) => connection ? connection.context : ({ currentUser: db.users[0] }),
      subscriptions: {
        onConnect: ({ currentUser }: any) => ({ currentUser }),
      },
    });

    await server.listen();

    apolloClientUser1 = new ApolloClient({
      link: new WebSocketLink({
        uri: GRAPHQL_ENDPOINT,
        webSocketImpl: ws,
        options: {
          connectionParams: () => ({ currentUser: db.users[0] }),
        },
      }),
      cache: new InMemoryCache(),
    });

    apolloClientUser2 = new ApolloClient({
      link: new WebSocketLink({
        uri: GRAPHQL_ENDPOINT,
        webSocketImpl: ws,
        options: {
          connectionParams: () => ({ currentUser: db.users[1] }),
        },
      }),
      cache: new InMemoryCache(),
    });
  });

  it('should match the snapshot for the GetChats query', async () => {
    const res: any = await new Promise(async (resolve, reject) => {
      apolloClientUser1.subscribe({
        query: gql`
            subscription messageAdded {
                messageAdded {
                    id
                    content
                    chat {
                        id,
                    },
                }
            }
        `,
      }).subscribe({
        next: resolve,
        error: reject,
      });

      await apolloClientUser2.mutate({
        mutation: gql`
            mutation AddMessage($chatId: ID!, $content: String!) {
                addMessage(chatId: $chatId, content: $content) {
                    id
                    content
                }
            }
        `,
        variables: { chatId: 7, content: 'This is a test' },
      });
    });

    expect(res.data).toBeDefined();
    expect(res.data.messageAdded).toBeDefined();
    expect(res.errors).toBeUndefined();
    expect(res.data).toMatchSnapshot();
  });
});
