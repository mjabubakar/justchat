const jwt = require("jsonwebtoken");

exports.createAccessToken = (user) => {
    return jwt.sign({
        username: user.username,
    },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "24hr" },
    );
}

exports.confimationToken = (user) => {
    return jwt.sign({
        username: user.username,
    },
        process.env.CONFIRMATION_TOKEN_SECRET,
        { expiresIn: "15m" },
    );
}

exports.changeEmail = (user, newEmail) => {
    return jwt.sign({
        username: user.username,
        email: newEmail
    },
        process.env.CHANGE_EMAIL,
        { expiresIn: "15m" },
    );
}

exports.emailConfirmation = (username, email) => {
    return jwt.sign({
        username,
        email
    },
        process.env.EMAIL_CONFIRMATION_TOKEN_SECRET,
        { expiresIn: "60m" },
    );
}