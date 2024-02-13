const httpStatus = require('http-status');
// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');
const { ClientLocation } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');
const { updateSubDocument } = require('../../utils/repository/subdocument_update');
const { removeFromClient, addToClient, updateClientLocationInfo } = require('./client.shared.repository');
const logger = require('../../utils/logger/logger');
const { randomNumberSequence } = require('../../utils/crypto/random');

// const groupBy = function (xs, key) {
//   const reduced = xs.reduce(function (rv, x) {
//     // eslint-disable-next-line no-param-reassign
//     (rv[x[key]] = rv[x[key]] || []).push(x);
//     return rv;
//   }, {});
//   const final = [];
//   // eslint-disable-next-line guard-for-in,no-restricted-syntax
//   for (const item in reduced) {
//     const locationItems = {
//       client: reduced[item],
//     };
//     final.push(locationItems);
//   }
//   return final;
// };

// generate random number for login and password!
function generateRandomNumber() {
  // eslint-disable-next-line no-restricted-properties
  return `${Math.floor(10000 + Math.random() * Math.pow(9, 10))}`;
}

/**
 * Get client location login password
 * @param {Object} clientLocationBody
 * @returns {Promise<number>}
 */
// eslint-disable-next-line no-unused-vars
const getClientLocationLoginPassword = async (clientLocationBody) => {
  const body = clientLocationBody;
  body.password = randomNumberSequence(6);
  body.login = randomNumberSequence(8);
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 4; i++) {
    if (body.login.length !== 8) {
      logger.warn(`randomNumberSequence(8) return wrong login: ${body.login}`);
      body.login = randomNumberSequence(8);
    } else {
      break;
    }
  }
  body.lastChangedPassword = new Date();
  return body;
};

/**
 * Get client location by id
 * @param id
 * @param populateObject
 * @param projection
 * @returns {Promise<ClientLocation>}
 */
// eslint-disable-next-line no-unused-vars
const getClientLocationById = async (id, populateObject = null, projection = null) => {
  const defaultPopulateObject = [
    {
      path: 'clientId',
      populate: [
        {
          path: 'finance.priceGroup',
          select: 'id name',
        },
      ],
      select: 'personalInfo provider id finance',
    },
    {
      path: 'commentUser',
      select: 'id firstname lastname',
    },
  ];
  const findResult = ClientLocation.findById(id, {}).populate(populateObject || defaultPopulateObject);
  if (projection) findResult.projection(projection);
  return findResult;
};

/**
 * Update location by id
 * @param {ObjectId} _id
 * @param body
 * @returns {Promise<OttProvider>}
 */
const updateLocationById = async (_id, body) => {
  await ClientLocation.updateMany({ _id }, body);
  const current = await getClientLocationById(_id);
  await updateClientLocationInfo(current);
  return current;
};

/**
 * Create a client location
 * @param {Object} clientLocationBody
 * @param user
 * @param geoInfo
 * @returns {Promise<ClientLocation>}
 */
const createClientLocation = async (clientLocationBody, user, geoInfo) => {
  const body = clientLocationBody;
  // body.timezone = geoInfo.geoInfo.timezone;
  body.geoInfo = geoInfo.geoInfo;
  // eslint-disable-next-line no-console
  body.packages = { isDefault: true };
  // email for reset, this is your new Email
  const newLocation = await ClientLocation.create(body);
  if (newLocation) {
    await addToClient(body.clientId, 'locations', newLocation._id);
    await updateClientLocationInfo(newLocation);
  }
  return newLocation;
};

/**
 * Get clientLocation by clientId
 * @param {ObjectId} clientId
 * @returns {Promise<ClientLocation>}
 */
// eslint-disable-next-line no-unused-vars
const getClientLocationByClientId = async (clientId) => {
  const defaultPopulateObject = [
    {
      path: 'clientId',
      populate: [
        {
          path: 'finance.priceGroup',
          select: 'id name',
        },
      ],
      select: 'personalInfo provider id finance',
    },
    {
      path: 'commentUser',
      select: 'id firstname lastname',
    },
  ];
  return ClientLocation.find({ clientId }, {}).populate(defaultPopulateObject);
};

/**
 * Get Client Locations
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getClientLocations = async (filter = {}, populate = [], projection = null) => {
  const query = ClientLocation.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryClientLocations = async (filter, options, user) => {
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
  return ClientLocation.aggregate([{ $sort: sortObject }]);
};

/**
 * Update client location by id
 * @param {ObjectId} clientLocationId
 * @param {Object} updateBody
 * @returns {Promise<ClientLocation>}
 */
