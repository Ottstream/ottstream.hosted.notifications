const httpStatus = require('http-status');
const { ClientActivity } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

// eslint-disable-next-line no-unused-vars
const clientActivityPopulateObject = [
  {
    path: 'user',
  },
  {
    path: 'provider',
  },
];

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<ClientActivity>}
 */
// eslint-disable-next-line no-unused-vars
const getClientActivityById = async (id, options = {}) => {
  return ClientActivity.findById(id).populate(clientActivityPopulateObject);
};

/**
 * Get item by id
 * @returns {Promise<ClientActivity>}
 * @param filter
 */
// eslint-disable-next-line no-unused-vars
const getClientActivitys = async (filter) => {
  return ClientActivity.find(filter).populate(clientActivityPopulateObject);
};

/**
 * Create a item clientActivity
 * @param {Object} itemBody
 * @param user
 * @returns {Promise<ClientActivity>}
 */
const createClientActivity = async (itemBody) => {
  const body = itemBody;
  // eslint-disable-next-line no-console
  const created = await ClientActivity.create(body);
  return getClientActivityById(created.id);
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryClientActivitys = async (filter, options) => {
  const paginationFilter = {};

  if (filter.search && filter.search.length) {
    if (!paginationFilter.$and) {
      paginationFilter.$and = [];
    }
    filter.search.replace('%20', ' ');
    // eslint-disable-next-line security/detect-non-literal-regexp
    const regex = new RegExp(filter.search, 'i');
    paginationFilter.$and = [
      {
        $or: [
          { typeDescription: regex },
          { userDescription: regex },
          { actionDescription: regex },
          { 'action.type': regex },
          { 'action.name': regex },
        ],
      },
    ];
  }
  if (filter.startDate && filter.endDate) {
    if (!paginationFilter.$and) {
      paginationFilter.$and = [];
    }
    // eslint-disable-next-line no-param-reassign
    filter.startDate = new Date(filter.startDate);
    // eslint-disable-next-line no-param-reassign
    filter.endDate = new Date(filter.endDate);
    filter.startDate.setHours(0, 0, 0);
    filter.endDate.setHours(23, 59, 59);
    paginationFilter.$and.push({
      createdAt: {
        $gte: filter.startDate,
        $lte: filter.endDate,
      },
    });
  }
  if (!paginationFilter.$and) {
    paginationFilter.$and = [];
  }
  paginationFilter.$and.push({
    provider: { $in: filter.providers },
  });
  return ClientActivity.paginate(paginationFilter, options, null, [
    { path: 'user' },
    { path: 'client' },
    { path: 'provider' },
  ]);
};

/**
 * Update Option by id
 * @param {ObjectId} clientActivityId
 * @param {Object} updateBody
 * @returns {Promise<ClientActivity>}
 */
const updateClientActivityById = async (clientActivityId, updateBody) => {
  const item = await getClientActivityById(clientActivityId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientActivity not found');
  }
  Object.assign(item, updateBody);
  await item.save();
  return getClientActivityById(clientActivityId);
};

/**
 * clientActivity action by id
 * @returns {Promise<ClientActivity>}
 * @param {Object} updateBody
 */
const clientActivitysActionById = async (updateBody) => {
  try {
    if (!updateBody) throw new ApiError(httpStatus.BAD_REQUEST, 'ClientActivity not found');
    const { clientActivityId } = updateBody;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < clientActivityId.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const clientActivity = await getClientActivityById(clientActivityId[i]);
      // eslint-disable-next-line no-await-in-loop
      await ClientActivity.updateMany(
        {
          _id: clientActivity._id,
        },
        { $set: { enableForSale: updateBody.enableForSale } },
        { multi: true }
      );
    }
    return clientActivityId;
  } catch (e) {
    throw new ApiError(httpStatus.BAD_REQUEST, e);
  }
};

/**
 * Delete clientActivity by id
 * @param {Object} clientActivityId
 * @returns {Promise<Balance>}
 */
const deleteClientActivityById = async (clientActivityId) => {
  // eslint-disable-next-line no-await-in-loop
  const _clientActivity = await getClientActivityById(clientActivityId);
  if (!_clientActivity) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientActivity not found');
  }
  // eslint-disable-next-line no-await-in-loop
  await _clientActivity.remove();
  return _clientActivity;
};

module.exports = {
  createClientActivity,
  getClientActivitys,
  queryClientActivitys,
  getClientActivityById,
  updateClientActivityById,
  clientActivitysActionById,
  deleteClientActivityById,
};
