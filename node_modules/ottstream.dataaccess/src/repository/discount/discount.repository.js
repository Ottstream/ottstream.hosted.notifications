const httpStatus = require('http-status');
// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');
const { Discount } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

const discountProjection = [
  // {
  //   path: 'priceGroups',
  //   populate: [
  //     {
  //       path: 'item',
  //     },
  //   ],
  // },
  // {
  //   path: 'currency',
  // },
];

const determineStatusByDate = (startDate, endDate) => {
  if (startDate <= new Date() <= endDate) this.timelineStatus = 1;
  if (startDate >= new Date()) this.timelineStatus = 2;
  if (endDate < new Date()) this.timelineStatus = 0;
  return this.timelineStatus;
};
/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Discount>}
 */
// eslint-disable-next-line no-unused-vars
const getDiscountById = async (id, options = {}) => {
  return Discount.findById(id).populate(discountProjection);
};

/**
 * Get active discounts for provider
 * @param {ObjectId} parentProviderId
 * @returns {Promise<Discount>}
 */
const getActiveDiscountsForProvider = async (parentProviderId) => {
  const now = new Date();
  return Discount.find({
    provider: parentProviderId,
    created_on: {
      $gte: now,
      $lt: now,
    },
  });
};

/**
 * Get active discounts for provider
 * @param {ObjectId} parentProviderId
 * @returns {Promise<Discount>}
 */
const getActiveDiscountsForClient = async (packageId, priceGroup) => {
  const now = new Date();
  const clientFilter = {};
  clientFilter['generalInfo.startDate'] = {
    $lt: now,
  };
  clientFilter['generalInfo.endDate'] = {
    $gte: now,
  };
  clientFilter.packages = { $in: [packageId] };
  clientFilter.priceGroups = { $in: [priceGroup] };
  return Discount.find(clientFilter);
};

/**
 * Create a item package
 * @param {Object} itemBody
 * @param user
 * @returns {Promise<Discount>}
 */
const createDiscount = async (itemBody, user) => {
  const body = itemBody;
  body.user = user._id;
  if (user.provider) body.provider = user.provider.id;
  if (!body.generalInfo.sendNotifications && body.notifications) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SendNotifications must be valid to add notifications');
  }
  // if (!body.priceGroups || !body.priceGroups.length) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'PriceGroups must contain at least one data');
  // }
  if (!body.packages || !body.packages.length) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Packages must contain at least one data');
  }
  if (body.generalInfo.sendNotifications && body.generalInfo.startDate >= Date.now()) {
    body.notifications.notificationTextForCurrent = undefined;
  }
  body.timelineStatus = await determineStatusByDate(body.generalInfo.startDate, body.generalInfo.endDate);
  const created = await Discount.create(body);
  return getDiscountById(created.id);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryDiscounts = async (filter, options, user) => {
  const curOptions = {
    page: options.page ?? 1,
    all: options.all ?? false,
    limit: options.all ? 10000000 : options.limit ?? 20,
  };

  const sortObject = {
    // _id: -1,
  };

  if (options.sortBy) {
    if (typeof options.sortBy === 'object') {
      options.sortBy.forEach(function (sortOption) {
        const parts = sortOption.split(':');
        sortObject[parts[0]] = parts[1] === 'desc' ? -1 : 1;
      });
    } else if (typeof options.sortBy === 'string') {
      const parts = options.sortBy.split(':');
      sortObject[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }
  } else {
    sortObject._id = -1;
    // generalInfo.defaultSalePercent = -1
  }

  const match = {};
  const searchMatch = {};
  const filterMatch = {};
  const filterAndMatch = {};
  const dateMatch = {};
  match.$or = [];
  searchMatch.$or = [];
  filterMatch.$or = [];
  filterAndMatch.$and = [];
  dateMatch.$and = [];

  // status to 1
  match.status = { $eq: 1 };

  // resellers
  if (user.provider) {
    match.provider = { $eq: mongoose.Types.ObjectId(user.provider._id.toString()) };
  }

  // search filter
  if (filter.search) {
    searchMatch.$or.push({
      'generalInfo.name': { $regex: `.*${filter.search}.*`, $options: 'i' },
    });
  }
  if (filter.status === 2 || filter.status === 3) {
    filterMatch.$or.push({
      'generalInfo.status': { $eq: filter.status },
    });
  }
  if (filter.status === 1) {
    // All
    await Discount.find();
  }

  if (filter.type === 2 || filter.type === 3) {
    filterMatch.$or.push({
      'generalInfo.type': { $eq: filter.type },
    });
  }
  if (filter.type === 1) {
    // All
    await Discount.find();
  }

  if (typeof filter.timeLineStatus !== 'undefined') {
    match.timelineStatus = { $eq: filter.timeLineStatus };
  }

  if (filter.priceGroups) {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < filter.priceGroups.length; i++) {
      match['priceGroups._id'] = { $eq: mongoose.Types.ObjectId(filter.priceGroups[i]) };
    }
  }
  if (filter.packages) {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < filter.packages.length; i++) {
      match.packages = { $eq: mongoose.Types.ObjectId(filter.packages[i]) };
    }
  }

  if (typeof filter.startDate !== 'undefined' && typeof filter.endDate !== 'undefined') {
    dateMatch.$and.push({
      'generalInfo.startDate': { $gte: filter.startDate },
    });
    dateMatch.$and.push({
      'generalInfo.endDate': { $lte: filter.endDate },
    });
  } else if (typeof filter.startDate !== 'undefined') {
    match.$or.push({
      'generalInfo.startDate': { $gte: filter.startDate },
    });
  } else if (typeof filter.endDate !== 'undefined') {
    match.$or.push({
      'generalInfo.endDate': { $lte: filter.endDate },
    });
  }

  if (!match.$or.length) delete match.$or;
  if (!searchMatch.$or.length) delete searchMatch.$or;
  if (!filterMatch.$or.length) delete filterMatch.$or;
  if (!filterAndMatch.$and.length) delete filterAndMatch.$and;
  if (!dateMatch.$and.length) delete dateMatch.$and;
  const constFilter = [
    {
      $match: match,
    },
    {
      $match: searchMatch,
    },
    {
      $match: filterMatch,
    },
    {
      $match: filterAndMatch,
    },
    {
      $match: dateMatch,
    },
  ];
  const lookupFilter = [{ $sort: sortObject }];
  const finalAggregate = lookupFilter.concat(constFilter);
  const aggregate = Discount.aggregate(finalAggregate);
  const list = await Discount.aggregatePaginate(aggregate, curOptions);
  list.docs.forEach((elem, i) => {
    list.docs[i].id = elem._id;
    // let timeLineStatus = 0;
    // if (elem.generalInfo?.startDate <= new Date() <= elem.generalInfo?.endDate) timeLineStatus = 1;
    // if (elem.generalInfo?.startDate >= new Date()) timeLineStatus = 2;
    // if (elem.generalInfo?.endDate < new Date()) timeLineStatus = 0;
    delete list.docs[i]._id;
  });
  return {
    results: list.docs,
    page: list.page,
    limit: list.limit,
    totalPages: list.totalPages,
    totalResults: list.totalDocs,
  };
};

