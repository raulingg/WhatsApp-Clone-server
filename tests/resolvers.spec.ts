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

  it('should match the snapshot for the AddChat mutation', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({
      query: gql`
          mutation AddChat($userId: ID!) {
              addChat(userId: $userId) {
                  id
                  name
                  messages {
                      id
                      content
                      sender {
                          id
                          name
                      }
                  }
              }
          }
      `,
      variables: { userId: 7 },
    });

    expect(res.data).toBeDefined();
    expect(res.errors).toBeUndefined();
    expect(res.data).toMatchSnapshot();
  });

  it('should throw an error when trying to recreate an existing chat', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({
      query: gql`
          mutation AddChat($userId: ID!) {
              addChat(userId: $userId) {
                  id
                  name
                  messages {
                      id
                      content
                      sender {
                          id
                          name
                      }
                  }
              }
          }
      `,
      variables: { userId: 3 },
    });

    expect(res.data).toBeDefined();
    expect(res.data.addChat).toBeNull();
    expect(res.errors).toBeDefined();
    expect(res.errors.length).toBe(1);
    expect(res.errors[0].message).toContain('Chat already exists');
  });

  it('should match the snapshot for the RemoveChat mutation', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({
      query: gql`
          mutation RemoveChat($chatId: ID!) {
              removeChat(chatId: $chatId)
          }
      `,
      variables: { chatId: 3 },
    });

    expect(res.data).toBeDefined();
    expect(res.errors).toBeUndefined();
    expect(res.data.removeChat).toBe("3");
  });

  it('should throw an error when trying to remove a non-existing chat', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({
      query: gql`
          mutation RemoveChat($chatId: ID!) {
              removeChat(chatId: $chatId)
          }
      `,
      variables: { chatId: 13 },
    });

    expect(res.data).toBeDefined();
    expect(res.data.removeChat).toBeNull();
    expect(res.errors).toBeDefined();
    expect(res.errors.length).toBe(1);
    expect(res.errors[0].message).toContain("doesn't exist");
  });

  it('should match the snapshot for the AddMessage mutation', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({
      query: gql`
          mutation AddMessage($chatId: ID!, $content: String!) {
              addMessage(chatId: $chatId, content: $content) {
                  id
                  content
              }
          }
      `,
      variables: { chatId: 2, content: 'This is a test' },
    });

    expect(res.data).toBeDefined();
    expect(res.errors).toBeUndefined();
    expect(res.data).toMatchSnapshot();
  });

  it('should throw an error when trying to add a message to an unlisted chat', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({
      query: gql`
          mutation AddMessage($chatId: ID!, $content: String!) {
              addMessage(chatId: $chatId, content: $content) {
                  id
                  content
              }
          }
      `,
      variables: { chatId: 3, content: 'This is a test' },
    });

    expect(res.data).toBeDefined();
    expect(res.data.addMessage).toBeNull();
    expect(res.errors).toBeDefined();
    expect(res.errors.length).toBe(1);
    expect(res.errors[0].message).toContain("must be listed for the current user before adding a message");
  });

  it('should match the snapshot for the RemoveMessages mutation', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({
      query: gql`
          mutation RemoveMessages($chatId: ID!, $messageIds: [ID!]) {
              removeMessages(chatId: $chatId, messageIds: $messageIds)
          }
      `,
      variables: { chatId: 2, messageIds: [1] },
    });

    expect(res.data).toBeDefined();
    expect(res.errors).toBeUndefined();
    expect(res.data.removeMessages).toBeDefined();
    expect(res.data.removeMessages.length).toBe(1);
    expect(res.data.removeMessages[0]).toBe("1");
  });

  it('should throw an error when trying to remove a message for an unlisted chat', async () => {
    const { mutate } = createTestClient(server);

    const res = await mutate({
      query: gql`
          mutation RemoveMessages($chatId: ID!, $messageIds: [ID!]) {
              removeMessages(chatId: $chatId, messageIds: $messageIds)
          }
      `,
      variables: { chatId: 3, messageIds: [1] },
    });

    expect(res.data).toBeDefined();
    expect(res.data.removeMessages).toBeNull();
    expect(res.errors).toBeDefined();
    expect(res.errors.length).toBe(1);
    expect(res.errors[0].message).toContain("is not listed for the current user, so there is nothing to delete");
  });
});
