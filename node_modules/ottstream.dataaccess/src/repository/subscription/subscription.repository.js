const httpStatus = require('http-status');
const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const { Subscription, Package, Server } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');
const priceUtils = require('../../utils/price/price_utils');
const logger = require('../../utils/logger/logger');
const { addToLocation, removeFromLocation } = require('../client/client.shared.repository');

/**
 * Get channel by location id
 * @param {ObjectId} id
 * @param _package
 * @returns {Promise<Subscription>}
 */
// eslint-disable-next-line no-unused-vars

const getSubscriptionByLocationId = async (id, _package) => {
  const exist = await Subscription.find({ location: id, package: _package });
  return exist && exist.length ? exist[0] : null;
};

/**
 * Create a channel package
 * @param {Object} channelBody
 * @param user
 * @returns {Promise<Subscription>}
 */
const createSubscription = async (channelBody) => {
  const body = channelBody;
  const created = await Subscription.create(body);
  if (created && body.client) {
    await addToLocation(body.location, 'subscriptions', created._id);
  }
  return created;
};

/**
 * Subscribe location to package
 * @param location
 * @param _package
 * @param data
 * @returns {Promise<Subscription>}
 */
const subscribeLocationToPackage = async (location, _package, data) => {
  try {
    // check if no active subscription
    const existing = await getSubscriptionByLocationId(location._id, _package._id);
    if (existing) {
      logger.error(`Subscription already exists`);
    }

    if (!location) {
      logger.error(`location not found`);
    }

    // TODO check if package exists

    const startDate = new Date();
    let endDate = new Date();
    const isDaySubscription = typeof data.day !== 'undefined' && typeof data.month !== 'undefined';
    if (isDaySubscription) {
      endDate = priceUtils.addUTCDays(endDate, data.day);
      endDate = priceUtils.addUTCDays(endDate, data.month);
    } else {
      endDate = data.subscribeToDate;
    }
    const newLocation = {
      state: 1,
      selectedMonth: data.month,
      selectedDay: data.day,
      selectedDate: isDaySubscription ? endDate : data.subscribeToDate,
      // currentPriceGroup: client.priceGroup,
      // currentDiscounts:  // TODO discount
      currentPrices: _package.prices, // TODO price calculation from price helper utils
      startDate,
      endDate,
      provider: location.clientId.provider,
      client: location.clientId._id,
      package: _package._id,
      location: location._id,
    };

    // create subscription
    const _created = await Subscription.create(newLocation);
    return getSubscriptionByLocationId(_created._id);
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, err);
  }
};

/**
 * Unsubscribe location to package
 * @returns {Promise<Subscription>}
 */
const unsubscribeLocationToPackage = async () => {
  const body = {}; // TODO check invoice generation then do
  return Subscription.create(body);
};

/**
 * @param locationId
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryClientSubscriptions = async (locationId, filter, options, user) => {
  // will be method for getting and calculating client package info tab // TODO calculate this info
  /*
  able Columns:
Check 		- отметить пакет для  Global Action
Package Name	- имя пакета
Package Type	- тип  пакета (Base/Additional)
Expire Date/Time    - Дата и время окончания пакеты (+( rooms N) показывает количество комнат на которое был подписан пакет - если  прежнее кол комнат совпадает с текущим то кол комнат не указывается)
Recurring Payment - статус для повторяющихся оплат (editable)
Current Price 	- цена пакета (месяц) на данный момент ( с учетом rooms)
Expire New		- После выбора Global Action и выбора пакетов указывается окончательная дата которая будет после прохождения  checkout (+( rooms N) показывает количество комнат на которое будет подписан пакет - если  прежнее кол комнат совпадает с текущим то кол комнат не указывается)
Total Price            -  После выбора Global Action и выбора пакетов указывается окончательная сумма с учётом комнат, даты, и прайс группы
   */
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
  }

  const match = {};
  match.$or = [];

  // providerId
  match.location = { $eq: mongoose.Types.ObjectId(locationId) };

  if (!match.$or.length) delete match.$or;

  const constFilter = [
    {
      $match: match,
    },
  ];

  const lookupFilter = [
    // {
    //   $lookup: {
    //     from: 'ottproviders',
    //     localField: 'provider',
    //     foreignField: '_id',
    //     as: 'provider',
    //   },
    // },

    // {
    //   $lookup: {
    //     from: 'subscriptions',
    //     // localField: '_id',
    //     // foreignField: 'providerId',
    //     let: { id: '$_id' },
    //     as: 'credits',
    //     pipeline: [
    //       {
    //         $match: {
    //           $expr: { $eq: ['packageId', '$$id'] },
    //         },
    //       },
    //       {
    //         $match: {
    //           $expr: { $eq: ['providerId', '$$id'] },
    //         },
    //       },
    //     ],
    //   },
    // },
    { $sort: sortObject },
  ];

  const finalAggregate = lookupFilter.concat(constFilter);
  const aggregate = Package.aggregate(finalAggregate);
  const list = await Package.aggregatePaginate(aggregate, curOptions);
  list.docs.forEach(function (it, i) {
    const item = list.docs[i];
    item.id = item._id;
    item.services = { vEnable: item.vEnable, tEnable: item.tEnable, aEnable: item.aEnable };
    delete item.middlewareName;
    // delete item.middlewareId;
    delete item.__v;
    item.clientsDirect = 0; // TODO join with subscriptions
    item.clientsTotal = 0; // TODO join with subscriptions
    item.buyPrice = 0; // TODO get from prices array
    item.clientPrice = 0; // TODO get from prices array
    item.resalePrice = 0; // TODO get from prices array
  });
  return {
    results: list.docs,
    page: list.page,
    limit: list.limit,
    totalPages: list.totalPages,
    totalResults: list.totalDocs,
    balanceMin: 0,
    balanceMax: 0,
    debtMin: 0,
    debtMax: 0,
  };
};

