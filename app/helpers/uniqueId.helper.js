import db from '../../models'

exports.generateRandomInvoiceId = async () => {
  const randomId = require('crypto').randomBytes(5).toString('hex')
  const sameId = await db.UserPackage.findOne({
    where: {
      invoice_id: randomId
    }
  })
  if (sameId) generateRandomInvoiceId()

  return randomId
}

exports.generateRandomTransactionId = async () => {
  const randomId = require('crypto').randomBytes(5).toString('hex')
  const sameId = await db.UserPackage.findOne({
    where: {
      transaction_id: randomId
    }
  })
  if (sameId) generateRandomTransactionId()

  return randomId
}

exports.generateRandomTerminalId = async () => {
  const randomId = require('crypto').randomBytes(5).toString('hex')
  const sameId = await db.UserPackage.findOne({
    where: {
      terminal_id: randomId
    }
  })
  if (sameId) generateRandomTerminalId()

  return randomId
}