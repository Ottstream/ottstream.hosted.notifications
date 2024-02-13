const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { EquipmentType } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

// eslint-disable-next-line no-unused-vars
const equipmentTypePopulateObject = [
  {
    path: 'provider',
  },
];

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<EquipmentType>}
 */
// eslint-disable-next-line no-unused-vars
const getEquipmentTypeById = async (id, options = {}) => {
  const item = await EquipmentType.findById(id);
  // if (item) {
  //   item.typeName = equipmentTypeTypes.filter((r) => r.type === item.type)[0].name;
  // }
  return item;
};

/**
 * Get item by id
 * @returns {Promise<EquipmentType>}
 * @param filter
 */
// eslint-disable-next-line no-unused-vars
const getEquipmentTypes = async (filter) => {
  const items = await EquipmentType.find(filter);
  // items.forEach((elem) => {
  //   // eslint-disable-next-line no-param-reassign
  //   elem.typeName = equipmentTypeTypes.filter((r) => r.type === elem.type)[0].name;
  // });
  return items;
};

/**
 * Create a item equipmentType
 * @param {Object} itemBody
 * @param user
 * @returns {Promise<EquipmentType>}
 */
const createEquipmentType = async (itemBody, user) => {
  const body = itemBody;
  // eslint-disable-next-line no-console
  if (!user.provider) throw new ApiError('no provider for user');
  body.user = user._id;
  body.provider = user.provider.id;
  const created = await EquipmentType.create(body);
  return getEquipmentTypeById(created.id);
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryEquipmentTypes = async (filter, options) => {
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
    //     from: 'equipmentType_subscriptions',
    //     // localField: '_id',
    //     // foreignField: 'providerId',
    //     let: { id: '$_id' },
    //     as: 'equipmentTypes_sold',
    //     pipeline: [
    //       {
    //         $match: {
    //           state: 1,
    //         },
    //       },
    //       {
    //         $match: {
    //           $expr: { $eq: ['$equipmentType', '$$id'] },
    //         },
    //       },
    //     ],
    //   },
    // },
    { $sort: sortObject },
  ];

  const finalAggregate = lookupFilter.concat(constFilter);
  const aggregate = EquipmentType.aggregate(finalAggregate);
  const list = await EquipmentType.aggregatePaginate(aggregate, curOptions);
  list.docs.forEach(function (it, i) {
    const item = list.docs[i];
    item.id = item._id;
    // item.typeName = equipmentTypeTypes.filter((r) => r.type === item.type)[0].name;
    // item.butTotal = item.equipmentTypes_sold ? item.equipmentTypes_sold.length : 0;
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
 * @param {ObjectId} equipmentTypeId
 * @param {Object} updateBody
 * @returns {Promise<EquipmentType>}
 */
const updateEquipmentTypeById = async (equipmentTypeId, updateBody) => {
  const item = await getEquipmentTypeById(equipmentTypeId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'EquipmentType not found');
  }
  Object.assign(item, updateBody);
  await item.save();
  return getEquipmentTypeById(equipmentTypeId);
};

/**
 * equipmentType action by id
 * @returns {Promise<EquipmentType>}
 * @param {Object} updateBody
 */
const equipmentTypesActionById = async (updateBody) => {
  try {
    if (!updateBody) throw new ApiError(httpStatus.BAD_REQUEST, 'EquipmentType not found');
    const { equipmentTypeId } = updateBody;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < equipmentTypeId.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const equipmentType = await getEquipmentTypeById(equipmentTypeId[i]);
      // eslint-disable-next-line no-await-in-loop
      await EquipmentType.updateMany(
        {
          _id: equipmentType._id,
        },
        { $set: { enableForSale: updateBody.enableForSale } },
        { multi: true }
      );
    }
    return equipmentTypeId;
  } catch (e) {
    throw new ApiError(httpStatus.BAD_REQUEST, e);
  }
};

/**
 * Delete equipmentType by id
 * @param {Object} updateBody
 * @returns {Promise<Balance>}
 */
const deleteEquipmentTypeById = async (updateBody) => {
  const equipmentType = updateBody.equipmentTypeId;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < equipmentType.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    const _equipmentType = await getEquipmentTypeById(equipmentType[i]);
    if (!_equipmentType) {
      throw new ApiError(httpStatus.NOT_FOUND, 'EquipmentType not found');
    }
    // eslint-disable-next-line no-await-in-loop
    await _equipmentType.remove();
  }
  return equipmentType;
};

module.exports = {
  createEquipmentType,
  getEquipmentTypes,
  queryEquipmentTypes,
  getEquipmentTypeById,
  updateEquipmentTypeById,
  equipmentTypesActionById,
  deleteEquipmentTypeById,
};
