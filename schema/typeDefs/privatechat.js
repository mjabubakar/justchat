exports.mutations = `
    sendDirectMessage(id: ID!, message: String!): Message!
    startConversation(username: String!): Int!
    deleteChat(id: ID!): String
    setCount(id: ID!): String
`;

exports.queries = `
    directMessages(id: ID!): [Message]!
    friends: [Friend!]!
`;

exports.types = `
    type Friend {
        username: String!
        message: String
        conversationId: ID!
        profilepic: String!
        lastmessage: String
        count: Int!
        online: String
        lastmsgTime: String
    }
`;
