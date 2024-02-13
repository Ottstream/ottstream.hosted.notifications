const httpStatus = require('http-status');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
// eslint-disable-next-line no-unused-vars
const { User, OttProvider } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');
// eslint-disable-next-line no-unused-vars
const tokenService = require('./token.repository');
// const config = require('../../config/config');
// const { sendEmail } = require('../../utils/reset_password_send_message/send_message');
// eslint-disable-next-line no-unused-vars
const roleService = require('../role/role.repository');
const Token = require('../../models/user/token.model');

const userPopulate = [
  {
    path: 'provider',
  },
  {
    path: 'roles',
    populate: { path: 'permissions' },
  },
];

// const updateAccessEnable = async (userId) => {
//   if (userId) {
//     await User.updateOne({
//       userId,
//       $set: { state: 2 },
//       new: true,
//     });
//     throw new Error('User is disabled');
//   }
// };
/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id).populate(userPopulate).exec();
};

/**
 * Get user by TelLogin
 * @param TelLogin
 * @returns {Promise<User>}
 */
const getUserByTelegramLogin = async (TelLogin) => {
  const user = await User.findOne({
    telegramLogin: TelLogin,
  }).populate(userPopulate);
  return user;
};

/**
 * Get user by id
 * @param {ObjectId} filter
 * @returns {Promise<User>}
 */
const getAllUsers = async (filter) => {
  return User.find(filter);
};

/**
 * reset settings
 */
