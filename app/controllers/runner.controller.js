import db from "../../models";
import Response from "../helpers/response.helper";
import Status from "../helpers/status.helper";
import Message from "../helpers/message.helper";
import Image from "../helpers/upload.helper";
import Onepay from "../helpers/bcel.helper";
import UniqueId from "../helpers/uniqueId.helper";
import QRCode from "qrcode";
import createError from "http-errors";
import axios from "axios";
import { Op } from "sequelize";

/**
 * Update User Profile.
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.updateProfile = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const userProfile = await db.UserProfile.findOne({
      where: {
        user_id: req.user.user_id,
      },
    });

    if (!userProfile) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      return res
        .status(Status.code.NotFound)
        .json({ message: Message.fail._notFound("user_profile") });
    }
    const { name, surname, gender, dob, national_id } = req.body;

    let profile_image = userProfile.profile_image
      ? userProfile.profile_image
      : null;
    let profile_image_id = userProfile.profile_image_id
      ? userProfile.profile_image_id
      : null;

    if (req.file) {
      if (profile_image && profile_image_id) {
        await Image.destroy(profile_image_id);
      }
      const cloudImage = await Image.upload(req.file);
      profile_image_id = cloudImage.public_id;
      profile_image = cloudImage.secure_url;
    }

    const updateData = await userProfile.update(
      {
        name,
        surname,
        gender,
        dob,
        national_id,
        profile_image_id,
        profile_image: profile_image,
      },
      {
        transaction: transaction,
      },
    );

    await transaction.commit();
    return Response.success(res, Message.success._success, updateData);
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    next(error);
  }
};

/**
 * Update User Location.
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.updateUserLocation = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const userProfile = await req.auth.getUserProfile();

    if (!userProfile) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

      return res
        .status(Status.code.NotFound)
        .json({ message: Message.fail._notFound("user_profile") });
    }

    let hal_branche_id = req.body.hal_branche_id;
    const size = req.body.size;

    if (!hal_branche_id) {
      const Evo = await db.HalBranche.findOne({
        where: {
          name: "EVO Store",
        },
      });
      if (!Evo) {
        if (!transaction.finished) {
          await transaction.rollback();
        }
        return res
          .status(Status.code.NotFound)
          .json({ message: Message.fail._notFound("evo_store") });
      }
    }

    const updateData = await userProfile.update(
      {
        hal_branche_id,
        size_shirt: size,
      },
      {
        transaction: transaction,
      },
    );

    await transaction.commit();
    return Response.success(res, Message.success._success, updateData);
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    next(error);
  }
};

/**
 * Get User Profile.
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.getProfile = async (req, res, next) => {
  try {
    const userProfile = await db.UserProfile.findOne({
      where: {
        user_id: req.user.user_id,
      },
      include: {
        model: db.HalBranche,
      },
    });
    if (!userProfile) {
      return res
        .status(Status.code.NotFound)
        .json({ message: Message.fail._notFound("user_profile") });
    }

    const ranking = await req.auth.getRanking({
      attributes: ["total_range", "total_time"],
    });

    const userPackage = await req.auth.getUserPackage({
      attributes: ["package_id", "status", "transaction_id"],
      include: {
        model: db.Package,
        attributes: ["name"],
      },
    });

    // Get the most recent manual payment
    const manualPayment = await db.ManualPayment.findOne({
      where: {
        user_id: req.user.user_id,
      },
      include: [
        {
          model: db.Package,
          attributes: ["id", "name", "price"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const resData = userProfile.dataValues;
    resData.ranking = ranking;
    resData.package = userPackage;
    resData.manualPayment = manualPayment || null;

    return Response.success(res, Message.success._success, resData);
  } catch (error) {
    next(error);
  }
};

/**
 * Check Phone Number unique.
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.isUnique = async (req, res, next) => {
  try {
    const phone = req.query.phone ? req.query.phone : null;

    if (phone < 8)
      next(
        createError(Status.code.Validation, {
          phone: Message.validation("min", "phone", 8),
        }),
      );

    const user = await db.User.findOne({
      where: {
        phone: phone,
      },
    });

    if (!user) return Response.success(res, Message.success._success, true);

    return Response.success(res, Message.success._success, false);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Bcel Qr.
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.getBcelQr = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const runnerPackage = await db.Package.findByPk(req.params.packageId);
    if (!runnerPackage) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      return res
        .status(Status.code.NotFound)
        .json({ message: Message.fail._notFound("runner_package") });
    }

    let userPackage = await db.UserPackage.findOne({
      where: {
        user_id: req.user.user_id,
      },
    });

    /**
     * @overide  userPackage
     */
    if (!userPackage) {
      userPackage = await runnerPackage.createUserPackage(
        {
          total: runnerPackage.price,
          user_id: req.user.user_id,
          transaction_id: await UniqueId.generateRandomTransactionId(),
          invoice_id: await UniqueId.generateRandomInvoiceId(),
          terminal_id: await UniqueId.generateRandomTerminalId(),
        },
        {
          transaction: transaction,
        },
      );
    }

    if (userPackage.status == "pending") {
      await userPackage.update(
        {
          package_id: runnerPackage.id,
          total: runnerPackage.price,
        },
        {
          transaction: transaction,
        },
      );

      const data = {
        transactionid: userPackage.transaction_id,
        invoiceid: userPackage.invoice_id,
        terminalid: userPackage.terminal_id,
        description: Message.description._paymentDescription(
          runnerPackage.name,
        ),
        amount: runnerPackage.price,
      };

      const qr_number = Onepay.getCode(data);
      const qr = await QRCode.toDataURL(qr_number);

      const paymentData = {
        id: userPackage.id,
        package_id: userPackage.package_id,
        total: userPackage.total,
        status: userPackage.status,
        transaction_id: userPackage.transaction_id,
        invoice_id: userPackage.invoice_id,
        terminal_id: userPackage.terminal_id,
        qr_number: qr_number,
        payment_qr: qr,
      };

      await transaction.commit();
      return Response.success(res, Message.success._success, paymentData);
    }
    await transaction.commit();
    return res.status(Status.code.NotFound).json(userPackage);
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    next(error);
  }
};

