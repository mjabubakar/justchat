
exports.types = `
  
type Users {
    fullname: String!
    username: String!
    profilepic: String
}

type User {
    fullname: String!
    username: String!
    message: String!
}  

input UserInputData {
    fullname: String!
    email: String! 
    username: String!
    password: String!
}

type userData {
    fullname: String!
    username: String!
    bio: String
    profilepic: String
}
`

exports.mutations = `
    login(email: String!, password: String!): String!
    createUser(userInput: UserInputData): User!
    deleteUser(password: String!): String
    updateUser(bio: String!, about: String!, username: String!, fullname: String!): String
    changePassword(password: String!, newPassword: String!): String
    changeProfilePic(id: ID!, file: String!): String
    sendForgotPassMail(email: String!): String
    forgotPassword(confirmationToken: String!, newPassword: String!): String
    verifyEmail(confirmationToken: String!): String
    updateEmail(newEmail: String!): String
    sendVerification: String
`;

exports.queries = `
    userDetails: userData!
    allUsers: [Users!]
`;