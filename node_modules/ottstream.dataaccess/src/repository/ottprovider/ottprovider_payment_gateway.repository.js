const httpStatus = require('http-status');
const { OttProviderPaymentGateway } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Create a OttProviderPaymentGateway
 * @param {Object} ottProviderPaymentGatewayBody
 * @param providerId
 * @returns {Promise<OttProviderPaymentGateway>}
 */
const createOttProviderPaymentGateway = async (ottProviderPaymentGatewayBody) => {
  const body = ottProviderPaymentGatewayBody;
  return OttProviderPaymentGateway.create(body);
};

/**
 * @param filter
 * @param options
 *  @param user
 * @returns {Promise<QueryResult>}
 */
const queryOttProviderPaymentGateways = async (filter, options) => {
  return OttProviderPaymentGateway.paginate(filter, options);
};

/**
 * Get OttProviderPaymentGateway by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProviderPaymentGateway>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderPaymentGatewayById = async (id, options = {}) => {
  return OttProviderPaymentGateway.findById(id);
};

/**
 * Get OttProviderPaymentGateway by id
 * @returns {Promise<OttProviderPaymentGateway>}
 * @param ottProviderId
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderPaymentGatewayByProviderId = async (ottProviderId) => {
  return OttProviderPaymentGateway.find({ providerId: ottProviderId });
};

/**
 * Update OttProviderPaymentGateway by id
 * @param {ObjectId} ottProviderPaymentGatewayId
 * @param {Object} updateBody
 * @returns {Promise<OttProviderPaymentGateway>}
 */
const updateOttProviderPaymentGatewayById = async (ottProviderPaymentGatewayId, updateBody) => {
  const ottProviderPaymentGateway = await getOttProviderPaymentGatewayByProviderId(ottProviderPaymentGatewayId);
  if (!ottProviderPaymentGateway || !ottProviderPaymentGateway.length) {
    // eslint-disable-next-line no-param-reassign
    updateBody.providerId = ottProviderPaymentGatewayId;
    const created = await OttProviderPaymentGateway.create(updateBody);
    return created;
    // throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderPaymentGateway not found');
  }
  const current = ottProviderPaymentGateway[0];
  Object.assign(current, updateBody);
  await current.save();
  return current;
};

/**
 * Delete OttProviderPaymentGateway by id
 * @param {ObjectId} ottProviderPaymentGatewayId
 * @returns {Promise<OttProviderPaymentGateway>}
 */
const deleteOttProviderPaymentGatewayById = async (ottProviderPaymentGatewayId) => {
  const ottProviderPaymentGateway = await getOttProviderPaymentGatewayById(ottProviderPaymentGatewayId);
  if (!ottProviderPaymentGateway) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderPaymentGateway not found');
  }
  await ottProviderPaymentGateway.remove();
  return ottProviderPaymentGateway;
};

/**
 * Get list
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getList = async (filter = {}, populate = [], projection = null) => {
  const query = OttProviderPaymentGateway.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

module.exports = {
  createOttProviderPaymentGateway,
  getOttProviderPaymentGatewayByProviderId,
  queryOttProviderPaymentGateways,
  getOttProviderPaymentGatewayById,
  updateOttProviderPaymentGatewayById,
  deleteOttProviderPaymentGatewayById,
  getList,
};
