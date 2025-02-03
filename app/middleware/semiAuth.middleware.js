import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  let token =
    req.body.token || req.query.token || req.headers["x-access-token"] || req.headers["authorization"];

  if (token) {
    if (token.substring(0, 6) === 'Bearer') {
      const bearer = token.split(' ');
      token = bearer[1];
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;
    } catch (err) {
      console.log(err);
    }
  }

  return next();
};

module.exports = verifyToken;