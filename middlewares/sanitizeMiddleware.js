const { body, query } = require('express-validator');

const sanitizeProfileUpdate = [
    body('name').optional().trim().escape().isLength({ min: 2}).withMessage('Name is too short'),
    body('username').optional().trim().escape().isLength({ min: 3 }).withMessage('Username is too short'),
    body('age').optional().isNumeric().withMessage('Age must be a number'),
    body('gender').optional().isIn(['Male', 'Female', 'Others']).withMessage('Invalid gender'),
    body('contact').optional().trim().escape(),
    body('birthday').optional().trim().escape(),
    body('address').optional().trim().escape(),
    body('bloodGroup').optional().trim().escape(),
    body('intro').optional().trim().escape().isLength({ max: 500 }).withMessage('Intro is too long'),  
];

const sanitizeSearch = [
    query('name').optional().trim().escape(),
    query('specialty').optional().trim().escape(),
];

module.exports = { sanitizeProfileUpdate, sanitizeSearch };