const updateClientLocationById = async (clientLocationId, updateBody) => {
  const clientLocation = await getClientLocationById(clientLocationId);
  if (!clientLocation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientLocation not found');
  }
  if (updateBody.locations) {
    clientLocation.locations = updateSubDocument(clientLocation, 'locations', updateBody, 'locations');
    // eslint-disable-next-line no-param-reassign
    delete updateBody.locations;
  }
  // email for reset, this is your updated Email
  Object.assign(clientLocation, updateBody);
  await clientLocation.save();
  await updateClientLocationInfo(clientLocation);
  return clientLocation;
};

/**
 * pause client location by id
 * @param {ObjectId} clientLocationId
 * @param {Object} paused
 * @returns {Promise<ClientLocation>}
 */
const pauseClientLocationById = async (clientLocationId, paused) => {
  const clientLocation = await getClientLocationById(clientLocationId);
  if (!clientLocation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientLocation not found');
  }

  // email for reset, this is your updated Email
  Object.assign(clientLocation, {
    isPauseSubscriptions: paused,
  });
  // TODO pause works
  await clientLocation.save();
  await updateClientLocationInfo(clientLocation);
  return clientLocation;
};

/**
 * Get client location current price, total price by room
 * @param {ObjectId} clientLocationId
 * @param {Number} roomsCount
 * @param {Date} expireNew
 * @returns {Promise<ClientLocation>}
 */
const getClientLocationPackagesByRoom = async (clientLocationId, roomsCount, expireNew) => {
  const clientLocation = await getClientLocationById(clientLocationId);
  if (!clientLocation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientLocation not found');
  }
  // clientLocation.currentPrice = currentPriceByRooms(clientLocation.packages.currentPrice, roomsCount);
  // eslint-disable-next-line no-console
  console.log(expireNew);
  // eslint-disable-next-line no-console
  console.log(roomsCount);
  return clientLocation;
};

/**
 * reset balances
 */
// eslint-disable-next-line no-unused-vars
const resetAllPasswords = async () => {
  await ClientLocation.updateMany({}, { password: `` });
};

/**
 * Delete clientLocation by id
 * @param {ObjectId} clientLocationId
 * @returns {Promise<ClientLocation>}
 */
const deleteClientLocationById = async (clientLocationId) => {
  const clientLocation = await getClientLocationById(clientLocationId);
  if (!clientLocation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientLocation not found');
  }
  await clientLocation.remove();

  await removeFromClient(
    clientLocation.clientId._id ? clientLocation.clientId._id.toString() : clientLocation.clientId,
    'locations',
    clientLocationId
  );
  await updateClientLocationInfo(clientLocation, true);
  return clientLocation;
};

