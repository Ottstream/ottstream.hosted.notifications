const httpStatus = require('http-status');
const { Sms } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

// eslint-disable-next-line no-unused-vars
const smsPopulateObject = [
  {
    path: 'client',
  },
  {
    path: 'location',
  },
  {
    path: 'equipmentInstaller',
  },
];

/**
 * Get item by messageId
 * @param {string} id
 * @returns {Promise<Sms>}
 */
// eslint-disable-next-line no-unused-vars
const findBySid = async (sid) => {
  const item = await Sms.findOne({
    messageId: sid,
  });
  return item;
};
/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Sms>}
 */
// eslint-disable-next-line no-unused-vars
const getSmsById = async (id, options = {}) => {
  const item = await Sms.findById(id);
  return item;
};

/**
 * Get item by id
 * @returns {Promise<Sms>}
 * @param filter
 */
// eslint-disable-next-line no-unused-vars
const getSmss = async (filter) => {
  const items = await Sms.find(filter).populate(smsPopulateObject);
  // items.forEach((elem) => {
  //   // eslint-disable-next-line no-param-reassign
  //   elem.typeName = smsTypes.filter((r) => r.type === elem.type)[0].name;
  // });
  return items;
};

/**
 * Create a item sms
 * @param {Object} itemBody
 * @param user
 * @returns {Promise<Sms>}
 */
const createSms = async (itemBody) => {
  const body = itemBody;
  const created = await Sms.create(body);
  return created;
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const querySmss = async (filter, options) => {
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
    sortBy.push(`executionDate:desc`);
  }

  curOptions.sortBy = sortBy;
  const smsFilter = {};
  if (filter.search && filter.search.length) {
    filter.search.replace('%20', ' ');
    // eslint-disable-next-line security/detect-non-literal-regexp
    const regex = new RegExp(filter.search, 'i');
    smsFilter.$and = [
      {
        $or: [
          { 'personalInfo.firstname': regex },
          { 'personalInfo.lastname': regex },
          { 'emails.email': regex },
          { 'addresses.address': regex },
          { 'info.locations.login': regex },
        ],
      },
    ];
  }
  if (filter.packageExpireDateFrom && filter.packageExpireDateTo) {
    if (!smsFilter.$and) {
      smsFilter.$and = [];
    }
    filter.packageExpireDateFrom.setHours(0, 0, 0);
    filter.packageExpireDateTo.setHours(23, 59, 59);
    smsFilter.$and.push({
      'info.locations': {
        $elemMatch: {
          subscriptionExpireDate: {
            $gte: filter.packageExpireDateFrom,
            $lte: filter.packageExpireDateTo,
          },
        },
      },
    });
  }

  if (filter.transactionType) {
    smsFilter.transaction_type = filter.transactionType;
  }

  if (filter.executionStartDate && filter.executionEndDate) {
    if (!smsFilter.$and) {
      smsFilter.$and = [];
    }
    filter.executionStartDate.setHours(0, 0, 0);
    filter.executionEndDate.setHours(23, 59, 59);
    smsFilter.$and.push({
      executionDate: {
        $gte: filter.executionStartDate,
        $lte: filter.executionEndDate,
      },
    });
  }

  smsFilter.provider = { $eq: filter.provider };

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
  // smsFilter.status = { $eq: 1 };
  // smsFilter.provider = { $in: filter.providers };
  return Sms.paginate(smsFilter, curOptions, {}, [
    {
      path: 'equipmentInstaller',
    },
    {
      path: 'client',
      populate: [{ path: 'provider' }],
    },
    {
      path: 'location',
    },
    {
      path: 'user',
    },
  ]);
};

/**
 * Update Option by id
 * @param {ObjectId} smsId
 * @param {Object} updateBody
 * @returns {Promise<Sms>}
 */
const updateSmsById = async (smsId, updateBody) => {
  const item = await getSmsById(smsId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sms not found');
  }
  Object.assign(item, updateBody);
  await item.save();
  return getSmsById(smsId);
};

/**
 * sms action by id
 * @returns {Promise<Sms>}
 * @param {Object} updateBody
 */
const smssActionById = async (updateBody) => {
  try {
    if (!updateBody) throw new ApiError(httpStatus.BAD_REQUEST, 'Sms not found');
    const { smsId } = updateBody;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < smsId.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const sms = await getSmsById(smsId[i]);
      // eslint-disable-next-line no-await-in-loop
      await Sms.updateMany(
        {
          _id: sms._id,
        },
        { $set: { enableForSale: updateBody.enableForSale } },
        { multi: true }
      );
    }
    return smsId;
  } catch (e) {
    throw new ApiError(httpStatus.BAD_REQUEST, e);
  }
};

/**
 * Get list
 * @returns {Promise<Chat>}
 */
// eslint-disable-next-line no-unused-vars
const getList = async (filter = {}, populate = [], projection = null) => {
  const query = await Sms.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

/**
 * Delete sms by id
 * @param {Object} smsId
 * @returns {Promise<Balance>}
 */
const deleteSmsById = async (smsId) => {
  return Sms.deleteOne({ _id: smsId });
};

module.exports = {
  createSms,
  getSmss,
  querySmss,
  getSmsById,
  updateSmsById,
  getList,
  smssActionById,
  deleteSmsById,
  findBySid,
};
