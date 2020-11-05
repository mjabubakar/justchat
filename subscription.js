const jwt = require("jsonwebtoken");
const { User } = require("./models");

const onConnect = async (connectionParams, _) => {
  if (connectionParams.authorization) {
    const token = connectionParams.authorization.split(" ")[1];
    let username;
    try {
      username = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).username;
    } catch (e) {
      return "Not authenticated";
    }
    await User.update(
      {
        online: true,
      },
      { where: { username } }
    );

    return {
      username,
    };
  }
};
const onDisconnect = async (_, context) => {
  const init = await context.initPromise;
  const { username } = init;
  await User.update(
    {
      online: false,
    },
    { where: { username } }
  );
};

module.exports = {
  onConnect,
  onDisconnect,
};
