const httpStatus = require('http-status');
const { ProductPriceGroup } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Get channel by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<ProductPriceGroup>}
 */
// eslint-disable-next-line no-unused-vars
const getProductPriceGroupById = async (id, options = {}) => {
  return ProductPriceGroup.findById(id);
};

/**
 * Create a channel package
 * @param {Object} channelBody
 * @param user
 * @returns {Promise<ProductPriceGroup>}
 */
const createProductPriceGroup = async (channelBody, user) => {
  const body = channelBody;
  body.user = user._id;
  if (user.provider) body.provider = user.provider.id;
  const created = await ProductPriceGroup.create(body);
  return getProductPriceGroupById(created.id);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryProductPriceGroups = async (filter, options, user) => {
  const currentFilter = filter;
  if (user.provider) currentFilter.provider = user.provider.id;
  const currentOptions = options;
  const sortBy = [];
  sortBy.push('order:desc');
  currentOptions.sortBy = sortBy;
  return ProductPriceGroup.paginate(currentFilter, options, {});
};
/**
 * Update channel by id
 * @param {ObjectId} productPriceGroupId
 * @param {Object} updateBody
 * @returns {Promise<ProductPriceGroup>}
 */
const updateProductPriceGroupById = async (productPriceGroupId, updateBody) => {
  const channel = await getProductPriceGroupById(productPriceGroupId);
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ProductPriceGroup not found');
  }
  Object.assign(channel, updateBody);
  await channel.save();
  return channel;
};

/**
 * Delete channel by id
 * @param {ObjectId} productPriceGroupId
 * @returns {Promise<ProductPriceGroup>}
 */
const deleteProductPriceGroupById = async (productPriceGroupId) => {
  const channel = await getProductPriceGroupById(productPriceGroupId);
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ProductPriceGroup not found');
  }
  await channel.remove();
  return channel;
};

module.exports = {
  createProductPriceGroup,
  queryProductPriceGroups,
  getProductPriceGroupById,
  updateProductPriceGroupById,
  deleteProductPriceGroupById,
};
