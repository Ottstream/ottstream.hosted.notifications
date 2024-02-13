const httpStatus = require('http-status');
const { Language } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Create a language
 * @param {Object} languageBody
 * @param user
 * @returns {Promise<Language>}
 */
const createLanguage = async (languageBody, user) => {
  const body = languageBody;
  body.user = user._id;
  return Language.create(body);
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
const queryLanguages = async (filter, options) => {
  return Language.paginate(
    filter,
    options,
    {
      name: true, // { $elemMatch: { lang: { $eq: langPick(options, user) } } },
      state: true,
      selected: true,
      country: true,
      code: true,
      user: true,
    },
    ['country']
  );
};

/**
 * @returns {Promise<QueryResult>}
 */
const querySystemLanguages = async () => {
  return (
    Language.find({
      selected: true,
    })
      .sort({ order: 1, _id: -1 })
      // .populate({
      //   path: 'units',
      //   populate: {
      //     path: 'unit',
      //   },
      // })
      .populate({
        path: 'country',
      })
  );
};

/**
 * Get language by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Language>}
 */
const getLanguageById = async (id, options = {}) => {
  const projection = {
    name: true,
    state: true,
    user: true,
    country: true,
    selected: true,
    code: true,
  };
  if (options.lang) projection.name = { $elemMatch: { lang: { $eq: options.lang } } };
  return Language.findById(id, projection).populate('country');
};

/**
 * Update language by id
 * @param {ObjectId} languageId
 * @param {Object} updateBody
 * @returns {Promise<Language>}
 */
const updateLanguageById = async (languageId, updateBody) => {
  const language = await getLanguageById(languageId);
  if (!language) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Language not found');
  }
  Object.assign(language, updateBody);
  await language.save();
  return language;
};

/**
 * Delete language by id
 * @param {ObjectId} languageId
 * @returns {Promise<Language>}
 */
const deleteLanguageById = async (languageId) => {
  const language = await getLanguageById(languageId);
  if (!language) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Language not found');
  }
  await language.remove();
  return language;
};

module.exports = {
  createLanguage,
  queryLanguages,
  querySystemLanguages,
  getLanguageById,
  updateLanguageById,
  deleteLanguageById,
};
