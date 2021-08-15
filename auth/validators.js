const { validationResult, check, oneOf } = require('express-validator')

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
                .custom((val) => /[^A-za-z0-9]/g.test(val))
                .withMessage('Username can not use symbols')
                .isLength({ min: 3 })
                .withMessage('Username must be at least 3 characters')
                .isLength({ max: 20 })
                .withMessage('Username must not be over 20 characters'),
            oneOf([
                check('email').isEmail().withMessage('Please enter a valid email'),
                check('email').isEmpty().withMessage('Please enter a valid email')
            ]),
            check('password')
                .notEmpty()
                .withMessage('password is required')
                .isLength({ min: 8 })
                .withMessage('password must be at least 8 characters')
                .withMessage('password is required')
                .isLength({ max: 16 })
                .withMessage('password must not be over 16 characters')
        ]
    },
    loginValidator: () => {
        return [
            check('username').notEmpty().withMessage('username or email is required'),
            check('password').notEmpty().withMessage('password is required')
        ]
    }
}