/**
 * Pay Bcel Qr.
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.payBcelQr = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const transaction_id = req.body.transaction_id || req.query.transaction_id;

    let bcelTransaction;
    try {
      bcelTransaction = await axios.get(
        "https://bcel.la:8083/onepay/gettransaction.php",
        {
          params: {
            mcid: process.env.BCEL_MCID_V2,
            uuid: transaction_id,
          },
        },
      );
    } catch (error) {
      console.log(error);
      if (!transaction.finished) {
        await transaction.rollback();
      }
      return res
        .status(Status.code.NotFound)
        .json({ message: Message.fail._notFound("transaction") });
    }

    const payment = await db.UserPackage.findOne({
      where: {
        user_id: req.user.user_id,
      },
    });
    if (!payment) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      return res
        .status(Status.code.NotFound)
        .json({ message: Message.fail._notFound("payment") });
    }
    if (payment.status == "success") {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      return res.status(Status.code.BadRequest).json(payment);
    }
    const runnerPackage = await db.Package.findByPk(req.params.packageId);
    if (!runnerPackage) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      return res
        .status(Status.code.NotFound)
        .json({ message: Message.fail._notFound("package") });
    }

    const paid = await payment.update(
      {
        ticket_id: bcelTransaction.data.ticket,
        package_id: runnerPackage.id,
        total: runnerPackage.price,
        status: "success",
      },
      {
        transaction: transaction,
      },
    );

    await req.auth.update(
      {
        package_id: runnerPackage.id,
      },
      {
        transaction: transaction,
      },
    );

    await transaction.commit();

    return Response.success(res, Message.success._success, paid);
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    next(error);
  }
};

/**
 * Get all runner.
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.getAllRunner = async (req, res, next) => {
  try {
    const bib = req.query.bib;
    const name = req.query.name;
    const phone = req.query.phone;
    const gender = req.query.gender;
    const package_runner = req.query.package_runner;

    // Build condition for user profile filters
    const condition = {};
    if (bib) condition.bib = bib;
    if (gender) condition.gender = gender;

    // Build condition for user information filters
    const userCondition = {};
    if (phone) userCondition.phone = phone;

    let package_runnerCondition = {};
    if (package_runner) {
      package_runnerCondition =
        package_runner == "free"
          ? {
              package_id: null,
            }
          : {
              package_id: package_runner,
            };

      // Merge with existing user conditions
      Object.assign(userCondition, package_runnerCondition);
    }

    const include = [
      {
        model: db.HalBranche,
      },
      {
        model: db.User,
        where: userCondition,
        required: true,
        attributes: ["id", "name", "email", "phone"],
        include: [
          {
            model: db.Ranking,
            attributes: ["total_range", "total_time"],
          },
          {
            model: db.UserPackage,
            attributes: ["package_id", "status", "transaction_id"],
            include: {
              model: db.Package,
              attributes: ["name"],
            },
          },
        ],
      },
    ];

    // Add name search to the query if provided
    if (name) {
      // Search in both name and surname fields
      condition[Op.or] = [
        { name: { [Op.like]: `%${name}%` } },
        { surname: { [Op.like]: `%${name}%` } },
      ];
    }

    const orderCondition = [["id", "DESC"]];

    // Paginate
    const per_page = Number.parseInt(req.query.per_page);
    let page = Number.parseInt(req.query.page);

    if (per_page) {
      const userProfileData = {};
      page = page && page > 0 ? page : 1;

      const userProfile = await db.UserProfile.findAndCountAll({
        where: condition,
        include: include,
        order: orderCondition,
        limit: per_page,
        offset: (page - 1) * per_page,
        subQuery: false,
      });

      userProfileData.data = userProfile.rows;
      userProfileData.pagination = {
        total: userProfile.count,
        per_page: per_page,
        total_pages: Math.ceil(userProfile.count / per_page),
        current_page: page,
      };
      return Response.success(res, Message.success._success, userProfileData);
    }

    const userProfile = await db.UserProfile.findAll({
      where: condition,
      include: include,
      order: orderCondition,
    });

    return Response.success(res, Message.success._success, userProfile);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a runner.
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.getOneRunner = async (req, res, next) => {
  try {
    const id = req.params.user_profile_id;

    const userProfile = await db.UserProfile.findOne({
      where: { id: id },
      include: [
        {
          model: db.HalBranche,
        },
        {
          model: db.User,
          required: true,
          attributes: ["id", "name", "email", "phone"],
          include: [
            {
              model: db.Ranking,
              attributes: ["total_range", "total_time"],
            },
            {
              model: db.UserPackage,
              attributes: ["package_id", "status", "transaction_id"],
              include: {
                model: db.Package,
                attributes: ["name"],
              },
            },
          ],
        },
      ],
    });

    return Response.success(res, Message.success._success, userProfile);
  } catch (error) {
    next(error);
  }
};
