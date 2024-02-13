const httpStatus = require('http-status');
const { ClientUsedDeviceActivity } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Create a client used device
 * @param {Object} clientUsedDeviceActivityBody
 * @param user
 * @returns {Promise<ClientUsedDeviceActivity>}
 */
const createClientUsedDeviceActivity = async (clientUsedDeviceActivityBody, user) => {
  const body = clientUsedDeviceActivityBody;
  if (user) body.user = user._id;
  return ClientUsedDeviceActivity.create(body);
};

/**
 * Get Client Locations
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getClientUsedDeviceActivitys = async (filter = {}, populate = [], projection = null) => {
  const query = ClientUsedDeviceActivity.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryClientUsedDeviceActivitys = async (filter, options, user) => {
  return ClientUsedDeviceActivity.paginate(filter, options);
};

/**
 * Get client used device by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<ClientUsedDeviceActivity>}
 */
// eslint-disable-next-line no-unused-vars
const getClientUsedDeviceActivityById = async (id, options = {}) => {
  return ClientUsedDeviceActivity.findById(id);
};

/**
 * Get client used device by locationId
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<ClientUsedDeviceActivity>}
 */
// eslint-disable-next-line no-unused-vars
const getClientUsedDeviceActivitysByLocationId = async (id, options = {}) => {
  return ClientUsedDeviceActivity.find({ locationId: id }).sort({ lastActiveTime: 'desc' });
};

/**
 * Update client used device by id
 * @param {ObjectId} clientUsedDeviceActivityId
 * @param {Object} updateBody
 * @returns {Promise<ClientUsedDeviceActivity>}
 */
const updateClientUsedDeviceActivityById = async (clientUsedDeviceActivityId, updateBody) => {
  await ClientUsedDeviceActivity.updateOne({ _id: clientUsedDeviceActivityId }, updateBody);
  const clientUsedDeviceActivity = await getClientUsedDeviceActivityById(clientUsedDeviceActivityId);
  clientUsedDeviceActivity.lastActiveTime = updateBody.lastActiveTime;
  await clientUsedDeviceActivity.save();
  return clientUsedDeviceActivity;
};

/**
 * Delete client used device by id
 * @param {ObjectId} clientUsedDeviceActivityId
 * @returns {Promise<ClientUsedDeviceActivity>}
 */
const deleteClientUsedDeviceActivityById = async (clientUsedDeviceActivityId) => {
  const clientUsedDeviceActivity = await getClientUsedDeviceActivityById(clientUsedDeviceActivityId);
  if (!clientUsedDeviceActivity) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientUsedDeviceActivity not found');
  }
  await clientUsedDeviceActivity.remove();
  return clientUsedDeviceActivity;
};

module.exports = {
  createClientUsedDeviceActivity,
  queryClientUsedDeviceActivitys,
  getClientUsedDeviceActivityById,
  getClientUsedDeviceActivitysByLocationId,
  updateClientUsedDeviceActivityById,
  deleteClientUsedDeviceActivityById,
  getClientUsedDeviceActivitys,
};
