import db from "../../models";
import Response from "../helpers/response.helper";
import Message from "../helpers/message.helper";
import createError from "http-errors";
import { loginAndSendOtp } from "../helpers/hal.service";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";

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
        verified_at: null, // Check if verified_at is empty
      },
    });

    if (!otp) {
      otp = await db.Otp.create({
        code: generateOtp(),
        phone: req.body.phone,
        expired_at: new Date(new Date().getTime() + 3 * 60000).toISOString(), // 30 minutes from now
      });

      const isSent = await loginAndSendOtp(req.body.phone, otp.code);
      if (!isSent) {
        if (!transaction.finished) {
          await transaction.rollback();
        }
        return res.status(500).json({ message: Message.fail._otp_not_sent });
      }
    }

    await transaction.commit();

    return Response.success(res, Message.success._success, {
      phone: otp.phone,
      expired_at: otp.expired_at,
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
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
      otp.expired_at = new Date(
        new Date().getTime() + 30 * 60000,
      ).toISOString(); // 30 minutes from now
      await otp.save();

      const isSent = await loginAndSendOtp(req.body.phone, otp.code);
      if (!isSent) {
        if (!transaction.finished) {
          await transaction.rollback();
        }
        return res.status(500).json({ message: Message.fail._otp_not_sent });
      }
    } else {
      return res.status(404).json({ message: Message.fail._otp_not_found });
    }
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
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
      order: [["createdAt", "DESC"]], // Select the latest OTP
    });

    if (
      !otp ||
      otp.code !== req.body.code ||
      new Date(otp.expired_at) <= new Date() ||
      otp.verified_at !== null
    ) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

      return res.status(400).json({ message: Message.fail._otp_invalid });
    }

    otp.verified_at = new Date().toISOString();
    await otp.save();

    const token = jwt.sign(
      {
        phone: otp.phone,
        sub: otp.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30m",
      },
    );

    await transaction.commit();

    return Response.success(res, Message.success._success, {
      phone: otp.phone,
      token,
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    next(error);
  }
};

/**
 * Verify OTP Token.
 *
 * @param {string} token
 * @returns {object|null}
 */
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.log(error);

    return null;
  }
};
