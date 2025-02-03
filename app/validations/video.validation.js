import {
  Joi,
} from 'express-validation'
import validator from '../utils/validator'

exports.store = validator.validateDefault(
  {
    body: Joi.object({
      link: Joi.string()
        .required(),
    }),
  }
)