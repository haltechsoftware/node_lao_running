exports.success = {
  _success: 'success.',
}

exports.description = {
  _paymentDescription: (packageName) => {
    return `LaoRunning ${packageName} Package Subscription.`
  },
}

exports.fail = {
  _validation: 'validation error.',
  _no_roles: 'user has not right role.',
  _notFound: (value = null) => {
    return `${value} not found.`
  },
  _invalidCredential: 'invalid Credential.',
  _oldPassword: 'Invalid token, please login again.',
  _invalidToken: 'Invalid token.',
  _noToken: 'A token is required for authentication',
  _badRole: 'can not access with current role.',
  _routeNotfound: 'Route not found.',
  _unAutorize: 'UnAutorize.',
  _userAreadyPaid: 'User aready had a package.',
  _areadyChooseRange: 'User aready choose a range and can not chage any more.',
  _freeUser: 'Free user can not choose range.',
  _existPhone: 'This phone has aready used',
}

exports.serverError = {
  _serverError: 'some thing when wrong.'
}

exports.validation = (validationCase, key, value = null) => {
  switch (validationCase) {
    case 'required':
      return `${key} is required.`
    case 'exists':
      return `${key} is exists.`
    case 'not_exists':
      return `${key} is not exists.`
    case 'min':
      return `${key} can not be less than ${value}.`
    case 'is_email':
      return `${key} must be an valid email.`
    case 'is_time':
      return `${key} must be an valid time.`
    case 'is_number':
      return `${key} must be an valid number.`
  }
}