const httpStatus = require('http-status');
const { Currency } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Get channel by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Currency>}
 */
// eslint-disable-next-line no-unused-vars
const getCurrencyById = async (id, options = {}) => {
  return Currency.findById(id);
};

/**
 * Create a channel package
 * @param {Object} channelBody
 * @param user
 * @returns {Promise<Currency>}
 */
const createCurrency = async (channelBody, user) => {
  const body = channelBody;
  body.user = user._id;
  if (user.provider) body.provider = user.provider.id;
  const created = await Currency.create(body);
  return getCurrencyById(created.id);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryCurrencys = async (filter, options, user) => {
  return Currency.paginate(filter, options);
};

/**
 * Update channel by id
 * @param {ObjectId} currencyId
 * @param {Object} updateBody
 * @returns {Promise<Currency>}
 */
const updateCurrencyById = async (currencyId, updateBody) => {
  const channel = await getCurrencyById(currencyId);
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Currency not found');
  }
  Object.assign(channel, updateBody);
  await channel.save();
  return channel;
};

/**
 * Delete channel by id
 * @param {ObjectId} currencyId
 * @returns {Promise<Currency>}
 */
const deleteCurrencyById = async (currencyId) => {
  const channel = await getCurrencyById(currencyId);
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Currency not found');
  }
  await channel.remove();
  return channel;
};

module.exports = {
  createCurrency,
  queryCurrencys,
  getCurrencyById,
  updateCurrencyById,
  deleteCurrencyById,
};
