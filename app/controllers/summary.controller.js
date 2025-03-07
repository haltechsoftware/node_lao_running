import db from "../../models";
import Response from "../helpers/response.helper";
import Message from "../helpers/message.helper";

/**
 * Get Summary.
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.summary = async (req, res, next) => {
  try {
    const resData = {};
    let condition = { status: "success" };
    const package_id = req.query.package_id;

    if (package_id) {
      condition = { package_id: package_id, status: "success" };
    }

    const summaryData = await db.UserPackage.findAll({
      where: condition,
      attributes: [
        "package_id",
        [db.sequelize.fn("sum", db.sequelize.col("total")), "total_amount"],
      ],
      include: {
        model: db.Package,
        attributes: ["id", "name", "price"],
      },
      group: ["package_id"],
    });

    let total = 0;
    summaryData.forEach((element) => {
      total += parseInt(element.dataValues.total_amount);
      console.log(
        total,
        element.dataValues.total_amount,
        parseInt(element.dataValues.total_amount),
      );
    });

    if (!package_id) {
      resData.total = total;
      resData.data = summaryData;

      return Response.success(res, Message.success._success, resData);
    }
    return Response.success(res, Message.success._success, summaryData);
  } catch (error) {
    next(error);
  }
};

/**
 * Get totalRange.
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.totalRange = async (req, res, next) => {
  try {
    const totalRange = await db.Ranking.findAll({
      attributes: [
        [
          db.sequelize.fn("sum", db.sequelize.col("total_range")),
          "total_range",
        ],
        [db.sequelize.fn("sum", db.sequelize.col("total_time")), "total_time"],
      ],
    });

    // Get total count of runners
    const totalRunners = await db.UserProfile.count({
      distinct: true,
      col: "user_id",
    });

    // Combine the data
    const responseData = {
      ...totalRange[0].dataValues,
      total_runners: totalRunners,
    };

    return Response.success(res, Message.success._success, responseData);
  } catch (error) {
    next(error);
  }
};
