const httpStatus = require('http-status');
const { Country } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Create a country
 * @param {Object} countryBody
 * @param user
 * @returns {Promise<Country>}
 */
const createCountry = async (countryBody, user) => {
  const body = countryBody;
  body.user = user._id;
  return Country.create(body);
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
const queryCountrys = async (filter, options) => {
  return Country.paginate(filter, options, {
    name: true, // { $elemMatch: { lang: { $eq: langPick(options, user) } } },
    state: true,
    code: true,
    user: true,
  });
};

/**
 * Get country by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Country>}
 */
const getCountryById = async (id, options = {}) => {
  const projection = {
    name: true,
    state: true,
    code: true,
    user: true,
  };
  if (options.lang) projection.name = { $elemMatch: { lang: { $eq: options.lang } } };
  return Country.findById(id, projection);
};

/**
 * Update country by id
 * @param {ObjectId} countryId
 * @param {Object} updateBody
 * @returns {Promise<Country>}
 */
const updateCountryById = async (countryId, updateBody) => {
  const country = await getCountryById(countryId);
  if (!country) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Country not found');
  }
  Object.assign(country, updateBody);
  await country.save();
  return country;
};

/**
 * Delete country by id
 * @param {ObjectId} countryId
 * @returns {Promise<Country>}
 */
const deleteCountryById = async (countryId) => {
  const country = await getCountryById(countryId);
  if (!country) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Country not found');
  }
  await country.remove();
  return country;
};

module.exports = {
  createCountry,
  queryCountrys,
  getCountryById,
  updateCountryById,
  deleteCountryById,
};
