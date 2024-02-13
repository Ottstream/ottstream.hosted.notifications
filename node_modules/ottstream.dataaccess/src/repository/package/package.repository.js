const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { Package, PackageOption } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');
const { updateSubDocument } = require('../../utils/repository/subdocument_update');
const priceUtils = require('../../utils/price/price_utils');
const  ottProviderRepository  = require('../ottprovider/ottprovider.repository');

const packagePopulateObject = [
  // {
  //   path: 'payment.balance.currency',
  //   model: 'Currency',
  // },
  // {
  //   path: 'payment.balance.priceGroup',
  //   model: 'PriceGroup',
  // },
  // {
  //   path: 'locations',
  //   populate: [
  //     {
  //       path: 'room',
  //     },
  //   ],
  // },
  {
    path: 'provider',
  },
];

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Package>}
 */
// eslint-disable-next-line no-unused-vars
const getPackageById = async (id, options = {}) => {
  return Package.findById(id).populate(packagePopulateObject);
};

/**
 * get middleware packages
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Package>}
 */
// eslint-disable-next-line no-unused-vars
const getMiddlewarePackages = async (id, options = {}) => {
  return Package.find({ middlewareId: { $ne: null } });
};

/**
 * Get item by id
 * @param packageId
 * @param user
 * @returns {Promise<Package>}
 */
// eslint-disable-next-line no-unused-vars
const getOrCreatePackageOption = async (packageId, user) => {
  const providerId = user.provider._id;
  const items = await PackageOption.find({
    provider: providerId,
    package: packageId,
  }).populate(packagePopulateObject);
  if (items && items.length) return items[0];
  const body = {};
  body.provider = providerId;
  body.package = packageId;
  body.user = user._id;
  return PackageOption.create(body);
};

/**
 * Get item by id
 * @param packageId
 * @param providerId
 * @param options
 * @returns {Promise<Package>}
 */
// eslint-disable-next-line no-unused-vars
const getPackageOption = async (packageId, providerId, options = {}) => {
  const items = await PackageOption.find({
    provider: providerId,
    package: packageId,
  }).populate(packagePopulateObject);
  if (items && items.length) return items[0];
  return null;
};

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Package>}
 */
// eslint-disable-next-line no-unused-vars
const getPackageByMiddlewareId = async (id, options = {}) => {
  const packages = await Package.find({
    middlewareId: id,
  }).populate(packagePopulateObject);
  if (packages.length) return packages[0];
  return null;
};

/**
 * Create a item package
 * @param {Object} itemBody
 * @param user
 * @returns {Promise<Package>}
 */
const createPackage = async (itemBody, user) => {
  const body = itemBody;
  // eslint-disable-next-line no-console
  if (!user.provider) throw new ApiError('no provider for user');
  body.user = user._id;
  body.provider = user.provider.id;
  const created = await Package.create(body);
  return getPackageById(created.id);
};

/**
 * Create a item package options
 * @param {Object} itemBody
 * @param packageId
 * @param providerId
 * @param user
 * @returns {Promise<Package>}
 */
const createPackageOption = async (itemBody, packageId, providerId, user) => {
  const old = await getPackageOption(packageId, providerId);
  if (old) throw new ApiError('provider already has package option');
  const body = itemBody;
  if (!user.provider) throw new ApiError('no provider for user');
  if (user.provider.id !== providerId) throw new ApiError('can create package options only for yourself');
  body.provider = providerId;
  body.package = packageId;
  body.user = user._id;
  const created = await PackageOption.create(body);
  return getPackageById(created.id);
};

/**
 * @param providerId
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const getPackageOptions = async (providerId) => {
  return PackageOption.find({ provider: providerId });
};

/**
 * @param providerId
 * @param locationId
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const getPackagesForClient = async (providerId, locationId, options, user) => {
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
  match.provider = { $eq: mongoose.Types.ObjectId(providerId) };

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
    //     from: 'subscriptions',string
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
 * Get package by id
 * @param {ObjectId} filter
 * @returns {Promise<User>}
 */
const getAll = async (filter) => {
  return Package.find(filter);
};

