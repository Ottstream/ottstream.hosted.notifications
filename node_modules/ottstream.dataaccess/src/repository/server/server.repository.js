const httpStatus = require('http-status');
const { Server, ServerOption } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

const serverPopulateObject = [
  // {
  //   path: 'payment.balance.currency',
  //   model: 'Currency',
  // },
  // {
  //   path: 'payment.balance.priceGroup',
  //   model: 'PriceGroup',
  // },
  // {
  //   path: 'locations',
  //   populate: [
  //     {
  //       path: 'room',
  //     },
  //   ],
  // },
  {
    path: 'provider',
  },
];

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Server>}
 */
// eslint-disable-next-line no-unused-vars
const getServerById = async (id, options = {}) => {
  return Server.findById(id).populate(serverPopulateObject);
};

/**
 * Get item by id
 * @param serverId
 * @param providerId
 * @param options
 * @returns {Promise<Server>}
 */
// eslint-disable-next-line no-unused-vars
const getServerOption = async (serverId, providerId, options = {}) => {
  const items = await ServerOption.find({
    provider: providerId,
    server: serverId,
  }).populate(serverPopulateObject);
  if (items && items.length) return items[0];
  return null;
};

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Server>}
 */
// eslint-disable-next-line no-unused-vars
const getServerByMiddlewareId = async (id, options = {}) => {
  const servers = await Server.find({
    middlewareId: id,
  }).populate(serverPopulateObject);
  if (servers.length) return servers[0];
  return null;
};

/**
 * Create a item server
 * @param {Object} itemBody
 * @param user
 * @returns {Promise<Server>}
 */
const createServer = async (itemBody, user) => {
  const body = itemBody;
  // eslint-disable-next-line no-console
  if (!user.provider) throw new ApiError('no provider for user');
  body.provider = user.provider.id;
  const created = await Server.create(body);
  return getServerById(created.id);
};

/**
 * Get list
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getList = async (filter = {}, populate = [], projection = null) => {
  const query = Server.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
const queryServers = async (filter, options) => {
  return Server.paginate(filter, options);
};

/**
 * @param id
 * @param options
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const getServersList = async (id, options = {}) => {
  const servers = await Server.find({
    middlewareId: id,
    name: id.name,
    ip: id.ip,
    spdtest_url: id.spdtest_url,
  }).populate(serverPopulateObject);
  if (servers.length) return servers[0];
  return null;
};

/**
 * Update Option by id
 * @param {ObjectId} serverId
 * @param {Object} updateBody
 * @returns {Promise<Server>}
 */
const updateServerById = async (serverId, updateBody) => {
  const item = await getServerById(serverId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Server not found');
  }
  Object.assign(item, updateBody);
  await item.save();
  return getServerById(serverId);
};

/**
 * Delete item by id
 * @param {ObjectId} serverId
 * @param action
 * @returns {Promise<Server>}
 */
const disableEnableServerById = async (serverId, action) => {
  const _server = await getServerById(serverId);
  return Server.updateOne({ _id: _server._id }, { $set: { status: action ? 1 : 0 } }, { multi: false });
};

/**
 * Delete server by id
 * @param {ObjectId} serverId
 * @returns {Promise<Balance>}
 */
const deleteServerById = async (serverId) => {
  const _server = await getServerById(serverId);
  if (!_server) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Balance not found');
  }
  await _server.remove();
  return _server;
};

module.exports = {
  createServer,
  queryServers,
  getServerById,
  getServerByMiddlewareId,
  updateServerById,
  disableEnableServerById,
  deleteServerById,
  getServersList,
  getList,
};
