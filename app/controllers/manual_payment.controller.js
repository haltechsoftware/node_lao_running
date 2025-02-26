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
  let transaction;
  try {
    transaction = await db.sequelize.transaction();
    const { package_id, amount, address } = req.body;

    // Check for existing payment
    const existingPayment = await db.ManualPayment.findOne({
      where: {
        user_id: req.user.user_id,
      },
      order: [["createdAt", "DESC"]],
    });

    // If payment exists and is approved, reject new creation
    if (existingPayment && existingPayment.status == "approved") {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      return res
        .status(Status.code.BadRequest)
        .json({ message: "You already have an approved or rejected payment" });
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

    try {
      // If there's no payment slip, only update existing pending payment
      if (
        !req.file &&
        existingPayment &&
        existingPayment.status === "pending"
      ) {
        const updatedPayment = await existingPayment.update(
          {
            package_id: package_id,
            amount: amount || runnerPackage.price,
            address: address,
          },
          {
            transaction: transaction,
          },
        );
        await transaction.commit();
        return Response.success(res, Message.success._success, updatedPayment);
      }

      // Require payment slip for new payments
      if (!req.file) {
        if (!transaction.finished) {
          await transaction.rollback();
        }
        return res
          .status(Status.code.BadRequest)
          .json({ message: Message.fail._paymentSlipRequired });
      }

      // Upload payment slip
      const payment_slip = await Image.upload(req.file);

      // Create or update payment entry
      const paymentData = {
        user_id: req.user.user_id,
        package_id: package_id,
        amount: amount || runnerPackage.price,
        address: address,
        payment_slip: payment_slip.secure_url,
        payment_slip_id: payment_slip.public_id,
      };

      let manualPayment;
      if (existingPayment && existingPayment.status === "pending") {
        manualPayment = await existingPayment.update(paymentData, {
          transaction: transaction,
        });
      } else {
        manualPayment = await db.ManualPayment.create(paymentData, {
          transaction: transaction,
        });
      }

      await transaction.commit();
      return Response.success(res, Message.success._success, manualPayment);
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      if (!transaction.finished) {
        await transaction.rollback();
      }
      return res
        .status(Status.code.BadRequest)
        .json({ message: uploadError.message || "Error uploading file" });
    }
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    next(error);
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
    const per_page = Number.parseInt(req.query.per_page);
    let page = Number.parseInt(req.query.page);
    const status = req.query.status;

    const condition = {
      user_id: req.user.user_id,
      ...(status && { status: status }),
    };

    if (per_page) {
      const manualPaymentData = {};
      page = page && page > 0 ? page : 1;

      const manualPayments = await db.ManualPayment.findAndCountAll({
        where: condition,
        include: [
          {
            model: db.Package,
            attributes: ["id", "name", "price"],
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

    // Find or create UserPackage
    let userPackage = await db.UserPackage.findOne({
      where: {
        user_id: manualPayment.user_id,
      },
    });

    const packageData = {
      user_id: manualPayment.user_id,
      package_id: manualPayment.package_id,
      total: manualPayment.amount,
      status: "success",
      invoice_id: `MP-${manualPayment.id}-${Date.now()}`,
      transaction_id: `MP-TRAN-${manualPayment.id}-${Date.now()}`,
      terminal_id: `MP-TERM-${manualPayment.id}-${Date.now()}`,
      ticket_id: `MP-TICKET-${manualPayment.id}-${Date.now()}`,
    };

    if (userPackage) {
      await userPackage.update(packageData, {
        transaction: transaction,
      });
    } else {
      userPackage = await db.UserPackage.create(packageData, {
        transaction: transaction,
      });
    }

    // Update user's package
    await db.User.update(
      {
        package_id: manualPayment.package_id,
      },
      {
        where: { id: manualPayment.user_id },
        transaction: transaction,
      },
    );

    await transaction.commit();

    const updatedPayment = await db.ManualPayment.findOne({
      where: { id },
      include: [
        {
          model: db.User,
          attributes: ["id", "name", "email", "phone"],
          include: [
            {
              model: db.UserPackage,
              attributes: [
                "package_id",
                "status",
                "transaction_id",
                "ticket_id",
              ],
              include: {
                model: db.Package,
                attributes: ["name"],
              },
            },
          ],
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

/**
 * Upload additional payment slip
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.uploadSlip = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    // Find the most recent pending payment for the user
    const manualPayment = await db.ManualPayment.findOne({
      where: {
        user_id: req.user.user_id,
        status: "pending",
      },
      order: [["createdAt", "DESC"]],
    });

    // Check if payment exists
    if (!manualPayment) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      return res
        .status(Status.code.NotFound)
        .json({ message: Message.fail._notFound("pending payment") });
    }

    // Check if new slip is provided
    if (!req.file) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      return res
        .status(Status.code.BadRequest)
        .json({ message: Message.fail._paymentSlipRequired });
    }

    try {
      // Delete old payment slip if exists
      if (manualPayment.payment_slip_id) {
        await Image.delete(manualPayment.payment_slip_id);
      }

      // Upload new payment slip
      const payment_slip = await Image.upload(req.file);

      // Update payment record
      const updatedPayment = await manualPayment.update(
        {
          payment_slip: payment_slip.secure_url,
          payment_slip_id: payment_slip.public_id,
        },
        {
          transaction: transaction,
        },
      );

      await transaction.commit();
      return Response.success(res, Message.success._success, updatedPayment);
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      if (!transaction.finished) {
        await transaction.rollback();
      }
      return res
        .status(Status.code.BadRequest)
        .json({ message: uploadError.message || "Error uploading file" });
    }
  } catch (error) {
    console.error("Upload slip error:", error);
    if (!transaction.finished) {
      await transaction.rollback();
    }
    return res
      .status(Status.code.InternalServerError)
      .json({ message: error.message || Message.fail._internalServerError });
  }
};

/**
 * Get current user's payment and UserPackage
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.getCurrentUserPayment = async (req, res, next) => {
  try {
    // Get the most recent payment for the current user
    const manualPayment = await db.ManualPayment.findOne({
      where: {
        user_id: req.user.user_id,
      },
      include: [
        {
          model: db.Package,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Get the user's package information
    const userPackage = await db.UserPackage.findOne({
      where: {
        user_id: req.user.user_id,
      },
      include: [
        {
          model: db.Package,
        },
      ],
    });

    // Combine the data
    const responseData = {
      manualPayment: manualPayment || null,
      userPackage: userPackage || null,
    };

    return Response.success(res, Message.success._success, responseData);
  } catch (error) {
    next(error);
  }
};
