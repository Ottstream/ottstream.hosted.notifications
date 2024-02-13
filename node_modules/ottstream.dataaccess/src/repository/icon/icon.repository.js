const httpStatus = require('http-status');
const { Icon, IconOption } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

const iconPopulateObject = [
  // {
  //   path: 'payment.balance.currency',
  //   model: 'Currency',
  // },
  // {
  //   path: 'payment.balance.priceGroup',
  //   model: 'PriceGroup',
  // },
  // {
  //   path: 'locations',
  //   populate: [
  //     {
  //       path: 'room',
  //     },
  //   ],
  // },
  {
    path: 'provider',
  },
];

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Icon>}
 */
// eslint-disable-next-line no-unused-vars
const getIconById = async (id, options = {}) => {
  return Icon.findById(id).populate(iconPopulateObject);
};

/**
 * Get item by id
 * @param iconId
 * @param providerId
 * @param options
 * @returns {Promise<Icon>}
 */
// eslint-disable-next-line no-unused-vars
const getIconOption = async (iconId, providerId, options = {}) => {
  const items = await IconOption.find({
    provider: providerId,
    icon: iconId,
  }).populate(iconPopulateObject);
  if (items && items.length) return items[0];
  return null;
};

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Icon>}
 */
// eslint-disable-next-line no-unused-vars
const getIconByMiddlewareId = async (id, options = {}) => {
  const icons = await Icon.find({
    middlewareId: id,
  }).populate(iconPopulateObject);
  if (icons.length) return icons[0];
  return null;
};

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Icon>}
 */
// eslint-disable-next-line no-unused-vars
const getIconBySize = async (size, options = {}) => {
  const icons = await Icon.find({
    size,
  }).populate(iconPopulateObject);
  if (icons.length) return icons[0];
  return null;
};

/**
 * Create a item icon
 * @param {Object} itemBody
 * @param user
 * @returns {Promise<Icon>}
 */
const createIcon = async (itemBody, user) => {
  const body = itemBody;
  // eslint-disable-next-line no-console
  if (!user.provider) throw new ApiError('no provider for user');
  body.provider = user.provider.id;
  const created = await Icon.create(body);
  return getIconById(created.id);
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
const queryIcons = async (filter, options) => {
  return Icon.paginate(filter, options);
};

/**
 * Update Option by id
 * @param {ObjectId} iconId
 * @param {Object} updateBody
 * @returns {Promise<Icon>}
 */
const updateIconById = async (iconId, updateBody) => {
  const item = await getIconById(iconId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Icon not found');
  }
  Object.assign(item, updateBody);
  await item.save();
  return getIconById(iconId);
};

/**
 * Update Option by id
 * @param {ObjectId} size
 * @param {Object} updateBody
 * @returns {Promise<Icon>}
 */
const updateIconBySize = async (size, updateBody) => {
  const item = await getIconBySize(size);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Icon by size not found');
  }
  Object.assign(item, updateBody);
  await item.save();
  return getIconBySize(size);
};

/**
 * Delete item by id
 * @param {ObjectId} iconId
 * @param action
 * @returns {Promise<Icon>}
 */
const disableEnableIconById = async (iconId, action) => {
  const _icon = await getIconById(iconId);
  return Icon.updateOne({ _id: _icon._id }, { $set: { status: action ? 1 : 0 } }, { multi: false });
};

/**
 * Delete icon by id
 * @param {ObjectId} iconId
 * @returns {Promise<Balance>}
 */
const deleteIconById = async (iconId) => {
  const _icon = await getIconById(iconId);
  if (!_icon) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Balance not found');
  }
  await _icon.remove();
  return _icon;
};

module.exports = {
  createIcon,
  queryIcons,
  getIconById,
  getIconByMiddlewareId,
  getIconBySize,
  updateIconById,
  updateIconBySize,
  disableEnableIconById,
  deleteIconById,
};
