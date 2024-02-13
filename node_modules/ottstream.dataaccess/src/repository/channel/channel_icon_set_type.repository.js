const httpStatus = require('http-status');
const { ChannelIconSetType } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Create a channelIconSetType
 * @param {Object} channelIconSetTypeBody
 * @param user
 * @returns {Promise<ChannelIconSetType>}
 */
const createChannelIconSetType = async (channelIconSetTypeBody, user) => {
  const body = channelIconSetTypeBody;
  body.user = user._id;
  if (user.provider) {
    body.provider = user.provider.id;
  }
  return ChannelIconSetType.create(body);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryChannelIconSetTypes = async (filter, options, user) => {
  const currentFilter = filter;
  // if (user.provider) currentFilter.provider = user.provider.id;
  return ChannelIconSetType.paginate(currentFilter, options);
};

/**
 * Get channelIconSetType by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<ChannelIconSetType>}
 */
// eslint-disable-next-line no-unused-vars
const getChannelIconSetTypeById = async (id, options = {}) => {
  return ChannelIconSetType.findById(id);
};

/**
 * Update channelIconSetType by id
 * @param {ObjectId} channelIconSetTypeId
 * @param {Object} updateBody
 * @returns {Promise<ChannelIconSetType>}
 */
const updateChannelIconSetTypeById = async (channelIconSetTypeId, updateBody) => {
  const channelIconSetType = await getChannelIconSetTypeById(channelIconSetTypeId);
  if (!channelIconSetType) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ChannelIconSetType not found');
  }
  Object.assign(channelIconSetType, updateBody);
  await channelIconSetType.save();
  return channelIconSetType;
};

/**
 * Delete channelIconSetType by id
 * @param {ObjectId} channelIconSetTypeId
 * @returns {Promise<ChannelIconSetType>}
 */
const deleteChannelIconSetTypeById = async (channelIconSetTypeId) => {
  const channelIconSetType = await getChannelIconSetTypeById(channelIconSetTypeId);
  if (!channelIconSetType) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ChannelIconSetType not found');
  }
  await channelIconSetType.remove();
  return channelIconSetType;
};

module.exports = {
  createChannelIconSetType,
  queryChannelIconSetTypes,
  getChannelIconSetTypeById,
  updateChannelIconSetTypeById,
  deleteChannelIconSetTypeById,
};
