const httpStatus = require('http-status');
const { UserActivity } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

// eslint-disable-next-line no-unused-vars
const userActivityPopulateObject = [
  {
    path: 'user',
  },
  {
    path: 'provider',
  },
];

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<UserActivity>}
 */
// eslint-disable-next-line no-unused-vars
const getUserActivityById = async (id, options = {}) => {
  return UserActivity.findById(id).populate(userActivityPopulateObject);
};

/**
 * Get item by id
 * @returns {Promise<UserActivity>}
 * @param filter
 */
// eslint-disable-next-line no-unused-vars
const getUserActivitys = async (filter) => {
  return UserActivity.find(filter).populate(userActivityPopulateObject);
};

/**
 * Create a item userActivity
 * @param {Object} itemBody
 * @param user
 * @returns {Promise<UserActivity>}
 */
const createUserActivity = async (itemBody) => {
  const body = itemBody;
  // eslint-disable-next-line no-console
  const created = await UserActivity.create(body);
  return getUserActivityById(created.id);
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryUserActivitys = async (filter, options) => {
  return UserActivity.paginate(filter, options, null, [{ path: 'user' }]);
};

/**
 * Update Option by id
 * @param {ObjectId} userActivityId
 * @param {Object} updateBody
 * @returns {Promise<UserActivity>}
 */
const updateUserActivityById = async (userActivityId, updateBody) => {
  const item = await getUserActivityById(userActivityId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'UserActivity not found');
  }
  Object.assign(item, updateBody);
  await item.save();
  return getUserActivityById(userActivityId);
};

/**
 * userActivity action by id
 * @returns {Promise<UserActivity>}
 * @param {Object} updateBody
 */
const userActivitysActionById = async (updateBody) => {
  try {
    if (!updateBody) throw new ApiError(httpStatus.BAD_REQUEST, 'UserActivity not found');
    const { userActivityId } = updateBody;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < userActivityId.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const userActivity = await getUserActivityById(userActivityId[i]);
      // eslint-disable-next-line no-await-in-loop
      await UserActivity.updateMany(
        {
          _id: userActivity._id,
        },
        { $set: { enableForSale: updateBody.enableForSale } },
        { multi: true }
      );
    }
    return userActivityId;
  } catch (e) {
    throw new ApiError(httpStatus.BAD_REQUEST, e);
  }
};

/**
 * Delete userActivity by id
 * @param {Object} userActivityId
 * @returns {Promise<Balance>}
 */
const deleteUserActivityById = async (userActivityId) => {
  // eslint-disable-next-line no-await-in-loop
  const _userActivity = await getUserActivityById(userActivityId);
  if (!_userActivity) {
    throw new ApiError(httpStatus.NOT_FOUND, 'UserActivity not found');
  }
  // eslint-disable-next-line no-await-in-loop
  await _userActivity.remove();
  return _userActivity;
};

module.exports = {
  createUserActivity,
  getUserActivitys,
  queryUserActivitys,
  getUserActivityById,
  updateUserActivityById,
  userActivitysActionById,
  deleteUserActivityById,
};
