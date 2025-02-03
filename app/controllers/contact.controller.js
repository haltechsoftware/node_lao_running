import db from "../../models";
import Response from '../helpers/response.helper';
import Status from '../helpers/status.helper';
import Message from '../helpers/message.helper';
import createError from 'http-errors'

/**
 * Create contact.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.store = async (req, res, next) => {
  try {
    const link = await db.Contact.create({
      name: req.body.name,
      surname: req.body.surname,
      phone: req.body.phone,
      message: req.body.message,
    })
    return Response.success(res, Message.success._success, link);

  } catch (error) {
    next(error)
  }
}

/**
 * Get contact.
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
      let contactData = {}
      page = page && page > 0 ? page : 1

      const contact = await db.Contact.findAndCountAll({
        order: orderCondition,
        limit: per_page,
        offset: (page - 1) * per_page,
        subQuery: false
      })

      contactData.data = contact.rows
      contactData.pagination = {
        total: contact.count,
        per_page: per_page,
        total_pages: Math.ceil(contact.count / per_page),
        current_page: page
      }
      return Response.success(res, Message.success._success, contactData);
    }

    const contact = await db.Contact.findAll({
      order: orderCondition
    })
    return Response.success(res, Message.success._success, contact);

  } catch (error) {
    next(error)
  }
}

/**
 * Delete contact.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.destroy = async (req, res, next) => {
  try {
    const contacts = await db.Contact.findOne(
      {
        where: {
          id: req.params.id
        }
      })
    if (!contacts) return next(createError(Message.fail._notFound('contact'), 404))

    await contacts.destroy()

    return Response.success(res, Message.success._success, null);

  } catch (error) {
    next(error)
  }
}

/**
 * Get a contact.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.show = async (req, res, next) => {
  try {
    const id = req.params.id
    const contacts = await db.Contact.findOne(
      {
        where: {
          id: id
        }
      })
    if (!contacts) return next(createError(Message.fail._notFound(`contact: ${id}`), 404))

    return Response.success(res, Message.success._success, contacts);

  } catch (error) {
    next(error)
  }
}