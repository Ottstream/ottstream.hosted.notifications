const httpStatus = require('http-status');
const { ChannelIconSet } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

const channelIconSetPopulateObject = [
  {
    path: 'setType',
  },
  {
    path: 'setItems',
    populate: [
      {
        path: 'iconType',
      },
      {
        path: 'originalImage',
      },
      {
        path: 'changedImage',
      },
    ],
  },
  {
    path: 'provider',
  },
];

/**
 * Get channelIconSet by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<ChannelIconSet>}
 */
// eslint-disable-next-line no-unused-vars
const getChannelIconSetById = async (id, options = {}) => {
  return ChannelIconSet.findById(id).populate(channelIconSetPopulateObject);
};

/**
 * Create a channelIconSet
 * @param {Object} channelIconSetBody
 * @param user
 * @returns {Promise<ChannelIconSet>}
 */
const createChannelIconSet = async (channelIconSetBody, user) => {
  const body = channelIconSetBody;
  body.user = user._id;
  if (user.provider) {
    body.provider = user.provider.id;
  }
  const newEntity = await ChannelIconSet.create(body);
  return getChannelIconSetById(newEntity.id);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
const queryChannelIconSets = async (filter, options, user) => {
  const currentFilter = filter;
  if (user.provider) currentFilter.provider = user.provider.id;
  return ChannelIconSet.paginate(currentFilter, options, {}, channelIconSetPopulateObject);
};

/**
 * Update channelIconSet by id
 * @param {ObjectId} channelIconSetId
 * @param {Object} updateBody
 * @returns {Promise<ChannelIconSet>}
 */
const updateChannelIconSetById = async (channelIconSetId, updateBody) => {
  const channelIconSet = await getChannelIconSetById(channelIconSetId);
  if (!channelIconSet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ChannelIconSet not found');
  }
  Object.assign(channelIconSet, updateBody);
  await channelIconSet.save();
  return getChannelIconSetById(channelIconSetId);
};

/**
 * Delete channelIconSet by id
 * @param {ObjectId} channelIconSetId
 * @returns {Promise<ChannelIconSet>}
 */
const deleteChannelIconSetById = async (channelIconSetId) => {
  const channelIconSet = await getChannelIconSetById(channelIconSetId);
  if (!channelIconSet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ChannelIconSet not found');
  }
  await channelIconSet.remove();
  return channelIconSet;
};

module.exports = {
  createChannelIconSet,
  queryChannelIconSets,
  getChannelIconSetById,
  updateChannelIconSetById,
  deleteChannelIconSetById,
};
