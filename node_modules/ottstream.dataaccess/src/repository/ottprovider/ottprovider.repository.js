const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { OttProvider, Client } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');
// eslint-disable-next-line no-unused-vars
const langPick = require('../../utils/helpers/langPick');
const clientRepository = require('../client/client.repository');
const ottProviderEmailRepository = require('./ottprovider_email.repository');
const ottProviderPhoneRepository = require('./ottprovider_phone.repository');
const { updateUserById, getUserById } = require('../user/user.repository');
const { USER_STATE } = require('../../config/user_states');
const { updateSubDocument } = require('../../utils/repository/subdocument_update');
const logger = require('../../utils/logger/logger');
const EmailService = require('../../services/email/EmailService.service');
const CacheService = require('../../services/cache/CacheService');

function getCreditRemainInfo(result) {
  const now = new Date();
  const startDate = result.creditStartDate;
  const days = result.creditTerm;
  const endDate = new Date(startDate);
  if (result.days) {
    endDate.setDate(endDate.getDate() + days);
  } else {
    endDate.setMonth(endDate.getMonth() + days);
  }
  const remainDays = (endDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
  const remainDaysBlock = remainDays + result.clientsPauseAfterDays;
  return {
    remainDays,
    remainDaysBlock,
    amount: result.creditAmount,
  };
}

const ottProviderPopulateObject = [
  {
    path: 'parent',
  },
  {
    path: 'priceGroup',
  },
  {
    path: 'user',
  },
];

/**
 * reset balances
 */
const resetBalances = async () => {
  await OttProvider.updateMany({}, { balance: 0 });
};

/**
 * reset timezone
 */
const resetTimezones = async () => {
  await OttProvider.updateMany({}, { timezone: '' });
};

/**
 * Get ottprovider by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getBaseOttProvider = async (id, options = {}) => {
  return await OttProvider.findOne({ type: 0 }, {}).populate(ottProviderPopulateObject);
};

const orderParents = async (providerId, list) => {
  const foundList = list.filter((r) => r._id.toString() === providerId.toString());
  if (!foundList.length) {
    logger.error(`provider not found list in orderParents()`);
    return [];
  }
  const parent = foundList[0].parent ? foundList[0].parent.toString() : null;
  let results = [];
  const filteredList = list.filter((r) => r._id.toString() === parent);
  // eslint-disable-next-line no-unused-vars,no-restricted-syntax
  for (const provider of filteredList) {
    results.push(provider);
    // eslint-disable-next-line no-await-in-loop
    results = results.concat(await orderParents(provider._id.toString(), list));
  }
  return results;
};

const orderChilds = async (providers, list, depth) => {
  let results = [];
  const filteredList = list.filter((r) => r.parent && providers.filter((a) => a === r.parent.toString()).length);
  // eslint-disable-next-line no-unused-vars,no-restricted-syntax
  for (const provider of filteredList) {
    results.push(provider);
    if (depth !== 1) {
      // eslint-disable-next-line no-await-in-loop
      results = results.concat(await orderChilds([provider._id.toString()], list, depth));
    }
  }
  return results;
};

const getOttChildCacheKey = (providers) => {
  return `ott_child_list_${providers.toString()}`;
};

const getOttChilds = async (providers, depth = null) => {
  const list = await OttProvider.find({ status: 1 }, '_id parent number name');
  if (!(await CacheService.hasKey(getOttChildCacheKey(providers)))) {
    return CacheService.setex(getOttChildCacheKey(providers), await orderChilds(providers, list, depth), 3600);
  }
  return CacheService.get(getOttChildCacheKey(providers));
};

const getOttParents = async (providerId) => {
  const list = await OttProvider.find({ status: 1 }, '_id parent number name priceGroup');
  return orderParents(providerId, list);
};

/**
 * Get ottprovider by id
 * @param {ObjectId} id
 * @param populateObject
 * @param projection
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderById = async (id, populateObject = null, projection = null) => {
  const findResult = OttProvider.findById(id, {}).populate(populateObject || ottProviderPopulateObject);
  if (projection) findResult.projection(projection);
  return findResult;
};

/**
 * Get ottprovider by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getOttTabs = async (id, options = {}) => {
  const match = {};
  match._id = { $eq: mongoose.Types.ObjectId(id) };

  const lookupFilter = [
    {
      $match: match,
    },
    {
      $lookup: {
        from: 'ottprovider_phones',
        localField: '_id',
        foreignField: 'providerId',
        as: 'phones',
      },
    },
    {
      $lookup: {
        from: 'ottprovider_address',
        localField: '_id',
        foreignField: 'providerId',
        as: 'addresses',
      },
    },
    {
      $lookup: {
        from: 'ottprovider_emails',
        localField: '_id',
        foreignField: 'providerId',
        as: 'emails',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'users',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'registerBy',
        foreignField: '_id',
        as: 'registerBy',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'editBy',
        foreignField: '_id',
        as: 'editBy',
      },
    },
    {
      $lookup: {
        from: 'credits',
        // localField: '_id',
        // foreignField: 'providerId',
        let: { id: '$_id' },
        as: 'credits',
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$providerId', '$$id'] },
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'ottproviders',
        localField: 'parent',
        foreignField: '_id',
        as: 'parent',
      },
    },
  ];
  const list = await OttProvider.aggregate(lookupFilter);
  if (list.length) {
    const current = list[0];
    current.id = current._id;
    // eslint-disable-next-line no-param-reassign,no-return-assign
    current.emails.forEach((elem) => (elem.id = elem._id));
    // eslint-disable-next-line no-param-reassign,no-return-assign
    current.phones.forEach((elem) => (elem.id = elem._id));
    // eslint-disable-next-line no-param-reassign,no-return-assign
    current.addresses.forEach((elem) => (elem.id = elem._id));
    current.user = current.users.length ? current.users[0] : {};
    current.registerBy = current.registerBy.length ? current.registerBy[0] : null;
    current.editBy = current.editBy.length ? current.editBy[0] : null;
    current.parent = current.parent.length ? current.parent[0] : null;
    // eslint-disable-next-line no-nested-ternary
    current.credits = current.credits.length
      ? current.credits.filter((r) => r.state === 1).length
        ? getCreditRemainInfo(current.credits.filter((r) => r.state === 1)[0])
        : null
      : null;
    return current;
  }
  throw new ApiError(httpStatus.NOT_FOUND, 'Base OttProvider');
};

/**
 * isEmailTaken
 * @param email
 * @returns {Promise<*>}
 */
const isEmailTaken = async (email) => {
  const result = await OttProvider.isEmailTaken(email);
  return result;
};

/**
 * Create a provider
 * @param {Object} ottproviderBody
 * @param user
 * @returns {Promise<OttProvider>}
 */
const createOttProvider = async (ottproviderBody, user) => {
  const body = {};
  Object.assign(body, ottproviderBody);
  body.user = user._id;
  const ottProvider = new OttProvider(body);
  const created = await ottProvider.save();
  await updateUserById(user._id, {
    provider: created._id,
  });
  if (ottproviderBody.phone) {
    await ottProviderPhoneRepository.createOttProviderPhone({
      providerId: created._id,
      inUse: true,
      isMain: true,
      number: ottproviderBody.phone?.phoneNumber,
    });
  }
  if (ottproviderBody.email) {
    await ottProviderEmailRepository.createOttProviderEmail({
      providerId: created._id,
      inUse: true,
      isMain: true,
      address: ottproviderBody.email,
    });
  }
  return getOttTabs(created._id);
};

/**
 * Create a provider by admin
 * @param body
 * @param user
 * @param companyEmails
 * @param companyPhones
 * @returns {Promise<OttProvider>}
 */
const createOttProviderByAdmin = async (body, user, companyEmails = [], companyPhones = []) => {
  const ottProvider = new OttProvider(body);
  ottProvider.user = user._id;
  const created = await ottProvider.save();
  if (created) {
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const i in companyEmails) {
      const val = companyEmails[i];
      val.providerId = created._id;
      // eslint-disable-next-line no-await-in-loop
      try {
        // eslint-disable-next-line no-await-in-loop
        await ottProviderEmailRepository.createOttProviderEmail(val);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const i in companyPhones) {
      const val = companyPhones[i];
      val.providerId = created._id;
      // eslint-disable-next-line no-await-in-loop
      try {
        // eslint-disable-next-line no-await-in-loop
        await ottProviderPhoneRepository.createOttProviderPhone(val);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  }
  await updateUserById(user._id, {
    provider: created._id,
  });
  return getOttTabs(created._id);
};

/**
 * Create a base provider
 * @param {Object} ottproviderBody
 * @param user
 * @returns {Promise<OttProvider>}
 */
const createBaseOttProvider = async (ottproviderBody, user) => {
  const ottProvider = new OttProvider();
  if (await OttProvider.isEmailTaken(ottproviderBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  ottProvider.email = ottproviderBody.email;
  ottProvider.state = 1;
  ottProvider.type = 0;
  ottProvider.name = [
    {
      lang: 'en',
      name: 'Base OttProvider',
    },
  ];
  ottProvider.phone = '+3749';
  const created = await ottProvider.save();
  await updateUserById(user._id, {
    provider: created._id,
  });
  return created;
};

/**
 * @param filter
 * @param options
 * @returns {Promise<{totalResults: string, limit, totalPages: (string|number|number|*), page, results}>}
 */
// eslint-disable-next-line no-unused-vars
const queryRegistrationOttProviders = async (filter, options) => {
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
  const stateMatch = {};
  const channelMatch = {};
  const dateMatch = {};
  match.$or = [];
  channelMatch.$and = [];
  dateMatch.$and = [];
  stateMatch.$or = [];
  if (filter.search) {
    match.$or.push({
      'name.name': { $regex: `.*${filter.search}.*`, $options: 'i' },
    });
    match.$or.push({
      'emails.address': { $regex: `.*${filter.search}.*`, $options: 'i' },
    });
    match.$or.push({
      'phones.number': { $regex: `.*${filter.search.replace('+', '')}.*`, $options: 'i' },
    });
  }
  if (typeof filter.state !== 'undefined') {
    stateMatch.$or.push({
      state: { $eq: filter.state },
    });
  } else {
    stateMatch.$or.push({ state: { $eq: 0 } });
    stateMatch.$or.push({ state: { $eq: 2 } });
  }

  if (typeof filter.clientAmount !== 'undefined') {
    match.clientAmount = { $eq: filter.clientAmount };
  }
  if (typeof filter.channelMinCount !== 'undefined' && typeof filter.channelMaxCount !== 'undefined') {
    channelMatch.$and.push({
      channelAmount: { $gt: filter.channelMinCount },
    });
    channelMatch.$and.push({
      channelAmount: { $lt: filter.channelMaxCount },
    });
  } else if (typeof filter.channelMinCount !== 'undefined') {
    channelMatch.channelAmount = { $gt: filter.channelMinCount };
  } else if (typeof filter.channelMaxCount !== 'undefined') {
    channelMatch.channelAmount = { $lt: filter.channelMaxCount };
  }

  if (typeof filter.dateFrom !== 'undefined' && typeof filter.dateTo !== 'undefined') {
    dateMatch.$and.push({
      createdAt: { $gte: filter.dateFrom },
    });
    dateMatch.$and.push({
      createdAt: { $lte: filter.dateTo },
    });
  } else if (typeof filter.dateFrom !== 'undefined') {
    dateMatch.createdAt = { $gte: filter.dateFrom };
  } else if (typeof filter.dateTo !== 'undefined') {
    dateMatch.createdAt = { $lte: filter.dateTo };
  }

  if (!match.$or.length) delete match.$or;
  if (!channelMatch.$and.length) delete channelMatch.$and;
  if (!dateMatch.$and.length) delete dateMatch.$and;
  if (!stateMatch.$or.length) delete stateMatch.$or;

  const channelFilterMatchObject = [
    {
      $match: channelMatch,
    },
  ];
  const constFilter = [
    {
      $match: match,
    },
    {
      $match: stateMatch,
    },
    {
      $match: dateMatch,
    },
  ];
  const lookupFilter = [
    {
      $lookup: {
        from: 'ottprovider_phones',
        localField: '_id',
        foreignField: 'providerId',
        as: 'phones',
      },
    },
    {
      $lookup: {
        from: 'ottprovider_address',
        localField: '_id',
        foreignField: 'providerId',
        as: 'addresses',
      },
    },
    {
      $lookup: {
        from: 'ottprovider_emails',
        localField: '_id',
        foreignField: 'providerId',
        as: 'emails',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'users',
      },
    },
    { $sort: sortObject },
  ];
  const finalAggregate = lookupFilter.concat(constFilter).concat(channelFilterMatchObject);
  const channelMinMaxAggregate = constFilter.concat([{ $project: { channelAmount: 1 } }]);

  const aggregate = OttProvider.aggregate(finalAggregate);
  const list = await OttProvider.aggregatePaginate(aggregate, curOptions);
  const channelMinMaxList = await OttProvider.aggregate(channelMinMaxAggregate);

  list.docs.forEach((elem, i) => {
    list.docs[i].id = elem._id;
    list.docs[i].user = elem.users.length ? elem.users[0] : {};
    delete list.docs[i]._id;
  });
  return {
    page: curOptions.page,
    limit: curOptions.limit,
    results: list.docs,
    totalPages: list.totalPages,
    totalResults: list.totalDocs,
    // eslint-disable-next-line prefer-spread
    channelAmountMin: Math.min.apply(
      Math,
      channelMinMaxList.map(function (o) {
        return o.channelAmount;
      })
    ),
    // eslint-disable-next-line prefer-spread
    channelAmountMax: Math.max.apply(
      Math,
      channelMinMaxList.map(function (o) {
        return o.channelAmount;
      })
    ),
  };
};
/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryOttProviders = async (filter, options, user) => {
  /*
  const curOptions = {
    page: options.page ?? 1,
    all: options.all ?? false,
    limit: options.all ? 10000000 : options.limit ?? 10,
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
  if (filter.search) {
    match.$or = [
      {
        'name.name': { $regex: `.*${filter.search}.*` },
      },
    ];
  }
  if (filter._id) {
    match._id = { $eq: mongoose.Types.ObjectId(filter._id) };
  }
  const myAggregate = User.aggregate([
    {
      $match: match,
    },
    {
      $lookup: {
        from: 'ottprovider_phones',
        localField: '_id',
        foreignField: 'providerId',
        as: 'phones',
      },
    },
    {
      $lookup: {
        from: 'ottprovider_address',
        localField: '_id',
        foreignField: 'providerId',
        as: 'addresses',
      },
    },
    {
      $lookup: {
        from: 'ottprovider_emails',
        localField: '_id',
        foreignField: 'providerId',
        as: 'emails',
      },
    },
    {
      $lookup: {
        from: 'ottprovider_emails',
        localField: '_id',
        foreignField: 'providerId',
        as: 'emails',
      },
    },
    {
      $lookup: {
        from: 'ottprovider_invoice',
        localField: '_id',
        foreignField: 'providerId',
        as: 'invoices',
      },
    },
    {
      $lookup: {
        from: 'ottprovider_ui',
        localField: '_id',
        foreignField: 'providerId',
        as: 'uis',
      },
    },
    {
      $lookup: {
        from: 'balances',
        localField: '_id',
        foreignField: 'providerId',
        as: 'balances',
      },
    },
    {
      $lookup: {
        from: 'ottproviders',
        localField: '_id',
        foreignField: 'parent',
        as: 'resellers',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'registerBy',
        foreignField: '_id',
        as: 'registerBy',
      },
    },
    {
      $lookup: {
        from: 'credits',
        // localField: '_id',
        // foreignField: 'providerId',
        let: { id: '$_id' },
        as: 'credits',
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$providerId', '$$id'] },
            },
          },
        ],
      },
    },
    { $sort: sortObject },
  ]);

  const list = await OttProvider.aggregatePaginate(myAggregate, curOptions);

  let totalResellers = 0;
  const totalClients = 0;

  list.docs.forEach((elem, i) => {
    list.docs[i].clients = [];
    list.docs[i].logins = [];
    list.docs[i].activeLogins = [];
    list.docs[i].inactiveLogin = [];
    list.docs[i].currentMonthPayments = 0;
    list.docs[i].currentMonthIncome = 0;
    list.docs[i].id = elem._id;
    list.docs[i].registerBy = list.docs[i].registerBy.length ? list.docs[i].registerBy[0] : {};
    totalResellers += list.docs[i].resellers.length;
    totalResellers += list.docs[i].clients.length;
    delete list.docs[i]._id;
  });
  const data = {
    results: list.docs,
    page: list.page,
    limit: list.limit,
    totalPages: list.totalPages,
    totalResults: list.totalDocs,
    balanceMin: 0,
    balanceMax: 0,
    debtMin: 0,
    debtMax: 0,
    clientsMin: 0,
    clientsMax: 0,
    resellersMin: 0,
    resellersMax: 0,
    totalLoginMin: 0,
    totalLoginMax: 0,
    creditEndRemainDayMin: 0,
    creditEndRemainDayMax: 0,
    currentMonthPaymentsMin: 0,
    currentMonthPaymentsMax: 0,
    currentMonthIncomeMin: 0,
    currentMonthIncomeMax: 0,
    totalClients,
    totalResellers,
    totalLogins: 0, // TODO after client location login part finished on Th. 23.09.2021
    totalActiveLogins: 0, // TODO after client location login part finished on Th. 23.09.2021
    totalInactiveLogins: 0, // TODO after client location login part finished on Th. 23.09.2021
    totalCurrentMonthPayments: 0, // TODO after invoice list is ready
    totalCurrentMonthIncome: 0, // TODO after invoice list is ready
    totalCreditFromParent: 0, // TODO after invoice list is ready
    totalDebt: 0, // TODO after invoice list is ready
    totalOwnChannels: 0, // TODO after invoice list is ready
  };

  return data; */
  /*
    'creditAmountFrom',
    'creditAmountTo',
    'creditDateFrom',
    'creditDateTo',
    'creditAutoExtend',
    'creditDaysRemainingFrom',
    'creditDaysRemainingTo',
    'currentMonthPaymentsFrom',
    'currentMonthPaymentsTo',
    'currentMonthIncomeFrom',
    'currentMonthIncomeTo',
    'dateFrom',
    'dateTo',
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
  const searchMatch = {};
  const stateMatch = {};
  const clientMatch = {};
  const subMatch = {};
  const resellerMatch = {};
  const balanceMatch = {};
  const creditMatch = {};
  const debtMatch = {};
  const loginsMatch = {};
  const dateMatch = {};
  searchMatch.$or = [];
  match.$or = [];
  clientMatch.$and = [];
  subMatch.$and = [];
  resellerMatch.$and = [];
  balanceMatch.$and = [];
  debtMatch.$and = [];
  creditMatch.$and = [];
  dateMatch.$and = [];
  loginsMatch.$and = [];
  stateMatch.$or = [];

  // search filter
  if (filter.search) {
    match.$or = [
      {
        // eslint-disable-next-line security/detect-non-literal-regexp
        'name.name': { $regex: new RegExp(`.*${filter.search}.*`, 'i') },
      },
      {
        // eslint-disable-next-line security/detect-non-literal-regexp
        'emails.address': { $regex: new RegExp(`.*${filter.search}.*`, 'i') },
      },
      {
        // eslint-disable-next-line security/detect-non-literal-regexp
        'phones.number': { $regex: new RegExp(`.*${filter.search.replace('+', '')}.*`, 'i') },
      },
    ];
  }

  // status to 1
  match.status = { $eq: 1 };

  // state
  if (filter.state) {
    stateMatch.actionStatus = { $eq: filter.state };
  }

  // country
  if (typeof filter.country !== 'undefined') {
    match.country = { $eq: filter.country };
  }

  // priceGroup
  if (typeof filter.priceGroup !== 'undefined') {
    match.priceGroup = { $eq: mongoose.Types.ObjectId(filter.priceGroup) };
  }

  // creditAutoExtend
  if (typeof filter.creditAutoExtend !== 'undefined') {
    match.$or.push({
      'credits.creditAutoextend': { $eq: filter.creditAutoExtend },
    });
  }

  // clientsFrom clientsTo
  if (typeof filter.clientsFrom !== 'undefined' && typeof filter.clientsTo !== 'undefined') {
    clientMatch.$and.push({
      'clients.clientCount': { $gte: filter.clientsFrom },
    });
    clientMatch.$and.push({
      'clients.clientCount': { $lte: filter.clientsTo },
    });
  } else if (typeof filter.clientsFrom !== 'undefined') {
    match.$or.push({
      'clients.clientCount': { $gte: filter.clientsFrom },
    });
  } else if (typeof filter.clientsTo !== 'undefined') {
    match.$or.push({
      'clients.clientCount': { $lte: filter.clientsTo },
    });
  }

  // subsFrom subsTo
  if (typeof filter.activeLoginsFrom !== 'undefined' && typeof filter.activeLoginsTo !== 'undefined') {
    subMatch.$and.push({
      subs: { $gte: filter.activeLoginsFrom },
    });
    subMatch.$and.push({
      subs: { $gte: filter.activeLoginsTo },
    });
  } else if (typeof filter.activeLoginsFrom === 'undefined' || typeof filter.activeLoginsTo !== 'undefined') {
    match.$or.subs = { $gte: filter.activeLoginsFrom };
    match.$or.subs = { $lte: filter.activeLoginsTo };
  }

  if (typeof filter.resellersFrom !== 'undefined' && typeof filter.resellersTo !== 'undefined') {
    resellerMatch.$and.push({
      'resellers.resellerCount': { $gte: filter.resellersFrom },
    });
    resellerMatch.$and.push({
      'resellers.resellerCount': { $lte: filter.resellersTo },
    });
  } else if (typeof filter.resellersFrom !== 'undefined') {
    match.$or.push({
      'resellers.resellerCount': { $gte: filter.resellersFrom },
    });
  } else if (typeof filter.resellersTo !== 'undefined') {
    match.$or.push({
      'resellers.resellerCount': { $lte: filter.resellersTo },
    });
  }

  // creditAmountFrom creditAmountTo
  if (typeof filter.creditAmountFrom !== 'undefined' && typeof filter.creditAmountTo !== 'undefined') {
    creditMatch.$and.push({
      'credits.creditAmount': { $gte: filter.creditAmountFrom },
    });
    creditMatch.$and.push({
      'credits.creditAmount': { $lte: filter.creditAmountTo },
    });
  } else if (typeof filter.creditAmountFrom !== 'undefined' || typeof filter.creditAmountTo !== 'undefined') {
    match.$or.push({
      'credits.creditAmount': { $gte: filter.creditAmountFrom },
    });
    match.$or.push({
      'credits.creditAmount': { $lte: filter.creditAmountTo },
    });
  }

  // creditDateFrom creditDateTo
  if (typeof filter.creditDateFrom !== 'undefined' && typeof filter.creditDateTo !== 'undefined') {
    creditMatch.$and.push({
      'credits.creditStartDate': { $gte: filter.creditDateFrom },
    });
    creditMatch.$and.push({
      'credits.creditStartDate': { $lte: filter.creditDateTo },
    });
  } else if (typeof filter.creditDateFrom !== 'undefined' || typeof filter.creditDateTo !== 'undefined') {
    match.$or.push({
      'credits.creditStartDate': { $gte: filter.creditDateFrom },
    });
    match.$or.push({
      'credits.creditStartDate': { $lte: filter.creditDateTo },
    });
  }

  // creditDaysRemainingFrom creditDaysRemainingTo
  if (typeof filter.creditDaysRemainingFrom !== 'undefined' && typeof filter.creditDaysRemainingTo !== 'undefined') {
    creditMatch.$and.push({
      'credits.creditTerm': { $gte: filter.creditDaysRemainingFrom },
    });
    creditMatch.$and.push({
      'credits.creditTerm': { $lte: filter.creditDaysRemainingTo },
    });
  } else if (typeof filter.creditDaysRemainingFrom !== 'undefined' || typeof filter.creditDaysRemainingTo !== 'undefined') {
    match.$or.push({
      'credits.creditTerm': { $gte: filter.creditDaysRemainingFrom },
    });
    match.$or.push({
      'credits.creditTerm': { $lte: filter.creditDaysRemainingTo },
    });
  }

  // totalLoginsFrom, totalLoginsTo
  if (typeof filter.totalLoginsFrom !== 'undefined' && typeof filter.totalLoginsTo !== 'undefined') {
    loginsMatch.$and.push({
      totalLogins: { $gte: filter.totalLoginsFrom },
    });
    loginsMatch.$and.push({
      totalLogins: { $lte: filter.totalLoginsTo },
    });
  } else if (typeof filter.totalLoginsFrom !== 'undefined') {
    match.$or.push({
      'clients.totalLogins': { $gte: filter.totalLoginsFrom },
    });
  } else if (typeof filter.totalLoginsTo !== 'undefined') {
    match.$or.push({
      'clients.totalLogins': { $lte: filter.totalLoginsTo },
    });
  }

  // currentMonthPayments, currentMonthIncome // TODO future

  // priceGroup
  if (typeof filter.priceGroup !== 'undefined') {
    match.priceGroup = { $eq: filter.priceGroup };
  }
  // provider check
  if (typeof filter.parentId !== 'undefined') {
    match.parent = { $eq: mongoose.Types.ObjectId(filter.parentId) };
  }

  // balanceFrom balanceTo
  if (typeof filter.balanceFrom !== 'undefined' && typeof filter.balanceTo !== 'undefined') {
    balanceMatch.$and.push({
      balance: { $gte: filter.balanceFrom },
    });
    balanceMatch.$and.push({
      balance: { $lte: filter.balanceTo },
    });
  } else if (typeof filter.balanceFrom !== 'undefined') {
    match.$or.push({
      balance: { $gte: filter.balanceFrom },
    });
  } else if (typeof filter.balanceTo !== 'undefined') {
    match.$or.push({
      balance: { $lte: filter.balanceTo },
    });
  }

  // debtFrom debtTo
  if (typeof filter.debtFrom !== 'undefined' && typeof filter.debtTo !== 'undefined') {
    debtMatch.$and.push({
      debt: { $gte: filter.debtFrom },
    });
    debtMatch.$and.push({
      debt: { $lte: filter.debtTo },
    });
  } else if (typeof filter.debtFrom !== 'undefined') {
    debtMatch.debt = { $gte: filter.debtFrom };
  } else if (typeof filter.debtTo !== 'undefined') {
    debtMatch.debt = { $lte: filter.debtTo };
  }

  if (typeof filter.dateFrom !== 'undefined' && typeof filter.dateTo !== 'undefined') {
    dateMatch.$and.push({
      createdAt: { $gte: filter.dateFrom },
    });
    dateMatch.$and.push({
      createdAt: { $lte: filter.dateTo },
    });
  } else if (typeof filter.dateFrom !== 'undefined') {
    dateMatch.createdAt = { $gte: filter.dateFrom };
  } else if (typeof filter.dateTo !== 'undefined') {
    dateMatch.createdAt = { $lte: filter.dateTo };
  }

  if (!match.$or.length) delete match.$or;
  if (!searchMatch.$or.length) delete searchMatch.$or;
  if (!clientMatch.$and.length) delete clientMatch.$and;
  if (!subMatch.$and.length) delete subMatch.$and;
  if (!resellerMatch.$and.length) delete resellerMatch.$and;
  if (!balanceMatch.$and.length) delete balanceMatch.$and;
  if (!debtMatch.$and.length) delete debtMatch.$and;
  if (!creditMatch.$and.length) delete creditMatch.$and;
  if (!dateMatch.$and.length) delete dateMatch.$and;
  if (!stateMatch.$or.length) delete stateMatch.$or;
  if (!loginsMatch.$and.length) delete loginsMatch.$and;

  const clientFilterMatchObject = [
    {
      $match: clientMatch,
    },
  ];
  const subFilterMatchObject = [
    {
      $match: subMatch,
    },
  ];
  const loginsFilterMatchObject = [
    {
      $match: loginsMatch,
    },
  ];
  const creditFilterMatchObject = [
    {
      $match: creditMatch,
    },
  ];
  const resellerFilterMatchObject = [
    {
      $match: resellerMatch,
    },
  ];
  const balanceFilterMatchObject = [
    {
      $match: balanceMatch,
    },
  ];
  const debtFilterMatchObject = [
    {
      $match: debtMatch,
    },
  ];
  const constFilter = [
    {
      $match: match,
    },
    {
      $match: searchMatch,
    },
    {
      $match: stateMatch,
    },
    {
      $match: dateMatch,
    },
  ];
  const lookupFilter = [
    {
      $lookup: {
        from: 'ottprovider_phones',
        localField: '_id',
        foreignField: 'providerId',
        as: 'phones',
      },
    },
    {
      $lookup: {
        from: 'ottprovider_address',
        localField: '_id',
        foreignField: 'providerId',
        as: 'addresses',
      },
    },
    {
      $lookup: {
        from: 'ottprovider_emails',
        localField: '_id',
        foreignField: 'providerId',
        as: 'emails',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'users',
      },
    },
    {
      $lookup: {
        from: 'ottprovider_invoice',
        localField: '_id',
        foreignField: 'providerId',
        as: 'invoices',
      },
    },
    {
      $lookup: {
        from: 'ottprovider_ui',
        localField: '_id',
        foreignField: 'providerId',
        as: 'uis',
      },
    },
    {
      $lookup: {
        from: 'ottproviders',
        // localField: '_id',
        // foreignField: 'parent',
        let: { id: '$_id' },
        as: 'resellers',
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$parent', '$$id'] },
            },
          },
          {
            $lookup: {
              from: 'clients',
              // localField: '_id',
              // foreignField: 'providerId',
              let: { id: '$_id' },
              as: 'clients',
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$provider', '$$id'] },
                  },
                },
                {
                  $match: {
                    status: 1,
                  },
                },
                {
                  $group: {
                    _id: null,
                    clientCount: { $sum: 1 },
                  },
                },
              ],
            },
          },
          {
            $group: {
              _id: null,
              resellerCount: { $sum: 1 },
              listOfResellers: { $push: '$_id' },
              listofClients: { $push: '$clients' },
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'price_groups',
        // localField: '_id',
        // foreignField: 'providerId',
        let: { id: '$priceGroup' },
        as: 'priceGroup',
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
      $lookup: {
        from: 'clients',
        // localField: '_id',
        // foreignField: 'providerId',
        let: { id: '$_id' },
        as: 'clients',
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$provider', '$$id'] },
            },
          },
          {
            $match: {
              status: 1,
            },
          },
          {
            $lookup: {
              from: 'client_locations',
              // localField: '_id',
              // foreignField: 'providerId',
              let: { id: '$_id' },
              as: 'locations',
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$clientId', '$$id'] },
                  },
                },
              ],
            },
          },
          {
            $group: {
              _id: null,
              clientCount: { $sum: 1 },
              listOfClients: { $push: '$_id' },
              locations: { $push: '$locations' },
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'registerBy',
        foreignField: '_id',
        as: 'registerBy',
      },
    },
    {
      $lookup: {
        from: 'credits',
        // localField: '_id',
        // foreignField: 'providerId',
        let: { id: '$_id' },
        as: 'credits',
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$providerId', '$$id'] },
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'transactions',
        // localField: '_id',
        // foreignField: 'providerId',
        let: { id: '$_id' },
        as: 'transactions',
        pipeline: [
          {
            $match: {
              state: 1,
            },
          },
          {
            $match: {
              $expr: { $eq: ['$from_provider', '$$id'] },
            },
          },
          {
            $project: {
              from_provider: 1,
              from_client: 1,
              to_client: 1,
              to_provider: 1,
              createdAt: 1,
              amount: 1,
            },
          },
        ],
      },
    },
    { $sort: sortObject },
  ];
  const finalAggregate = lookupFilter
    .concat(constFilter)
    .concat(clientFilterMatchObject)
    .concat(subFilterMatchObject)
    .concat(resellerFilterMatchObject)
    .concat(balanceFilterMatchObject)
    .concat(debtFilterMatchObject)
    .concat(creditFilterMatchObject)
    .concat(loginsFilterMatchObject);
  const channelMinMaxAggregate = constFilter
    .concat(clientFilterMatchObject)
    .concat(subFilterMatchObject)
    .concat(resellerFilterMatchObject)
    .concat(balanceFilterMatchObject)
    .concat(debtFilterMatchObject)
    .concat([{ $project: { channelAmount: 1 } }]);
  const resellersMinMaxAggregate = constFilter
    .concat(clientFilterMatchObject)
    .concat(subFilterMatchObject)
    .concat(balanceFilterMatchObject)
    .concat(debtFilterMatchObject)
    .concat([
      {
        $lookup: {
          from: 'ottproviders',
          localField: '_id',
          foreignField: 'parent',
          as: 'resellers',
        },
      },
      { $project: { resellers: 1 } },
    ]);

  const aggregate = OttProvider.aggregate(finalAggregate);
  const list = await OttProvider.aggregatePaginate(aggregate, curOptions);
  const channelMinMaxList = await OttProvider.aggregate(channelMinMaxAggregate);
  const resellersMinMaxList = await OttProvider.aggregate(resellersMinMaxAggregate);

  // const res = await OttProvider.find({});
  // res.forEach( function (x) {
  //   if (x.priceGroup) x.priceGroup = mongoose.Types.ObjectId(x.priceGroup); // convert field to string
  //   if (isNaN(x.timezone)) {
  //     x.timezone = 0;
  //   }
  //   x.save();
  // });

  list.docs.forEach((elem, i) => {
    list.docs[i].logins = [];
    list.docs[i].activeLogins = 0;
    list.docs[i].totalLogins = 0;
    list.docs[i].resellerAmount = 0;
    list.docs[i].inactiveLogin = 0;
    if (elem.balance && elem.balance < 0) {
      // eslint-disable-next-line no-param-reassign
      elem.debt = elem.balance;
    }
    // eslint-disable-next-line prefer-destructuring
    if (list.docs[i].priceGroup && list.docs[i].priceGroup.length) list.docs[i].priceGroup = list.docs[i].priceGroup[0];
    else delete list.docs[i].priceGroup;
    list.docs[i].activeLogins = 0;
    list.docs[i].inactiveLogin = 0;
    // if (elem.subs && elem.subs.length) {
    //   // eslint-disable-next-line no-param-reassign
    //   list.docs[i].activeLogins = elem.subs.length;
    //   elem.subs.forEach((e) => {
    //     if (!e.state) {
    //       list.docs[i].inactiveLogin = elem.subs.length;
    //     }
    //   });
    // }
    list.docs[i].clients.forEach((item) => {
      if (item.locations && item.locations.length) {
        // eslint-disable-next-line no-param-reassign
        item.locations = item.locations.length ? item.locations[0] : null;
        // eslint-disable-next-line no-param-reassign
        list.docs[i].totalLogins = item.locations.length;
      }
    });

    // transaction
    if (elem.transactions.length) {
      list.docs[i].currentMonthPayments = elem.transactions
        .map((r) => (!r.from_provider && r.createdAt.getMonth() !== new Date().getMonth() ? null : r.amount))
        .reduce((prev, next) => prev + next, 0);

      const trans = elem.transactions
        .map((r) =>
          r.to_provider !== user.provider._id && r.createdAt.getMonth() !== new Date().getMonth() ? null : r.amount
        )
        .reduce((prev, next) => prev + next, 0);
      let credit = 0;
      if (elem.credits.length) {
        credit = elem.credits.reduce((prev, next) => prev + next.creditAmount, 0);
      }
      list.docs[i].currentMonthIncome = credit + trans;
    }
    if (elem.resellers) {
      elem.resellers.forEach((item) => {
        list.docs[i].resellerAmount = item.resellerCount;
      });
    }
    list.docs[i].subProviderClients = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const reseller of elem.resellers) {
      // eslint-disable-next-line no-restricted-syntax
      for (const client of reseller.listofClients) {
        if (client.length) list.docs[i].subProviderClients += client[0].clientCount;
      }
    }

    list.docs[i].id = elem._id;
    list.docs[i].user = elem.users.length ? elem.users[0] : {};
    // list.docs[i].registerBy = list.docs[i].registerBy.length ? list.docs[i].registerBy[0] : {};
    delete list.docs[i]._id;
  });
  return {
    page: curOptions.page,
    limit: curOptions.limit,
    results: list.docs,
    totalPages: list.totalPages,
    totalResults: list.totalDocs,
    balanceMin: 0,
    balanceMax: 0,
    debtMin: 0,
    debtMax: 0,
    // eslint-disable-next-line prefer-spread
    resellersMin: Math.min.apply(
      Math,
      resellersMinMaxList.map(function (o) {
        return o.resellers.length;
      })
    ),
    // eslint-disable-next-line prefer-spread
    resellersMax: Math.max.apply(
      Math,
      resellersMinMaxList.map(function (o) {
        return o.resellers.length;
      })
    ),
    totalClients:
      list.docs
        .map((item) => item.clients.map((it) => it.clientCount).reduce((prev, next) => prev + next, 0))
        .reduce((prev, next) => prev + next, 0) +
      list.docs.map((item) => item.subProviderClients).reduce((prev, next) => prev + next, 0),
    totalResellers: resellersMinMaxList.map((item) => item.resellers.length).reduce((prev, next) => prev + next, 0),
    // eslint-disable-next-line prefer-spread
    totalLogins: Math.max.apply(
      Math,
      // eslint-disable-next-line array-callback-return
      list.docs.map(function (o) {
        return o.clients.map((item) => item.locations?.length);
      })
    ),
    // totalActiveLogins: list.docs.filter((item) => (item.subs.state ? item.subs.length : 0)).length,
    // totalInactiveLogins: list.docs.filter((item) => (item.subs.state ? 0 : item.subs.length)).length,
    totalActiveLogins: 0,
    totalInactiveLogins: 0,
    totalCurrentMonthPayments: list.docs
      .map((el) => (el.currentMonthPayments > 0 ? el.currentMonthPayments : null))
      .reduce((prev, next) => prev + next, 0),
    totalCurrentMonthIncome: list.docs
      .map((el) => (el.currentMonthIncome > 0 ? el.currentMonthIncome : null))
      .reduce((prev, next) => prev + next, 0),
    totalCreditFromParent: list.docs
      .map((item) => item.credits.reduce((prev, next) => prev + next.creditAmount, 0))
      .reduce((prev, next) => prev + next, 0),
    totalDebt: list.docs
      .map((el) => (el.balance && el.balance < 0 ? String(el.balance).slice(1) : null))
      .reduce((prev, next) => prev + Number(next), 0),
    // totalOwnChannels: ,
    // eslint-disable-next-line prefer-spread
    channelAmountMin: Math.min.apply(
      Math,
      channelMinMaxList.map(function (o) {
        return o.channelAmount;
      })
    ),
    // eslint-disable-next-line prefer-spread
    channelAmountMax: Math.max.apply(
      Math,
      channelMinMaxList.map(function (o) {
        return o.channelAmount;
      })
    ),
  };
};

/**
 * Update ottprovider by id
 * @param {ObjectId} ottproviderId
 * @param {Object} ottproviderBody
 * @returns {Promise<OttProvider>}
 */
const getCheckOttProviderKey = async (ottproviderBody, ottproviderId) => {
  const ottprovider = await getOttProviderById(ottproviderId);
  if (!ottprovider) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProvider not found');
  }
  // eslint-disable-next-line no-use-before-define
  const phone = await ottprovider.findOne({ phone, _id: { $ne: ottproviderId } });
  // eslint-disable-next-line no-use-before-define
  const email = await ottprovider.findOne({ email, _id: { $ne: ottproviderId } });
  return !!(phone || email);
};

/**
 * Get ottprovider by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderCategoryChannels = async (id, options = {}) => {
  const ottProvider = await OttProvider.findById(id, {}).populate({
    path: 'categoryChannels',
    populate: [
      {
        path: 'category',
      },
      {
        path: 'channels',
        populate: {
          path: 'channel',
        },
      },
    ],
  }); // ottProvider.categoryChannels[0].channels[0].id
  ottProvider.categoryChannels.forEach(function (item) {
    item.channels.sort((a, b) => (a.order > b.order ? 1 : -1));
  });
  return ottProvider.categoryChannels;
};

/**
 * Get ottprovider settings by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderSettings = async (id, options = {}) => {
  const ottProvider = await OttProvider.findById(id, {}); // ottProvider.categoryChannels[0].channels[0].id
  return ottProvider;
};

/**
 * Get ottproviders
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviders = async (filter = {}, populate = [], projection = null) => {
  const query = await OttProvider.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};
// const getOttProviders = async (filter = {}, populate = [], projection = null) => {
//   let query = OttProvider.find(filter);
//   if (populate.length > 0) {
//     query = query.populate(populate);
//   }
//   if (projection) {
//     query = query.select(projection);
//   }
//   return query.exec();
// };

/**
 * Get ottproviders
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const removeAll = async () => {
  return OttProvider.remove(); // ottProvider.categoryChannels[0].channels[0].id
};

/**
 * Get ottprovider settings by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderSalesTax = async (id, options = {}) => {
  const ottProvider = await OttProvider.findById(id, {}); // ottProvider.categoryChannels[0].channels[0].id
  if (!ottProvider) return ottProvider;
  return ottProvider;
};

/**
 * Get ottprovider address by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderAddress = async (id, options = {}) => {
  const ottProvider = await OttProvider.findById(id, {
    addresses: true,
  }); // ottProvider.categoryChannels[0].channels[0].id
  if (!ottProvider) return ottProvider;
  return ottProvider;
};

// eslint-disable-next-line no-unused-vars
const getOttProviderPaymentGateways = async (id, options = {}) => {
  const ottProvider = await OttProvider.findById(id, {}); // ottProvider.categoryChannels[0].channels[0].id
  if (!ottProvider) return ottProvider;
  return ottProvider;
};

// eslint-disable-next-line no-unused-vars
const getOttProviderShippingProviders = async (id, options = {}) => {
  const ottProvider = await OttProvider.findById(id, {}); // ottProvider.categoryChannels[0].channels[0].id
  if (!ottProvider) return ottProvider;
  return ottProvider;
};

/**
 * Get ottprovider settings by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProvider3Tabs = async (id, options = {}) => {
  const ottProvider = await OttProvider.findById(id, {}); // ottProvider.categoryChannels[0].channels[0].id
  return ottProvider;
};

/**
 * reset balances
 */
// eslint-disable-next-line no-unused-vars
const updateAll = async (filter = {}, fields = {}) => {
  await OttProvider.updateMany(filter, fields);
};

/**
 * reset balances
 */
// eslint-disable-next-line no-unused-vars
const updateOne = async (filter = {}, fields = {}) => {
  await OttProvider.updateOne(filter, fields);
};

/**
 * Update ottprovider by id
 * @param {ObjectId} ottproviderId
 * @param ottproviderBody
 * @returns {Promise<OttProvider>}
 */
const updateOttProviderById = async (ottproviderId, ottproviderBody) => {
  try {
    const ottProvider = await getOttProviderById(ottproviderId);
    if (!ottProvider) {
      throw new ApiError(httpStatus.NOT_FOUND, 'OttProvider not found');
    }
    ottProvider.name = ottproviderBody.companyName;
    ottProvider.website = ottproviderBody.website;
    ottProvider.timezone = ottproviderBody.timezone;
    ottProvider.clientAmount = ottproviderBody.clientAmount;
    ottProvider.channelAmount = ottproviderBody.channelAmount;
    ottProvider.description = ottproviderBody.description;
    ottProvider.comment = ottproviderBody.comment;
    ottProvider.priceGroup = ottproviderBody.priceGroup;
    ottProvider.country = ottproviderBody.country;
    ottProvider.editBy = ottproviderBody.user?._id;
    // eslint-disable-next-line no-undef
    // ottProvider.editBy = user.id;
    if (ottproviderBody.user) {
      const obj = {
        firstname: ottproviderBody.user.firstname,
        lastname: ottproviderBody.user.lastname,
        email: ottproviderBody.user.email,
        phone: ottproviderBody.user.phone,
      };
      if (ottproviderBody.user.password) {
        obj.password = ottproviderBody.user.password;
      }
      await updateUserById(ottProvider.user.id, obj);
    }
    // ottProvider.user = user._id;
    // Object.assign(ottprovider, updateBody);
    await ottProvider.save();
    return getOttTabs(ottproviderId);
  } catch (e) {
    throw new ApiError(httpStatus.BAD_REQUEST, e);
  }
};

/**
 * Update ottprovider by number
 * @param {ObjectId} number
 * @param body
 * @returns {Promise<OttProvider>}
 */
const updateOttProvidersByNumber = async (number, body) => {
  await OttProvider.updateMany({ number }, body);
};

/**
 * Update ottprovider paymentOptions
 * @param {ObjectId} ottproviderId
 * @param ottproviderBody
 * @returns {Promise<OttProvider>}
 */
const updatePaymentOptions = async (ottproviderId, ottproviderBody) => {
  const ottProvider = await getOttProviderById(ottproviderId);
  if (!ottProvider) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProvider not found');
  }
  ottProvider.paymentOptions = ottproviderBody;
  await ottProvider.save();
  return ottProvider?.paymentOptions;
};

/**
 * Get ottprovider paymentOptions
 * @param {ObjectId} id
 * @returns {Promise<OttProvider>}
 */
const getPaymentOptions = async (id) => {
  const ottProvider = await OttProvider.findById(id, {});
  return ottProvider.paymentOptions;
};

/**
 * Update ottprovider actions
 * @param {Object} updateBody
 * @returns {Promise<OttProvider>}
 */
const updateOttProviderAction = async (updateBody) => {
  if (!updateBody) throw new ApiError(httpStatus.BAD_REQUEST, 'OttProvider action not found');

  const ottProvider = updateBody.ottproviderId;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < ottProvider.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    const provider = await getOttProviderById(ottProvider[i]);

    if (updateBody.actionStatus === 'blockClient') {
      // eslint-disable-next-line no-await-in-loop
      const client = await Client.find({ provider });
      // eslint-disable-next-line no-restricted-syntax
      for (const item of client) {
        // eslint-disable-next-line no-await-in-loop
        const result = await clientRepository.getClientById(item);
        // eslint-disable-next-line no-await-in-loop
        await Client.updateMany(
          {
            _id: result._id,
          },
          { $set: { 'personalInfo.isBlocked': true } },
          { multi: true }
        );
      }
      // eslint-disable-next-line no-await-in-loop
      await OttProvider.updateMany(
        {
          _id: provider._id,
        },
        { $set: { actionStatus: updateBody.actionStatus } },
        { multi: true }
      );
    }
    // eslint-disable-next-line no-await-in-loop
    await OttProvider.updateMany(
      {
        _id: provider._id,
      },
      { $set: { actionStatus: updateBody.actionStatus } },
      { multi: true }
    );
  }
  return ottProvider;
};

/**
 * Update ottprovider by id
 * @param {ObjectId} ottproviderId
 * @param {Object} updateBody
 * @returns {Promise<OttProvider>}
 */
const addBalance = async (ottproviderId, balance) => {
  const ottProvider = await getOttProviderById(ottproviderId);
  if (!ottProvider) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProvider not found');
  }
  // await OttProvider.updateOne({
  //   _id: ottProvider._id.toString(),
  //   $set: { balance: ottProvider.balance + balance },
  //   // $set: { "companyAddress": companyAddress },
  // });
  await OttProvider.updateOne(
    {
      _id: ottProvider._id,
    },
    { $set: { balance: ottProvider.balance + balance } },
    { multi: false }
  );
  return getOttTabs(ottproviderId);
};

/**
 * Update ottprovider Address by id
 * @param {ObjectId} ottproviderId
 * @param {Object} updateBody
 * @returns {Promise<OttProvider>}
 */
const updateOttProviderAddressById = async (ottproviderId, updateBody) => {
  const ottprovider = await getOttProviderById(ottproviderId);
  if (!ottprovider) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProvider not found');
  }
  if (updateBody) {
    ottprovider.addresses = updateSubDocument(ottprovider, 'addresses', { addresses: updateBody }, 'addresses');
    // eslint-disable-next-line no-param-reassign
  }
  await ottprovider.save();
  return ottprovider.addresses;
};

/**
 * Update ottprovider Settings by id
 * @param {ObjectId} ottproviderId
 * @param {Object} updateBody
 * @returns {Promise<OttProvider>}
 */
const updateOttProviderSettingsById = async (ottproviderId, updateBody) => {
  const ottprovider = await getOttProviderById(ottproviderId);
  if (!ottprovider) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProvider not found');
  }
  if (updateBody) {
    ottprovider.settings = updateBody;
    // eslint-disable-next-line no-param-reassign
  }
  await ottprovider.save();
  return ottprovider.settings;
};

