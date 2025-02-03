import db from "../../models";
import Response from '../helpers/response.helper';
import Status from '../helpers/status.helper';
import Message from '../helpers/message.helper';
import createError from 'http-errors'

/**
 * Create Video.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.store = async (req, res, next) => {
  try {
    const link = await db.Video.create({
      link: req.body.link
    })
    return Response.success(res, Message.success._success, link);

  } catch (error) {
    next(error)
  }
}

/**
 * Get Video.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.index = async (req, res, next) => {
  try {
    // Pagiate
    const per_page = Number.parseInt(req.query.per_page)
    let page = Number.parseInt(req.query.page)
    const orderCondition = [
      ['id', 'DESC']
    ];

    if (per_page) {
      let videoData = {}
      page = page && page > 0 ? page : 1

      const video = await db.Video.findAndCountAll({
        order: orderCondition,
        limit: per_page,
        offset: (page - 1) * per_page,
        subQuery: false
      })

      videoData.data = video.rows
      videoData.pagination = {
        total: video.count,
        per_page: per_page,
        total_pages: Math.ceil(video.count / per_page),
        current_page: page
      }
      return Response.success(res, Message.success._success, videoData);
    }

    const video = await db.Video.findAll({
      order: orderCondition
    })
    return Response.success(res, Message.success._success, video);

  } catch (error) {
    next(error)
  }
}

/**
 * Delete Video.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.destroy = async (req, res, next) => {
  try {
    const videos = await db.Video.findOne(
      {
        where: {
          id: req.params.id
        }
      })
    if (!videos) return next(createError(Message.fail._notFound('video'), 404))

    await videos.destroy()

    return Response.success(res, Message.success._success, null);

  } catch (error) {
    next(error)
  }
}

/**
 * Get a video.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.show = async (req, res, next) => {
  try {
    const id = req.params.id
    const videos = await db.Video.findOne(
      {
        where: {
          id: id
        }
      })
    if (!videos) return next(createError(Message.fail._notFound(`video: ${id}`), 404))

    return Response.success(res, Message.success._success, videos);

  } catch (error) {
    next(error)
  }
}