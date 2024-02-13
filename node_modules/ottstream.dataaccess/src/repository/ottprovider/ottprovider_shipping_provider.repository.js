const httpStatus = require('http-status');
const { OttProviderShippingProvider } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Create a OttProviderShippingProvider
 * @param {Object} ottProviderShippingProviderBody
 * @param providerId
 * @returns {Promise<OttProviderShippingProvider>}
 */
const createOttProviderShippingProvider = async (ottProviderShippingProviderBody) => {
  const body = ottProviderShippingProviderBody;
  return OttProviderShippingProvider.create(body);
};

/**
 * @param filter
 * @param options
 *  @param user
 * @returns {Promise<QueryResult>}
 */
const queryOttProviderShippingProviders = async (filter, options) => {
  return OttProviderShippingProvider.paginate(filter, options);
};

/**
 * Get OttProviderShippingProvider by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProviderShippingProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderShippingProviderById = async (id, options = {}) => {
  return OttProviderShippingProvider.findById(id);
};

/**
 * Get OttProviderShippingProvider by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProviderShippingProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderShippingProviderByProviderId = async (ottProviderId) => {
  return OttProviderShippingProvider.find({ providerId: ottProviderId });
};

/**
 * Get list
 * @returns {Promise<OttProviderShippingProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getList = async (filter = {}, populate = [], projection = null) => {
  const query = OttProviderShippingProvider.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

/**
 * Update OttProviderShippingProvider by id
 * @param {ObjectId} ottProviderShippingProviderId
 * @param {Object} updateBody
 * @returns {Promise<OttProviderShippingProvider>}
 */
const updateOttProviderShippingProviderById = async (ottProviderShippingProviderId, updateBody) => {
  const ottProviderShippingProvider = await getOttProviderShippingProviderByProviderId(ottProviderShippingProviderId);
  if (!ottProviderShippingProvider || !ottProviderShippingProvider.length) {
    // eslint-disable-next-line no-param-reassign
    updateBody.providerId = ottProviderShippingProviderId;
    const created = await OttProviderShippingProvider.create(updateBody);
    return created;
    // throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderShippingProvider not found');
  }
  const current = ottProviderShippingProvider[0];
  Object.assign(current, updateBody);
  await current.save();
  return current;
};

/**
 * Delete OttProviderShippingProvider by id
 * @param {ObjectId} ottProviderShippingProviderId
 * @returns {Promise<OttProviderShippingProvider>}
 */
const deleteOttProviderShippingProviderById = async (ottProviderShippingProviderId) => {
  const ottProviderShippingProvider = await getOttProviderShippingProviderById(ottProviderShippingProviderId);
  if (!ottProviderShippingProvider) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderShippingProvider not found');
  }
  await ottProviderShippingProvider.remove();
  return ottProviderShippingProvider;
};

module.exports = {
  getList,
  createOttProviderShippingProvider,
  getOttProviderShippingProviderByProviderId,
  queryOttProviderShippingProviders,
  getOttProviderShippingProviderById,
  updateOttProviderShippingProviderById,
  deleteOttProviderShippingProviderById,
};
