const express = require('express');
const { async } = require('seed/lib/seed');
const { User } = require('./models');
const { Course } = require('./models');

// User Routes
// A route that will GET all properties and values for the user with a 200 status code
router.get('./users', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
    res.status(200).json({
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress
    });
}));

// A route that will POST a new user, set location, and return a 201 status code
router.post('./users', asyncHandler(async (req, res) =>{
    try {
        await User.create(req.body);
        res.status(201).location('/').end();
    } catch(error) {
        if(error.name === 'SequelizeValidationError' || error.name === 'SequelizeConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        } else {
            throw error;
        }
    }
}));
