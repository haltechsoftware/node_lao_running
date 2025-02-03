import {
  Joi,
} from 'express-validation'
import validator from '../utils/validator'

exports.store = validator.validateDefault(
  {
    body: Joi.object({
      name: Joi.string()
        .required(),
      surname: Joi.string()
        .required(),
      phone: Joi.number().min(7)
        .required(),
      message: Joi.string()
        .required(),
    }),
  }
)