'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GroupMessage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      GroupMessage.belongsTo(models.User, { foreignKey: "userId" });
      GroupMessage.belongsTo(models.Group, { foreignKey: "groupId" });
    }
  };
  GroupMessage.init({
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'GroupMessage',
  });
  return GroupMessage;
};