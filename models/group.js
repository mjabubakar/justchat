'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Group.belongsTo(models.User, { foreignKey: "userId" });
      Group.hasMany(models.GroupMember, { constraints: true, onDelete: "CASCADE", foreignKey: "groupId" });
      Group.hasMany(models.GroupMessage, { constraints: true, onDelete: "CASCADE", foreignKey: "groupId" });
    }
  };
  Group.init({
    lastmessage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    info: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profilepic: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};