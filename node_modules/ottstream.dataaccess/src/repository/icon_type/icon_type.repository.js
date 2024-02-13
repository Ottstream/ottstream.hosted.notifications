const httpStatus = require('http-status');
const { IconType } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Create a iconType
 * @param {Object} iconTypeBody
 * @param user
 * @returns {Promise<IconType>}
 */
const createIconType = async (iconTypeBody, user) => {
  const body = iconTypeBody;
  body.user = user._id;
  if (user.provider) {
    body.provider = user.provider.id;
  }
  return IconType.create(body);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryIconTypes = async (filter, options, user) => {
  const currentFilter = filter;
  // if (user.provider) currentFilter.provider = user.provider.id;
  return IconType.paginate(currentFilter, options, {});
};

/**
 * Get iconType by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<IconType>}
 */
const getIconTypeById = async (id) => {
  return IconType.findById(id);
};

/**
 * Update iconType by id
 * @param {ObjectId} iconTypeId
 * @param {Object} updateBody
 * @returns {Promise<IconType>}
 */
const updateIconTypeById = async (iconTypeId, updateBody) => {
  const iconType = await getIconTypeById(iconTypeId);
  if (!iconType) {
    throw new ApiError(httpStatus.NOT_FOUND, 'IconType not found');
  }
  Object.assign(iconType, updateBody);
  await iconType.save();
  return iconType;
};

/**
 * Delete iconType by id
 * @param {ObjectId} iconTypeId
 * @returns {Promise<IconType>}
 */
const deleteIconTypeById = async (iconTypeId) => {
  const iconType = await getIconTypeById(iconTypeId);
  if (!iconType) {
    throw new ApiError(httpStatus.NOT_FOUND, 'IconType not found');
  }
  await iconType.remove();
  return iconType;
};

module.exports = {
  createIconType,
  queryIconTypes,
  getIconTypeById,
  updateIconTypeById,
  deleteIconTypeById,
};