const resetSettings = async () => {
  await User.updateMany({}, { $set: { settings: {}, userSettings: {} } }, { multi: true });
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserByGoogleId = async (id) => {
  return User.find({ googleId: id }).populate(userPopulate).exec();
};

/**
 * isEmailTaken
 * @param email
 * @param userId
 * @returns {Promise<*>}
 */
const isEmailTaken = async (email, userId) => {
  const result = await User.isEmailTaken(email, userId);
  return result;
};

/**
 * Create a user
 * @param {Object} userBody
 * @param {Object} geoInfo
 * @param role
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const body = {};
  // check isSelectedRole is true: user choose any role, otherwise false
  Object.assign(body, userBody);
  body.number = Math.floor(100000 + Math.random() * 900000); // TODO remove from here
  return getUserById((await User.create(body)).id);
};

/**
 * Check a UserPhone
 * @param {Object} userEmailBody
 * @param user
 * @returns {Promise<UserEmail>}
 */
const UserCheckEmail = async (userEmailBody = {}) => {
  return User.isEmailTaken(userEmailBody.email, userEmailBody.userId);
};

/**
 * Check a UserPhone
 * @param {Object} userPhoneBody
 * @param user
 * @returns {Promise<UserPhone>}
 */
const UserCheckPhone = async (userPhoneBody = {}) => {
  return User.isPhoneTaken(userPhoneBody.phone, userPhoneBody.userId);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param user
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryUsers = async (filter, options, user) => {
  const curOptions = {
    page: options.page ?? 1,
    all: options.all ?? false,
    limit: options.all ? 10000000 : options.limit ?? 20,
  };
  const sortObject = {
    // _id: -1,
  };
  if (options.sortBy) {
    if (typeof options.sortBy === 'object') {
      options.sortBy.forEach(function (sortOption) {
        const parts = sortOption.split(':');
        sortObject[parts[0]] = parts[1] === 'desc' ? -1 : 1;
      });
    } else if (typeof options.sortBy === 'string') {
      const parts = options.sortBy.split(':');
      sortObject[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }
  } else {
    sortObject._id = -1;
  }
  const match = {};

  // status to 1
  match.status = { $eq: 1 };

  // country
  // if (typeof filter.isSelectedRole !== 'undefined') {
  //   match.isSelectedRole = { $eq: filter.isSelectedRole };
  // }

  // if (filter.firstname) {
  //   match.firstname = { $regex: `.*${filter.firstname}.*` };
  // }
  // if (filter.lastname) {
  //   match.lastname = { $regex: `.*${filter.lastname}.*` };
  // }
  // if (filter.email) {
  //   match.email = { $regex: `.*${filter.email}.*` };
  // }
  // if (filter.phone) {
  //   match.phone = { $regex: `.*${filter.phone}.*` };
  // }
  // if (typeof filter.accessEnable !== 'undefined') {
  //   match.accessEnable = { $eq: filter.accessEnable };
  // }

  // resellers
  if (user && user.provider) {
    match.provider = { $eq: mongoose.Types.ObjectId(user.provider._id.toString()) };
    match._id = { $ne: mongoose.Types.ObjectId(user._id) };
  }

  if (filter.search) {
    match.$or = [
      {
        // eslint-disable-next-line security/detect-non-literal-regexp
        email: { $regex: new RegExp(`.*${filter.search}.*`, 'i') },
      },
      {
        // eslint-disable-next-line security/detect-non-literal-regexp
        firstname: { $regex: new RegExp(`.*${filter.search}.*`, 'i') },
      },
      {
        // eslint-disable-next-line security/detect-non-literal-regexp
        lastname: { $regex: new RegExp(`.*${filter.search}.*`, 'i') },
      },
    ];
  }

  if (typeof filter.admin !== 'undefined') {
    match.$or = [
      {
        'rolesInfo.admin': { $eq: filter.admin },
      },
    ];
  }
  if (typeof filter.cashier !== 'undefined') {
    match.$or = [
      {
        'rolesInfo.cashier': { $eq: filter.cashier },
      },
    ];
  }
  if (typeof filter.advancedCashier !== 'undefined') {
    match.$or = [
      {
        'rolesInfo.advancedCashier': { $eq: filter.advancedCashier },
      },
    ];
  }
  if (typeof filter.equipmentInstaller !== 'undefined') {
    match.$or = [
      {
        'rolesInfo.equipmentInstaller': { $eq: filter.equipmentInstaller },
      },
    ];
  }
  if (typeof filter.support !== 'undefined') {
    match.$or = [
      {
        'rolesInfo.support': { $eq: filter.support },
      },
    ];
  }
  // if (filter.roles) {
  //   const roles = filter.roles.split(',');
  //   const elemMatches = [];
  //   if (roles && roles.length) {
  //     roles.forEach((role) => {
  //       // elemMatches.push({ $elemMatch:discounts { id: mongoose.Types.ObjectId(role) } });
  //       elemMatches.push(mongoose.Types.ObjectId(role));
  //     });
  //     // match['roles._id'] = mongoose.Types.ObjectId(roles[0]);
  //
  //     match.roles = {
  //       $all: elemMatches,
  //     };
  //     // match.roles = { $all: roles };
  //   } else if (filter.roles.length) {
  //     match.roles = {
  //       $in: elemMatches,
  //     };
  //   }
  // }
  const myAggregate = User.aggregate([
    {
      $match: match,
    },
    {
      $lookup: {
        from: 'roles',
        localField: 'roles',
        foreignField: '_id',
        as: 'roles',
      },
    },
    {
      $lookup: {
        from: 'ottproviders',
        localField: 'provider',
        foreignField: '_id',
        as: 'providers',
      },
    },
    { $sort: sortObject },
  ]);

  const list = await User.aggregatePaginate(myAggregate, curOptions);

  list.docs.forEach((elem) => {
    if (elem.providers.length) {
      // eslint-disable-next-line no-param-reassign,prefer-destructuring
      elem.provider = elem.providers[0];
      // eslint-disable-next-line no-param-reassign
      elem.provider.id = elem.provider._id;
      // elem.rolesInfo = { admin: elem.admin, cashier: elem.cashier, support: elem.support };
      // eslint-disable-next-line no-param-reassign
      delete elem.provider._id;
    }
    elem.roles.forEach(function (role) {
      // eslint-disable-next-line no-param-reassign
      role.id = role._id;
      // eslint-disable-next-line no-param-reassign
      delete role._id;
    });
    // eslint-disable-next-line no-param-reassign
    delete elem.providers;
    // eslint-disable-next-line no-param-reassign
    elem.id = elem._id;
    // eslint-disable-next-line no-param-reassign
    delete elem._id;
  });
  return {
    results: list.docs,
    page: list.page,
    limit: list.limit,
    totalPages: list.totalPages,
    totalResults: list.totalDocs,
  };
};

/**
 * Query for active users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param user
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryActiveUsers = async (filter, options, user) => {
  const curOptions = {
    page: options.page ?? 1,
    all: options.all ?? false,
    limit: options.all ? 10000000 : options.limit ?? 20,
  };

  const sortObject = {
    // _id: -1,
  };
  if (options.sortBy) {
    if (typeof options.sortBy === 'object') {
      options.sortBy.forEach(function (sortOption) {
        const parts = sortOption.split(':');
        sortObject[parts[0]] = parts[1] === 'desc' ? -1 : 1;
      });
    } else if (typeof options.sortBy === 'string') {
      const parts = options.sortBy.split(':');
      sortObject[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }
  } else {
    sortObject._id = -1;
  }

  const match = {};
  const loginMatch = {};
  match.$or = [];
  loginMatch.$and = [];

  // status to 1
  match.status = { $eq: 1 };

  if (user && user.provider) {
    match.provider = { $eq: mongoose.Types.ObjectId(user.provider._id.toString()) };
  }

  // таблица доступны только для ролей “Admin”
  match.$or.push({
    'rolesInfo.admin': { $eq: true },
  });

  if (typeof filter.userStatus !== 'undefined') {
    match.accessEnable = { $eq: filter.userStatus };
  }

  if (typeof filter.id !== 'undefined') {
    match.number = { $eq: filter.id };
  }

  if (typeof filter.ipAddressesSearch !== 'undefined') {
    match.$or = [
      {
        'geoInfo.realIp': { $regex: `.*${filter.ipAddressesSearch}.*` },
      },
    ];
  }

  if (typeof filter.city !== 'undefined') {
    match.$or = [
      {
        'geoInfo.city': { $regex: `.*${filter.city}.*`, $options: 'i' },
      },
      {
        'geoInfo.city.names.en': { $regex: `.*${filter.city}.*`, $options: 'i' },
      },
    ];
  }
  if (typeof filter.country !== 'undefined') {
    match.$or = [
      {
        'geoInfo.country': { $regex: `.*${filter.country}.*`, $options: 'i' },
      },
    ];
  }

  if (typeof filter.loginStatus !== 'undefined') {
    match.$or.push({
      loginStatus: { $eq: filter.loginStatus },
    });
  }

  if (filter.search) {
    match.$or = [
      {
        // eslint-disable-next-line security/detect-non-literal-regexp
        email: { $regex: new RegExp(`.*${filter.search}.*`, 'i') },
      },
      {
        // eslint-disable-next-line security/detect-non-literal-regexp
        'phone.phoneNumber': { $regex: new RegExp(`.*${filter.search.replace('+', '')}.*`, 'i') },
      },
      {
        // eslint-disable-next-line security/detect-non-literal-regexp
        firstname: { $regex: new RegExp(`.*${filter.search}.*`, 'i') },
      },
      {
        // eslint-disable-next-line security/detect-non-literal-regexp
        lastname: { $regex: new RegExp(`.*${filter.search}.*`, 'i') },
      },
    ];
  }

  if (typeof filter.loginStartDate !== 'undefined' && typeof filter.loginEndDate !== 'undefined') {
    loginMatch.$and.push({
      updatedAt: { $gte: filter.loginStartDate },
    });
    loginMatch.$and.push({
      updatedAt: { $lte: filter.loginEndDate },
    });
  } else if (typeof filter.loginStartDate !== 'undefined') {
    match.updatedAt = { $gte: filter.loginStartDate };
  } else if (typeof filter.loginEndDate !== 'undefined') {
    match.updatedAt = { $lte: filter.loginStartDate };
  }

  if (!match.$or.length) delete match.$or;
  if (!loginMatch.$and.length) delete loginMatch.$and;

  const myAggregate = User.aggregate([
    {
      $match: match,
    },
    {
      $match: loginMatch,
    },
    {
      $lookup: {
        from: 'roles',
        localField: 'roles',
        foreignField: '_id',
        as: 'roles',
      },
    },
    { $sort: sortObject },
  ]);

  const list = await User.aggregatePaginate(myAggregate, curOptions);

  list.docs.forEach((elem, i) => {
    list.docs[i].id = elem._id;
    list.docs[i].loginDateTime = elem.updatedAt;
    list.docs[i].userCurrentStatus = elem.accessEnable;
    list.docs[i].phoneNumber = elem.phone.phoneNumber;
    // loginStatus // TODO test the users login status
    // logOutDateTime // TODO test the logout users

    elem.roles.forEach(function (role) {
      // eslint-disable-next-line no-param-reassign
      role.id = role._id;
      // eslint-disable-next-line no-param-reassign
      delete role._id;
    });
    // eslint-disable-next-line no-param-reassign
    delete elem.providers;
    // eslint-disable-next-line no-param-reassign
    elem.id = elem._id;
    // eslint-disable-next-line no-param-reassign
    delete elem._id;
  });
  return {
    results: list.docs,
    page: list.page,
    limit: list.limit,
    totalPages: list.totalPages,
    totalResults: list.totalDocs,
  };
};
/**
 * Get reg users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const getRegistrationUsers = async (filter, options) => {
  return User.paginate(filter, options, {
    email: true,
    firstname: true,
    lastname: true,
    state: true,
  });
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email }).populate(userPopulate);
};

/**
 * Get user by firstname
 * @returns {Promise<User>}
 * @param firstname
 */
const getUserByFirstname = async (firstname) => {
  return User.findOne({ firstname }).populate(userPopulate);
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserSettings = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  // if (typeof user.phone === 'string') {
  //   const phone = {
  //     phoneNumber: user.phone,
  //     countryCode: 'us',
  //   };
  //   user.phone = phone;
  // }
  // if (typeof user.phone === 'object') {
  //   user.phone.phoneNumber = `phone_${user.email}`;
  // }
  Object.assign(user.settings, updateBody);
  await User.updateOne(
    {
      _id: userId,
    },
    { $set: { settings: user.settings } },
    { multi: false }
  );
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @returns {Promise<User>}
 * @param userId
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user not found');
  }
  // return OttProvider.updateOne({ _id: ottprovider._id }, { $set: { status: 0 } }, { multi: false });
  await user.remove();
  return user;
};

/**
 * Delete user by id
 * @returns {Promise<User>}
 * @param {Object} updateBody
 */
const deleteMultiplyUserById = async (updateBody) => {
  // console.log(updateBody);
  const item = updateBody.userId;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < item.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    const user = await getUserById(item[i]);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'user not found');
    }
    // eslint-disable-next-line no-await-in-loop
    await user.remove();
  }
  return item;
};

