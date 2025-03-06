import db from "../../models";
import Response from "../helpers/response.helper";
import Status from "../helpers/status.helper";
import Message from "../helpers/message.helper";
import createError from "http-errors";
import Image from "../helpers/upload.helper";
import RunResultValid from "../validations/run_result.validation";
import { Op } from "sequelize";

/**
 * Create run result
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.create = async (req, res, next) => {
  let transaction;
  try {
    // Properly initialize the transaction
    transaction = await db.sequelize.transaction();

    const valid = await RunResultValid.create(req.body);
    if (Object.keys(valid).length) {
      await transaction.rollback();
      return res.status(Status.code.Validation).json(valid);
    }

    const { time, range } = req.body;

    const user = req.auth;

    const image = req.file ? await Image.upload(req.file) : null;

    const runResult = await user.createRunResult(
      {
        time: time,
        range: range,
        image: image ? image.secure_url : null,
        image_id: image ? image.public_id : null,
      },
      {
        transaction: transaction,
      },
    );

    await transaction.commit();

    return Response.success(res, Message.success._success, {
      runResult,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    next(error);
  }
};

/**
 * Get all run result
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
    const condition = status
      ? {
          user_id: req.user.user_id,
          status: status,
        }
      : {
          user_id: req.user.user_id,
        };
    const attribute = [
      "id",
      "user_id",
      "range",
      "time",
      "image",
      "image_id",
      "status",
      "reject_description",
      "createdAt",
      "updatedAt",
    ];

    if (per_page) {
      const runResultData = {};
      page = page && page > 0 ? page : 1;

      const runResult = await db.RunResult.findAndCountAll({
        where: condition,
        attributes: attribute,
        limit: per_page,
        offset: (page - 1) * per_page,
        subQuery: false,
      });

      runResultData.data = runResult.rows;
      runResultData.pagination = {
        total: runResult.count,
        per_page: per_page,
        total_pages: Math.ceil(runResult.count / per_page),
        current_page: page,
      };
      return Response.success(res, Message.success._success, runResultData);
    }

    const runResult = await req.auth.getRunResults({
      where: condition,
      attributes: attribute,
    });
    return Response.success(res, Message.success._success, runResult);
  } catch (error) {
    next(error);
  }
};

/**
 * Get one run result
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.findOne = async (req, res, next) => {
  try {
    const runResult = await db.RunResult.findByPk(req.params.id);
    return Response.success(res, Message.success._success, runResult);
  } catch (error) {
    next(error);
  }
};

// Update a RunResult by the id in the request
exports.update = async (req, res, next) => {
  let transaction;
  try {
    // Properly initialize the transaction
    transaction = await db.sequelize.transaction();

    const runResult = await db.RunResult.findByPk(req.params.id);
    const previousStatus = runResult.status;
    runResult.status = req.body.status;

    if (req.body.status === "approve" && previousStatus !== "approve") {
      // Only update ranking when status changes to approve
      let ranking = await db.Ranking.findOne({
        where: {
          user_id: runResult.user_id,
        },
        transaction: transaction,
      });

      if (!ranking) {
        ranking = await db.Ranking.create(
          {
            user_id: runResult.user_id,
          },
          {
            transaction: transaction,
          },
        );
      }

      await ranking.increment(
        {
          total_range: runResult.range,
          total_time: runResult.time,
        },
        {
          transaction: transaction,
        },
      );
    }

    if (req.body.reject_description) {
      runResult.reject_description = req.body.reject_description;
    }

    await runResult.save({ transaction });
    await transaction.commit();

    return Response.success(res, Message.success._success, runResult);
  } catch (error) {
    if (transaction) await transaction.rollback();
    next(error);
  }
};

// Delete a RunResult with the specified id in the request
exports.delete = (req, res) => {
  return Response.success(res, Message.success._success, {
    id: req.params.id,
  });
};

/**
 * Get all run result
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
    const search = req.query.search;

    // Base condition for status filter
    let condition = status ? { status: status } : {};

    // Setup include options with potential search query
    const includeOptions = {
      model: db.User,
      include: {
        model: db.UserProfile,
      },
    };

    // Add search functionality if search parameter exists
    if (search) {
      includeOptions.where = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
        ],
      };

      // Also search in UserProfile through nested include
      includeOptions.include.where = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { surname: { [Op.like]: `%${search}%` } },
          { bib: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const attribute = [
      "id",
      "user_id",
      "range",
      "time",
      "image",
      "image_id",
      "status",
      "reject_description",
      "createdAt",
      "updatedAt",
    ];

    if (per_page) {
      const runResultData = {};
      page = page && page > 0 ? page : 1;

      const runResult = await db.RunResult.findAndCountAll({
        where: condition,
        attributes: attribute,
        include: includeOptions,
        limit: per_page,
        offset: (page - 1) * per_page,
        subQuery: false,
        distinct: true, // Important for correct count when using includes
      });

      runResultData.data = runResult.rows;
      runResultData.pagination = {
        total: runResult.count,
        per_page: per_page,
        total_pages: Math.ceil(runResult.count / per_page),
        current_page: page,
      };
      return Response.success(res, Message.success._success, runResultData);
    }

    // Fix the non-paginated version to use direct query instead of association
    const runResult = await db.RunResult.findAll({
      where: condition,
      attributes: attribute,
      include: includeOptions,
      order: [["createdAt", "DESC"]],
    });

    return Response.success(res, Message.success._success, runResult);
  } catch (error) {
    console.error("Error in findAllAdmin:", error);
    next(error);
  }
};