/**
 * Update ottprovider Sales Tax by id
 * @param {ObjectId} ottproviderId
 * @param {Object} updateBody
 * @returns {Promise<Object>}
 */
const updateOttProviderSalesTaxById = async (ottproviderId, updateBody) => {
  try {
    const ottprovider = await getOttProviderById(ottproviderId);
    if (!ottprovider) {
      throw new ApiError(httpStatus.NOT_FOUND, 'OttProvider not found');
    }
    if (updateBody) {
      // ottprovider.salesTax = updateBody;
      // // eslint-disable-next-line no-param-reassign
      // ottprovider.salesTax = updateSubDocument(ottprovider, 'salesTax', { salesTax: updateBody }, 'salesTax');

      if (typeof ottprovider.salesTax === 'undefined') ottprovider.salesTax = {};
      Object.assign(ottprovider.salesTax, updateBody);
    }
    await ottprovider.save();
    return ottprovider.salesTax;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

/**
 * Update ottprovider Shipping Provider by id
 * @param {ObjectId} ottproviderId
 * @param {Object} updateBody
 * @returns {Promise<OttProvider>}
 */
const updateOttProviderShippingProviderById = async (ottproviderId, updateBody) => {
  const ottprovider = await getOttProviderById(ottproviderId);
  if (!ottprovider) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProvider not found');
  }
  if (!ottprovider.shippingProvider) ottprovider.shippingProvider = {};
  Object.assign(ottprovider.shippingProvider, updateBody);
  await ottprovider.save();
  return ottprovider.shippingProvider;
};

/**
 * Approve ottprovider by id
 * @param {ObjectId} ottproviderId
 * @param {Object} updateBody
 * @param user
 * @returns {Promise<OttProvider>}
 */
const approveOttProviderById = async (ottproviderId, updateBody, user) => {
  const ottprovider = await getOttProviderById(ottproviderId);
  if (!ottprovider) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProvider not found');
  }
  if (user.provider && ottprovider.parent.id !== user.provider.id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You can Approve only your ott providers');
  }
  Object.assign(ottprovider, updateBody);
  await ottprovider.save();
  return ottprovider;
};

