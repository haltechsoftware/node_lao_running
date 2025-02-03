import db from "../../models";
const User = db.User;
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Response from '../helpers/response.helper';
import Status from '../helpers/status.helper';
import Message from '../helpers/message.helper';
import Image from '../helpers/upload.helper'
import createError from 'http-errors'
import Otp from '../helpers/otp.helper'
import {
  create
} from "qrcode";

/**
 * Validate Step 1.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.validateFirst = async (req, res, next) => {
  let errors = {}

  try {

    const { name, surname } = req.body

    const user = await db.UserProfile.findOne({
      where: [{
        name: name
      },
      {
        surname: surname
      }]
    })

    if (user) errors.name = Message.validation('exists', '\"name\"')


    if (!Object.keys(errors).length)
      return Response.success(res, Message.success._success, { message: "success" });

    return res.status(422).json(
      {
        name: "ValidationError",
        message: "Validation Failed",
        statusCode: 422,
        error: "Unprocessable Entity",
        details: [
          errors
        ]
      }
    )
  } catch (error) {
    next(error)
  }
}

/**
 * Validate Step 1.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.validateSecond = async (req, res, next) => {
  let errors = {}

  try {
    const email = req.body.email

    if (await User.findOne({
      where: {
        email: email,
      }
    })) errors.email = Message.validation('exists', '\"email\"')


    if (!Object.keys(errors).length)
      return Response.success(res, Message.success._success, { message: "success" });

    return res.status(422).json(
      {
        name: "ValidationError",
        message: "Validation Failed",
        statusCode: 422,
        error: "Unprocessable Entity",
        details: [
          errors
        ]
      }
    )
  } catch (error) {
    next(error)
  }
}

/**
 * Register User.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.register = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const {
      name,
      surname,
      email,
      password,
      national_id,
      gender,
      dob,
      id_token,
    } = req.body

    const decodeData = Otp.verify(id_token)

    if (!decodeData) return next(createError(Status.code.BadRequest, Message.fail._invalidToken))

    const oldUser = await db.User.findOne({ where: { sub: decodeData.sub } })

    if (oldUser) return next(createError(Status.code.BadRequest, Message.fail._existPhone))

    const phone = decodeData.phone_number.replace('+85620', '')

    const encryptedPassword = password ? await bcrypt.hash(password, 10) : null;

    const user = await db.User.create({
      name: name,
      phone: phone,
      sub: decodeData.sub,
      email: email,
      password: encryptedPassword,
      is_active: true
    }, {
      transaction: transaction
    });

    const roleUser = await db.Role.findOne({
      where: {
        name: 'User'
      }
    })

    await user.addRole(roleUser, {
      transaction: transaction
    })

    let profile_image = req.file ? await Image.upload(req.file) : null

    await user.createUserProfile({
      name: name,
      surname: surname,
      gender: gender,
      national_id: national_id,
      dob: dob,
      bib: user.id.toString().padStart(5, '0'),
      profile_image: profile_image ? profile_image.secure_url : null,
      profile_image_id: profile_image ? profile_image.public_id : null,
    }, {
      transaction: transaction
    })



    const token = jwt.sign({
      user_id: user.id,
      email,
    },
      process.env.JWT_SECRET, {
      expiresIn: "30d",
    }
    );

    await transaction.commit()

    const userData = {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      phone: user.phone,
      role: await user.getRoles(),
      token: token,
    }


    return Response.success(res, Message.success._success, userData);

  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

/**
 * Login User.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.login = async (req, res, next) => {
  try {
    const email = req.body.email ? req.body.email : null
    const password = req.body.password ? req.body.password : null

    const condition = isNaN(email)
      ? { email: email }
      : { phone: email }

    const user = await db.User.findOne({
      where: condition
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const role = await user.getRoles()
      const token = jwt.sign({
        user_id: user.id,
        email,
      },
        process.env.JWT_SECRET, {
        expiresIn: "30d",
      }
      );

      const userData = {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        role: role,
        token: token,
      }



      return Response.success(res, Message.success._success, userData)
    }
    next(createError(Status.code.BadRequest, Message.fail._invalidCredential))

  } catch (error) {
    next(error)
  }
}

/**
 * Get User from token.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.me = async (req, res, next) => {
  try {
    const userData = req.user
    return Response.success(res, Message.success._success, userData)
  } catch (error) {
    next(error)
  }
}

/**
 * Create Admin.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.createAdmin = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const {
      name,
      phone,
      email,
      password,
    } = req.body

    const encryptedPassword = password ? await bcrypt.hash(password, 10) : null;

    const user = await db.User.create({
      name: name,
      phone: phone,
      email: email,
      password: encryptedPassword,
      is_active: true
    }, {
      transaction: transaction
    });

    const roleUser = await db.Role.findOne({
      where: {
        name: 'Admin'
      }
    })

    await user.addRole(roleUser, {
      transaction: transaction
    })

    const token = jwt.sign({
      user_id: user.id,
      email,
    },
      process.env.JWT_SECRET, {
      expiresIn: "30d",
    }
    );

    await transaction.commit()

    const userData = {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      phone: user.phone,
      role: await user.getRoles(),
      token: token,
    }


    return Response.success(res, Message.success._success, userData);

  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

/**
 * Get Admin.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.getAllAdmin = async (req, res, next) => {
  try {

    const userData = await User.findAll({
      attributes: ['id', 'name', 'email', 'phone'],
      include: {
        require: true,
        model: db.Role,
        where: {
          name: "Admin"
        }
      }
      ,
    })

    return Response.success(res, Message.success._success, userData);

  } catch (error) {
    next(error)
  }
}

/**
 * Get a Admin.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.getOneAdmin = async (req, res, next) => {
  try {
    const id = req.params.id

    const userData = await User.findOne({
      attributes: ['id', 'name', 'email', 'phone'],
      where: {
        id: id
      },
      include: {
        require: true,
        model: db.Role,
        where: {
          name: "Admin"
        }
      }
      ,
    })
    if (!userData) return next(createError(Message.fail._notFound(`user: ${id}`)))

    return Response.success(res, Message.success._success, userData);

  } catch (error) {
    next(error)
  }
}

/**
 * Delete a Admin.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.destroyAdmin = async (req, res, next) => {
  try {
    const id = req.params.id

    const userData = await User.findOne({
      where: {
        id: id
      },
      include: {
        require: true,
        model: db.Role,
        where: {
          name: "Admin"
        }
      }
      ,
    })
    if (!userData) return next(createError(Message.fail._notFound(`user: ${id}`)))
    await userData.destroy()

    return Response.success(res, Message.success._success, null);

  } catch (error) {
    next(error)
  }
}

/**
 * Reset a Admin Password.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.resetPasswordAdmin = async (req, res, next) => {
  try {
    const id = req.params.id

    const userData = await User.findOne({
      where: {
        id: id
      },
      include: {
        require: true,
        model: db.Role,
        where: {
          name: "Admin"
        }
      }
      ,
    })
    if (!userData) return next(createError(Message.fail._notFound(`user: ${id}`)))

    const password = await bcrypt.hash(req.body.new_password, 10)

    await userData.update({
      password: password
    })

    return Response.success(res, Message.success._success, userData);

  } catch (error) {
    next(error)
  }
}

/**
 * Update Range.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.updateRange = async (req, res, next) => {
  try {
    const {
      range,
    } = req.body

    if (!req.auth.package_id) return next(createError(Status.code.BadRequest, Message.fail._freeUser))

    const userProfile = await req.auth.getUserProfile({
      where: {
        range: 'free'
      }
    })

    if (!userProfile) return next(createError(Status.code.BadRequest, Message.fail._areadyChooseRange))

    userProfile.range = range
    await userProfile.save()

    return Response.success(res, Message.success._success, userProfile.range);

  } catch (error) {
    next(error)
  }
}

/**
 * Reset a User Password.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.resetPasswordUser = async (req, res, next) => {
  try {
    const { id_token, password } = req.body

    const decodeData = Otp.verify(id_token)

    if (!decodeData) return next(createError(Status.code.BadRequest, Message.fail._invalidToken))

    const existUser = await db.User.findOne(
      {
        where: {
          sub: decodeData.sub
        },
        include: {
          require: true,
          model: db.Role,
          where: {
            name: "User"
          }
        }
        ,
      }
    )

    if (!existUser) return next(createError(Status.code.BadRequest, Message.fail._notFound('user')))

    const encryptedPassword = await bcrypt.hash(password, 10);

    await existUser.update({
      password: encryptedPassword,
      resetPasswordAt: new Date().getTime() / 1000
    })

    return Response.success(res, Message.success._success, existUser);

  } catch (error) {
    next(error)
  }
}