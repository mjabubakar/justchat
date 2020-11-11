const { gql } = require("apollo-server");

const grouptypeDefs = require("./typeDefs/groupchat");
const usertypeDefs = require("./typeDefs/user");
const chatypeDefs = require("./typeDefs/privatechat");

const typeDefs = gql`

    ${usertypeDefs.types}

    ${grouptypeDefs.types}

    ${chatypeDefs.types}

    type Query {
        ${grouptypeDefs.queries}

        ${usertypeDefs.queries}

        ${chatypeDefs.queries}
    }
    type Mutation {
        ${usertypeDefs.mutations}

        ${grouptypeDefs.mutations}

        ${chatypeDefs.mutations}
    },
    type Subscription {
        messageSent(id: ID!): Message
        directMessageSent(id: ID!): Message
        directMessages: Message
    }
`;

module.exports = typeDefs;
