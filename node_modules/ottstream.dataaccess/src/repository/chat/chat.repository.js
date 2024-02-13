const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { Chat } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

// eslint-disable-next-line no-unused-vars
const chatPopulateObject = [
  {
    path: 'client',
  },
  {
    path: 'location',
  },
  {
    path: 'equipmentInstaller',
  },
];

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Chat>}
 */
// eslint-disable-next-line no-unused-vars
const getChatById = async (id, options = {}) => {
  const item = await Chat.findById(id);
  return item;
};

/**
 * Get item by id
 * @returns {Promise<Chat>}
 * @param filter
 */
// eslint-disable-next-line no-unused-vars
const getChats = async (filter) => {
  const items = await Chat.find(filter).populate(chatPopulateObject);
  // items.forEach((elem) => {
  //   // eslint-disable-next-line no-param-reassign
  //   elem.typeName = chatTypes.filter((r) => r.type === elem.type)[0].name;
  // });
  return items;
};

/**
 * Get item by id
 * @returns {Promise<Chat>}
 * @param filter
 */
// eslint-disable-next-line no-unused-vars
const queryProviderChats = async (filter) => {
  const groupedMessages = await Chat.aggregate([
    {
      $match: {
        provider: mongoose.Types.ObjectId(filter.provider),
        client: { $ne: null },
        // Include any other filters like provider here
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: 'clients', // Replace with your clients collection name
        localField: 'client',
        foreignField: '_id',
        as: 'clientInfo',
      },
    },
    { $unwind: '$clientInfo' },
    {
      $group: {
        _id: '$clientInfo._id',
        lastMessageDate: { $first: '$createdAt' },
        lastMessage: { $first: '$message' },
        client: { $first: '$clientInfo' },
        unreadMessagesCount: {
          $sum: { $cond: [{ $eq: ['$readState', 0] }, 1, 0] },
        },
      },
    },
    { $sort: { lastMessageDate: -1 } }, // Sort the grouped results by the lastMessageDate
    {
      $project: {
        _id: 0,
        client: {
          id: '$_id',
          personalInfo: '$client.personalInfo',
          status: '$client.status',
        },
        lastMessageDate: 1,
        lastMessage: 1,
        unreadMessagesCount: 1,
      },
    },
  ]);
  // provider: mongoose.Types.ObjectId(filter.provider), // Filter for the provider

  return groupedMessages;
};

/**
 * Get item by id
 * @returns {Promise<Chat>}
 * @param filter
 */
// eslint-disable-next-line no-unused-vars
const queryProviderCountChats = async (filter) => {
  const groupedMessages = await Chat.aggregate([
    {
      $match: {
        client: { $ne: null },
        readState: 0,
        provider: mongoose.Types.ObjectId(filter.provider), // Filter for the provider
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: 'clients', // Replace with your clients collection name
        localField: 'client',
        foreignField: '_id',
        as: 'clientInfo',
      },
    },
    { $unwind: '$clientInfo' },
    {
      $group: {
        _id: '$clientInfo._id',
        earliestCreatedAt: { $last: '$createdAt' }, // Captures the earliest createdAt for each group
        lastMessageDate: { $first: '$updatedAt' },
        lastMessage: { $first: '$message' },
        client: { $first: '$clientInfo' },
        unreadMessagesCount: {
          $sum: { $cond: [{ $eq: ['$readState', 0] }, 1, 0] }, // Sum chats where readState is 0
        },
      },
    },
    { $sort: { earliestCreatedAt: -1 } }, // Sort the grouped results by the earliest createdAt date
    {
      $project: {
        _id: 0,
        client: {
          id: '$_id',
          personalInfo: '$client.personalInfo',
        },
        lastMessageDate: 1,
        lastMessage: 1,
        unreadMessagesCount: 1, // Include the count in the projection
      },
    },
  ]);
  return groupedMessages;
};

/**
 * Create a item chat
 * @param {Object} itemBody
 * @param user
 * @returns {Promise<Chat>}
 */
