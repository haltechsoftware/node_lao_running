import db from "../../models";
import Response from "../helpers/response.helper";
import Message from "../helpers/message.helper";
import createError from "http-errors";
import { loginAndSendOtp } from "../helpers/hal.service";
import { Op } from 'sequelize';

/**
 * Create Otp.
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.store = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const generateOtp = () => {
      return Math.floor(100000 + Math.random() * 900000).toString();
    };

    let otp = await db.Otp.findOne({
      where: {
        phone: req.body.phone,
        expired_at: {
          [Op.gt]: new Date().toISOString(), // Check if expired_at is still valid
        },
      },
    });

    if (!otp) {
      otp = await db.Otp.create({
        code: generateOtp(),
        phone: req.body.phone,
        expired_at: new Date(new Date().getTime() + 30 * 60000).toISOString(), // 30 minutes from now
      });

      const isSent = await loginAndSendOtp(req.body.phone, otp.code);
      if (!isSent) {
        await transaction.rollback();
        return next(createError(500, Message.error._otp_not_sent));
      }
    }

    await transaction.commit();

    return Response.success(res, Message.success._success, otp);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Resend Otp.
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.resendOtp = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const generateOtp = () => {
      return Math.floor(100000 + Math.random() * 900000).toString();
    };

    let otp = await db.Otp.findOne({
      where: {
        phone: req.body.phone,
      },
    });

    if (otp) {
      otp.code = generateOtp();
      otp.expired_at = new Date(new Date().getTime() + 30 * 60000).toISOString(); // 30 minutes from now
      await otp.save();

      const isSent = await loginAndSendOtp(req.body.phone, otp.code);
      if (!isSent) {
        await transaction.rollback();
        return next(createError(500, Message.error._otp_not_sent));
      }
    } else {
      return next(createError(404, Message.error._otp_not_found));
    }

    await transaction.commit();

    return Response.success(res, Message.success._success, otp);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Verify Otp.
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.verifyOtp = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const otp = await db.Otp.findOne({
      where: {
        phone: req.body.phone,
      },
      order: [['created_at', 'DESC']], // Select the latest OTP
    });

    if (!otp || otp.code !== req.body.code || new Date(otp.expired_at) <= new Date() || otp.verified_at !== null) {
      await transaction.rollback();
      return next(createError(400, Message.error._otp_invalid));
    }

    otp.verified_at = new Date().toISOString();
    await otp.save();

    await transaction.commit();

    return Response.success(res, Message.success._success, otp);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