const approveProviders = async (providers) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const el of providers) {
    // eslint-disable-next-line no-await-in-loop
    const provider = await getOttProviderById(el.id);

    if (!provider) {
      throw new ApiError(httpStatus.NOT_FOUND, 'OttProvider not found');
    }

    // eslint-disable-next-line no-await-in-loop
    const user = await getUserById(provider.user);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    Object.assign(provider, { state: el.state });
    // eslint-disable-next-line no-await-in-loop
    await provider.save();

    Object.assign(user, { state: el.state });
    // eslint-disable-next-line no-await-in-loop
    await user.save();
    // eslint-disable-next-line no-await-in-loop
    if (el.state === USER_STATE.APPROVED) {
      // eslint-disable-next-line no-await-in-loop
      await EmailService.sendRegistrationApproveEmail(user.email, user.firstname);
    } else if (el.state === USER_STATE.REJECTED) {
      // eslint-disable-next-line no-await-in-loop
      await EmailService.sendRegistrationRejectEmail(user.email, user.firstname);
    }
  }
};

/**
 * Delete ottprovider by id
 * @param {ObjectId} ottproviderId
 * @returns {Promise<OttProvider>}
 */
const deleteOttProviderById = async (ottproviderId) => {
  const ottprovider = await getOttProviderById(ottproviderId);
  if (!ottprovider) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProvider not found');
  }
  return OttProvider.updateOne({ _id: ottprovider._id }, { $set: { status: 0 } }, { multi: false });
  // await ottprovider.remove();
  // return ottprovider;
};

