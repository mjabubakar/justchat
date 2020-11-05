"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Count extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Count.belongsTo(models.Friend, {
        foreignKey: "friendId",
        onDelete: "CASCADE",
      });
    }
  }
  Count.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      count: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "Count",
    }
  );
  return Count;
};
