const httpStatus = require('http-status');
const { LanguageUnitTranslation } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Create a LanguageUnitTranslation
 * @param {Object} languageUnitTranslationBody
 * @param user
 * @returns {Promise<LanguageUnitTranslation>}
 */
const createLanguageUnitTranslation = async (languageUnitTranslationBody, user) => {
  const body = languageUnitTranslationBody;
  body.user = user._id;
  return LanguageUnitTranslation.create(body);
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
const queryLanguageUnitTranslations = async (filter, options) => {
  return LanguageUnitTranslation.paginate(filter, options);
  // const languageUnits = await LanguageUnit.paginate(filter, options, {
  //   keyword: true, // { $elemMatch: { lang: { $eq: langPick(options, user) } } },
  // });
  // const language = await Language.findById(options.id).populate('units');
  // const returnList = [];
  // languageUnits.results.forEach(function (languageUnit) {
  //   const unitTranslation = language.units.find((a) => a.unit.toString() === languageUnit.id);
  //   const obj = {
  //     keyword: languageUnit.keyword,
  //     unit: languageUnit.id,
  //   };
  //   if (unitTranslation) {
  //     obj.translation = unitTranslation.translation;
  //     obj.id = unitTranslation.id;
  //   }
  //   returnList.push(obj);
  // });
  // languageUnits.results = returnList;
  // return languageUnits;
};

/**
 * Get languageUnitTranslation by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<LanguageUnitTranslation>}
 */
const getLanguageUnitTranslationById = async (id, options = {}) => {
  const projection = {
    translation: true,
    state: true,
    user: true,
  };
  if (options.lang) projection.name = { $elemMatch: { lang: { $eq: options.lang } } };
  return LanguageUnitTranslation.findById(id, projection).populate('categorys');
};

/**
 * Update languageUnitTranslation by id
 * @param languageUnitTranslationId
 * @param {Object} updateBody
 * @returns {Promise<LanguageUnitTranslation>}
 */
const updateLanguageUnitTranslationById = async (languageUnitTranslationId, updateBody) => {
  const languageUnitTranslation = await getLanguageUnitTranslationById(languageUnitTranslationId);
  if (!languageUnitTranslation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'LanguageUnitTranslation not found');
  }
  Object.assign(languageUnitTranslation, updateBody);
  await languageUnitTranslation.save();
  return languageUnitTranslation;
};

/**
 * Delete languageUnitTranslation by id
 * @param {ObjectId} languageUnitTranslationId
 * @returns {Promise<LanguageUnitTranslation>}
 */
const deleteLanguageUnitTranslationById = async (languageUnitTranslationId) => {
  const languageUnitTranslation = await getLanguageUnitTranslationById(languageUnitTranslationId);
  if (!languageUnitTranslation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'LanguageUnitTranslation not found');
  }
  await languageUnitTranslation.remove();
  return languageUnitTranslation;
};

module.exports = {
  createLanguageUnitTranslation,
  queryLanguageUnitTranslations,
  getLanguageUnitTranslationById,
  updateLanguageUnitTranslationById,
  deleteLanguageUnitTranslationById,
};
