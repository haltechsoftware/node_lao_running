import {
    validate
} from 'express-validation'

exports.validateDefault = (rule) => {
    return validate(rule, { context: false, statusCode: 422, keyByField: true }, { abortEarly: false })
}