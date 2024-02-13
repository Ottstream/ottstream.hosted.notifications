const httpStatus = require('http-status');
const { ClientProfile } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Create a client profile
 * @param {Object} clientProfileBody
 * @param user
 * @returns {Promise<ClientProfile>}
 */
const createClientProfile = async (clientProfileBody, user) => {
  const body = clientProfileBody;
  body.user = user._id;
  return ClientProfile.create(body);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryClientProfiles = async (filter, options, user) => {
  return ClientProfile.paginate(filter, options);
};

/**
 * Get client profile by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<ClientProfile>}
 */
// eslint-disable-next-line no-unused-vars
const getClientProfileById = async (id, options = {}) => {
  return ClientProfile.findById(id);
};

/**
 * Update client profile by id
 * @param {ObjectId} clientProfileId
 * @param {Object} updateBody
 * @returns {Promise<ClientProfile>}
 */
const updateClientProfileById = async (clientProfileId, updateBody) => {
  const clientProfile = await getClientProfileById(clientProfileId);
  if (!clientProfile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientProfile not found');
  }
  Object.assign(clientProfile, updateBody);
  await clientProfile.save();
  return clientProfile;
};

/**
 * Delete client profile by id
 * @param {ObjectId} clientProfileId
 * @returns {Promise<ClientProfile>}
 */
const deleteClientProfileById = async (clientProfileId) => {
  const clientProfile = await getClientProfileById(clientProfileId);
  if (!clientProfile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientProfile not found');
  }
  await clientProfile.remove();
  return clientProfile;
};

module.exports = {
  createClientProfile,
  queryClientProfiles,
  getClientProfileById,
  updateClientProfileById,
  deleteClientProfileById,
};
