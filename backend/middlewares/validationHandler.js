const { validationResult } = require('express-validator');

const validationHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg }); // return first error only
    }
    next();
};

module.exports = validationHandler;