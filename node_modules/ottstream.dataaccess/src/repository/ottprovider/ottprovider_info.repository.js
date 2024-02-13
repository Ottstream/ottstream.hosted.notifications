const httpStatus = require('http-status');
const { OttProviderInfo } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Create a OttProviderInfo
 * @param {Object} ottProviderInfoBody
 * @param providerId
 * @returns {Promise<OttProviderInfo>}
 */
const createOttProviderInfo = async (ottProviderInfoBody) => {
  const body = ottProviderInfoBody;
  return OttProviderInfo.create(body);
};

/**
 * @param filter
 * @param options
 *  @param user
 * @returns {Promise<QueryResult>}
 */
const queryOttProviderInfos = async (filter, options) => {
  return OttProviderInfo.paginate(filter, options);
};

/**
 * Get OttProviderInfo by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProviderInfo>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderInfoById = async (id, options = {}) => {
  return OttProviderInfo.findById(id);
};

/**
 * Get OttProviderInfo by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProviderInfo>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderInfoByProviderId = async (ottProviderId) => {
  return OttProviderInfo.find({ providerId: ottProviderId });
};

/**
 * Update OttProviderInfo by id
 * @param {ObjectId} ottProviderInfoId
 * @param {Object} updateBody
 * @returns {Promise<OttProviderInfo>}
 */
const updateOttProviderInfoById = async (ottProviderInfoId, updateBody) => {
  const ottProviderInfo = await getOttProviderInfoByProviderId(ottProviderInfoId);
  if (!ottProviderInfo || !ottProviderInfo.length) {
    // eslint-disable-next-line no-param-reassign
    updateBody.providerId = ottProviderInfoId;
    const created = await OttProviderInfo.create(updateBody);
    return created;
    // throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderInfo not found');
  }
  const current = ottProviderInfo[0];
  Object.assign(current, updateBody);
  await current.save();
  return current;
};

/**
 * Delete OttProviderInfo by id
 * @param {ObjectId} ottProviderInfoId
 * @returns {Promise<OttProviderInfo>}
 */
const deleteOttProviderInfoById = async (ottProviderInfoId) => {
  const ottProviderInfo = await getOttProviderInfoById(ottProviderInfoId);
  if (!ottProviderInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderInfo not found');
  }
  await ottProviderInfo.remove();
  return ottProviderInfo;
};

module.exports = {
  createOttProviderInfo,
  getOttProviderInfoByProviderId,
  queryOttProviderInfos,
  getOttProviderInfoById,
  updateOttProviderInfoById,
  deleteOttProviderInfoById,
};