/**
 * Delete ottprovider by action
 * @param {Object} updateBody
 * @returns {Promise<OttProvider>}
 */
const ottProvderActionDeleteById = async (updateBody) => {
  const item = updateBody.ottproviderId;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < item.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    const provider = await getOttProviderById(item[i]);
    // eslint-disable-next-line no-await-in-loop
    await OttProvider.updateOne({ _id: provider._id }, { $set: { status: 0 } }, { multi: true });
  }
  return item;
};

/**
 * Update CompanyAddress by ottproviderId
 * @param {ObjectId} ottproviderId
 * @returns {Promise<OttProvider>}
 */
const updateCompanyAddress = async (ottproviderId) => {
  const ottprovider = await getOttProviderById(ottproviderId);
  if (!ottprovider) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OttProvider not found');
  }
  await ottprovider.updateOne({
    ottproviderId,
    $set: { companyAddress: ottprovider.companyAddress },
    // $set: { "companyAddress": companyAddress },
    new: true,
  });
  return ottprovider;
};

/**
 * Update PaymentMethod by ottproviderId
 * @param {ObjectId} ottproviderId
 * @returns {Promise<OttProvider>}
 */
const updatePaymentMethod = async (ottproviderId) => {
  const ottprovider = await getOttProviderById(ottproviderId);
  if (!ottprovider) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OttProvider not found');
  }
  await ottprovider.updateOne({
    ottproviderId,
    $set: { paymentMethod: ottprovider.paymentMethod },
    new: true,
  });
  return ottprovider;
};

