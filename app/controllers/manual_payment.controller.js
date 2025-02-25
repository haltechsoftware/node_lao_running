import db from "../../models";
import Response from "../helpers/response.helper";
import Status from "../helpers/status.helper";
import Message from "../helpers/message.helper";
import Image from "../helpers/upload.helper";
import createError from "http-errors";

/**
 * Create manual payment
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.create = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { package_id, amount, address } = req.body;

    if (!req.file) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

      return res
        .status(Status.code.BadRequest)
        .json({ message: Message.fail._paymentSlipRequired });
    }

    const runnerPackage = await db.Package.findByPk(package_id);
    if (!runnerPackage) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      return res
        .status(Status.code.NotFound)
        .json({ message: Message.fail._notFound("package") });
    }

    console.log(444);

    // Upload payment slip
    const payment_slip = await Image.upload(req.file);
    console.log(payment_slip);

    // Create manual payment entry
    const manualPayment = await db.ManualPayment.create(
      {
        user_id: req.user.user_id,
        package_id: package_id,
        amount: amount || runnerPackage.price,
        address: address,
        payment_slip: payment_slip.secure_url,
        payment_slip_id: payment_slip.public_id,
      },
      {
        transaction: transaction,
      },
    );

    await transaction.commit();
    return Response.success(res, Message.success._success, manualPayment);
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    return res
      .status(Status.code.NotFound)
      .json({ message: error.message || Message.fail._internalServerError });
  }
};

/**
 * Get all manual payments for admin
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.findAllAdmin = async (req, res, next) => {
  try {
    const per_page = Number.parseInt(req.query.per_page);
    let page = Number.parseInt(req.query.page);
    const status = req.query.status;
    const condition = status ? { status: status } : {};

    if (per_page) {
      const manualPaymentData = {};
      page = page && page > 0 ? page : 1;

      const manualPayments = await db.ManualPayment.findAndCountAll({
        where: condition,
        include: [
          {
            model: db.User,
            attributes: ["id", "name", "email", "phone"],
            include: {
              model: db.UserProfile,
              attributes: ["name", "surname", "gender", "profile_image"],
            },
          },
          {
            model: db.Package,
            attributes: ["id", "name", "price"],
          },
          {
            model: db.User,
            as: "ApproveBy",
            attributes: ["id", "name", "email"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: per_page,
        offset: (page - 1) * per_page,
        subQuery: false,
      });

      manualPaymentData.data = manualPayments.rows;
      manualPaymentData.pagination = {
        total: manualPayments.count,
        per_page: per_page,
        total_pages: Math.ceil(manualPayments.count / per_page),
        current_page: page,
      };
      return Response.success(res, Message.success._success, manualPaymentData);
    }

    const manualPayments = await db.ManualPayment.findAll({
      where: condition,
      include: [
        {
          model: db.User,
          attributes: ["id", "name", "email", "phone"],
          include: {
            model: db.UserProfile,
            attributes: ["name", "surname", "gender", "profile_image"],
          },
        },
        {
          model: db.Package,
          attributes: ["id", "name", "price"],
        },
        {
          model: db.User,
          as: "ApproveBy",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return Response.success(res, Message.success._success, manualPayments);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's manual payments
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.findAll = async (req, res, next) => {
  try {
    const manualPayments = await db.ManualPayment.findAll({
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

    return Response.success(res, Message.success._success, manualPayments);
  } catch (error) {
    next(error);
  }
};

/**
 * Get one manual payment
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.findOne = async (req, res, next) => {
  try {
    const id = req.params.id;
    const manualPayment = await db.ManualPayment.findOne({
      where: {
        id: id,
      },
      include: [
        {
          model: db.User,
          attributes: ["id", "name", "email", "phone"],
          include: {
            model: db.UserProfile,
            attributes: ["name", "surname", "gender", "profile_image"],
          },
        },
        {
          model: db.Package,
          attributes: ["id", "name", "price"],
        },
        {
          model: db.User,
          as: "ApproveBy",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!manualPayment) {
      return res
        .status(Status.code.NotFound)
        .json({ message: Message.fail._notFound(`payment: ${id}`) });
    }

    return Response.success(res, Message.success._success, manualPayment);
  } catch (error) {
    next(error);
  }
};

/**
 * Approve manual payment
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.approve = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const id = req.params.id;
    const manualPayment = await db.ManualPayment.findByPk(id);

    if (!manualPayment) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      return res
        .status(Status.code.NotFound)
        .json({ message: Message.fail._notFound(`payment: ${id}`) });
    }

    if (manualPayment.status !== "pending") {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      return res
        .status(Status.code.BadRequest)
        .json({ message: Message.fail._alreadyProcessed });
    }

    // Update manual payment status
    await manualPayment.update(
      {
        status: "approved",
        approved_by: req.user.user_id,
        notes: req.body.notes || "Payment approved",
      },
      {
        transaction: transaction,
      },
    );

    // Get the user and update their package
    const user = await db.User.findByPk(manualPayment.user_id);

    if (user) {
      await user.update(
        {
          package_id: manualPayment.package_id,
        },
        {
          transaction: transaction,
        },
      );

      // Create or update UserPackage entry
      const userPackage = await db.UserPackage.findOne({
        where: {
          user_id: manualPayment.user_id,
        },
      });

      if (userPackage) {
        await userPackage.update(
          {
            package_id: manualPayment.package_id,
            total: manualPayment.amount,
            status: "success",
            invoice_id: `MANUAL-${manualPayment.id}`,
            transaction_id: `MANUAL-TRAN-${manualPayment.id}`,
            terminal_id: `MANUAL-TERM-${manualPayment.id}`,
          },
          {
            transaction: transaction,
          },
        );
      } else {
        await db.UserPackage.create(
          {
            user_id: manualPayment.user_id,
            package_id: manualPayment.package_id,
            total: manualPayment.amount,
            status: "success",
            invoice_id: `MANUAL-${manualPayment.id}`,
            transaction_id: `MANUAL-TRAN-${manualPayment.id}`,
            terminal_id: `MANUAL-TERM-${manualPayment.id}`,
          },
          {
            transaction: transaction,
          },
        );
      }
    }

    await transaction.commit();

    const updatedPayment = await db.ManualPayment.findOne({
      where: {
        id: id,
      },
      include: [
        {
          model: db.User,
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: db.Package,
          attributes: ["id", "name", "price"],
        },
        {
          model: db.User,
          as: "ApproveBy",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return Response.success(res, Message.success._success, updatedPayment);
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    next(error);
  }
};

/**
 * Reject manual payment
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.reject = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const id = req.params.id;
    const manualPayment = await db.ManualPayment.findByPk(id);

    if (!manualPayment) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      return res
        .status(Status.code.NotFound)
        .json({ message: Message.fail._notFound(`payment: ${id}`) });
    }

    if (manualPayment.status !== "pending") {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      return res
        .status(Status.code.BadRequest)
        .json({ message: Message.fail._alreadyProcessed });
    }

    // Reject reason is mandatory
    if (!req.body.notes) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      return res
        .status(Status.code.BadRequest)
        .json({ message: Message.fail._reasonRequired });
    }

    await manualPayment.update(
      {
        status: "rejected",
        approved_by: req.user.user_id,
        notes: req.body.notes,
      },
      {
        transaction: transaction,
      },
    );

    await transaction.commit();

    const updatedPayment = await db.ManualPayment.findOne({
      where: {
        id: id,
      },
      include: [
        {
          model: db.User,
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: db.Package,
          attributes: ["id", "name", "price"],
        },
        {
          model: db.User,
          as: "ApproveBy",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return Response.success(res, Message.success._success, updatedPayment);
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    next(error);
  }
};
