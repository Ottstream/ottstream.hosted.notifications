const httpStatus = require('http-status');
const { OttProviderOtherApi } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');
const OttProviderConversationProvider = require('../../models/ottprovider/ottprovider_conversation_provider.model');

/**
 * Create a OttProviderOtherApi
 * @param {Object} ottProviderOtherApiBody
 * @param providerId
 * @returns {Promise<OttProviderOtherApi>}
 */
const createOttProviderOtherApi = async (ottProviderOtherApiBody) => {
  const body = ottProviderOtherApiBody;
  return OttProviderOtherApi.create(body);
};

/**
 * @param filter
 * @param options
 *  @param user
 * @returns {Promise<QueryResult>}
 */
const queryOttProviderOtherApis = async (filter, options) => {
  return OttProviderOtherApi.paginate(filter, options);
};

/**
 * Get OttProviderOtherApi by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProviderOtherApi>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderOtherApiById = async (id, options = {}) => {
  return OttProviderOtherApi.findById(id);
};

/**
 * Get OttProviderOtherApi by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProviderOtherApi>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderOtherApiByProviderId = async (ottProviderId) => {
  return OttProviderOtherApi.find({ providerId: ottProviderId });
};

/**
 * Update OttProviderOtherApi by id
 * @param {ObjectId} ottProviderOtherApiId
 * @param {Object} updateBody
 * @returns {Promise<OttProviderOtherApi>}
 */
const updateOttProviderOtherApiById = async (ottProviderOtherApiId, updateBody) => {
  const ottProviderOtherApi = await getOttProviderOtherApiByProviderId(ottProviderOtherApiId);
  if (!ottProviderOtherApi || !ottProviderOtherApi.length) {
    // eslint-disable-next-line no-param-reassign
    updateBody.providerId = ottProviderOtherApiId;
    const created = await OttProviderOtherApi.create(updateBody);
    return created;
    // throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderOtherApi not found');
  }
  const current = ottProviderOtherApi[0];
  Object.assign(current, updateBody);
  await current.save();
  return current;
};

/**
 * reset balances
 */
// eslint-disable-next-line no-unused-vars
const updateOne = async (filter = {}, fields = {}) => {
  await OttProviderOtherApi.updateOne(filter, fields);
  return OttProviderOtherApi.findOne(filter);
};

/**
 * Delete OttProviderOtherApi by id
 * @param {ObjectId} ottProviderOtherApiId
 * @returns {Promise<OttProviderOtherApi>}
 */
const deleteOttProviderOtherApiById = async (ottProviderOtherApiId) => {
  const ottProviderOtherApi = await getOttProviderOtherApiById(ottProviderOtherApiId);
  if (!ottProviderOtherApi) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderOtherApi not found');
  }
  await ottProviderOtherApi.remove();
  return ottProviderOtherApi;
};

/**
 * Get list
 * @returns {Promise<OttProviderOtherApi>}
 */
// eslint-disable-next-line no-unused-vars
const getList = async (filter = {}, populate = [], projection = null) => {
  const query = OttProviderConversationProvider.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

module.exports = {
  createOttProviderOtherApi,
  getOttProviderOtherApiByProviderId,
  queryOttProviderOtherApis,
  getList,
  getOttProviderOtherApiById,
  updateOttProviderOtherApiById,
  deleteOttProviderOtherApiById,
  updateOne,
};
