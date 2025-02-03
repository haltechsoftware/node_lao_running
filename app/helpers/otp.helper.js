import jwt from 'jsonwebtoken'

exports.verify = (id_token) => {
  const decodeData = jwt.decode(id_token)
  const seconds = new Date().getTime() / 1000;

  if (
    !decodeData
    || decodeData.exp < seconds
    || decodeData.iss != process.env.F_ISS
  ) return null

  return decodeData
};