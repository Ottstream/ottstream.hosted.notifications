const httpStatus = require('http-status');
const { ChannelCategory } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');
const {
  updateOttProviderById,
  getOttProviderCategoryChannels,
  getOttProviderById,
} = require('../ottprovider/ottprovider.repository');

const channelCategoryPopulateObject = '';

/**
 * Create a CategoryChannel
 * @param {Object} channelChannelCategoryBody
 * @param user
 * @returns {Promise<{}>}
 */
const createCategoryChannel = async (channelChannelCategoryBody, user) => {
  if (user.provider && user.provider.id) {
    await updateOttProviderById(user.provider.id, { categoryChannels: channelChannelCategoryBody.list });
    return getOttProviderCategoryChannels(user.provider.id, {});
  }
  return [];
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<*[]>}
 */
const queryCategoryChannels = async (filter, options, user) => {
  if (user.provider) {
    return getOttProviderCategoryChannels(user.provider.id, {});
  }
  return [];
};

/**
 * Create a channelChannelCategory
 * @param {Object} channelChannelCategoryBody
 * @param user
 * @returns {Promise<ChannelCategory>}
 */
const createChannelCategory = async (channelChannelCategoryBody, user) => {
  const body = channelChannelCategoryBody;
  body.user = user._id;
  if (user.provider) body.provider = user.provider.id;
  return ChannelCategory.create(body);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
const queryChannelCategorys = async (filter, options, user) => {
  const currentFilter = filter;
  if (user.provider) currentFilter.provider = user.provider.id;
  const currentOptions = options;
  const sortBy = [];
  sortBy.push('order:desc');
  currentOptions.sortBy = sortBy;
  return ChannelCategory.paginate(currentFilter, currentOptions, {}, channelCategoryPopulateObject);
};

/**
 * Get channelChannelCategory by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<ChannelCategory>}
 */
// eslint-disable-next-line no-unused-vars
const getChannelCategoryById = async (id, options = {}) => {
  return ChannelCategory.findById(id).populate(channelCategoryPopulateObject);
};

/**
 * Update channelChannelCategory by id
 * @param {ObjectId} channelChannelCategoryId
 * @param {Object} updateBody
 * @returns {Promise<ChannelCategory>}
 */
// eslint-disable-next-line no-unused-vars
const updateChannelCategoryById = async (channelChannelCategoryId, updateBody) => {
  const channelChannelCategory = await getChannelCategoryById(channelChannelCategoryId);
  if (!channelChannelCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ChannelCategory not found');
  }
  Object.assign(channelChannelCategory, updateBody);
  await channelChannelCategory.save();
  return getChannelCategoryById(channelChannelCategoryId);
};

/**
 * Update updateChannelCategoryOrder by id
 * @param {ObjectId} channelChannelCategoryId
 * @param {Object} updateBody
 * @returns {Promise<ChannelCategory>}
 */
const updateChannelCategoryOrder = async (channelChannelCategoryId, updateBody) => {
  // const ops = updateBody.map(function (item) {
  //   return {
  //     updateOne: {
  //       filter: {
  //         id: item.id,
  //         order: { $ne: item.order },
  //       },
  //       update: { $set: { order: item.order } },
  //     },
  //   };
  // });
  updateBody.forEach(function (item) {
    ChannelCategory.findByIdAndUpdate(item.id, { order: item.order }, function () {});
  });
  // await ChannelCategory.collection.bulkWrite(ops);
  // Object.assign(channelChannelCategory, updateBody);
  // await channelChannelCategory.save();
  // return getChannelCategoryById(channelChannelCategoryId);
};

/**
 * Update updateCategoryChannelOrder by id
 * @param {Object} updateBody
 * @param user
 * @returns {Promise<ChannelCategory>}
 */
const updateCategoryChannelOrder = async (updateBody, user) => {
  if (user.provider) {
    const ottprovider = await getOttProviderById(user.provider.id);
    // const categoryChannels = await getOttProviderCategoryChannels(user.provider.id, {});
    ottprovider.categoryChannels.forEach(function (item) {
      item.channels.forEach(function (channel) {
        updateBody.forEach(function (update, i) {
          if (channel.id === update.id) {
            const elem = updateBody[i];
            elem.order = update.order;
          }
        });
      });
    });

    await ottprovider.save();

    // categoryChannels.forEach(function (item, i) {
    //   categoryChannels[i].category = item.category.id;
    //   item.channels.forEach(function (channel, j) {
    //     categoryChannels[i].channels[j].channel = channel.channel.id;
    //   });
    // });

    // await updateOttProviderById(user.provider.id, { categoryChannels });

    const test = await getOttProviderCategoryChannels(user.provider.id, {});
    test.forEach(function (item) {
      item.channels.sort((a, b) => (a.order > b.order ? 1 : -1));
    });
  }
  // const ops = updateBody.map(function (item) {
  //   return {
  //     updateOne: {
  //       filter: {
  //         id: item.id,
  //         order: { $ne: item.order },
  //       },
  //       update: { $set: { order: item.order } },
  //     },
  //   };
  // });
  // updateBody.forEach(function (item) {
  //   ChannelCategory.findByIdAndUpdate(item.id, { order: item.order }, function () {});
  // });
  // await ChannelCategory.collection.bulkWrite(ops);
  // Object.assign(channelChannelCategory, updateBody);
  // await channelChannelCategory.save();
  // return getChannelCategoryById(channelChannelCategoryId);
};

/**
 * Delete channelChannelCategory by id
 * @param {ObjectId} channelChannelCategoryId
 * @returns {Promise<ChannelCategory>}
 */
const deleteChannelCategoryById = async (channelChannelCategoryId) => {
  const channelChannelCategory = await getChannelCategoryById(channelChannelCategoryId);
  if (!channelChannelCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ChannelCategory not found');
  }
  await channelChannelCategory.remove();
  return channelChannelCategory;
};

module.exports = {
  createChannelCategory,
  createCategoryChannel,
  queryChannelCategorys,
  queryCategoryChannels,
  getChannelCategoryById,
  updateChannelCategoryById,
  updateChannelCategoryOrder,
  updateCategoryChannelOrder,
  deleteChannelCategoryById,
};
