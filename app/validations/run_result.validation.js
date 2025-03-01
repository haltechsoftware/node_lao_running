import Message from "../helpers/message.helper";

exports.create = async (body) => {
  const errors = {};
  const { time, range } = body;
  try {
    if (!time) errors.time = Message.validation("required", "time");
    if (!range) errors.range = Message.validation("required", "range");

    if (!Object.keys(errors).length) {
      if (!(isInt(range) || isFloat(range)))
        errors.range = Message.validation("is_number", "range");
      if (!isInt(time)) errors.time = Message.validation("is_number", "time");

      console.log(isInt(time), isFloat(time), time, Number(time));
    }

    return errors;
  } catch (error) {
    console.log(error);

    throw error;
  }

  function isInt(n) {
    return Number(n) == n && n % 1 === 0;
  }

  function isFloat(n) {
    return Number(n) == n && n % 1 !== 0;
  }
};
