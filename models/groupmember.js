'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GroupMember extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      GroupMember.belongsTo(models.User, { foreignKey: "memberId" });
      GroupMember.belongsTo(models.Group, { foreignKey: "groupId" });
    }
  };
  GroupMember.init({
    type: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'GroupMember',
  });
  return GroupMember;
};