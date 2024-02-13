const httpStatus = require('http-status');
const { ShippingProvider } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');
const langPick = require('../../utils/helpers/langPick');

/**
 * Create a paymentMethod
 * @param {Object} shippingProviderBody
 * @param user
 * @returns {Promise<ShippingProvider>}
 */
// eslint-disable-next-line no-unused-vars
const createShippingProvider = async (shippingProviderBody, user) => {
  const body = shippingProviderBody;
  body.user = user._id;
  return ShippingProvider.create(body);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryShippingProvider = async (filter, options, user) => {
  return ShippingProvider.paginate(filter, options, {
    name: { $elemMatch: { lang: { $eq: langPick(options, user) } } },
    state: true,
    user: true,
  });
};

/**
 * Get shippingProvider by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<ShippingProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getShippingProviderById = async (id, options = {}) => {
  // eslint-disable-next-line no-undef
  return ShippingProvider.findById(id, projection).populate('categorys');
};

/**
 * Update paymentMethod by id
 * @param {ObjectId} shippingProviderId
 * @param {Object} updateBody
 * @returns {Promise<ShippingProvider>}
 */
const updateShippingProviderById = async (shippingProviderId, updateBody) => {
  const shippingProvider = await getShippingProviderById(shippingProviderId);
  if (!shippingProvider) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ShippingProvider not found');
  }
  Object.assign(shippingProvider, updateBody);
  await shippingProvider.save();
  return shippingProvider;
};

/**
 * Delete paymentMethod by id
 * @param {ObjectId} shippingProviderId
 * @returns {Promise<ShippingProvider>}
 */
const deleteShippingProviderById = async (shippingProviderId) => {
  const shippingProvider = await getShippingProviderById(shippingProviderId);
  if (!shippingProvider) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ShippingProvider not found');
  }
  await shippingProvider.remove();
  return shippingProvider;
};

module.exports = {
  createShippingProvider,
  queryShippingProvider,
  getShippingProviderById,
  updateShippingProviderById,
  deleteShippingProviderById,
};
