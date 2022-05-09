'use strict';
const Sequelize = require('sequelize');
const bcrypt = require ('bcrypts');
const { sequelize } = require('.');

module.exports = (sequelize) => {
    class User extends Sequelize.Model{}
    User.init({
        firstName: {
            type: Sequelize.STRING,
        },
        lastName: {
            type:Sequelize.STRING,
        },
        emailAddress: {
            type: Sequelize.STRING,
        },
        password: {
            type: Sequelize.STRING,
        }
    })
}