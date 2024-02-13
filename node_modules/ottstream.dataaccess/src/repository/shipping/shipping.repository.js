const httpStatus = require('http-status');
const { Shipping } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

// eslint-disable-next-line no-unused-vars
const shippingPopulateObject = [
  {
    path: 'provider',
    select: 'id name',
  },
  {
    path: 'user',
  },
  {
    path: 'client',
    select: 'personalInfo provider id',
  },
];

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Shipping>}
 */
// eslint-disable-next-line no-unused-vars
const getShippingById = async (id, options = {}) => {
  return Shipping.findById(id);
};

/**
 * Get item by id
 * @returns {Promise<Shipping>}
 * @param filter
 */
// eslint-disable-next-line no-unused-vars
const getShippings = async (filter) => {
  return Shipping.find(filter);
};

/**
 * Create a item shipping
 * @param {Object} itemBody
 * @param user
 * @returns {Promise<Shipping>}
 */
const createShipping = async (itemBody, user) => {
  const body = itemBody;
  // eslint-disable-next-line no-console
  if (user) body.user = user._id;
  const created = await Shipping.create(body);
  return getShippingById(created.id);
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryShippings = async (filter, options) => {
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
    sortBy.push(`_id:desc`);
  }

  curOptions.sortBy = sortBy;
  const shippingFilter = {};
  if (filter.search && filter.search.length) {
    filter.search.replace('%20', ' ');
    // eslint-disable-next-line security/detect-non-literal-regexp
    const regex = new RegExp(filter.search, 'i');
    shippingFilter.$and = [
      {
        $or: [{ number: regex }],
      },
    ];
  }

  if (filter.client) {
    shippingFilter.client = { $eq: filter.client };
  } else {
    shippingFilter.provider = { $in: filter.providers };
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
  // shippingFilter.status = { $eq: 1 };
  // shippingFilter.provider = { $in: filter.providers };
  return Shipping.paginate(shippingFilter, options, null, shippingPopulateObject);
};

/**
 * Update Option by id
 * @param {ObjectId} shippingId
 * @param {Object} updateBody
 * @returns {Promise<Shipping>}
 */
const updateShippingById = async (shippingId, updateBody) => {
  const item = await getShippingById(shippingId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shipping not found');
  }
  Object.assign(item, updateBody);
  await item.save();
  return getShippingById(shippingId);
};

/**
 * shipping action by id
 * @returns {Promise<Shipping>}
 * @param {Object} updateBody
 */
const shippingsActionById = async (updateBody) => {
  try {
    if (!updateBody) throw new ApiError(httpStatus.BAD_REQUEST, 'Shipping not found');
    const { shippingId } = updateBody;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < shippingId.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const shipping = await getShippingById(shippingId[i]);
      // eslint-disable-next-line no-await-in-loop
      await Shipping.updateMany(
        {
          _id: shipping._id,
        },
        { $set: { enableForSale: updateBody.enableForSale } },
        { multi: true }
      );
    }
    return shippingId;
  } catch (e) {
    throw new ApiError(httpStatus.BAD_REQUEST, e);
  }
};

/**
 * Delete shipping by id
 * @param {Object} shippingId
 * @returns {Promise<Balance>}
 */
const deleteShippingById = async (shippingId) => {
  // eslint-disable-next-line no-await-in-loop
  const _shipping = await getShippingById(shippingId);
  if (!_shipping) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shipping not found');
  }
  // eslint-disable-next-line no-await-in-loop
  await _shipping.remove();
  return _shipping;
};

/**
 * Get shippings all
 * @param {ObjectId} filter
 * @returns {Promise<User>}
 */
const getAll = async (filter) => {
  return Shipping.find(filter);
};

module.exports = {
  createShipping,
  getAll,
  getShippings,
  queryShippings,
  getShippingById,
  updateShippingById,
  shippingsActionById,
  deleteShippingById,
};
