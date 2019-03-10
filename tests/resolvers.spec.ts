import { createTestClient } from "apollo-server-testing";
import { ApolloServer, gql } from "apollo-server";
import typeDefs from "../schema/typeDefs";
import { resolvers } from "../schema/resolvers";

describe('Apollo Server', () => {
  let server: ApolloServer;

  beforeEach(async() => {
    server = new ApolloServer({
      typeDefs: gql(typeDefs),
      resolvers: resolvers as any,
    });
  });

  it('should match the snapshot for the GetChats query', async () => {
    const {query} = createTestClient(server);

    const res = await query({
      query: gql`
          query GetChats {
              chats {
                  id
                  name
                  messages {
                      id
                      content
                  }
              }
          }
      `,
    });

    expect(res.data).toBeDefined();
    expect(res.errors).toBeUndefined();
    expect(res.data).toMatchSnapshot();
  });

  it('should match the snapshot for the GetChat query', async () => {
    const {query} = createTestClient(server);

    const res = await query({
      query: gql`
          query GetChat($chatId: ID!) {
              chat(chatId: $chatId) {
                  id
                  name
                  messages {
                      id
                      content
                  }
              }
          }
      `,
      variables: {chatId: 8},
    });

    expect(res.data).toBeDefined();
    expect(res.errors).toBeUndefined();
    expect(res.data).toMatchSnapshot();
  });

  it('should match the snapshot for the GetUsers query', async () => {
    const {query} = createTestClient(server);

    const res = await query({
      query: gql`
          query GetUsers {
              users {
                  id,
                  name,
                  picture,
              }
          }
      `,
    });

    expect(res.data).toBeDefined();
    expect(res.errors).toBeUndefined();
    expect(res.data).toMatchSnapshot();
  });

  it('should match the snapshot for the GetMe query', async () => {
    const {query} = createTestClient(server);

    const res = await query({
      query: gql`
          query GetMe {
              me {
                  id,
                  name,
                  picture,
              }
          }
      `,
    });

    expect(res.data).toBeDefined();
    expect(res.errors).toBeUndefined();
    expect(res.data).toMatchSnapshot();
  });
});
