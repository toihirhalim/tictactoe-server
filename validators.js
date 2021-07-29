const { validationResult, check } = require('express-validator')

module.exports = {
    resultsValidator: (req) => {
        return validationResult(req).array().map(err => err.msg).join(' and ')
    },
    registerValidator: () => {
        return [
            check('username')
                .notEmpty()
                .withMessage('username is required')
                .not()
                .custom((val) => /[^A-za-z0-9\s]/g.test(val))
                .withMessage('Username can not use symbols'),
            check('email')
                .notEmpty()
                .withMessage('Email is required')
                .isEmail()
                .withMessage('Please enter a valid email'),
            check('password')
                .notEmpty()
                .withMessage('password is required')
                .isLength({ min: 8 })
                .withMessage('password must be 8 characters')
        ]
    },
    loginValidator: () => {
        return [
            check('username').notEmpty().withMessage('username or email is required'),
            check('password').notEmpty().withMessage('password is required')
        ]
    }
}