/**
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const getPackages = async (provider) => {
  const curOptions = {
    page: 1,
    limit: 1000,
  };
  const sortObject = {
    _id: -1,
  };

  const constFilter = [
    {
      $lookup: {
        from: 'package_options',
        // localField: '_id',
        // foreignField: 'providerId',
        let: { id: '$_id' },
        as: 'option',
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$package', '$$id'] },
                  { $eq: ['$provider', mongoose.Types.ObjectId(provider.id.toString())] },
                ],
              },
            },
          },
        ],
      },
    },
    { $sort: sortObject },
  ];
  const hasParent = !!provider.parent; // provider
  if (hasParent) {
    constFilter.push({
      $lookup: {
        from: 'package_options',
        // localField: '_id',
        // foreignField: 'providerId',
        let: { id: '$_id' },
        as: 'parent_option',
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$package', '$$id'] }, { $eq: ['$provider', mongoose.Types.ObjectId(provider.parent)] }],
              },
            },
          },
        ],
      },
    });
    // lookupFilter.push({ $unwind: '$option' });
  }

  const aggregate = Package.aggregate(constFilter);
  const list = await Package.aggregatePaginate(aggregate, curOptions);
  const items = [];
  list.docs.forEach(function (item) {
    // eslint-disable-next-line no-param-reassign,prefer-destructuring
    if (item.option && item.option.length) {
      // eslint-disable-next-line no-param-reassign,prefer-destructuring
      item.option = item.option[0];
    } else {
      // eslint-disable-next-line no-param-reassign
      delete item.options;
    }

    // eslint-disable-next-line no-param-reassign
    item.id = item._id;
    items.push(item);
  });
  return items;
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryPackages = async (filter, options, user) => {
  const curOptions = {
    page: options.page ?? 1,
    all: options.all ?? false,
    limit: options.all ? 10000000 : options.limit ?? 20,
  };
  const ottProvider = await ottProviderRepository.getOttProviderById(user.provider.id);
  const hasParent = !!user.provider.parent; // provider

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
  const searchMatch = {};
  const clientMatch = {};
  searchMatch.$or = [];
  match.$or = [];
  clientMatch.$and = [];

  // search filter
  if (filter.search) {
    searchMatch.$or.push({
      'name.name': { $regex: `.*${filter.search}.*`, $options: 'i' },
    });
  }

  // room
  if (typeof filter.room !== 'undefined') {
    match.$or.push({
      'prices.priceItems.room': { $eq: filter.room },
    });
  }

  // client priceGroup
  if (typeof filter.clientPriceGroup !== 'undefined') {
    match['discounts.generalInfo.type'] = { $eq: 2 };
    match['discounts.priceGroups._id'] = { $eq: mongoose.Types.ObjectId(filter.clientPriceGroup) };
  }

  // provider priceGroup
  if (typeof filter.providerPriceGroup !== 'undefined') {
    match['discounts.generalInfo.type'] = { $eq: 3 };
    match['discounts.priceGroups._id'] = { $eq: mongoose.Types.ObjectId(filter.providerPriceGroup) };
  }

  if (typeof filter.parentDiscounts !== 'undefined') {
    match['discounts.generalInfo.type'] = { $eq: 1 };
    // match['discounts.timelineStatus'] = { $ne: 0 };
    match['discounts._id'] = { $eq: mongoose.Types.ObjectId(filter.parentDiscounts) };
  }

  if (typeof filter.clientDiscounts !== 'undefined') {
    match['discounts.generalInfo.type'] = { $eq: 2 };
    // match['discounts.timelineStatus'] = { $ne: 0 };
    match['discounts._id'] = { $eq: mongoose.Types.ObjectId(filter.clientDiscounts) };
  }

  if (typeof filter.providerDiscounts !== 'undefined') {
    match['discounts.generalInfo.type'] = { $eq: 3 };
    // match['discounts.timelineStatus'] = { $ne: 0 };
    match['discounts._id'] = { $eq: mongoose.Types.ObjectId(filter.providerDiscounts) };
  }

  // clientsFrom clientsTo
  if (typeof filter.clientsFrom !== 'undefined' && typeof filter.clientsTo !== 'undefined') {
    clientMatch.$and.push({
      clients: { $gte: filter.clientsFrom },
    });
    clientMatch.$and.push({
      clients: { $lte: filter.clientsTo },
    });
  } else if (typeof filter.clientsFrom !== 'undefined' || typeof filter.clientsTo !== 'undefined') {
    match.$or.clients = { $gte: filter.clientsFrom };
    match.$or.clients = { $lte: filter.clientsTo };
  }

  // clientsTotalFrom clientsTotalTo
  if (typeof filter.clientsTotalFrom !== 'undefined' && typeof filter.clientsTotalTo !== 'undefined') {
    clientMatch.$and.push({
      clientsTotal: { $gte: filter.clientsTotalFrom },
    });
    clientMatch.$and.push({
      clientsTotal: { $lte: filter.clientsTotalTo },
    });
  } else if (typeof filter.clientsTotalFrom !== 'undefined' || typeof filter.clientsTotalTo !== 'undefined') {
    match.$or.clientsTotal = { $gte: filter.clientsTotalFrom };
    match.$or.clientsTotal = { $lte: filter.clientsTotalTo };
  }

  // services
  if (typeof filter.vEnable !== 'undefined') {
    match.vEnable = { $eq: filter.vEnable };
  }
  if (typeof filter.tEnable !== 'undefined') {
    match.tEnable = { $eq: filter.tEnable };
  }
  if (typeof filter.aEnable !== 'undefined') {
    match.aEnable = { $eq: filter.aEnable };
  }

  if (!match.$or.length) delete match.$or;
  if (!searchMatch.$or.length) delete searchMatch.$or;
  if (!clientMatch.$and.length) delete clientMatch.$and;

  const constFilter = [
    {
      $match: match,
    },
    {
      $match: searchMatch,
    },
    // {
    //   $lookup: {
    //     from: 'channels',
    //     // localField: '_id',
    //     // foreignField: 'providerId',
    //     let: { id: '$middlewareId' },
    //     as: 'credits',
    //     pipeline: [
    //       { $unwind: '$packets' },
    //       {
    //         $match: {
    //           $expr: { $eq: ['$packets', '$$id'] },
    //         },
    //       },
    //     ],
    //   },
    // },
  ];

  const lookupFilter = [
    {
      $lookup: {
        from: 'ottproviders',
        localField: 'provider',
        foreignField: '_id',
        as: 'provider',
      },
    },
    {
      $lookup: {
        from: 'clients',
        localField: '_id',
        foreignField: 'provider',
        as: 'clients',
      },
    },
    {
      $lookup: {
        from: 'package_channels',
        // localField: '_id',
        // foreignField: 'providerId',
        let: { id: '$middlewareId' },
        as: 'channels',
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$packageMiddlewareId', '$$id'] },
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'discounts',
        // localField: '_id',
        // foreignField: 'providerId',
        let: { id: '$_id' },
        as: 'discounts',
        pipeline: [
          {
            $match: {
              $expr: { $in: ['$$id', '$packages'] },
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'package_options',
        // localField: '_id',
        // foreignField: 'providerId',
        let: { id: '$_id' },
        as: 'option',
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$package', '$$id'] },
                  { $eq: ['$provider', mongoose.Types.ObjectId(user.provider.id.toString())] },
                ],
              },
            },
          },
        ],
      },
    },
    { $sort: sortObject },
  ];

  if (hasParent) {
    lookupFilter.push({
      $lookup: {
        from: 'package_options',
        // localField: '_id',
        // foreignField: 'providerId',
        let: { id: '$_id' },
        as: 'parent_option',
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$package', '$$id'] }, { $eq: ['$provider', mongoose.Types.ObjectId(user.provider.parent)] }],
              },
            },
          },
        ],
      },
    });
    // lookupFilter.push({ $unwind: '$option' });
  }

  const finalAggregate = lookupFilter.concat(constFilter);
  const aggregate = Package.aggregate(finalAggregate);
  const list = await Package.aggregatePaginate(aggregate, curOptions);
  list.docs.forEach(function (it, i) {
    const item = list.docs[i];
    item.id = item._id;
    item.services = { vEnable: item.vEnable, tEnable: item.tEnable, aEnable: item.aEnable };
    delete item.middlewareName;
    item.channelCount = item.channels.length;
    // delete item.middlewareId;
    delete item.channels;
    delete item.__v;
    item.clientsTotal = 0;
    item.clientsDirect = 0;
    item.id = item._id;
    // if (item.subscriptions && item.subscriptions.length) {
    //   // eslint-disable-next-line no-param-reassign
    //   item.clientsDirect =
    //     user && user.provider
    //       ? item.subscriptions.filter((r) => r.provider && r.provider.toString() === user.provider._id.toString()).length
    //       : -1;
    //   item.clientsTotal = item.subscriptions.length; // TODO remove parent totals from here.
    // }
    item.buyPrice = priceUtils.getMonthPrice(
      item.parent_option && item.parent_option.length ? item.parent_option[0] : null,
      1,
      false,
      ottProvider.priceGroup,
      null
    );
    item.clientPrice = priceUtils.getMonthPrice(item.option.length ? item.option[0] : null, 1, true, null, null);
    item.resalePrice = priceUtils.getMonthPrice(item.option.length ? item.option[0] : null, 1, false, null, null);
    delete item.option;
    delete item.parent_option;
  });
  // const sorted = list.docs.filter((item) => item);
  // const l1 = sorted[0];
  // if (options.sortBy) {
  //   if (typeof options.sortBy === 'string') {
  //     const parts = options.sortBy.split(':');
  //     l1[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  //   }
  // } else {
  //   l1.clientsTotal = -1;
  // } // TODO check virtual properties sorted
  return {
    results: hasParent ? list.docs.filter((r) => r.buyPrice >= 0) : list.docs,
    page: list.page,
    limit: list.limit,
    totalPages: list.totalPages,
    totalResults: !hasParent ? list.docs.length : list.docs.filter((r) => r.buyPrice >= 0).length,
    balanceMin: 0,
    balanceMax: 0,
    debtMin: 0,
    debtMax: 0,
    clientsMin: 0,
    clientsMax: 0,
  };
};

/**
 * Update Option by id
 * @param {ObjectId} packageId
 * @param {Object} updateBody
 * @returns {Promise<Package>}
 */
