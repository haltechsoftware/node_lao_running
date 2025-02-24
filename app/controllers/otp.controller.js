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
