exports.mutations = `
    sendDirectMessage(id: ID!, message: String!): Message!
    startConversation(username: String!): String
    deleteChat(id: ID!): String
`;

exports.queries = `
    directMessages(id: ID!): [Message]!
    friends: [Users!]!
`;