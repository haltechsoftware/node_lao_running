/**
 * Get Error.
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns \app\helpers\response.helper
 */
exports.error = async (req, res) => {
  res.send("Route is not exists.");
};
