import { GraphQLDateTime } from 'graphql-iso-date'
import { chats, messages } from '../db'

const resolvers = {
  Date: GraphQLDateTime,

  Chat: {
    messages(chat: any) {
      return messages.filter(m => chat.messages.includes(m.id))
    },

    lastMessage(chat: any) {
      const lastMessage = chat.messages[chat.messages.length - 1]

      return messages.find(m => m.id === lastMessage)
    },
  },

  Query: {
    chats() {
      return chats
    },

    chat(root: any, { chatId }: any) {
      return chats.find(c => c.id === chatId)
    },
  },

  Mutation: {
    addMessage(root: any, { chatId, content }: any) {
      const chat = chats.find(c => c.id === chatId)

      if (!chat) return null

      const recentMessage = messages[messages.length - 1]
      const messageId = String(Number(recentMessage.id) + 1)
      const message = {
        id: messageId,
        createdAt: new Date(),
        content,
      }

      messages.push(message)
      chat.messages.push(messageId)

      return message
    }
  }
}

export default resolvers
