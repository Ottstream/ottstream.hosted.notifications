const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { EquipmentInstaller } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

// eslint-disable-next-line no-unused-vars
const equipmentInstallerPopulateObject = [
  {
    path: 'provider',
  },
];

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<EquipmentInstaller>}
 */
// eslint-disable-next-line no-unused-vars
const getEquipmentInstallerById = async (id, options = {}) => {
  const item = await EquipmentInstaller.findById(id);
  // if (item) {
  //   item.typeName = equipmentInstallerTypes.filter((r) => r.type === item.type)[0].name;
  // }
  return item;
};

/**
 * Get item by id
 * @returns {Promise<EquipmentInstaller>}
 * @param filter
 */
// eslint-disable-next-line no-unused-vars
const getEquipmentInstallers = async (filter) => {
  const items = await EquipmentInstaller.find(filter);
  // items.forEach((elem) => {
  //   // eslint-disable-next-line no-param-reassign
  //   elem.typeName = equipmentInstallerTypes.filter((r) => r.type === elem.type)[0].name;
  // });
  return items;
};

/**
 * Create a item equipmentInstaller
 * @param {Object} itemBody
 * @param user
 * @returns {Promise<EquipmentInstaller>}
 */
const createEquipmentInstaller = async (itemBody, user) => {
  const body = itemBody;
  // eslint-disable-next-line no-console
  if (!user.provider) throw new ApiError('no provider for user');
  body.user = user._id;
  body.provider = user.provider.id;
  const created = await EquipmentInstaller.create(body);
  return getEquipmentInstallerById(created.id);
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryEquipmentInstallers = async (filter, options) => {
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
  const searchMatch = {};
  const priceMatch = {};
  searchMatch.$or = [];
  priceMatch.$and = [];
  match.$or = [];

  // resellers
  if (filter.provider) {
    match.provider = { $eq: mongoose.Types.ObjectId(filter.provider) };
  }

  // search filter
  if (filter.search) {
    searchMatch.$or.push({
      'name.name': { $regex: `.*${filter.search}.*`, $options: 'i' },
    });
    searchMatch.$or.push({
      'description.name': { $regex: `.*${filter.search}.*`, $options: 'i' },
    });
  }

  if (typeof filter.type !== 'undefined') {
    match.$or.push({
      type: { $eq: filter.type },
    });
  }

  if (!match.$or.length) delete match.$or;
  if (!searchMatch.$or.length) delete searchMatch.$or;
  if (!priceMatch.$and.length) delete priceMatch.$and;
  const constFilter = [
    {
      $match: match,
    },
    {
      $match: searchMatch,
    },
    {
      $match: priceMatch,
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
    //     from: 'equipmentInstaller_subscriptions',
    //     // localField: '_id',
    //     // foreignField: 'providerId',
    //     let: { id: '$_id' },
    //     as: 'equipmentInstallers_sold',
    //     pipeline: [
    //       {
    //         $match: {
    //           state: 1,
    //         },
    //       },
    //       {
    //         $match: {
    //           $expr: { $eq: ['$equipmentInstaller', '$$id'] },
    //         },
    //       },
    //     ],
    //   },
    // },
    { $sort: sortObject },
  ];

  const finalAggregate = lookupFilter.concat(constFilter);
  const aggregate = EquipmentInstaller.aggregate(finalAggregate);
  const list = await EquipmentInstaller.aggregatePaginate(aggregate, curOptions);
  list.docs.forEach(function (it, i) {
    const item = list.docs[i];
    item.id = item._id;
    // item.typeName = equipmentInstallerTypes.filter((r) => r.type === item.type)[0].name;
    // item.butTotal = item.equipmentInstallers_sold ? item.equipmentInstallers_sold.length : 0;
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
 * Update Option by id
 * @param {ObjectId} equipmentInstallerId
 * @param {Object} updateBody
 * @returns {Promise<EquipmentInstaller>}
 */
const updateEquipmentInstallerById = async (equipmentInstallerId, updateBody) => {
  const item = await getEquipmentInstallerById(equipmentInstallerId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'EquipmentInstaller not found');
  }
  Object.assign(item, updateBody);
  await item.save();
  return getEquipmentInstallerById(equipmentInstallerId);
};

/**
 * equipmentInstaller action by id
 * @returns {Promise<EquipmentInstaller>}
 * @param {Object} updateBody
 */
const equipmentInstallersActionById = async (updateBody) => {
  try {
    if (!updateBody) throw new ApiError(httpStatus.BAD_REQUEST, 'EquipmentInstaller not found');
    const { equipmentInstallerId } = updateBody;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < equipmentInstallerId.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const equipmentInstaller = await getEquipmentInstallerById(equipmentInstallerId[i]);
      // eslint-disable-next-line no-await-in-loop
      await EquipmentInstaller.updateMany(
        {
          _id: equipmentInstaller._id,
        },
        { $set: { enableForSale: updateBody.enableForSale } },
        { multi: true }
      );
    }
    return equipmentInstallerId;
  } catch (e) {
    throw new ApiError(httpStatus.BAD_REQUEST, e);
  }
};

/**
 * Delete equipmentInstaller by id
 * @param {Object} updateBody
 * @returns {Promise<Balance>}
 */
const deleteEquipmentInstallerById = async (updateBody) => {
  const equipmentInstaller = updateBody.equipmentInstallerId;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < equipmentInstaller.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    const _equipmentInstaller = await getEquipmentInstallerById(equipmentInstaller[i]);
    if (!_equipmentInstaller) {
      throw new ApiError(httpStatus.NOT_FOUND, 'EquipmentInstaller not found');
    }
    // eslint-disable-next-line no-await-in-loop
    await _equipmentInstaller.remove();
  }
  return equipmentInstaller;
};

module.exports = {
  createEquipmentInstaller,
  getEquipmentInstallers,
  queryEquipmentInstallers,
  getEquipmentInstallerById,
  updateEquipmentInstallerById,
  equipmentInstallersActionById,
  deleteEquipmentInstallerById,
};