/**
 * user action by id
 * @returns {Promise<User>}
 * @param {Object} updateBody
 */
const userActionById = async (updateBody) => {
  if (!updateBody) throw new ApiError(httpStatus.BAD_REQUEST, 'User action not found');

  const { userId } = updateBody;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < userId.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    const user = await getUserById(userId[i]);
    // eslint-disable-next-line no-await-in-loop
    await User.updateMany(
      {
        _id: user._id,
      },
      { $set: { accessEnable: updateBody.accessEnable } },
      { multi: true }
    );
  }
  return userId;
};

const checkUserState = async (email) => {
  const userObj = await getUserByEmail(email);
  // if ((userObj && userObj.state !== 1) || (userObj && userObj.state === 1)) {
  //
  // }
  if (userObj && userObj.state === 0) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not approved user');
  }
  if (userObj && userObj.state === 2) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Rejected user');
  }
};

/**
 * Check disable User by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const checkDisableUser = async (email) => {
  const user = await getUserByEmail(email);
  if (!user.accessAnEnable) {
    await user.updateOne({
      email,
      $set: { state: 3 }, // Disable user's state
      new: true,
    });
    throw new ApiError(httpStatus.FORBIDDEN, 'Disabled user');
  }
  // const disableUpdated = user.accessDisable === updateBody.accessDisable;
  // if (!disableUpdated) {
  //   if (!updateBody.accessDisable) {
  //     await user.updateOne({
  //       email,
  //       $set: { state: 2 },
  //       new: true,
  //     });
  //   }
  // }
  await user.save();
  return user;
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
// eslint-disable-next-line no-unused-vars
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    // tested verify token
    // const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, 'resetPassword');
    const payload = jwt.verify(resetPasswordToken, config.jwt.secret);
    const tokenDoc = await Token.findOne({ resetPasswordToken, resetPassword, user: payload.sub, blacklisted: false });
    if (!tokenDoc) {
      throw new Error('Token not found');
    }
    const user = await getUserById(tokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: 'resetPassword' });
    await updateUserById(user.id, { password: newPassword });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, error);
  }
};

/**
 * Reset password
 * @returns {Promise}
 * @param userId
 */
