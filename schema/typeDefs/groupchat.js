exports.queries = `
    groupInfo(groupId: ID!): groupData!
    groupMessages(id: ID!): [Message!]
    myGroups: [groupsData]
`;

exports.mutations = `
    createGroup(name: String!, members: [addMembers!]): String
    leaveGroup(groupId: ID!): String
    removeMember(groupId: ID!, username: String!): String
    updateType(groupId: ID!, username: String!): String
    sendMessage(id: ID!, message: String!): Message!
    addMember(groupId: ID!, username: String!): String
    changeGProfilePic(groupId: ID!, file: Upload!): String
`;

exports.types = `
    type Message {
        message: String!
        time: String!
        sentBy: String!
    }

    input addMembers {
        type: String!
        username: String!
    }

    type groupData {
        info: String
        createdBy: String!
        createdOn: String!
        members: [members!]
    }

    type members {
        username: String!
        type: String!
    }

    type groupsData {
        lastmessage: String!
        time: String!
        profilepic: String
        name: String!
        groupId: ID!
    }
`;