/**
 * Update BalanceCredit by ottproviderId
 * @param {ObjectId} ottproviderId
 * @returns {Promise<OttProvider>}
 */
const updateBalanceCredit = async (ottproviderId) => {
  const ottprovider = await getOttProviderById(ottproviderId);
  if (!ottprovider) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OttProvider not found');
  }
  await ottprovider.updateOne({
    ottproviderId,
    $set: { balanceCredit: ottprovider.balanceCredit },
    new: true,
  });
  return ottprovider;
};

/**
 * Update PaymentGateway by ottproviderId
 * @param {ObjectId} ottproviderId
 * @param updateBody
 * @returns {Promise<OttProvider>}
 */
const updateOttProviderPaymentGateway = async (ottproviderId, updateBody) => {
  const ottprovider = await getOttProviderById(ottproviderId);
  if (!ottprovider) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OttProvider not found');
  }
  await ottprovider.updateOne({
    ottproviderId,
    $set: { paymentGateway: updateBody },
    new: true,
  });
  return ottprovider;
};

/**
 * Update ShippingProviders by ottproviderId
 * @param {ObjectId} ottproviderId
 * @param updateBody
 * @returns {Promise<OttProvider>}
 */
const updateShippingProviders = async (ottproviderId, updateBody) => {
  const ottprovider = await getOttProviderById(ottproviderId);
  if (!ottprovider) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OttProvider not found');
  }
  await ottprovider.updateOne({
    ottproviderId,
    $set: { shippingProviders: updateBody },
    new: true,
  });
  return ottprovider;
};

