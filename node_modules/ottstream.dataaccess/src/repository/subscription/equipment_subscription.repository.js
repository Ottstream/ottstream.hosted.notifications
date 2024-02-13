const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { EquipmentSubscription, Package } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Get channel by location id
 * @param {ObjectId} id
 * @param _package
 * @returns {Promise<EquipmentSubscription>}
 */
// eslint-disable-next-line no-unused-vars
const getEquipmentSubscriptionsByClientId = async (id, _package) => {
  return EquipmentSubscription.find({ client: id })
    .populate([
      {
        path: 'equipment',
        populate: [
          {
            path: 'type',
          },
        ],
      },
    ])
    .sort({
      _id: 'desc',
    });
};

/**
 * Get channel by location id
 * @returns {Promise<EquipmentSubscription>}
 * @param filter
 * @param populate
 * @param projection
 */
// eslint-disable-next-line no-unused-vars
const getEquipmentSubscriptions = async (filter = {}, populate = [], projection = null) => {
  const query = EquipmentSubscription.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

/**
 * Create a channel package
 * @param {Object} channelBody
 * @param user
 * @returns {Promise<EquipmentSubscription>}
 */
const createEquipmentSubscription = async (channelBody) => {
  const body = channelBody;
  return EquipmentSubscription.create(body);
};

/**
 * Unsubscribe location to package
 * @returns {Promise<EquipmentSubscription>}
 */
const unsubscribeLocationToPackage = async () => {
  const body = {}; // TODO check invoice generation then do
  return EquipmentSubscription.create(body);
};

/**
 * @param locationId
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryClientEquipmentSubscriptions = async (locationId, filter, options, user) => {
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
    //     from: 'equipmentSubscriptions',
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
    item.clientsDirect = 0; // TODO join with equipmentSubscriptions
    item.clientsTotal = 0; // TODO join with equipmentSubscriptions
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
const getLocationEquipmentSubscriptions = async (locationId) => {
  return EquipmentSubscription.find({
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
const removeLocationEquipmentSubscriptions = async (locationId) => {
  await EquipmentSubscription.remove({
    locationId,
  });
};

/**
 * @returns {Promise<QueryResult>}
 * @param locationId
 */
// eslint-disable-next-line no-unused-vars
const queryLocationEquipmentSubscriptions = async (locationId) => {
  return EquipmentSubscription.find({ location: locationId }).populate([
    {
      path: 'client',
      populate: [
        {
          path: 'finance.priceGroup',
        },
      ],
    },
  ]);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const getActiveEquipmentSubscriptions = async () => {
  return EquipmentSubscription.paginate(
    {
      state: 1,
    },
    {}
  );
};

/**
 * Get channel by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<EquipmentSubscription>}
 */
// eslint-disable-next-line no-unused-vars
const getEquipmentSubscriptionById = async (id, options = {}) => {
  return EquipmentSubscription.findById(id);
};

/**
 * Update channel by id
 * @param {String} equipmentSubscriptionId
 * @param {Object} updateBody
 * @returns {Promise<EquipmentSubscription>}
 */
const updateEquipmentSubscriptionById = async (equipmentSubscriptionId, updateBody) => {
  const channel = await getEquipmentSubscriptionById(equipmentSubscriptionId);
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'EquipmentSubscription not found');
  }
  Object.assign(channel, updateBody);
  await channel.save();
  return channel;
};

/**
 * Update channel by id
 * @param filter
 * @param {Object} updateBody
 * @returns {Promise<EquipmentSubscription>}
 */
const updateEquipmentSubscription = async (filter, updateBody) => {
  const channel = EquipmentSubscription.findOne(filter);
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'EquipmentSubscription not found');
  }
  Object.assign(channel, updateBody);
  await channel.save();
  return channel;
};

/**
 * Delete channel by id
 * @param {ObjectId} equipmentSubscriptionId
 * @returns {Promise<EquipmentSubscription>}
 */
const deleteEquipmentSubscriptionById = async (equipmentSubscriptionId) => {
  const channel = await getEquipmentSubscriptionById(equipmentSubscriptionId);
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'EquipmentSubscription not found');
  }
  await channel.remove();
  return channel;
};

/**
 * Delete channel by id
 * @returns {Promise<EquipmentSubscription>}
 * @param filter
 */
const deleteEquipmentSubscription = async (filter) => {
  const channel = await EquipmentSubscription.findOne(filter);
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'EquipmentSubscription not found');
  }
  await channel.remove();
  return channel;
};

module.exports = {
  createEquipmentSubscription,
  updateEquipmentSubscription,
  getActiveEquipmentSubscriptions,
  getEquipmentSubscriptions,
  queryLocationEquipmentSubscriptions,
  queryClientEquipmentSubscriptions,
  getLocationEquipmentSubscriptions,
  removeLocationEquipmentSubscriptions,
  unsubscribeLocationToPackage,
  getEquipmentSubscriptionsByClientId,
  getEquipmentSubscriptionById,
  updateEquipmentSubscriptionById,
  deleteEquipmentSubscription,
  deleteEquipmentSubscriptionById,
};
