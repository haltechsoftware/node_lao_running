import db from "../../models";
import Response from '../helpers/response.helper'
import Status from '../helpers/status.helper'
import Message from '../helpers/message.helper'
import createError from 'http-errors'
import Image from '../helpers/upload.helper'
import RunResultValid from '../validations/run_result.validation'

/**
 * Create run result
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper 
 */
exports.create = async (req, res, next) => {
  const transaction = await db.sequelize.transaction()
  try {
    const valid = await RunResultValid.create(req.body)
    if (Object.keys(valid).length) return next(createError(Status.code.Validation, valid))

    const {
      time,
      range
    } = req.body

    const user = req.auth

    let image = req.file ? await Image.upload(req.file) : null

    const runResult = await user.createRunResult({
      time: time,
      range: range,
      image: image ? image.secure_url : null,
      image_id: image ? image.public_id : null,
    }, {
      transaction: transaction
    })

    let ranking = await db.Ranking.findOne({
      where: {
        user_id: req.user.user_id
      }
    })
    if (!ranking) {
      ranking = await db.Ranking.create({
        user_id: req.user.user_id
      }, {
        transaction: transaction
      })
    }

    await ranking.increment({
      total_range: range,
      total_time: time
    }, {
      transaction: transaction
    })

    await transaction.commit()

    return Response.success(res, Message.success._success, {
      runResult,
      ranking: ranking
    })
  } catch (error) {
    await transaction.rollback()
    next(error)
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

    const per_page = Number.parseInt(req.query.per_page)
    let page = Number.parseInt(req.query.page)
    const status = req.query.status
    const condition = status ? {
      user_id: req.user.user_id,
      status: status
    } : {
      user_id: req.user.user_id
    }
    const attribute = ['id', 'user_id', 'range', 'time', 'image', 'image_id', 'status', 'reject_description', 'createdAt', 'updatedAt']

    if (per_page) {
      let runResultData = {}
      page = page && page > 0 ? page : 1

      const runResult = await db.RunResult.findAndCountAll({
        where: condition,
        attributes: attribute,
        limit: per_page,
        offset: (page - 1) * per_page,
        subQuery: false
      })

      runResultData.data = runResult.rows
      runResultData.pagination = {
        total: runResult.count,
        per_page: per_page,
        total_pages: Math.ceil(runResult.count / per_page),
        current_page: page
      }
      return Response.success(res, Message.success._success, runResultData);
    }

    const runResult = await req.auth.getRunResults({
      where: condition,
      attributes: attribute
    })
    return Response.success(res, Message.success._success, runResult)
  } catch (error) {
    next(error)
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
    const runResult = await db.RunResult.findOne(id)
    return Response.success(res, Message.success._success, runResult)

  } catch (error) {
    next(error)
  }

};

// Update a RunResult by the id in the request
exports.update = (req, res) => {

};

// Delete a RunResult with the specified id in the request
exports.delete = (req, res) => {

};