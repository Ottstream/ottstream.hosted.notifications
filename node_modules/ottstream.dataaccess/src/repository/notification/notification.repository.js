const httpStatus = require('http-status');
const { Notification } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

// eslint-disable-next-line no-unused-vars
const notificationPopulateObject = [
  {
    path: 'provider',
    select: 'id name',
  },
  {
    path: 'user',
    select: 'id firstname lastname',
  },
  {
    path: 'updateUser',
    select: 'id firstname lastname',
  },
  {
    path: 'client',
    select: 'id personalInfo',
  },
  {
    path: 'comment',
  },
];

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Notification>}
 */
// eslint-disable-next-line no-unused-vars
const getNotificationById = async (id, options = {}) => {
  return Notification.findById(id);
};

/**
 * Get item by id
 * @returns {Promise<Notification>}
 * @param filter
 */
// eslint-disable-next-line no-unused-vars
const getNotifications = async (filter) => {
  return Notification.find(filter);
};

/**
 * Create a item notification
 * @param {Object} itemBody
 * @param user
 * @returns {Promise<Notification>}
 */
const createNotification = async (itemBody, user) => {
  const body = itemBody;
  // eslint-disable-next-line no-console
  if (user) body.user = user._id;
  const created = await Notification.create(body);
  return getNotificationById(created.id);
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryNotifications = async (filter, options) => {
  const searchFilter = { ...filter };
  searchFilter.$and = [
    {
      $or: [{ provider: { $eq: filter.provider } }, { providers: { $in: [filter.provider] } }],
    },
    {
      $or: [{ isPrivate: { $in: [null, false] } }, { user: filter.user }],
    },
  ];
  delete searchFilter.provider;
  delete searchFilter.user;
  return Notification.paginate(searchFilter, options, null, notificationPopulateObject);
};

/**
 * Update Option by id
 * @param {ObjectId} notificationId
 * @param {Object} updateBody
 * @returns {Promise<Notification>}
 */
const updateNotificationById = async (notificationId, updateBody) => {
  const item = await getNotificationById(notificationId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  Object.assign(item, updateBody);
  await item.save();
  return getNotificationById(notificationId);
};

/**
 * notification action by id
 * @returns {Promise<Notification>}
 * @param {Object} updateBody
 */
const notificationsActionById = async (updateBody) => {
  try {
    if (!updateBody) throw new ApiError(httpStatus.BAD_REQUEST, 'Notification not found');
    const { notificationId } = updateBody;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < notificationId.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const notification = await getNotificationById(notificationId[i]);
      // eslint-disable-next-line no-await-in-loop
      await Notification.updateMany(
        {
          _id: notification._id,
        },
        { $set: { enableForSale: updateBody.enableForSale } },
        { multi: true }
      );
    }
    return notificationId;
  } catch (e) {
    throw new ApiError(httpStatus.BAD_REQUEST, e);
  }
};

/**
 * Delete notification by id
 * @param {Object} notificationId
 * @returns {Promise<Balance>}
 */
const deleteNotificationById = async (notificationId) => {
  // eslint-disable-next-line no-await-in-loop
  const _notification = await getNotificationById(notificationId);
  if (!_notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  // eslint-disable-next-line no-await-in-loop
  await _notification.remove();
  return _notification;
};

module.exports = {
  createNotification,
  getNotifications,
  queryNotifications,
  getNotificationById,
  updateNotificationById,
  notificationsActionById,
  deleteNotificationById,
};
