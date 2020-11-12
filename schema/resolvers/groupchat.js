const errorHandler = require("../../ErrorHandler");
const { User, Group, GroupMember, GroupMessage } = require("../../models");
const functions = require("../../functions");
const validator = require("validator");
const { pubsub } = require("./pubsub");
const MESSAGE_SENT = "MESSAGE_SENT";

exports.sendMessage = async function sendMessage(_, { id, message }, context) {
  if (!context.username) {
    errorHandler.authenticationError();
  }

  const user = await User.findOne({
    where: { username: context.username },
  });

  if (!user) {
    errorHandler.notFound("User");
  }

  const group = await Group.findByPk(id);

  if (!group) {
    errorHandler.notFound("Group");
  }

  const member = GroupMember.findOne({
    where: { groupId: id, memberId: user.id },
  });

  if (!member) {
    errorHandler.notAuthorized();
  }

  const newMessage = await GroupMessage.create({
    message,
    type: false,
    userId: user.id,
    groupId: id,
  });

  await Group.update(
    {
      lastmessage: message,
    },
    { where: { id } }
  );

  const time = functions.convertToTime(newMessage.createdAt);

  await pubsub.publish(MESSAGE_SENT, {
    messageSent: { time, message, id, type: false, sentBy: user.username },
  });

  const { type, userId } = newMessage;

  return { message: newMessage.message, type, sentBy: user.username, time };
};

exports.myGroups = async function (_, __, context) {
  if (!context.username) {
    errorHandler.authenticationError();
  }

  const user = await User.findOne({ where: { username: context.username } });

  if (!user) {
    errorHandler.notFound("User");
  }

  const member = await GroupMember.findAll({ where: { memberId: user.id } });

  if (!member) {
    errorHandler.notAuthorized();
  }

  let id = [];
  member.map((data) => {
    id.push(data.groupId);
  });

  const groups = await Group.findAll({
    where: { id },
    attributes: ["updatedAt", "lastmessage", "name", "profilepic", "id"],
    order: [["updatedAt", "DESC"]],
  });

  const myGroups = [];

  for (group of groups) {
    const { name, lastmessage, updatedAt, profilepic, id } = group;
    const time = functions.convertToTime(updatedAt);
    myGroups.push({ lastmessage, name, time, profilepic, groupId: id });
  }

  return myGroups;
};

exports.groupInfo = async function (_, { groupId }, context) {
  if (!context.username) {
    errorHandler.authenticationError();
  }

  const user = await User.findOne({ where: { username: context.username } });

  if (!user) {
    errorHandler.notFound("User");
  }

  const group = await Group.findByPk(groupId);

  if (!group) {
    errorHandler.notFound("Group");
  }

  const userMember = await GroupMember.findOne({
    where: { memberId: user.id, groupId },
  });

  if (!userMember) {
    errorHandler.notAuthorized();
  }

  const createdBy = await User.findByPk(group.userId);

  const members = await GroupMember.findAll({
    where: { groupId },
    attributes: ["memberId", "type"],
  });

  const groupMembers = [];

  for (member of members) {
    const user = await User.findByPk(member["memberId"]);
    groupMembers.push({ username: user.username, type: member["type"] });
  }

  return {
    info: group.info,
    members: groupMembers,
    createdBy: createdBy.username,
    createdOn: group.createdAt,
  };
};

exports.changeGProfilePic = async (_, { file, id }, context) => {
  if (!context.username) {
    return errorCheck();
  }

  const user = await User.findOne({ where: { username: context.username } });

  if (!user) {
    errorHandler.notFound("User");
  }

  const member = GroupMember.findOne({
    where: { groupId: id, memberId: user.id },
  });

  if (!member) {
    errorHandler.notAuthorized();
  }

  const { createReadStream } = await file;
  const name = new Date().getTime().toString();

  try {
    await new Promise((res) =>
      createReadStream()
        .pipe(
          bucket.file(`${id}/${name}`).createWriteStream({
            resumable: false,
            gzip: true,
          })
        )
        .on("finish", res)
    );
  } catch (e) {
    const error = new Error("No image uploaded");
    error.code = 422;
    throw error;
  }

  await Group.update(
    {
      profilepic: "images/" + filename,
    },
    {
      where: {
        id,
      },
    }
  );
  return "Profilepic updated successfully";
};

exports.groupMessages = async function (_, { id }, context) {
  if (!context.username) {
    errorHandler.authenticationError();
  }

  const user = await User.findOne({ where: { username: context.username } });

  if (!user) {
    errorHandler.notFound("User");
  }

  const group = await Group.findByPk(id);

  if (!group) {
    errorHandler.notFound("Group");
  }

  const member = await GroupMember.findOne({
    where: { groupId: id, memberId: user.id },
  });

  if (!member) {
    errorHandler.notAuthorized();
  }

  const messages = await GroupMessage.findAll({
    where: { groupId: id },
    attributes: ["message", "type", "userId", "createdAt"],
    order: [["createdAt", "DESC"]],
  });

  const groupMessages = [];

  for (msg of messages) {
    const user = await User.findByPk(msg.userId);
    const { createdAt, message, type } = msg;
    groupMessages.push({
      sentBy: user.username,
      time: functions.convertToTime(createdAt),
      type,
      message,
    });
  }

  return groupMessages;
};