const updatePackageById = async (packageId, updateBody) => {
  const item = await getPackageById(packageId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Package not found');
  }
  if (updateBody.prices) {
    item.prices = updateSubDocument(item, 'prices', updateBody, 'prices');
    // eslint-disable-next-line no-param-reassign
    delete updateBody.prices;
  }
  Object.assign(item, updateBody);
  await item.save();
  return getPackageById(packageId);
};

/**
 * Update item by id
 * @param {ObjectId} packageId
 * @param {Object} updateBody
 * @param providerId
 * @returns {Promise<Package>}
 */
const updatePackageOption = async (updateBody, packageId, providerId) => {
  const item = await getPackageOption(packageId, providerId);
  if (!item) throw new ApiError(httpStatus.NOT_FOUND, 'Package Option not found');
  Object.assign(item, updateBody);
  await item.save();
  return getPackageOption(packageId, providerId);
};

/**
 * Delete item by id
 * @param {ObjectId} packageId
 * @param action
 * @returns {Promise<Package>}
 */
const disableEnablePackageById = async (packageId, providerId, action) => {
  const _package = await PackageOption.findOne({ package: packageId, provider: providerId });
  return PackageOption.updateOne({ _id: _package.id }, { $set: { state: action ? 1 : 0 } }, { multi: false });
};

/**
 * Delete package by id
 * @param {ObjectId} packageId
 * @returns {Promise<Balance>}
 */
const deletePackageById = async (packageId) => {
  const _package = await getPackageById(packageId);
  if (!_package) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Balance not found');
  }
  await _package.remove();
  return _package;
};

/**
 * delete many
 */
// eslint-disable-next-line no-unused-vars
const deleteMany = async (filter = {}) => {
  await Package.deleteMany(filter);
};

/**
 * Get list
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getList = async (filter = {}, populate = [], projection = null) => {
  const query = Package.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

/**
 * Get list
 * @returns {Promise<PackageOption>}
 */
// eslint-disable-next-line no-unused-vars
const getOptionsList = async (filter = {}, populate = [], projection = null) => {
  const query = PackageOption.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

module.exports = {
  getPackages,
  getMiddlewarePackages,
  getAll,
  createPackage,
  getPackageOptions,
  queryPackages,
  createPackageOption,
  getPackageById,
  getPackageOption,
  getOrCreatePackageOption,
  getPackageByMiddlewareId,
  updatePackageById,
  updatePackageOption,
  disableEnablePackageById,
  deletePackageById,
  deleteMany,
  getList,
  getOptionsList,
};
