"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DirectMessage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      DirectMessage.belongsTo(models.User, { foreignKey: "sentBy" });
      DirectMessage.belongsTo(models.User, { foreignKey: "userId" });
      DirectMessage.belongsTo(models.Conversation, {
        foreignKey: "conversationId",
      });
    }
  }
  DirectMessage.init(
    {
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "DirectMessage",
    }
  );
  return DirectMessage;
};