/**
 * @returns {Promise<QueryResult>}
 * @param locationId
 */
// eslint-disable-next-line no-unused-vars
const getLocationSubscriptions = async (locationId) => {
  return Subscription.find({
    location: locationId,
    state: 1,
  }).populate([
    {
      path: 'package',
    },
    {
      path: 'client',
    },
    {
      path: 'location',
    },
  ]);
};

/**
 * @returns {Promise<QueryResult>}
 * @param locationId
 */
// eslint-disable-next-line no-unused-vars
const removeLocationSubscriptions = async (locationId) => {
  await Subscription.remove({
    locationId,
  });
};

/**
 * @returns {Promise<QueryResult>}
 * @param locationId
 */
// eslint-disable-next-line no-unused-vars
const queryLocationSubscriptions = async (locationId) => {
  return Subscription.find({ location: locationId, state: 1 }).populate([
    {
      path: 'invoice',
      select: 'id name createAt payloadCalculated totalAmount amount',
    },
    {
      path: 'client',
      select: 'id personalInfo',
      populate: [
        {
          path: 'finance.priceGroup',
          select: 'id name',
        },
      ],
    },
  ]);
};

/**
 * Get Client Locations
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getSubscriptions = async (filter = {}, populate = [], projection = null) => {
  const query = Subscription.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

/**
 * Get channel by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Subscription>}
 */
// eslint-disable-next-line no-unused-vars
const getSubscriptionById = async (id, options = {}) => {
  return Subscription.findById(id);
};

/**
 * Update channel by id
 * @param {String} subscriptionId
 * @param {Object} updateBody
 * @returns {Promise<Subscription>}
 */
const updateSubscriptionById = async (subscriptionId, updateBody) => {
  const channel = await getSubscriptionById(subscriptionId);
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subscription not found');
  }
  Object.assign(channel, updateBody);
  await channel.save();
  return channel;
};

/**
 * Delete channel by id
 * @param {ObjectId} subscriptionId
 * @returns {Promise<Subscription>}
 */
const deleteSubscriptionById = async (subscriptionId) => {
  const subscription = await getSubscriptionById(subscriptionId);
  if (!subscription) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subscription not found');
  }
  await subscription.remove();
  if (subscription) {
    await removeFromLocation(subscription.location, 'subscriptions', subscriptionId);
  }
  return subscription;
};

/**
 * delete many
 */
// eslint-disable-next-line no-unused-vars
const deleteMany = async (filter = {}) => {
  await Subscription.deleteMany(filter);
};

/**
 * Get list
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getList = async (filter = {}, populate = [], projection = null) => {
  const query = Subscription.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

const updateInvoiceSubscriptoins = async (invoice) => {
  await Subscription.updateMany({ invoice }, { state: 0 });
};

module.exports = {
  createSubscription,
  queryLocationSubscriptions,
  queryClientSubscriptions,
  getLocationSubscriptions,
  removeLocationSubscriptions,
  subscribeLocationToPackage,
  unsubscribeLocationToPackage,
  updateInvoiceSubscriptoins,
  getSubscriptionByLocationId,
  getSubscriptionById,
  updateSubscriptionById,
  deleteSubscriptionById,
  getSubscriptions,
  deleteMany,
  getList,
};
