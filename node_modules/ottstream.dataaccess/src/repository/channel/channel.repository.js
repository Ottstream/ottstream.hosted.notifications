const httpStatus = require('http-status');
const { Channel, ChannelOption } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

const channelPopulateObject = [
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
 * @returns {Promise<Channel>}
 */
// eslint-disable-next-line no-unused-vars
const getChannelById = async (id, options = {}) => {
  return Channel.findById(id).populate(channelPopulateObject);
};

/**
 * Get item by id
 * @param channelId
 * @param providerId
 * @param options
 * @returns {Promise<Channel>}
 */
// eslint-disable-next-line no-unused-vars
const getChannelOption = async (channelId, providerId, options = {}) => {
  const items = await ChannelOption.find({
    provider: providerId,
    channel: channelId,
  }).populate(channelPopulateObject);
  if (items && items.length) return items[0];
  return null;
};

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Channel>}
 */
// eslint-disable-next-line no-unused-vars
const getChannelByMiddlewareId = async (id, options = {}) => {
  const channels = await Channel.find({
    middlewareId: id,
  }).populate(channelPopulateObject);
  if (channels.length) return channels[0];
  return null;
};

/**
 * Create a item channel
 * @param {Object} itemBody
 * @param user
 * @returns {Promise<Channel>}
 */
const createChannel = async (itemBody, user) => {
  const body = itemBody;
  // eslint-disable-next-line no-console
  if (!user.provider) throw new ApiError('no provider for user');
  body.provider = user.provider.id;
  const created = await Channel.create(body);
  return getChannelById(created.id);
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
const queryChannels = async (filter, options) => {
  return Channel.paginate(filter, options);
};

/**
 * @returns {Promise<QueryResult>}
 * @param middlewareId
 */
const getChannelsByPackageMiddlewareId = async (middlewareId) => {
  const curOptions = {
    page: 1,
    limit: 10000,
  };

  const lookupFilter = [{ $unwind: '$packets' }, { $match: { packets: middlewareId } }];

  const aggregate = Channel.aggregate(lookupFilter);
  const list = await Channel.aggregatePaginate(aggregate, curOptions);

  list.docs.forEach((elem, i) => {
    list.docs[i].id = elem._id;
    delete list.docs[i]._id;
  });
  return {
    page: curOptions.page,
    limit: curOptions.limit,
    results: list.docs,
    totalPages: list.totalPages,
    totalResults: list.totalDocs,
  };
};

/**
 * Update Option by id
 * @param {ObjectId} channelId
 * @param {Object} updateBody
 * @returns {Promise<Channel>}
 */
const updateChannelById = async (channelId, updateBody) => {
  const item = await getChannelById(channelId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Channel not found');
  }
  Object.assign(item, updateBody);
  await item.save();
  return getChannelById(channelId);
};

/**
 * Delete item by id
 * @param {ObjectId} channelId
 * @param action
 * @returns {Promise<Channel>}
 */
const disableEnableChannelById = async (channelId, action) => {
  const _channel = await getChannelById(channelId);
  return Channel.updateOne({ _id: _channel._id }, { $set: { status: action ? 1 : 0 } }, { multi: false });
};

/**
 * Delete channel by id
 * @param {ObjectId} channelId
 * @returns {Promise<Balance>}
 */
const deleteChannelById = async (channelId) => {
  const _channel = await getChannelById(channelId);
  if (!_channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Balance not found');
  }
  await _channel.remove();
  return _channel;
};

module.exports = {
  createChannel,
  queryChannels,
  getChannelById,
  getChannelByMiddlewareId,
  getChannelsByPackageMiddlewareId,
  updateChannelById,
  disableEnableChannelById,
  deleteChannelById,
};