/**
 * Update LabelReceiptPrinters by ottproviderId
 * @param {ObjectId} ottproviderId
 * @returns {Promise<OttProvider>}
 */
const updateLabelReceiptPrinters = async (ottproviderId) => {
  const ottprovider = await getOttProviderById(ottproviderId);
  if (!ottprovider) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OttProvider not found');
  }
  await ottprovider.updateOne({
    ottproviderId,
    $set: { labelReceiptPrinters: ottprovider.labelReceiptPrinters },
    new: true,
  });
  return ottprovider;
};

/**
 * Update UiAndAccessCustomization  by ottproviderId
 * @param {ObjectId} ottproviderId
 * @returns {Promise<OttProvider>}
 */
const updateUiAndAccessCustomization = async (ottproviderId) => {
  const ottprovider = await getOttProviderById(ottproviderId);
  if (!ottprovider) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OttProvider not found');
  }
  await ottprovider.updateOne({
    ottproviderId,
    $set: { uiAndAccessCustomization: ottprovider.uiAndAccessCustomization },
    new: true,
  });
  return ottprovider;
};

/**
 * Update InfoForClientsApp by ottproviderId
 * @param {ObjectId} ottproviderId
 * @returns {Promise<OttProvider>}
 */
const updateInfoForClientsApp = async (ottproviderId) => {
  const ottprovider = await getOttProviderById(ottproviderId);
  if (!ottprovider) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OttProvider not found');
  }
  await ottprovider.updateOne({
    ottproviderId,
    $set: { infoForClientsApp: ottprovider.infoForClientsApp },
    new: true,
  });
  return ottprovider;
};

