const httpStatus = require('http-status');
const { OttProviderInvoice } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Create a OttProviderInvoice
 * @param {Object} ottProviderInvoiceBody
 * @param providerId
 * @returns {Promise<OttProviderInvoice>}
 */
const createOttProviderInvoice = async (ottProviderInvoiceBody) => {
  const body = ottProviderInvoiceBody;
  return OttProviderInvoice.create(body);
};

/**
 * @param filter
 * @param options
 *  @param user
 * @returns {Promise<QueryResult>}
 */
const queryOttProviderInvoices = async (filter, options) => {
  return OttProviderInvoice.paginate(filter, options);
};

/**
 * Get OttProviderInvoice by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProviderInvoice>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderInvoiceById = async (id, options = {}) => {
  return OttProviderInvoice.findById(id);
};

/**
 * Get OttProviderInvoice by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProviderInvoice>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderInvoiceByProviderId = async (ottProviderId) => {
  return OttProviderInvoice.find({ providerId: ottProviderId });
};

/**
 * Update OttProviderInvoice by id
 * @param {ObjectId} ottProviderInvoiceId
 * @param {Object} updateBody
 * @returns {Promise<OttProviderInvoice>}
 */
const updateOttProviderInvoiceById = async (ottProviderInvoiceId, updateBody) => {
  const ottProviderInvoice = await getOttProviderInvoiceByProviderId(ottProviderInvoiceId);
  if (!ottProviderInvoice || !ottProviderInvoice.length) {
    // eslint-disable-next-line no-param-reassign
    updateBody.providerId = ottProviderInvoiceId;
    const created = await OttProviderInvoice.create(updateBody);
    return created;
    // throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderInvoice not found');
  }
  const current = ottProviderInvoice[0];
  Object.assign(current, updateBody);
  await current.save();
  return current;
};

/**
 * Delete OttProviderInvoice by id
 * @param {ObjectId} ottProviderInvoiceId
 * @returns {Promise<OttProviderInvoice>}
 */
const deleteOttProviderInvoiceById = async (ottProviderInvoiceId) => {
  const ottProviderInvoice = await getOttProviderInvoiceById(ottProviderInvoiceId);
  if (!ottProviderInvoice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderInvoice not found');
  }
  await ottProviderInvoice.remove();
  return ottProviderInvoice;
};

/**
 * Get list
 * @returns {Promise<OttProviderOtherApi>}
 */
// eslint-disable-next-line no-unused-vars
const getList = async (filter = {}, populate = [], projection = null) => {
  const query = OttProviderInvoice.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

module.exports = {
  createOttProviderInvoice,
  getList,
  getOttProviderInvoiceByProviderId,
  queryOttProviderInvoices,
  getOttProviderInvoiceById,
  updateOttProviderInvoiceById,
  deleteOttProviderInvoiceById,
};
