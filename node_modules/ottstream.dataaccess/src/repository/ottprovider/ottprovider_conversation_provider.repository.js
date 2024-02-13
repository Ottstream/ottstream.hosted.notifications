const httpStatus = require('http-status');
const { OttProviderConversationProvider } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Create a OttProviderConversationProvider
 * @param {Object} ottProviderConversationProviderBody
 * @param providerId
 * @returns {Promise<OttProviderConversationProvider>}
 */
const createOttProviderConversationProvider = async (ottProviderConversationProviderBody) => {
  const body = ottProviderConversationProviderBody;
  return OttProviderConversationProvider.create(body);
};

/**
 * @param filter
 * @param options
 *  @param user
 * @returns {Promise<QueryResult>}
 */
const queryOttProviderConversationProviders = async (filter, options) => {
  return OttProviderConversationProvider.paginate(filter, options);
};

/**
 * Get OttProviderConversationProvider by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProviderConversationProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderConversationProviderById = async (id, options = {}) => {
  return OttProviderConversationProvider.findById(id);
};

/**
 * Get OttProviderConversationProvider by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProviderConversationProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderConversationProviderByProviderId = async (ottProviderId) => {
  return OttProviderConversationProvider.find({ providerId: ottProviderId });
};

/**
 * Get list
 * @returns {Promise<OttProviderConversationProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getList = async (filter = {}, populate = [], projection = null) => {
  const query = OttProviderConversationProvider.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

/**
 * Update OttProviderConversationProvider by id
 * @param {ObjectId} ottProviderConversationProviderId
 * @param {Object} updateBody
 * @returns {Promise<OttProviderConversationProvider>}
 */
const updateOttProviderConversationProviderById = async (ottProviderConversationProviderId, updateBody) => {
  const ottProviderConversationProvider = await getOttProviderConversationProviderByProviderId(
    ottProviderConversationProviderId
  );
  if (!ottProviderConversationProvider || !ottProviderConversationProvider.length) {
    // eslint-disable-next-line no-param-reassign
    updateBody.providerId = ottProviderConversationProviderId;
    const created = await OttProviderConversationProvider.create(updateBody);
    return created;
    // throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderConversationProvider not found');
  }
  const current = ottProviderConversationProvider[0];
  Object.assign(current, updateBody);
  await current.save();
  return current;
};

/**
 * Delete OttProviderConversationProvider by id
 * @param {ObjectId} ottProviderConversationProviderId
 * @returns {Promise<OttProviderConversationProvider>}
 */
const deleteOttProviderConversationProviderById = async (ottProviderConversationProviderId) => {
  const ottProviderConversationProvider = await getOttProviderConversationProviderById(ottProviderConversationProviderId);
  if (!ottProviderConversationProvider) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderConversationProvider not found');
  }
  await ottProviderConversationProvider.remove();
  return ottProviderConversationProvider;
};

module.exports = {
  getList,
  createOttProviderConversationProvider,
  getOttProviderConversationProviderByProviderId,
  queryOttProviderConversationProviders,
  getOttProviderConversationProviderById,
  updateOttProviderConversationProviderById,
  deleteOttProviderConversationProviderById,
};
