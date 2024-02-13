const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { Equipment } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

// eslint-disable-next-line no-unused-vars
const equipmentPopulateObject = [
  {
    path: 'provider',
  },
];

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Equipment>}
 */
// eslint-disable-next-line no-unused-vars
const getEquipmentById = async (id, options = {}) => {
  const item = await Equipment.findById(id).populate([{ path: 'type' }]);
  if (item) {
    item.typeName = item.type?.name?.length ? item.type.name[0].name : '';
  }
  return item;
};

/**
 * Get item by id
 * @returns {Promise<Equipment>}
 * @param filter
 */
// eslint-disable-next-line no-unused-vars
const getEquipments = async (filter) => {
  const items = await Equipment.find(filter);
  items.forEach((item) => {
    // eslint-disable-next-line no-param-reassign
    item.typeName = item.type?.name?.length ? item.type.name[0].name : '';
  });
  return items;
};

/**
 * Create a item equipment
 * @param {Object} itemBody
 * @param user
 * @returns {Promise<Equipment>}
 */
const createEquipment = async (itemBody, user) => {
  const body = itemBody;
  // eslint-disable-next-line no-console
  if (!user.provider) throw new ApiError('no provider for user');
  body.user = user._id;
  body.provider = user.provider.id;
  const created = await Equipment.create(body);
  return getEquipmentById(created.id);
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryEquipments = async (filter, options) => {
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

  if (typeof filter.service !== 'undefined') {
    match.isService = { $eq: filter.isService };
  }
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

  if (typeof filter.price !== 'undefined') {
    match.$or.push({
      price: { $gte: filter.price },
    });
    match.$or.push({
      price: { $lte: filter.price },
    });
  }

  if (typeof filter.priceFrom !== 'undefined' && typeof filter.priceTo !== 'undefined') {
    priceMatch.$and.push({
      price: { $gte: filter.priceFrom },
    });
    priceMatch.$and.push({
      price: { $lte: filter.priceTo },
    });
  } else if (typeof filter.priceFrom !== 'undefined') {
    match.price = { $gte: filter.priceFrom };
  } else if (typeof filter.priceTo !== 'undefined') {
    match.price = { $lte: filter.priceTo };
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
    {
      $lookup: {
        from: 'equipment_subscriptions',
        // localField: '_id',
        // foreignField: 'providerId',
        let: { id: '$_id' },
        as: 'equipments_sold',
        pipeline: [
          {
            $match: {
              state: 1,
            },
          },
          {
            $match: {
              $expr: { $eq: ['$equipment', '$$id'] },
            },
          },
        ],
      },
    },
    { $sort: sortObject },
  ];

  const finalAggregate = lookupFilter.concat(constFilter);
  const aggregate = Equipment.aggregate(finalAggregate);
  const list = await Equipment.aggregatePaginate(aggregate, curOptions);
  list.docs.forEach(function (it, i) {
    const item = list.docs[i];
    item.id = item._id;
    item.typeName = item.type?.name?.length ? item.type.name[0].name : '';
    item.butTotal = item.equipments_sold ? item.equipments_sold.length : 0;
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
 * @param {ObjectId} equipmentId
 * @param {Object} updateBody
 * @returns {Promise<Equipment>}
 */
const updateEquipmentById = async (equipmentId, updateBody) => {
  const item = await getEquipmentById(equipmentId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Equipment not found');
  }
  Object.assign(item, updateBody);
  await item.save();
  return getEquipmentById(equipmentId);
};

/**
 * equipment action by id
 * @returns {Promise<Equipment>}
 * @param {Object} updateBody
 */
const equipmentsActionById = async (updateBody) => {
  try {
    if (!updateBody) throw new ApiError(httpStatus.BAD_REQUEST, 'Equipment not found');
    const { equipmentId } = updateBody;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < equipmentId.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const equipment = await getEquipmentById(equipmentId[i]);
      // eslint-disable-next-line no-await-in-loop
      await Equipment.updateMany(
        {
          _id: equipment._id,
        },
        { $set: { enableForSale: updateBody.enableForSale } },
        { multi: true }
      );
    }
    return equipmentId;
  } catch (e) {
    throw new ApiError(httpStatus.BAD_REQUEST, e);
  }
};

/**
 * Delete equipment by id
 * @param {Object} updateBody
 * @returns {Promise<Balance>}
 */
const deleteEquipmentById = async (updateBody) => {
  const equipment = updateBody.equipmentId;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < equipment.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    const _equipment = await getEquipmentById(equipment[i]);
    if (!_equipment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Equipment not found');
    }
    // eslint-disable-next-line no-await-in-loop
    await _equipment.remove();
  }
  return equipment;
};

module.exports = {
  createEquipment,
  getEquipments,
  queryEquipments,
  getEquipmentById,
  updateEquipmentById,
  equipmentsActionById,
  deleteEquipmentById,
};