// eslint-disable-next-line no-unused-vars
const queryLocations = async (filter, options, user) => {
  const curOptions = {
    page: options.page ?? 1,
    all: options.all ?? false,
    limit: options.all ? 10000000 : options.limit ?? 20,
  };
  //   const findFilter = {};
  //   // status to 1
  //   findFilter.status = { $eq: 1 };
  //   findFilter.provider = { $in: filter.providers };
  // const start = new Date();
  // const locations = await ClientLocation.paginate(findFilter, curOptions, {}, [
  //   {
  //     path: 'subscriptions',
  //   },
  //   {
  //     path: 'provider',
  //   },
  //   {
  //     path: 'server',
  //   },
  //   {
  //     path: 'clientId',
  //   },
  // ]);
  // const end = new Date();
  // logger.info(`locations query duration duration: ${end.getTime() - start.getTime()}`);
  // locations.results = groupBy(locations.results, 'clientId');
  // return locations;
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

  const elemMatches = [];
  filter.providers.forEach((providerId) => {
    // elemMatches.push({ $elemMatch:discounts { id: mongoose.Types.ObjectId(role) } });
    elemMatches.push(mongoose.Types.ObjectId(providerId));
  });
  match.$or.push({
    'clients.provider': {
      $in: elemMatches,
    },
  });

  if (!match.$or.length) delete match.$or;

  // eslint-disable-next-line no-unused-vars
  const constFilter = [
    {
      $match: match,
    },
  ];

  // const lookupFilter = [
  //   {
  //     $lookup: {
  //       from: 'clients',
  //       // localField: '_id',
  //       // foreignField: 'providerId',
  //       let: { id: '$clientId' },
  //       as: 'clients',
  //       pipeline: [
  //         {
  //           $lookup: {
  //             from: 'price_groups',
  //             // localField: '_id',
  //             // foreignField: 'providerId',
  //             let: { id: '$finance.priceGroup' },
  //             as: 'priceGroupObject',
  //             pipeline: [
  //               {
  //                 $match: {
  //                   $expr: { $eq: ['$_id', '$$id'] },
  //                 },
  //               },
  //             ],
  //           },
  //         },
  //         {
  //           $match: {
  //             status: 1,
  //           },
  //         },
  //         {
  //           $match: {
  //             $expr: { $eq: ['$_id', '$$id'] },
  //           },
  //         },
  //       ],
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: 'ottproviders',
  //       // localField: 'provider',
  //       // foreignField: '_id',
  //       let: { id: '$provider' },
  //       as: 'providers',
  //       pipeline: [
  //         {
  //           $match: {
  //             status: 1,
  //           },
  //         },
  //         {
  //           $match: {
  //             $expr: { $eq: ['$_id', '$$id'] },
  //           },
  //         },
  //         {
  //           $project: {
  //             name: 1,
  //           },
  //         },
  //       ],
  //     },
  //   },
  //   { $sort: sortObject },
  // ];
  // const finalAggregate = lookupFilter.concat(constFilter);
  const aggregate = ClientLocation.aggregate([
    {
      $lookup: {
        from: 'clients',
        // localField: '_id',
        // foreignField: 'providerId',
        let: { id: '$clientId' },
        as: 'clients',
        pipeline: [
          {
            $lookup: {
              from: 'price_groups',
              // localField: '_id',
              // foreignField: 'providerId',
              let: { id: '$finance.priceGroup' },
              as: 'priceGroupObject',
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$id'] },
                  },
                },
              ],
            },
          },
          {
            $match: {
              status: 1,
            },
          },
          {
            $match: {
              $expr: { $eq: ['$_id', '$$id'] },
            },
          },
        ],
      },
    },
    {
      $unwind: '$clientInfo', // If 'clientId' is guaranteed to exist, you can skip this stage
    },
    {
      $project: {
        _id: 1,
        locationName: 1,
        // Add other fields as needed
        // Replace 'clientId' with 'clientInfo' to use the joined client data
        clientInfo: {
          _id: '$clientInfo._id',
          personalInfo: '$clientInfo.personalInfo',
          // Include other client fields as needed
        },
        roomsCount: 1,
        roomsCountNew: 1,
        // Include other fields as needed
      },
    },
  ]);
  const list = await ClientLocation.aggregatePaginate(aggregate, curOptions);

  list.docs.forEach((elem, i) => {
    list.docs[i].id = elem._id;
    list.docs[i].clients?.forEach((item) => {
      // eslint-disable-next-line no-param-reassign,prefer-destructuring
      if (item.priceGroupObject.length) item.priceGroupObject = item.priceGroupObject[0];
      // eslint-disable-next-line no-param-reassign
      else delete item.priceGroupObject;
    });

    // eslint-disable-next-line no-param-reassign
    // elem.activePackages = elem.subscriptions.length;

    // const myArray = elem.subscriptions;
    // if (myArray.length) {
    //   const min = Math.min.apply(
    //     null,
    //     myArray.map(function (a) {
    //       return a.endDate;
    //     })
    //   );
    //   // eslint-disable-next-line no-param-reassign
    //   elem.packageExpireDate = new Date(min);
    // }

    // eslint-disable-next-line no-param-reassign
    // elem.client = elem.clients.length ? elem.clients[0] : null;
    delete list.docs[i]._id;
  });

  // group locations by client Id
  // const group = list.docs.reduce(
  //   // eslint-disable-next-line no-param-reassign,no-sequences,no-return-assign
  //   (first, last) => (first[last.clientId] ? first[last.clientId].push(last) : (first[last.clientId] = [last]), first),
  //   {}
  // );
  // const newData = Object.keys(group).map((k) => ({ client: group[k] }));

  return {
    results: list.docs ? list.docs : null,
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
 * Get client location by id
 * @param {ObjectId} filter
 * @returns {Promise<User>}
 */
const getAll = async (filter) => {
  return ClientLocation.find(filter);
};

module.exports = {
  queryLocations,
  getAll,
  resetAllPasswords,
  createClientLocation,
  queryClientLocations,
  getClientLocations,
  getClientLocationById,
  getClientLocationByClientId,
  getClientLocationPackagesByRoom,
  updateLocationById,
  updateClientLocationById,
  pauseClientLocationById,
  deleteClientLocationById,
  getClientLocationLoginPassword,
  generateRandomNumber,
};
