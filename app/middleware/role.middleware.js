import Response from '../helpers/response.helper'
import Message from '../helpers/message.helper'
import Status from '../helpers/status.helper'
import db from '../../models/'
import createError from 'http-errors'

exports.hasRole = role => {
  return async (req, res, next) => {
    let hasRole = false

    try {
      const user = await db.User.findByPk(req.user.user_id)
      if (!user) return next(createError(Status.code.AuthError, Message.fail._unAutorize))
      const userRoles = await user.getRoles()
      userRoles.some(async userRole => {
        if (userRole.name == role || role.includes(userRole.name)) {
          hasRole = true
          return hasRole
        }
      });
    } catch (error) {
      next(error)
    }


    if (!hasRole)
      return res.status(403).json({
        error: true,
        code: 403,
        message: Message.fail._no_roles,
        data: role

      })

    return next()
  };
}