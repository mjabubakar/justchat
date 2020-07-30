'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('GroupMembers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      memberId: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: { model: "Users", key: "id", as: "memberId" }
      },
      groupId: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: { model: "Groups", key: "id", as: "groupId" }
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('GroupMembers');
  }
};