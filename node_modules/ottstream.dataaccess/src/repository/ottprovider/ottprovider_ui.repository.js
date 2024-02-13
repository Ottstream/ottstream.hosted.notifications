const httpStatus = require('http-status');
const { OttProviderUi } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

function generate(n) {
  const add = 1;
  let max = 12 - add; // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.

  if (n > max) {
    return generate(max) + generate(n - max);
  }

  // eslint-disable-next-line no-restricted-properties
  max = Math.pow(10, n + add);
  const min = max / 10; // Math.pow(10, n) basically
  const number = Math.floor(Math.random() * (max - min + 1)) + min;

  return `${number}`.substring(add);
}

/**
 * Create a OttProviderUi
 * @param {Object} ottProviderUiBody
 * @param providerId
 * @returns {Promise<OttProviderUi>}
 */
const createOttProviderUi = async (ottProviderUiBody) => {
  const body = ottProviderUiBody;
  body.dns = `${generate(6).toString()}.paneldev.ottprovider.live`;
  return OttProviderUi.create(body);
};

/**
 * @param filter
 * @param options
 *  @param user
 * @returns {Promise<QueryResult>}
 */
const queryOttProviderUis = async (filter, options) => {
  return OttProviderUi.paginate(filter, options);
};

/**
 * Get OttProviderUi by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProviderUi>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderUiById = async (id, options = {}) => {
  return OttProviderUi.findById(id);
};

/**
 * Get OttProviderUi by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProviderUi>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderUiByProviderId = async (ottProviderId) => {
  return OttProviderUi.find({ providerId: ottProviderId });
};

/**
 * Update OttProviderUi by id
 * @param {ObjectId} ottProviderUiId
 * @param {Object} updateBody
 * @returns {Promise<OttProviderUi>}
 */
const updateOttProviderUiById = async (ottProviderUiId, updateBody) => {
  const ottProviderUi = await getOttProviderUiByProviderId(ottProviderUiId);
  if (!ottProviderUi || !ottProviderUi.length) {
    // eslint-disable-next-line no-param-reassign
    updateBody.providerId = ottProviderUiId;
    // eslint-disable-next-line no-param-reassign
    updateBody.dns = `${generate(6).toString()}.paneldev.ottprovider.live`;
    const created = await OttProviderUi.create(updateBody);
    return created;
    // throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderUi not found');
  }
  const current = ottProviderUi[0];
  if (!current.dns) current.dns = `${generate(6).toString()}.pandeldev.ottprovider.live`;
  Object.assign(current, updateBody);
  await current.save();
  return current;
};

/**
 * Delete OttProviderUi by id
 * @param {ObjectId} ottProviderUiId
 * @returns {Promise<OttProviderUi>}
 */
const deleteOttProviderUiById = async (ottProviderUiId) => {
  const ottProviderUi = await getOttProviderUiById(ottProviderUiId);
  if (!ottProviderUi) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderUi not found');
  }
  await ottProviderUi.remove();
  return ottProviderUi;
};

module.exports = {
  createOttProviderUi,
  getOttProviderUiByProviderId,
  queryOttProviderUis,
  getOttProviderUiById,
  updateOttProviderUiById,
  deleteOttProviderUiById,
};
