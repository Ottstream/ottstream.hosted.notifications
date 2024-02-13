const httpStatus = require('http-status');
const { ProductType } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Get channel by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<ProductType>}
 */
// eslint-disable-next-line no-unused-vars
const getProductTypeById = async (id, options = {}) => {
  return ProductType.findById(id);
};

/**
 * Create a channel package
 * @param {Object} channelBody
 * @param user
 * @returns {Promise<ProductType>}
 */
const createProductType = async (channelBody, user) => {
  const body = channelBody;
  body.user = user._id;
  if (user.provider) body.provider = user.provider.id;
  const created = await ProductType.create(body);
  return getProductTypeById(created.id);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryProductTypes = async (filter, options, user) => {
  const currentFilter = filter;
  // if (user.provider) currentFilter.provider = user.provider.id;
  return ProductType.paginate(currentFilter, options);
};

/**
 * Update channel by id
 * @param {ObjectId} productTypeId
 * @param {Object} updateBody
 * @returns {Promise<ProductType>}
 */
const updateProductTypeById = async (productTypeId, updateBody) => {
  const channel = await getProductTypeById(productTypeId);
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ProductType not found');
  }
  Object.assign(channel, updateBody);
  await channel.save();
  return channel;
};

/**
 * Delete channel by id
 * @param {ObjectId} productTypeId
 * @returns {Promise<ProductType>}
 */
const deleteProductTypeById = async (productTypeId) => {
  const channel = await getProductTypeById(productTypeId);
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ProductType not found');
  }
  await channel.remove();
  return channel;
};

module.exports = {
  createProductType,
  queryProductTypes,
  getProductTypeById,
  updateProductTypeById,
  deleteProductTypeById,
};