/**
 * @returns {Promise<QueryResult>}
 * @param body
 * @param data
 */
// eslint-disable-next-line no-unused-vars
const getDiscountsByFilter = async (body, data) => {
  return Discount.find({
    packages: body.packages,
    priceGroups: body.priceGroups,
  }).populate([
    {
      path: 'packages',
    },
    {
      path: 'priceGroups',
    },
  ]);
};

/**
 * Update item by id
 * @param {ObjectId} discountId
 * @param {Object} updateBody
 * @returns {Promise<Discount>}
 */
const updateDiscountById = async (discountId, updateBody) => {
  const item = await getDiscountById(discountId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Discount not found');
  }
  if (!updateBody?.generalInfo?.sendNotifications && updateBody.notifications) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SendNotifications must be valid to add notifications');
  }
  if (!updateBody?.generalInfo?.sendNotifications && !updateBody.notifications) {
    item.notifications = undefined;
  }
  item.timelineStatus = await determineStatusByDate(updateBody.generalInfo.startDate, updateBody.generalInfo.endDate);
  Object.assign(item, updateBody);
  await item.save();
  return item;
};

/**
 * Delete item by id
 * @param {Object} updateBody
 * @returns {Promise<Discount>}
 */
const deleteDiscountById = async (updateBody) => {
  const item = updateBody.discountId;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < item.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    const discount = await getDiscountById(item[i]);
    // eslint-disable-next-line no-await-in-loop
    await Discount.updateOne({ _id: discount._id }, { $set: { status: 0 } }, { multi: true });
  }
  return item;
  // await item.remove();
  // return item;
};

/**
 * Action item choose by ids
 * @param {ObjectId} updateBody
 * @returns {Promise<Discount>}
 */
const discountSendNotificationAction = async (updateBody) => {
  if (!updateBody) throw new ApiError(httpStatus.BAD_REQUEST, 'Discount send notification action not found');
  const { discountId } = updateBody;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < discountId.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    const discount = await getDiscountById(discountId[i]);
    if (discount.priceGroups) {
      if (discount.generalInfo.sendNotifications) {
        return discountId;
      }
    } else throw new ApiError(httpStatus.BAD_REQUEST, 'Notification not sent');
  }
};

/**
 * Action item choose by ids
 * @param {ObjectId} updateBody
 * @returns {Promise<Discount>}
 */
const discountActions = async (updateBody) => {
  if (!updateBody) throw new ApiError(httpStatus.BAD_REQUEST, 'Discount action not found');

  const { discountId } = updateBody;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < discountId.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    const discount = await getDiscountById(discountId[i]);
    // eslint-disable-next-line no-await-in-loop
    await Discount.updateMany(
      {
        _id: discount._id,
      },
      { $set: { 'generalInfo.status': updateBody.status } },
      { multi: true }
    );
  }
  return discountId;
};

/**
 * update item by startDate & endDate
 * @returns {Promise<Discount>}
 * @param startDate
 * @param endDate
 */
const getDiscountPriceGroupList = async (startDate, endDate) => {
  const discount = await Discount.find();
  if (startDate && endDate) {
    // eslint-disable-next-line no-restricted-syntax
    for (const item of discount) {
      const sDate = item.generalInfo.startDate;
      const eDate = item.generalInfo.endDate;
      if (
        startDate.getUTCMonth() === sDate.getUTCMonth() &&
        endDate.getUTCMonth() === eDate.getUTCMonth() &&
        startDate.getUTCDate() === sDate.getUTCDate() &&
        endDate.getUTCDate() === eDate.getUTCDate()
      )
        return item.priceGroups;
    }
  }
  return null;
};

module.exports = {
  getActiveDiscountsForProvider,
  createDiscount,
  queryDiscounts,
  getDiscountById,
  getDiscountsByFilter,
  updateDiscountById,
  deleteDiscountById,
  getActiveDiscountsForClient,
  discountSendNotificationAction,
  discountActions,
  getDiscountPriceGroupList,
};