/**
 * Update PermissionsAndSettings by ottproviderId
 * @param {ObjectId} ottproviderId
 * @returns {Promise<OttProvider>}
 */
const updatePermissionsAndSettings = async (ottproviderId) => {
  const ottprovider = await getOttProviderById(ottproviderId);
  if (!ottprovider) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OttProvider not found');
  }
  await ottprovider.updateOne({
    ottproviderId,
    $set: { permissionsAndSettings: ottprovider.permissionsAndSettings },
    new: true,
  });
  return ottprovider;
};
/**
 * Update BillInvoicesGeneration by ottproviderId
 * @param {ObjectId} ottproviderId
 * @returns {Promise<OttProvider>}
 */
const updateBillInvoicesGeneration = async (ottproviderId) => {
  const ottprovider = await getOttProviderById(ottproviderId);
  if (!ottprovider) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OttProvider not found');
  }
  await ottprovider.updateOne({
    ottproviderId,
    $set: { billInvoicesGeneration: ottprovider.billInvoicesGeneration },
    new: true,
  });
  return ottprovider;
};

/**
 * Update OtherApiIntegrations by ottproviderId
 * @param {ObjectId} ottproviderId
 * @returns {Promise<OttProvider>}
 */
const updateOtherApiIntegrations = async (ottproviderId) => {
  const ottprovider = await getOttProviderById(ottproviderId);
  if (!ottprovider) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OttProvider not found');
  }
  await ottprovider.updateOne({
    ottproviderId,
    $set: { otherApiIntegrations: ottprovider.otherApiIntegrations },
    new: true,
  });
  return ottprovider;
};

