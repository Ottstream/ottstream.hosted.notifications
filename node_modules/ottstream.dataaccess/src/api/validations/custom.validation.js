const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message('password must be at least 8 characters');
  }
  if (!value.match(/^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/)) {
    return helpers.message('password must contain at least 1 letter, 1 number and 1 symbol');
  }
  return value;
};

const hideCardNumber = (value) => {
  if (value && value.length && value.length >= 4) {
    // return `****-****-****-${value.substring(0, 4)}`; first 4 digits
    return `${value.replace(/.(?=.{4})/g, '*')}`;
  }
  return value;
};

const hideCVC = (value) => {
  if (value && value.length && value.length >= 3) {
    return `${value.replace(/./g, '*')}`;
  }
};

module.exports = {
  objectId,
  password,
  hideCardNumber,
  hideCVC,
};
