'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Conversation.hasMany(models.Friend, { onDelete: "CASCADE", foreignKey: "conversationId" });
      Conversation.hasMany(models.DirectMessage, { onDelete: "CASCADE", foreignKey: "conversationId" });
    }
  };
  Conversation.init({
    chatId: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Conversation',
  });
  return Conversation;
};