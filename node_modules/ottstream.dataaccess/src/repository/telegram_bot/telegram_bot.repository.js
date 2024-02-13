const httpStatus = require('http-status');
const { TelegramBot } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

// eslint-disable-next-line no-unused-vars
const telegramBotPopulateObject = [];

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<TelegramBot>}
 */
// eslint-disable-next-line no-unused-vars
const getTelegramBotById = async (id, options = {}) => {
  return TelegramBot.findById(id).populate(telegramBotPopulateObject);
};

/**
 * Get item by id
 * @returns {Promise<TelegramBot>}
 * @param filter
 */
// eslint-disable-next-line no-unused-vars
const getTelegramBots = async (filter) => {
  return TelegramBot.find(filter).populate(telegramBotPopulateObject);
};

/**
 * Create a item telegramBot
 * @param {Object} itemBody
 * @returns {Promise<TelegramBot>}
 */
const createTelegramBot = async (itemBody) => {
  const body = itemBody;
  const created = await TelegramBot.create(body);
  return getTelegramBotById(created.id);
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryTelegramBots = async (filter, options) => {
  return TelegramBot.paginate(filter, options, null, telegramBotPopulateObject);
};

/**
 * Update Option by id
 * @param {ObjectId} telegramBotId
 * @param {Object} updateBody
 * @returns {Promise<TelegramBot>}
 */
const updateTelegramBotById = async (telegramBotId, updateBody) => {
  const item = await getTelegramBotById(telegramBotId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'TelegramBot not found');
  }
  Object.assign(item, updateBody);
  await item.save();
  return getTelegramBotById(telegramBotId);
};

/**
 * telegramBot action by id
 * @returns {Promise<TelegramBot>}
 * @param {Object} updateBody
 */
const telegramBotsActionById = async (updateBody) => {
  try {
    if (!updateBody) throw new ApiError(httpStatus.BAD_REQUEST, 'TelegramBot not found');
    const { telegramBotId } = updateBody;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < telegramBotId.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const telegramBot = await getTelegramBotById(telegramBotId[i]);
      // eslint-disable-next-line no-await-in-loop
      await TelegramBot.updateMany(
        {
          _id: telegramBot._id,
        },
        { $set: { enableForSale: updateBody.enableForSale } },
        { multi: true }
      );
    }
    return telegramBotId;
  } catch (e) {
    throw new ApiError(httpStatus.BAD_REQUEST, e);
  }
};

/**
 * Delete telegramBot by id
 * @param {Object} telegramBotId
 * @returns {Promise<Balance>}
 */
const deleteTelegramBotById = async (telegramBotId) => {
  // eslint-disable-next-line no-await-in-loop
  const _telegramBot = await getTelegramBotById(telegramBotId);
  if (!_telegramBot) {
    throw new ApiError(httpStatus.NOT_FOUND, 'TelegramBot not found');
  }
  // eslint-disable-next-line no-await-in-loop
  await _telegramBot.remove();
  return _telegramBot;
};

/**
 * delete many
 */
// eslint-disable-next-line no-unused-vars
const deleteMany = async (filter = {}) => {
  await TelegramBot.deleteMany(filter);
};

/**
 * Get list
 * @returns {Promise<TelegramBot>}
 */
// eslint-disable-next-line no-unused-vars
const getList = async (filter = {}, populate = [], projection = null) => {
  const query = TelegramBot.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

/**
 * update one
 */
// eslint-disable-next-line no-unused-vars
const updateOne = async (filter = {}, fields = {}) => {
  await TelegramBot.updateOne(filter, fields);
};

module.exports = {
  getList,
  updateOne,
  createTelegramBot,
  getTelegramBots,
  queryTelegramBots,
  getTelegramBotById,
  updateTelegramBotById,
  telegramBotsActionById,
  deleteTelegramBotById,
  deleteMany,
};
