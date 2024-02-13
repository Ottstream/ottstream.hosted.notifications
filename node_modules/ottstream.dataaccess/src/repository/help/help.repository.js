const httpStatus = require('http-status');
const { Help } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

// eslint-disable-next-line no-unused-vars
const helpPopulateObject = [
  {
    path: 'provider',
    select: 'id name',
  },
  {
    path: 'user',
    select: 'firstname lastname',
  },
];

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Help>}
 */
// eslint-disable-next-line no-unused-vars
const getHelpById = async (id, options = {}) => {
  return Help.findById(id).populate(helpPopulateObject);
};

/**
 * Get item by id
 * @returns {Promise<Help>}
 * @param filter
 */
// eslint-disable-next-line no-unused-vars
const getHelps = async (filter) => {
  return Help.find(filter).populate(helpPopulateObject);
};

/**
 * Create a item help
 * @param {Object} itemBody
 * @param user
 * @returns {Promise<Help>}
 */
const createHelp = async (itemBody, user) => {
  const body = itemBody;
  body.user = user._id;
  const created = await Help.create(body);
  return getHelpById(created.id);
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryHelps = async (filter, options) => {
  return Help.paginate(filter, options, null, helpPopulateObject);
};

/**
 * Update Option by id
 * @param {ObjectId} helpId
 * @param {Object} updateBody
 * @returns {Promise<Help>}
 */
const updateHelpById = async (helpId, updateBody) => {
  const item = await getHelpById(helpId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Help not found');
  }
  Object.assign(item, updateBody);
  await item.save();
  return getHelpById(helpId);
};

/**
 * help action by id
 * @returns {Promise<Help>}
 * @param {Object} updateBody
 */
const helpsActionById = async (updateBody) => {
  try {
    if (!updateBody) throw new ApiError(httpStatus.BAD_REQUEST, 'Help not found');
    const { helpId } = updateBody;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < helpId.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const help = await getHelpById(helpId[i]);
      // eslint-disable-next-line no-await-in-loop
      await Help.updateMany(
        {
          _id: help._id,
        },
        { $set: { enableForSale: updateBody.enableForSale } },
        { multi: true }
      );
    }
    return helpId;
  } catch (e) {
    throw new ApiError(httpStatus.BAD_REQUEST, e);
  }
};

/**
 * Delete help by id
 * @param {Object} helpId
 * @returns {Promise<Balance>}
 */
const deleteHelpById = async (helpId) => {
  // eslint-disable-next-line no-await-in-loop
  const _help = await getHelpById(helpId);
  if (!_help) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Help not found');
  }
  // eslint-disable-next-line no-await-in-loop
  await _help.remove();
  return _help;
};

/**
 * delete many
 */
// eslint-disable-next-line no-unused-vars
const deleteMany = async (filter = {}) => {
  await Help.deleteMany(filter);
};

module.exports = {
  createHelp,
  getHelps,
  queryHelps,
  getHelpById,
  updateHelpById,
  helpsActionById,
  deleteHelpById,
  deleteMany,
};
