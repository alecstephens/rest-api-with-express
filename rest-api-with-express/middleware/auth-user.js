'use strict';

const auth = require('basic-auth');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

exports.authenticateUser = async (req, res, next) => {
    let message;
    const credentials = auth(req);


    // If the credentials are available
    if(credentials) {
        const user = await User.findOne({ where: {emailAddress: credentials.name} });
        if(user) {
            const authenticated = bcrypt
                .compareSync(credentials.pass, user.password);
            if(authenticated) {
                console.log(`Authentication successfull for user: ${user.emailAddress}`);
                req.currentUser = user;
            } else {
                message = `Authentication failed for ${user.emailAddress}`;
            }
        } else {
            message = `User ${credentials.name} was not found`;
        }
    } else {
        message = 'Login required for this route';
    }
    if(message) {
        console.warn(message);
        res.status(401).json({ message: 'Access Denied' })
    } 
    next();
}