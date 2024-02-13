const httpStatus = require('http-status');
const { CurrencyCountry } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

const currencyCountryPopulateObject = [
  {
    path: 'country',
  },
  {
    path: 'currency',
  },
];

/**
 * Get channel by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<CurrencyCountry>}
 */
// eslint-disable-next-line no-unused-vars
const getCurrencyCountryById = async (id, options = {}) => {
  return CurrencyCountry.findById(id).populate(currencyCountryPopulateObject);
};

/**
 * Create a channel package
 * @param {Object} channelBody
 * @param user
 * @returns {Promise<CurrencyCountry>}
 */
const createCurrencyCountry = async (channelBody, user) => {
  const body = channelBody;
  body.user = user._id;
  if (user.provider) body.provider = user.provider.id;
  const created = await CurrencyCountry.create(body);
  return getCurrencyCountryById(created.id);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryCurrencyCountrys = async (filter, options, user) => {
  // if (user.provider) currentFilter.provider = user.provider.id;
  return CurrencyCountry.paginate(filter, options, {}, currencyCountryPopulateObject);
};

/**
 * Update channel by id
 * @param {ObjectId} currencyCountryId
 * @param {Object} updateBody
 * @returns {Promise<CurrencyCountry>}
 */
const updateCurrencyCountryById = async (currencyCountryId, updateBody) => {
  const channel = await getCurrencyCountryById(currencyCountryId);
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CurrencyCountry not found');
  }
  Object.assign(channel, updateBody);
  await channel.save();
  return channel;
};

/**
 * Delete channel by id
 * @param {ObjectId} currencyCountryId
 * @returns {Promise<CurrencyCountry>}
 */
const deleteCurrencyCountryById = async (currencyCountryId) => {
  const channel = await getCurrencyCountryById(currencyCountryId);
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CurrencyCountry not found');
  }
  await channel.remove();
  return channel;
};

module.exports = {
  createCurrencyCountry,
  queryCurrencyCountrys,
  getCurrencyCountryById,
  updateCurrencyCountryById,
  deleteCurrencyCountryById,
};
