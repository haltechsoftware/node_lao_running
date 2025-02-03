import db from "../../models";
import {
  Op
} from 'sequelize'
import Response from '../helpers/response.helper';
import Message from '../helpers/message.helper';

/**
 * Get all Package.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.findAllPackage = async (req, res, next) => {
  try {
    const per_page = Number.parseInt(req.query.per_page)
    let page = Number.parseInt(req.query.page)

    let myPackage

    if (req.user) {
      const userPackage = await db.UserPackage.findOne({
        where: {
          user_id: req.user.user_id
        }
      })
      if (userPackage) {
        myPackage = await userPackage.getPackage()
      }
    }

    if (per_page) {
      let packageData = {}
      page = page && page > 0 ? page : 1

      const packages = await db.Package.findAndCountAll({
        limit: per_page,
        offset: (page - 1) * per_page,
        subQuery: false,
        include: [{
          model: db.PackageRegisterReward
        }, {
          model: db.PackageCompleteReward
        }, {
          model: db.PackageImage
        }]
      })

      packageData.myPackage = myPackage
      packageData.data = packages.rows
      packageData.pagination = {
        total: packages.count,
        per_page: per_page,
        total_pages: Math.ceil(packages.count / per_page),
        current_page: page
      }

      return Response.success(res, Message.success._success, packageData);
    }

    const packages = await db.Package.findAll({
      include: [{
        model: db.PackageRegisterReward
      }, {
        model: db.PackageCompleteReward
      }, {
        model: db.PackageImage
      }]
    })
    const data = {
      myPackage,
      data: packages
    }

    return Response.success(res, Message.success._success, data);

  } catch (error) {
    next(error)
  }
}

/**
 * Get one Package.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.findOnePackage = async (req, res, next) => {
  try {
    const id = req.params.id
    const packages = await db.Package.findByPk(id, {
      include: [{
        model: db.PackageRegisterReward
      }, {
        model: db.PackageCompleteReward
      }, {
        model: db.PackageImage
      }]
    })

    return Response.success(res, Message.success._success, packages);

  } catch (error) {
    next(error)
  }
}

/**
 * Get all Branche.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.findAllBranche = async (req, res, next) => {
  try {
    const per_page = Number.parseInt(req.query.per_page)
    let page = Number.parseInt(req.query.page)

    if (per_page) {
      let brancheData = {}
      page = page && page > 0 ? page : 1

      const branches = await db.HalBranche.findAndCountAll({
        limit: per_page,
        offset: (page - 1) * per_page,
        subQuery: false
      })

      brancheData.data = branches.rows
      brancheData.pagination = {
        total: branches.count,
        per_page: per_page,
        total_pages: Math.ceil(branches.count / per_page),
        current_page: page
      }

      return Response.success(res, Message.success._success, brancheData);
    }

    const branches = await db.HalBranche.findAll()

    return Response.success(res, Message.success._success, branches);
  } catch (error) {
    next(error)
  }
}

/**
 * Get one Branche.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.findOneBranche = async (req, res, next) => {
  try {
    const id = req.params.id
    const branches = await db.HalBranche.findByPk(id)
    throw new Error('ee')

    return Response.success(res, Message.success._success, branches);

  } catch (error) {
    next(error)
  }
}

/**
 * Get all Nation.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.findAllNation = async (req, res, next) => {
  try {
    const per_page = Number.parseInt(req.query.per_page)
    let page = Number.parseInt(req.query.page)

    if (per_page) {
      let nationData = {}
      page = page && page > 0 ? page : 1

      const nations = await db.National.findAndCountAll({
        limit: per_page,
        offset: (page - 1) * per_page,
        subQuery: false
      })

      nationData.data = nations.rows
      nationData.pagination = {
        total: nations.count,
        per_page: per_page,
        total_pages: Math.ceil(nations.count / per_page),
        current_page: page
      }

      return Response.success(res, Message.success._success, nationData);
    }

    const laos = await db.National.findAll({
      where: {
        name: 'Laos'
      }
    })
    const nations = await db.National.findAll({
      where: {
        name: {
          [Op.ne]: 'Laos'
        }
      }
    })

    const nationData = Object.assign(nations,
      laos
    )

    return Response.success(res, Message.success._success, nationData);
  } catch (error) {
    next(error)
  }
}

/**
 * Get one Nation.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.findOneNation = async (req, res, next) => {
  try {
    const id = req.params.id
    const nation = await db.National.findByPk(id)

    return Response.success(res, Message.success._success, nation);

  } catch (error) {
    next(error)
  }
}

/**
 * Get all Ranking.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.findAllRanking = async (req, res, next) => {
  try {
    const bib = req.query.bib
    const per_page = Number.parseInt(req.query.per_page)
    let page = Number.parseInt(req.query.page)
    const rangeCondition = req.query.range
      ? {
        range: req.query.range,
      }
      : null

    const includeUser = [
      {
        model: db.UserProfile,
        required: true,
        where: rangeCondition
      }, {
        model: db.UserPackage,
        include: {
          model: db.Package,
        },
      }]

    const attributesOption = [
      [db.sequelize.literal('(RANK() OVER (ORDER BY total_range DESC))'), 'rank'], 'id', 'total_range', 'total_time'
    ]
    const includeOption = {
      model: db.User,
      required: true,
      attributes: ['id', 'name', 'email', 'phone'],
      include: includeUser
    }


    if (!per_page) {
      const ranking = await db.Ranking.findAll({
        attributes: attributesOption,
        include: includeOption
      })
      if (bib)
        return Response.success(res, Message.success._success, ranking.filter(item => item.User.UserProfile.bib == bib));

      return Response.success(res, Message.success._success, ranking);
    }

    let rannkingData = {}
    page = page && page > 0 ? page : 1

    const ranking = await db.Ranking.findAndCountAll({
      limit: per_page,
      offset: (page - 1) * per_page,
      subQuery: false,
      attributes: attributesOption,
      include: includeOption
    })

    rannkingData.data = ranking.rows

    rannkingData.pagination = {
      total: ranking.count,
      per_page: per_page,
      total_pages: Math.ceil(ranking.count / per_page),
      current_page: page,

    }

    return Response.success(res, Message.success._success, rannkingData);

  } catch (error) {
    next(error)
  }
}

/**
 * Get all Image.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.findAllImage = async (req, res, next) => {
  try {
    const per_page = Number.parseInt(req.query.per_page)
    let page = Number.parseInt(req.query.page)

    const runImageData = {};

    let runImages = await db.RunResult.findAll({
      where: {
        status: 'approve'
      },
      order: [
        ['id', 'DESC']
      ],
      group: ['user_id'],
    })
    if (per_page) {
      page = page && page > 0 ? page : 1

      const totalCount = Object.keys(runImages).length


      runImages = await db.RunResult.findAll({
        limit: per_page,
        offset: (page - 1) * per_page,
        subQuery: false,
        order: [
          ['id', 'DESC']
        ],
        group: ['user_id'],
      })
      runImageData.data = runImages
      runImageData.pagination = {
        total: totalCount,
        per_page: per_page,
        total_pages: Math.ceil(totalCount / per_page),
        current_page: page,

      }

      return Response.success(res, Message.success._success, runImageData);
    }

    runResultData = await db.RunResult.findAll({
      order: [
        ['id', 'DESC']
      ],
      group: ['user_id'],
    })
    return Response.success(res, Message.success._success, runResultData);
  } catch (error) {
    next(error)
  }
}

/**
 * Get all sumary.
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @returns \app\helpers\response.helper
 */
exports.getSumary = async (req, res, next) => {
  try {

  } catch (error) {

  }
}