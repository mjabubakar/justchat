"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Group, { foreignKey: "userId" });
      User.hasMany(models.GroupMember, {
        foreignKey: "memberId",
        constraints: true,
        onDelete: "CASCADE",
      });
      User.hasMany(models.GroupMessage, { foreignKey: "userId" });
      User.hasMany(models.DirectMessage, { foreignKey: "sentBy" });
      User.hasMany(models.DirectMessage, {
        onDelete: "CASCADE",
        foreignKey: "userId",
      });
      User.hasMany(models.Friend, { foreignKey: "friendId" });
      User.hasMany(models.Friend, {
        onDelete: "CASCADE",
        foreignKey: "userId",
      });
    }
  }
  User.init(
    {
      fullname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      profilepic: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bio: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      online: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
