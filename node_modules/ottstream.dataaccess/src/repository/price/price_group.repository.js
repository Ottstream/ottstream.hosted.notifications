const httpStatus = require('http-status');
const { PriceGroup } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Create a channel package
 * @param {Object} channelBody
 * @param user
 * @returns {Promise<PriceGroup>}
 */
const createPriceGroup = async (channelBody, user) => {
  const body = channelBody;
  // eslint-disable-next-line no-console
  if (!channelBody.provider && (!user || !user.provider)) throw new ApiError('priceGroup has no provider while creating');
  if (user) {
    body.user = user._id;
    body.provider = user.provider.id;
  }
  return PriceGroup.create(body);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryPriceGroups = async (filter, options, user) => {
  return PriceGroup.paginate(filter, options);
};

/**
 * Get list
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getList = async (filter = {}, populate = [], projection = null) => {
  const query = PriceGroup.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

/**
 * Get channel by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<PriceGroup>}
 */
// eslint-disable-next-line no-unused-vars
const getPriceGroupById = async (id, options = {}) => {
  return PriceGroup.findById(id);
};

/**
 * Update channel by id
 * @param {ObjectId} priceGroupId
 * @param {Object} updateBody
 * @returns {Promise<PriceGroup>}
 */
const updatePriceGroupById = async (priceGroupId, updateBody) => {
  const channel = await getPriceGroupById(priceGroupId);
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'PriceGroup not found');
  }
  Object.assign(channel, updateBody);
  await channel.save();
  return channel;
};

/**
 * Delete channel by id
 * @param {ObjectId} priceGroupId
 * @returns {Promise<PriceGroup>}
 */
const deletePriceGroupById = async (priceGroupId) => {
  const channel = await getPriceGroupById(priceGroupId);
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'PriceGroup not found');
  }
  await channel.remove();
  return channel;
};

/**
 * Delete PriceGroups of provider
 * @returns {Promise<OttProviderEmail>}
 */
const removePriceGroups = async (provider) => {
  return PriceGroup.remove({ provider });
};

module.exports = {
  createPriceGroup,
  queryPriceGroups,
  getPriceGroupById,
  updatePriceGroupById,
  deletePriceGroupById,
  getList,
  removePriceGroups,
};
