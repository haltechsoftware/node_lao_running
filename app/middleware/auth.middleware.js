import jwt from "jsonwebtoken";
import Message from "../helpers/message.helper";
import Status from "../helpers/status.helper";
import db from "../../models";

const verifyToken = async (req, res, next) => {
  let token =
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"] ||
    req.headers["authorization"];

  if (
    req.headers["authorization"] &&
    req.headers["authorization"].startsWith("Bearer ")
  ) {
    token = req.headers["authorization"].split(" ")[1];
  }

  if (!token) {
    return res
      .status(Status.code.Unauthorized)
      .json({ message: Message.fail._unAutorize });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const auth = await db.User.findByPk(decoded.user_id);

    if (auth.resetPasswordAt && auth.resetPasswordAt > decoded.iat) {
      return res
        .status(Status.code.Unauthorized)
        .json({ message: Message.fail._oldPassword });
    }

    req.user = decoded;
    req.auth = auth;

    next();
  } catch (err) {
    return res
      .status(Status.code.Unauthorized)
      .json({ message: Message.fail._unAutorize, error: err.message });
  }
};

module.exports = verifyToken;
