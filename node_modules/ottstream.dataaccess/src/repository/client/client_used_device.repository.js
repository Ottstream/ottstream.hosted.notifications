const httpStatus = require('http-status');
const { ClientUsedDevice } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Create a client used device
 * @param {Object} clientUsedDeviceBody
 * @param user
 * @returns {Promise<ClientUsedDevice>}
 */
const createClientUsedDevice = async (clientUsedDeviceBody, user) => {
  const body = clientUsedDeviceBody;
  if (user) body.user = user._id;
  return ClientUsedDevice.create(body);
};

/**
 * Get Client Locations
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getClientUsedDevices = async (filter = {}, populate = [], projection = null) => {
  const query = ClientUsedDevice.find(filter).populate(populate);
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
const queryClientUsedDevices = async (filter, options, user) => {
  return ClientUsedDevice.paginate(filter, options);
};

/**
 * Get client used device by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<ClientUsedDevice>}
 */
// eslint-disable-next-line no-unused-vars
const getClientUsedDeviceById = async (id, options = {}) => {
  return ClientUsedDevice.findById(id);
};

/**
 * Get client used device by locationId
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<ClientUsedDevice>}
 */
// eslint-disable-next-line no-unused-vars
const getClientUsedDevicesByLocationId = async (id, options = {}) => {
  return ClientUsedDevice.find({ locationId: id }).sort({ lastActiveTime: 'desc' });
};

/**
 * Update client used device by id
 * @param {ObjectId} clientUsedDeviceId
 * @param {Object} updateBody
 * @returns {Promise<ClientUsedDevice>}
 */
const updateClientUsedDeviceById = async (clientUsedDeviceId, updateBody) => {
  await ClientUsedDevice.updateOne({ _id: clientUsedDeviceId }, updateBody);
  const clientUsedDevice = await getClientUsedDeviceById(clientUsedDeviceId);
  clientUsedDevice.lastActiveTime = updateBody.lastActiveTime;
  await clientUsedDevice.save();
  return clientUsedDevice;
};

/**
 * update one
 */
// eslint-disable-next-line no-unused-vars
const updateOne = async (filter = {}, fields = {}) => {
  await ClientUsedDevice.updateOne(filter, fields);
  return ClientUsedDevice.findOne(filter);
};

/**
 * Delete client used device by id
 * @param {ObjectId} clientUsedDeviceId
 * @returns {Promise<ClientUsedDevice>}
 */
const deleteClientUsedDeviceById = async (clientUsedDeviceId) => {
  const clientUsedDevice = await getClientUsedDeviceById(clientUsedDeviceId);
  if (!clientUsedDevice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientUsedDevice not found');
  }
  await clientUsedDevice.remove();
  return clientUsedDevice;
};

module.exports = {
  createClientUsedDevice,
  queryClientUsedDevices,
  getClientUsedDeviceById,
  getClientUsedDevicesByLocationId,
  updateOne,
  updateClientUsedDeviceById,
  deleteClientUsedDeviceById,
  getClientUsedDevices,
};
