"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Friends", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      lastmessage: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: { model: "Users", key: "id" },
      },
      friendId: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" },
      },
      conversationId: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: { model: "Conversations", key: "id" },
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Friends");
  },
};
