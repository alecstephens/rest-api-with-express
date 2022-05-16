const express = require('express');
const { User } = require('./models');
const { Course } = require('./models');
const { authenticateUser } = require('./middleware/auth-user');
const { asyncHandler } = require('./middleware/async-handler');

const router = express.Router();

// // User Routes
// A route that will GET all properties and values for the user with a 200 status code
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
  
    res.status(200).json({
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress,
    });
  }));

// A route that will POST a new user, set location, and return a 201 status code
router.post('/users', asyncHandler(async (req, res) => {
    try {
        await User.create(req.body);
        res.status(201).location('/').end();
    } catch(error) {
        if(error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        } else {
            throw error;
        }
    }
}));

// Course Routes
// A route that will GET all of the courses with a user and return a 200 status code
router.get('/courses', asyncHandler(async (req, res) => {
    const course = await Course.findAll({
        attributes: [ 'title', 'description', 'estimatedTime', 'materialsNeeded', 'userId' ],
        include: [
            {
                model: User,
                attributes: [ 'firstName', 'lastName', 'emailAddress' ]
            }
        ]
    });
    res.status(200).json(course);
}))

// A route that will create a new course
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
    try {
        let course = await Course.create(req.body);
        res.location(`/courses/${course.id}`).status(201).end();
    } catch(error) {
        if(error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(error => error.message);
            res.status(400).json({ errors });
        } else {
            throw error;
        }
    }
}));

// A route that will return a specific course and user
router.get('/courses/:id', asyncHandler(async (req, res) => {
    const course = await Course.findOne({
        attributes: [ 'title', 'description', 'estimatedTime', 'materialsNeeded', 'userId'],
        include: [
            {
                model: User,
                attributes: [ 'firstName', 'lastName', 'emailAddress' ]
            }
        ]
    });
    res.status(200).json(course);
}))

// A route that will update the corresponding course and return a 204 HTTP status code and no content
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    try {
        let course = await Course.findOne({ where: { id: req.params.id } });
        const user = req.currentUser;
        if (course) {
            if (user.id === course.userId) {
                await course.update(req.body);
                res.status(204).end();
            } else {
                res.status(403).json({error: {message: 'Only users associated with this course can make changes'}});
            }
        } else {
            res.status(404).json({error: {message: `Course not found with id of ${req.params.id}`}});
        }
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        } else {
            throw error;
        }
    }
}));

// A route that will delete a specific course 
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    try {
        let course = await Course.findOne({ where: { id: req.params.id } });
        const user = req.currentUser;
        if(course) {
            if(user.id === course.userId) {
                await course.destroy();
                res.status(204).end();
            } else {
                res.status(403).json({error: {message: 'Only users associated witht his course can make changes'}});
            }
        } else {
            res.status(404).json({error: {message: `Course not found with id of ${req.params.id}`}});
        }
    } catch(error) {
        res.status(500).json({error})
    }
}));

module.exports = router;

