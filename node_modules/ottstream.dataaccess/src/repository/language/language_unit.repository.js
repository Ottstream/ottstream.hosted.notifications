const httpStatus = require('http-status');
const { LanguageUnit } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Create a languageUnit
 * @param {Object} languageUnitBody
 * @param user
 * @returns {Promise<LanguageUnit>}
 */
const createLanguageUnit = async (languageUnitBody, user) => {
  const body = languageUnitBody;
  body.user = user._id;
  return LanguageUnit.create(body);
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
const queryLanguageUnits = async (filter, options) => {
  return LanguageUnit.paginate(filter, options, {
    keyword: true, // { $elemMatch: { lang: { $eq: langPick(options, user) } } },
    state: true,
    user: true,
  });
};

/**
 * Get languageUnit by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<LanguageUnit>}
 */
const getLanguageUnitById = async (id, options = {}) => {
  const projection = {
    keyword: true,
    state: true,
    user: true,
  };
  if (options.lang) projection.name = { $elemMatch: { lang: { $eq: options.lang } } };
  return LanguageUnit.findById(id, projection);
};

/**
 * Update languageUnit by id
 * @param {ObjectId} languageUnitId
 * @param {Object} updateBody
 * @returns {Promise<LanguageUnit>}
 */
const updateLanguageUnitById = async (languageUnitId, updateBody) => {
  const languageUnit = await getLanguageUnitById(languageUnitId);
  if (!languageUnit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'LanguageUnit not found');
  }
  Object.assign(languageUnit, updateBody);
  await languageUnit.save();
  return languageUnit;
};

/**
 * Delete languageUnit by id
 * @param {ObjectId} languageUnitId
 * @returns {Promise<LanguageUnit>}
 */
const deleteLanguageUnitById = async (languageUnitId) => {
  const languageUnit = await getLanguageUnitById(languageUnitId);
  if (!languageUnit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'LanguageUnit not found');
  }
  await languageUnit.remove();
  return languageUnit;
};

module.exports = {
  createLanguageUnit,
  queryLanguageUnits,
  getLanguageUnitById,
  updateLanguageUnitById,
  deleteLanguageUnitById,
};