// eslint-disable-next-line no-unused-vars
const resetLoginCount = async (userId) => {
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No User Found');
    }
    await updateUserById(user.id, { loginAttempt: 0 });
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, ' count failed');
  }
};

/**
 * email reset password
 * @param {string} email
 * @returns {Promise}
 */
// eslint-disable-next-line no-unused-vars
const emailResetPassword = async (email) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const item of email) {
    // eslint-disable-next-line no-await-in-loop
    await getUserByEmail(item);
  }
  return email;
};

/**
 * Get list
 * @returns {Promise<User>}
 */
// eslint-disable-next-line no-unused-vars
const getList = async (filter = {}, populate = [], projection = null) => {
  const query = User.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

module.exports = {
  getList,
  createUser,
  resetSettings,
  checkUserState,
  checkDisableUser,
  queryUsers,
  queryActiveUsers,
  getRegistrationUsers,
  getUserById,
  getUserByEmail,
  getUserByFirstname,
  getUserByGoogleId,
  updateUserById,
  updateUserSettings,
  deleteMultiplyUserById,
  deleteUserById,
  userActionById,
  isEmailTaken,
  resetPassword,
  emailResetPassword,
  resetLoginCount,
  UserCheckEmail,
  UserCheckPhone,
  getAllUsers,
  getUserByTelegramLogin,
};