const createChat = async (itemBody) => {
  const body = itemBody;
  // eslint-disable-next-line no-console
  const created = await Chat.create(body);
  return created;
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryChats = async (filter, options) => {
  // const isLimited = !user.rolesInfo.admin;
  const curOptions = {
    page: options.page ?? 1,
    all: options.all ?? false,
    limit: options.all ? 10000000 : options.limit ?? 20,
  };

  const sortObject = {
    // _id: -1,
  };
  const sortBy = [];

  if (options.sortBy) {
    if (typeof options.sortBy === 'object') {
      options.sortBy.forEach(function (sortOption) {
        const parts = sortOption.split(':');
        sortObject[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        sortBy.push(`${parts[0]}:${parts[1]}`);
      });
    } else if (typeof options.sortBy === 'string') {
      const parts = options.sortBy.split(':');
      sortObject[parts[0]] = parts[1] === 'desc' ? -1 : 1;
      sortBy.push(`${parts[0]}:${parts[1]}`);
    }
  } else {
    sortObject._id = -1;
    sortBy.push(`executionDate:desc`);
  }

  curOptions.sortBy = sortBy;
  const chatFilter = {};

  if (filter.chatType) {
    chatFilter.chat_type = filter.chatType;
  }
  if (filter.from_client && filter.to_client) {
    if (!chatFilter.$or) chatFilter.$or = [];
    chatFilter.$or.push({
      from_client: filter.from_client,
    });
    chatFilter.$or.push({
      to_client: filter.to_client,
    });
  }

  // if (isLimited) {
  //   const searchValue = filter.search;
  //   clientFilter.$and = [
  //     {
  //       $or: [
  //         { 'personalInfo.firstname': { $eq: searchValue } },
  //         { 'personalInfo.lastname': { $eq: searchValue } },
  //         { 'emails.email': { $eq: searchValue } },
  //         { 'addresses.address': { $eq: searchValue } },
  //         { 'locations.login': { $eq: searchValue } },
  //       ],
  //     },
  //   ];
  // }
  // status to 1
  // chatFilter.status = { $eq: 1 };
  // chatFilter.provider = { $in: filter.providers };
  return Chat.paginate(chatFilter, curOptions, {}, [{ path: 'byUser', select: ['_id', 'firstname', 'lastname'] }]);
};

/**
 * Update Option by id
 * @param {ObjectId} chatId
 * @param {Object} updateBody
 * @returns {Promise<Chat>}
 */
const updateChatById = async (chatId, updateBody) => {
  const item = await getChatById(chatId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Chat not found');
  }
  Object.assign(item, updateBody);
  await item.save();
  return getChatById(chatId);
};

/**
 * chat action by id
 * @returns {Promise<Chat>}
 * @param {Object} updateBody
 */
const chatsActionById = async (updateBody) => {
  try {
    if (!updateBody) throw new ApiError(httpStatus.BAD_REQUEST, 'Chat not found');
    const { chatId } = updateBody;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < chatId.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const chat = await getChatById(chatId[i]);
      // eslint-disable-next-line no-await-in-loop
      await Chat.updateMany(
        {
          _id: chat._id,
        },
        { $set: { enableForSale: updateBody.enableForSale } },
        { multi: true }
      );
    }
    return chatId;
  } catch (e) {
    throw new ApiError(httpStatus.BAD_REQUEST, e);
  }
};

/**
 * Delete chat by id
 * @param {Object} chatId
 * @returns {Promise<Balance>}
 */
const deleteChatById = async (chatId) => {
  return Chat.deleteOne({ _id: chatId });
};

/**
 * update many chats
 * @param {Object} filter
 * @param {Object} update
 * @returns {Promise<CHat>}
 */
const updateMany = async (filter, update) => {
  return Chat.updateMany(filter, update);
};

/**
 * Get list
 * @returns {Promise<Chat>}
 */
// eslint-disable-next-line no-unused-vars
const getList = async (filter = {}, populate = [], projection = null) => {
  const query = Chat.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

module.exports = {
  createChat,
  getList,
  getChats,
  queryProviderChats,
  queryChats,
  getChatById,
  queryProviderCountChats,
  updateChatById,
  updateMany,
  chatsActionById,
  deleteChatById,
};