exports.leaveGroup = async function (_, { groupId }, context) {
  if (!context.username) {
    errorHandler.authenticationError();
  }

  const user = await User.findOne({ where: { username: context.username } });

  if (!user) {
    errorHandler.notFound("User");
  }

  const group = await Group.findByPk(groupId);

  if (!group) {
    errorHandler.notFound("Group");
  }

  const member = await GroupMember.findOne({
    where: { groupId, memberId: user.id },
  });

  if (!member) {
    errorHandler.notAuthorized();
  }

  const allMembers = await GroupMember.findAll({ where: { groupId } });

  if (allMembers.length < 2) {
    await Group.destroy({
      where: { id: groupId },
    });
    return `${user.username} left this group.`;
  }

  await GroupMember.destroy({
    where: { groupId, memberId: user.id },
  });

  return `${user.username} left this group.`;
};

exports.addMember = async function (_, { groupId, username }, context) {
  if (!context.username) {
    errorHandler.authenticationError();
  }

  const user = await User.findOne({ where: { username: context.username } });

  if (!user) {
    errorHandler.notFound("User");
  }

  const group = await Group.findByPk(groupId);

  if (!group) {
    errorHandler.notFound("Group");
  }

  const userM = await User.findOne({ where: { username } });
  const member = await GroupMember.findOne({
    where: { memberId: userM.id, groupId },
  });
  const userMember = await GroupMember.findOne({
    where: { groupId, memberId: user.id },
  });

  if (member) {
    const error = new Error("Member already exist.");
    throw error;
  }

  if (!userMember) {
    errorHandler.notAuthorized();
  }

  if (userMember.type !== "admin") {
    errorHandler.notAuthorized();
  }

  const members = await GroupMember.findAll({ where: { groupId } });

  if (members.length > 200) {
    const error = new Error("An error occured");
    throw error;
  }

  await GroupMember.create({
    type: "member",
    memberId: userM.id,
    groupId,
  });

  return `${userM.username} is added to this group.`;
};

exports.removeMember = async function (_, { groupId, username }, context) {
  if (!context.username) {
    errorHandler.authenticationError();
  }

  const user = await User.findOne({ where: { username: context.username } });

  if (!user) {
    errorHandler.notFound("User");
  }

  const group = await Group.findByPk(groupId);

  if (!group) {
    errorHandler.notFound("Group");
  }

  const userM = await User.findOne({ where: { username } });

  const member = await GroupMember.findOne({
    where: { memberId: userM.id, groupId },
  });

  const userMember = await GroupMember.findOne({
    where: { groupId, memberId: user.id },
  });

  if (!member || !userMember) {
    !member ? errorHandler.notFound("Member") : errorHandler.notAuthorized();
  }

  if (userMember.type !== "admin") {
    errorHandler.notAuthorized();
  }

  await GroupMember.destroy({
    where: { memberId: userM.id, groupId },
  });

  return `${user.username} removed ${userM.username} from this group.`;
};

exports.updateType = async function (_, { groupId, username }, context) {
  if (!context.username) {
    errorHandler.authenticationError();
  }

  const user = await User.findOne({ where: { username: context.username } });

  if (!user) {
    errorHandler.notFound("User");
  }

  const group = await Group.findByPk(groupId);

  if (!group) {
    errorHandler.notFound("Group");
  }

  const userM = await User.findOne({ where: { username } });

  if (!userM) {
    errorHandler.notFound("User");
  }

  const member = await GroupMember.findOne({
    where: { memberId: userM.id, groupId },
  });
  const userMember = await GroupMember.findOne({
    where: { groupId, memberId: user.id },
  });

  if (!member || !userMember) {
    !member ? errorHandler.notFound("Member") : errorHandler.notAuthorized();
  }

  if (userMember.type !== "admin") {
    errorHandler.notAuthorized();
  }

  await GroupMember.update(
    {
      type: member.type === "admin" ? "member" : "admin",
    },
    {
      where: { memberId: userM.id, groupId },
    }
  );

  return `${userM.username} is ${
    member.type === "admin" ? "no more an admin" : "now an admin"
  }`;
};

exports.createGroup = async function (_, { name, members }, context) {
  if (!context.username) {
    errorHandler.authenticationError();
  }

  const user = await User.findOne({ where: { username: context.username } });

  if (!user) {
    errorHandler.notFound("User");
  }

  const errors = [];

  if (validator.isEmpty(name)) {
    errors.push({ message: "All fields are required" });
  }

  if (!validator.isLength(name, { max: 25, min: 1 })) {
    errors.push({ message: "Name too long or too short" });
  }

  if (errors.length > 0) {
    const error = new Error("Invalid input.");
    error.data = errors;
    error.code = 422;
    throw error;
  }

  const group = Group.build({
    name,
    profilepic: "",
    userId: user.id,
    lastmessage: "Group created",
  });

  const admin = {
    type: "admin",
    username: user.username,
  };

  members.push(admin);

  if (members.length < 2) {
    const error = new Error("Add atleast two more members");
    error.code = 422;
    throw error;
  }

  for (member of members) {
    const check = await User.findOne({
      where: { username: member["username"] },
    });
    if (!check) {
      errorHandler.notFound("Member/members not found");
    }
  }

  await group.save();

  for (e of members) {
    const { id } = await User.findOne({ where: { username: e.username } });
    e.memberId = id;
    e.groupId = group.id;
  }

  GroupMember.bulkCreate(members);

  GroupMessage.create({
    groupId: group.id,
    message: `group created`,
    type: true,
    userId: user.id,
  });

  return "Group created successfully.";
};
