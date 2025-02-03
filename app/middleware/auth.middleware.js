import jwt from "jsonwebtoken";
import Response from '../helpers/response.helper'
import Message from '../helpers/message.helper'
import Status from '../helpers/status.helper'
import createError from 'http-errors'
import db from "../../models";

const verifyToken = async (req, res, next) => {
  let token =
    req.body.token || req.query.token || req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return next(createError(Status.code.Unauthorized, Message.fail._unAutorize))
  }

  if (token.substring(0, 6) === 'Bearer') {
    const bearer = token.split(' ');
    token = bearer[1];
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const auth = await db.User.findByPk(decoded.user_id)

    if (auth.resetPasswordAt && auth.resetPasswordAt > decoded.iat)
      return next(createError(Status.code.Unauthorized, Message.fail._oldPassword))

    req.user = decoded;
    req.auth = auth;
  } catch (err) {
    return next(createError(Status.code.Unauthorized, err))
  }
  return next();
};

module.exports = verifyToken;