/**
 * Get list
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getList = async (filter = {}, populate = [], projection = null) => {
  const query = OttProvider.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

module.exports = {
  getList,
  updatePaymentOptions,
  getPaymentOptions,
  resetBalances,
  updateOne,
  createOttProvider,
  addBalance,
  createBaseOttProvider,
  createOttProviderByAdmin,
  queryOttProviders,
  queryRegistrationOttProviders,
  getBaseOttProvider,
  getOttProviderSettings,
  getOttProviders,
  getOttProviderSalesTax,
  getOttProviderShippingProviders,
  getOttProviderAddress,
  getOttProvider3Tabs,
  getOttProviderById,
  getOttProviderCategoryChannels,
  getOttProviderPaymentGateways,
  getCheckOttProviderKey,
  updateOttProviderAction,
  updateOttProviderById,
  updateOttProviderAddressById,
  updateOttProviderSalesTaxById,
  updateOttProviderPaymentGateway,
  updateOttProviderShippingProviderById,
  approveOttProviderById,
  deleteOttProviderById,
  ottProvderActionDeleteById,
  approveProviders,
  updateOttProviderSettingsById,
  resetTimezones,
  updateCompanyAddress,
  updatePaymentMethod,
  updateBalanceCredit,
  updateShippingProviders,
  updateLabelReceiptPrinters,
  updateUiAndAccessCustomization,
  updateInfoForClientsApp,
  updatePermissionsAndSettings,
  updateBillInvoicesGeneration,
  updateOtherApiIntegrations,
  isEmailTaken,
  getOttTabs,
  getOttChilds,
  getOttParents,
  updateOttProvidersByNumber,
  updateAll,
};
