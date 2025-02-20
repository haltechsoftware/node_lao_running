import Message from "../helpers/message.helper";
import Status from "../helpers/status.helper";
import db from "../../models/";
import createError from "http-errors";

exports.hasRole = requiredRole => {
  return async (req, res, next) => {
    try {
      const user = await db.User.findByPk(req.user.user_id);
      if (!user) {
        return next(createError(Status.code.AuthError, Message.fail._unAutorize));
      }

      const userRoles = await user.getRoles(); // e.g. [{ name: "User" }, { name: "Admin" }, ... ]
      const roleNames = userRoles.map(r => r.name); // e.g. ["User", "Admin", ...]

      // If `requiredRole` is a single string:
      if (typeof requiredRole === "string") {
        if (!roleNames.includes(requiredRole)) {
          return res.status(403).json({
            error: true,
            code: 403,
            message: Message.fail._no_roles,
            data: requiredRole
          });
        }
        return next();
      }

      // If `requiredRole` can be an array of roles:
      if (Array.isArray(requiredRole)) {
        const found = requiredRole.some(r => roleNames.includes(r));
        if (!found) {
          return res.status(403).json({
            error: true,
            code: 403,
            message: Message.fail._no_roles,
            data: requiredRole
          });
        }
        return next();
      }

      // fallback if needed
      return next();
    } catch (error) {
      return next(error);
    }
  };
};