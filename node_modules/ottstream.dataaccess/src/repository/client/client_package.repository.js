const httpStatus = require('http-status');
const { ClientPackage } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

const currentPriceByRooms = async (currentPrice, room) => {
  return currentPrice * room;
};
// const incrementTotalPrice = async (clientId, totalPrice) => {
//   if (clientId) {
//     totalPrice.reduce((sum, current) => {
//       return sum + current;
//     });
//   }
/**
 * Create a channel package
 * @param {Object} channelBody
 * @param user
 * @returns {Promise<ClientPackage>}
 */
const createClientPackage = async (channelBody, user) => {
  const body = channelBody;
  body.user = user._id;
  return ClientPackage.create(body);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryClientPackages = async (filter, options, user) => {
  // return ClientPackage.paginate(filter, options);
  const curOptions = {
    page: options.page ?? 1,
    all: options.all ?? false,
    limit: options.all ? 10000000 : options.limit ?? 20,
  };

  const sortObject = {
    // _id: -1,
  };

  if (options.sortBy) {
    if (typeof options.sortBy === 'object') {
      options.sortBy.forEach(function (sortOption) {
        const parts = sortOption.split(':');
        sortObject[parts[0]] = parts[1] === 'desc' ? -1 : 1;
      });
    } else if (typeof options.sortBy === 'string') {
      const parts = options.sortBy.split(':');
      sortObject[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }
  } else {
    sortObject._id = -1;
  }
  const lookupFilter = [{ $sort: sortObject }];

  const aggregate = ClientPackage.aggregate(lookupFilter);
  const list = await ClientPackage.aggregatePaginate(aggregate, curOptions);
  return {
    results: list.docs,
    page: list.page,
    limit: list.limit,
    totalPages: list.totalPages,
    totalResults: list.totalDocs,
  };
};

/**
 * Get channel by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<ClientPackage>}
 */
// eslint-disable-next-line no-unused-vars
const getClientPackageById = async (id, options = {}) => {
  return ClientPackage.findById(id);
};
/**
 * Get channel by clientId
 * @param {ObjectId} clientId
 * @param options
 * @returns {Promise<ClientPackage>}
 */
// eslint-disable-next-line no-unused-vars
const getClientPackageByClientId = async (clientId, options = {}) => {
  return ClientPackage.find({ clientId });
};

/**
 * Update channel by id
 * @param {ObjectId} clientPackageId
 * @param {Object} updateBody
 * @returns {Promise<ClientPackage>}
 */
const updateClientPackageId = async (clientPackageId, updateBody) => {
  const channel = await getClientPackageById(clientPackageId);
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientPackage not found');
  }
  channel.currentPrice = await currentPriceByRooms(updateBody.currentPrice, updateBody.room);
  Object.assign(channel, updateBody);
  await channel.save();
  return channel;
};

/**
 * Delete channel by id
 * @param {ObjectId} clientPackageId
 * @returns {Promise<ClientPackage>}
 */
const deleteClientPackageById = async (clientPackageId) => {
  const channel = await getClientPackageById(clientPackageId);
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientPackage not found');
  }
  await channel.remove();
  return channel;
};

module.exports = {
  createClientPackage,
  queryClientPackages,
  getClientPackageById,
  getClientPackageByClientId,
  updateClientPackageId,
  deleteClientPackageById,
};
