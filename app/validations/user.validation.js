import Response from '../helpers/response.helper'
import Status from '../helpers/status.helper'
import Message from '../helpers/message.helper'
import db from "../../models"
import createError from 'http-errors'
import {
  Joi, validate
} from 'express-validation'
import validator from '../utils/validator'

exports.JoiRegist = {
  body: Joi.object({
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .regex(/[a-zA-Z0-9]{3,30}/)
      .required(),
  })
}

exports.login = validator.validateDefault(
  {
    body: Joi.object({
      email: Joi.required(),
      password: Joi.string()
        .min(8)
        .regex(/[a-zA-Z0-9]{3,30}/)
        .required(),
    }),
  }
)

exports.secondStep = validator.validateDefault(
  {
    body: Joi.object({
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string()
        .min(8)
        .regex(/[a-zA-Z0-9]{3,30}/)
        .required(),
    }),
  }
)

exports.firstStep = validator.validateDefault(
  {
    body: Joi.object({
      name: Joi.string()
        .required(),
      surname: Joi.string()
        .required(),
      national_id: Joi.number().required(),
      dob: Joi.date()
        .required(),
      gender: Joi.string()
        .required(),
    }),
  }
)

exports.resetPassword = validator.validateDefault(
  {
    body: Joi.object({
      new_password: Joi.string()
        .min(8)
        .regex(/[a-zA-Z0-9]{3,30}/)
        .required(),
    }),
  }
)

exports.updateRange = validator.validateDefault(
  {
    body: Joi.object({
      range: Joi.string().valid('15', '42', '100', '200')
        .required()
    }),
  }
)

exports.lastStep = validator.validateDefault(
  {
    body: Joi.object({
      name: Joi.string()
        .required(),
      surname: Joi.string()
        .required(),
      national_id: Joi.number().required(),
      dob: Joi.date()
        .required(),
      gender: Joi.string()
        .required(),
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string()
        .min(8)
        .regex(/[a-zA-Z0-9]{3,30}/)
        .required(),
      id_token: Joi.string()
        .required(),
    }),
  }
)

exports.resetPasswordUser = validator.validateDefault(
  {
    body: Joi.object({
      password: Joi.string()
        .min(8)
        .regex(/[a-zA-Z0-9]{3,30}/)
        .required(),
      id_token: Joi.string()
        .required(),
    }),
  }
)