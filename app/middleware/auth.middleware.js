const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  let token =
    req.body.token || req.query.token || req.headers["x-access-token"] || req.headers["authorization"];

  if (token.substring(0, 6) === 'Bearer') {
    const bearer = token.split(' ');
    token = bearer[1];
  }

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;