/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const moment = require('moment-timezone');
// eslint-disable-next-line no-unused-vars
const { Client, Subscription } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');
const { updateSubDocument } = require('../../utils/repository/subdocument_update');
const logger = require('../../utils/logger/logger');
const priceUtils = require('../../utils/price/price_utils');
const { hideCardNumber } = require('../../api/validations/custom.validation');

const clientPopulateObject = [
  // {
  //   path: 'payment.balance.currency',
  //   model: 'Currency',
  // },
  // {
  //   path: 'payment.balance.priceGroup',
  //   model: 'PriceGroup',
  // },
  {
    path: 'provider',
  },
];

const removeMain = async (clientId) => {
  if (clientId) {
    await Client.updateMany(
      {
        clientId,
      },
      { $set: { 'emails.$.isMain': false } },
      { multi: true }
    );
  }
};

const selectOneMain = async (clientId) => {
  if (clientId) {
    await Client.updateOne(
      {
        clientId,
      },
      { $set: { isMain: true } },
      { multi: false }
    );
  }
};

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Client>}
 */
// eslint-disable-next-line no-unused-vars
const getClientById = async (id, options = {}) => {
  const client = await Client.findById(id).populate(
    clientPopulateObject.concat([{ path: 'locations' }, { path: 'finance.forPackages' }])
  );
  return client;
};

/**
 * reset balances
 */
// eslint-disable-next-line no-unused-vars
const resetBalances = async () => {
  await Client.updateMany({}, { balance: 0 });
};

/**
 * reset timezone
 */
// eslint-disable-next-line no-unused-vars
const resetTimezones = async () => {
  await Client.updateMany({}, { 'finance.timezone': '' });
};

/**
 * Get settings by client id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Client>}
 */
// eslint-disable-next-line no-unused-vars
const getClientSettingsById = async (id, options = {}) => {
  return Client.findById(id, {});
};

/**
 * Create a item package
 * @param {Object} itemBody
 * @param user
 * @returns {Promise<Client>}
 */
const createClient = async (itemBody, user) => {
  const body = itemBody;
  // eslint-disable-next-line no-console
  if (!itemBody.provider && (!user || !user.provider)) throw new ApiError('client has no provider while creating');
  if (user) {
    body.user = user._id;
    if (itemBody.personalInfo.provider) {
      // TODO check if subprovider (security check)
      body.provider = itemBody.personalInfo.provider;
    } else {
      body.provider = user.provider.id;
    }
  }
  const created = await Client.create(body);
  return getClientById(created.id);
};

/**
 * Check a client Email Phone
 * @param {Object} itemBody
 * @returns {Promise<Client>}
 */
const clientCheckEmailPhone = async (itemBody = {}) => {
  const responseObject = {
    isDublicated: false,
    duplicateClients: [],
  };
  let searchProvider = null;
  if (itemBody.client) {
    const client = await Client.findById(itemBody.client);
    searchProvider = client?.provider?.toString();
  }
  if (itemBody.email) {
    responseObject.isDublicated = await Client.isEmailTaken(itemBody.email);
    if (responseObject.isDublicated) {
      const searchFilter = { 'emails.email': itemBody.email, status: 1 };
      if (searchProvider) searchFilter.provider = searchProvider;
      responseObject.duplicateClients = await Client.find(searchFilter);
      if (!responseObject.duplicateClients.length) responseObject.isDublicated = false;
    }
  }
  if (itemBody.phone) {
    responseObject.isDublicated = await Client.isPhoneTaken(itemBody.phone);
    if (responseObject.isDublicated) {
      const escapedPhone = itemBody.phone.replace(/\+/g, '\\+');
      // eslint-disable-next-line security/detect-non-literal-regexp
      const regex = new RegExp(`^${escapedPhone}$`);
      const searchFilter = { 'phones.phone': regex, status: 1 };
      if (searchProvider) searchFilter.provider = searchProvider;
      responseObject.duplicateClients = await Client.find(searchFilter);
      if (!responseObject.duplicateClients.length) responseObject.isDublicated = false;
    }
  }
  return responseObject;
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryClients = async (filter, options, user) => {
  const isLimited = !user.rolesInfo.admin;
  const curOptions = {
    page: isLimited ? 1 : options.page ?? 1,
    limit: isLimited ? 10 : options.limit ?? 20,
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
      if (parts[0] === 'packageExpire') parts[0] = 'info.locations.subscriptionExpireDate';
      sortObject[parts[0]] = parts[1] === 'desc' ? -1 : 1;
      sortBy.push(`${parts[0]}:${parts[1]}`);
    }
  } else {
    sortObject._id = -1;
    sortBy.push(`_id:desc`);
  }

  curOptions.sortBy = sortBy;

  const match = {};
  const searchMatch = {};
  const balanceMatch = {};
  const expiredMatch = {};
  const resellerMatch = {};
  const debtMatch = {};
  const creditMatch = {};
  searchMatch.$or = [];
  resellerMatch.$and = [];
  balanceMatch.$and = [];
  debtMatch.$and = [];
  expiredMatch.$and = [];
  creditMatch.$and = [];
  match.$or = [];
  // search filter
  // if (filter.search && filter.search.length) {
  //   filter.search.replace('%20', ' ');
  //   searchMatch.$or.push({
  //     'personalInfo.firstname': { $regex: `.*${filter.search}.*`, $options: 'i' },
  //   });
  //   searchMatch.$or.push({
  //     'personalInfo.lastname': { $regex: `.*${filter.search}.*`, $options: 'i' },
  //   });
  //   searchMatch.$or.push({
  //     'emails.email': { $regex: `.*${filter.search}.*`, $options: 'i' },
  //   });
  //   searchMatch.$or.push({
  //     'addresses.address': { $regex: `.*${filter.search}.*`, $options: 'i' },
  //   });
  //   searchMatch.$or.push({
  //     'locations.login': { $regex: `.*${filter.search}.*`, $options: 'i' },
  //   });
  //   // searchMatch._id = { $regex: `.*${filter.search}.*` };
  // }
  //
  // // currency
  // if (typeof filter.currency !== 'undefined') {
  //   match.$or.push({
  //     'finance.currency': { $eq: mongoose.Types.ObjectId(filter.currency) },
  //   });
  // }
  // // priceGroup
  // if (filter.priceGroup) {
  //   match.$or.push({
  //     'finance.priceGroup': { $eq: mongoose.Types.ObjectId(filter.priceGroup) },
  //   });
  // }
  //
  // // paymentMethod
  // if (typeof filter.paymentMethod !== 'undefined' && filter.paymentMethod.length >= 4) {
  //   match.$or.push({
  //     'payments.creditCard.cardNumber': { $regex: `.*${filter.paymentMethod}.*` },
  //   });
  //   match.$or.push({
  //     'payments.bankTransfer.accountNumber': { $regex: `.*${filter.paymentMethod}.*` },
  //   });
  // }
  //
  // // timezone
  // if (typeof filter.timezone !== 'undefined') {
  //   match.$or.push({
  //     'locations.timezone': { $eq: filter.timezone },
  //   });
  // }
  // // server
  // if (typeof filter.server !== 'undefined') {
  //   match.$or.push({
  //     'locations.server': { $regex: `.*${filter.server}.*` },
  //   });
  // }
  // // isBlocked
  // if (typeof filter.isBlocked !== 'undefined') {
  //   match.$or.push({
  //     'locations.isBlockLocation': { $eq: filter.isBlocked },
  //   });
  // }
  // // inPaused
  // if (typeof filter.inPaused !== 'undefined') {
  //   // match.personalInfo.inPaused = { $eq: filter.inPaused };
  //   match.$or.push({
  //     'locations.isPauseSubscriptions': { $eq: filter.inPaused },
  //   });
  // }
  // // rooms
  // if (typeof filter.roomsCount !== 'undefined') {
  //   // match.locations.roomsCount = { $eq: filter.roomsCount };
  //   match.$or.push({
  //     'locations.roomsCount': { $eq: filter.roomsCount },
  //   });
  // }
  // // if (typeof filter.creditExpired !== 'undefined') {
  // // }
  // // if (typeof filter.packageExpired !== 'undefined') {
  // // }
  //
  // // creditAutoExtend
  // if (typeof filter.creditAutoExtend !== 'undefined') {
  //   match.$or.push({
  //     'credits.creditAutoextend': { $eq: filter.creditAutoExtend },
  //   });
  // }

  // creditAmountFrom creditAmountTo
  // if (typeof filter.creditAmountFrom !== 'undefined' && typeof filter.creditAmountTo !== 'undefined') {
  //   creditMatch.$and.push({
  //     'credits.creditAmount': { $gte: filter.creditAmountFrom },
  //   });
  //   creditMatch.$and.push({
  //     'credits.creditAmount': { $lte: filter.creditAmountTo },
  //   });
  // } else if (typeof filter.creditAmountFrom !== 'undefined') {
  //   match.$or.push({
  //     'credits.creditAmount': { $gte: filter.creditAmountFrom },
  //   });
  // } else if (typeof filter.creditAmountTo !== 'undefined') {
  //   match.$or.push({
  //     'credits.creditAmount': { $lte: filter.creditAmountTo },
  //   });
  // }

  // creditDateFrom creditDateTo
  // if (typeof filter.creditDateFrom !== 'undefined' && typeof filter.creditDateTo !== 'undefined') {
  //   creditMatch.$and.push({
  //     'credits.creditStartDate': { $gte: filter.creditDateFrom },
  //   });
  //   creditMatch.$and.push({
  //     'credits.creditStartDate': { $lte: filter.creditDateTo },
  //   });
  // } else if (typeof filter.creditDateFrom !== 'undefined' || typeof filter.creditDateTo !== 'undefined') {
  //   match.$or.push({
  //     'credits.creditStartDate': { $gte: filter.creditDateFrom },
  //   });
  //   match.$or.push({
  //     'credits.creditStartDate': { $lte: filter.creditDateTo },
  //   });
  // }

  // creditDaysRemainingFrom creditDaysRemainingTo
  // if (typeof filter.creditDaysRemainingFrom !== 'undefined' && typeof filter.creditDaysRemainingTo !== 'undefined') {
  //   creditMatch.$and.push({
  //     'credits.creditTerm': { $gte: filter.creditDaysRemainingFrom },
  //   });
  //   creditMatch.$and.push({
  //     'credits.creditTerm': { $lte: filter.creditDaysRemainingTo },
  //   });
  // } else if (typeof filter.creditDaysRemainingFrom !== 'undefined' || typeof filter.creditDaysRemainingTo !== 'undefined') {
  //   match.$or.push({
  //     'credits.creditTerm': { $gte: filter.creditDaysRemainingFrom },
  //   });
  //   match.$or.push({
  //     'credits.creditTerm': { $lte: filter.creditDaysRemainingTo },
  //   });
  // }
  // balanceFrom balanceTo
  // if (typeof filter.balanceFrom !== 'undefined' && typeof filter.balanceTo !== 'undefined') {
  //   balanceMatch.$and.push({
  //     balance: { $gte: filter.balanceFrom },
  //   });
  //   balanceMatch.$and.push({
  //     balance: { $lte: filter.balanceTo },
  //   });
  // } else if (typeof filter.balanceFrom !== 'undefined') {
  //   match.$or.push({
  //     balance: { $gte: filter.balanceFrom },
  //   });
  // } else if (typeof filter.balanceTo !== 'undefined') {
  //   match.$or.push({
  //     balance: { $lte: filter.balanceTo },
  //   });
  // }

  // debtFrom debtTo
  // if (typeof filter.debtFrom !== 'undefined' && typeof filter.debtTo !== 'undefined') {
  //   debtMatch.$and.push({
  //     debt: { $gte: filter.debtFrom },
  //   });
  //   debtMatch.$and.push({
  //     debt: { $lte: filter.debtTo },
  //   });
  // } else if (typeof filter.debtFrom !== 'undefined') {
  //   debtMatch.debt = { $gte: filter.debtFrom };
  // } else if (typeof filter.debtTo !== 'undefined') {
  //   debtMatch.debt = { $lte: filter.debtTo };
  // }

  // packageExpireDate from ... to
  // if (typeof filter.packageExpireDateFrom !== 'undefined' && typeof filter.packageExpireDateTo !== 'undefined') {
  //   expiredMatch.$and.push({
  //     'subscriptions.endDate': { $gte: filter.packageExpireDateFrom },
  //   });
  //   expiredMatch.$and.push({
  //     'subscriptions.endDate': { $lte: filter.packageExpireDateTo },
  //   });
  // } else if (typeof filter.packageExpireDateFrom !== 'undefined') {
  //   match.$or.push({
  //     'subscriptions.endDate': { $gte: filter.packageExpireDateFrom },
  //   });
  // } else if (typeof filter.packageExpireDateTo !== 'undefined') {
  //   match.$or.push({
  //     'subscriptions.endDate': { $lte: filter.packageExpireDateTo },
  //   });
  // }

  // // activePackagesFrom
  // if (typeof filter.activePackagesFrom !== 'undefined' && typeof filter.activePackagesTo !== 'undefined') {
  //   expiredMatch.$and.push({
  //     'locations.activePackages': { $gte: filter.activePackagesFrom },
  //   });
  //   expiredMatch.$and.push({
  //     'locations.activePackages': { $lte: filter.activePackagesTo },
  //   });
  // } else if (typeof filter.activePackagesFrom !== 'undefined') {
  //   match.$or.push({
  //     'locations.activePackages': { $gte: filter.activePackagesFrom },
  //   });
  // } else if (typeof filter.activePackagesTo !== 'undefined') {
  //   match.$or.push({
  //     'locations.activePackages': { $lte: filter.activePackagesTo },
  //   });
  // }

  const clientFilter = {};
  if (filter.search && filter.search.length) {
    filter.search.replace('%20', ' ');
    // eslint-disable-next-line security/detect-non-literal-regexp
    const regex = new RegExp(filter.search, 'i');
    clientFilter.$and = [
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
  if (filter.autopayment) {
    clientFilter['finance.forPackages'] = { $ne: null };
  }
  if (filter.packageExpireDateFrom && filter.packageExpireDateTo) {
    if (!clientFilter.$and) {
      clientFilter.$and = [];
    }

    // Input timezone string
    const timezoneString = user.provider.timezone;

    // Get the current offset in minutes
    const offsetInMinutes = moment.tz(timezoneString).utcOffset();

    // Convert offset to hours and minutes
    const offsetHours = Math.floor(offsetInMinutes / 60);
    // filter.packageExpireDateFrom = new Date(Date.UTC(2023, 9, 2, 12, 0, 0));
    // filter.packageExpireDateTo = new Date(Date.UTC(2023, 9, 2, 12, 0, 0));
    filter.packageExpireDateFrom = new Date(filter.packageExpireDateFrom);
    filter.packageExpireDateFrom.setHours(0, 0, 0);

    // Get the time zone offset in minutes
    let timeZoneOffsetInMinutes = moment(filter.packageExpireDateFrom).utcOffset();

    // Convert the offset to hours
    let timeZoneOffsetInHours = timeZoneOffsetInMinutes / 60;

    // Add the offset hours to the date
    filter.packageExpireDateFrom.setHours(filter.packageExpireDateFrom.getHours() + timeZoneOffsetInHours - offsetHours);
    filter.packageExpireDateTo = new Date(filter.packageExpireDateTo);
    filter.packageExpireDateTo.setHours(23, 59, 59);

    // Get the time zone offset in minutes
    timeZoneOffsetInMinutes = moment(filter.packageExpireDateTo).utcOffset();

    // Convert the offset to hours
    timeZoneOffsetInHours = timeZoneOffsetInMinutes / 60;

    // Add the offset hours to the date
    filter.packageExpireDateTo.setHours(filter.packageExpireDateTo.getHours() + timeZoneOffsetInHours - offsetHours);
    clientFilter.$and.push({
      'info.locations': {
        $elemMatch: {
          subscriptionExpireDate: {
            $gte: filter.packageExpireDateFrom,
            $lte: filter.packageExpireDateTo,
          },
        },
      },
    });

    // const curCLients = await Client.find({
    //   'info.locations': {
    //     $elemMatch: {
    //       subscriptionExpireDate: {
    //         $gte: filter.packageExpireDateFrom,
    //         $lte: filter.packageExpireDateTo,
    //       },
    //     },
    //   },
    // });

    // const subs = await Subscription.find({
    //   state: 1,
    //   provider: '645799071c5b7b1510f5388c',
    //   isActive: 1,
    //   endDate: {
    //     $gte: filter.packageExpireDateFrom,
    //     $lte: filter.packageExpireDateTo,
    //   },
    // });

    // const newSubscriptionsDict = subs.reduce((obj, item) => {
    //   // eslint-disable-next-line no-param-reassign
    //   if (!obj[item.client.toString()]) {
    //     obj[item.client.toString()] = [];
    //   }
    //   obj[item.client.toString()].push(item);
    //   return obj;
    // }, {});
    // const subClients = Object.keys(newSubscriptionsDict);
    // const a = 1;
  }

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
  if (typeof filter.subscriptionState !== 'undefined' && !filter.statusFilterType) {
    clientFilter.subscriptionState = filter.subscriptionState;
  }

  if (filter.statusFilterType && typeof filter.subscriptionState !== 'undefined') {
    if (filter.statusFilterType === 'client') {
      clientFilter.subscriptionState = filter.subscriptionState;
    } else if (filter.statusFilterType === 'location') {
      if (!clientFilter.$and) {
        clientFilter.$and = [];
      }
      clientFilter.$and.push({
        'info.locations': {
          $elemMatch: {
            subscriptionState: filter.subscriptionState,
          },
        },
      });
    }
  }
  clientFilter.status = { $eq: 1 };
  clientFilter.provider = { $in: filter.providers };
  const start = new Date();
  const clients = await Client.paginate(clientFilter, curOptions, {}, [
    {
      path: 'provider',
    },
    {
      path: 'locations',
      populate: {
        path: 'server',
      },
    },
    {
      path: 'paymentMethods',
    },
    {
      path: 'credits',
    },
    {
      path: 'transactions',
    },
    {
      path: 'finance',
      populate: [
        {
          path: 'priceGroup',
        },
        {
          path: 'forPackages',
          select: ['creditCard'],
        },
      ],
    },
  ]);
  const end = new Date();
  logger.info(`clients query duration duration: ${end.getTime() - start.getTime()}`);
  clients.results.forEach((current, i) => {
    const elem = current.toJSON();
    clients.results[i] = elem;
    // in Pause and block parts
    let pauseCount = 0;
    let blockCount = 0;
    if (elem?.finance?.forPackages?.creditCard?.cardNumber) {
      elem.finance.forPackages.creditCard.cardNumber = hideCardNumber(elem?.finance?.forPackages?.creditCard.cardNumber);
      elem.finance.forPackages.creditCard.cvc = '***';
    }
    if (typeof filter.subscriptionState !== 'undefined' && filter.statusFilterType === 'location') {
      elem.locations = elem.locations.filter((a) => a.subscriptionState === filter.subscriptionState);
      if (elem.info.locations)
        elem.info.locations = elem.info.locations.filter((a) => a.subscriptionState === filter.subscriptionState);
      elem.subscriptionState = filter.subscriptionState;
    }
    elem.locations.forEach((item) => {
      if (item.isPauseSubscriptions) pauseCount += 1;
      if (item.isBlockLocation) blockCount += 1;
      const foundInfo = elem.info.locations.filter((c) => c.login === item.login)[0];
      // eslint-disable-next-line no-param-reassign
      item.activePackages = foundInfo?.packageSubscriptions?.length || 0;
      // eslint-disable-next-line prefer-destructuring
      const myArray = item.subscriptions;
      if (myArray.length) {
        const min = Math.min.apply(
          null,
          myArray.map(function (a) {
            return a.endDate;
          })
        );
        // eslint-disable-next-line no-param-reassign
        item.packageExpireDate = new Date(min);
      }
      const subs = item.subscriptions[item.subscriptions.length - 1];
      // eslint-disable-next-line no-param-reassign
      elem.subscriptionRecurringPayment = subs?.recurringPayment ? subs?.recurringPayment : null;
    });
    let inPause = 0;
    if (pauseCount !== 0) {
      if (pauseCount === elem.locations.length) {
        inPause = 1;
      } else {
        inPause = 2;
      }
    }
    // eslint-disable-next-line no-param-reassign
    elem.inPause = inPause;
    let inBlock = 0;
    if (blockCount !== 0) {
      if (blockCount === elem.locations.length) {
        inBlock = 1;
      } else {
        inBlock = 2;
      }
    }
    // eslint-disable-next-line no-param-reassign
    elem.inBlock = inBlock;
    // credits
    if (elem.credits.length) {
      const currentCredit = elem.credits[elem.credits.length - 1];
      if (currentCredit.days) {
        // eslint-disable-next-line no-param-reassign
        elem.creditExpireDate = priceUtils.addUTCDays(currentCredit.creditStartDate, currentCredit.creditTerm);
      }
      if (currentCredit.months) {
        // eslint-disable-next-line no-param-reassign
        elem.creditExpireDate = priceUtils.addMonths(currentCredit.creditStartDate, currentCredit.creditTerm);
      }
      // eslint-disable-next-line no-param-reassign
      elem.daysRemain = priceUtils.dateDiffDays(new Date(), elem.creditExpireDate);
      // eslint-disable-next-line no-param-reassign
      elem.creditAutoextend = currentCredit.creditAutoextend;
    }
    // // transaction
    if (elem.transactions.length) {
      elem.monthlyPayments = current.transactions
        .map((r) => (!r.from_client && r.createdAt.getMonth() !== new Date().getMonth() ? null : r.amount))
        .reduce((prev, next) => prev + next, 0);

      const item = current.transactions[current.transactions.length - 1];
      if (item.sourcePay) {
        if (item.sourcePay.cardNumber) {
          elem.lastPaymentMethod = {
            cardNumber: item.sourcePay.cardNumber.replace(/.(?=.{4})/g, ''),
            brand: item.sourcePay.brand,
          };
        }
        if (item.sourcePay.accountNumber) {
          elem.lastPaymentMethod = { accountNumber: item.sourcePay.accountNumber, brand: item.sourcePay.bankName };
        }
      }
    }
  });
  return clients;
  // .explain('executionStats')
  // return ClientPaymentMethod.find({ clientId: { $in: [...clients.map((r) => r._id.toString())] } }).explain('executionStats');

  // const lookupFilter = [
  // {
  //   $lookup: {
  //     from: 'credits',
  //     // localField: '_id',
  //     // foreignField: 'providerId',
  //     let: { id: '$_id' },
  //     as: 'credits',
  //     pipeline: [
  //       {
  //         $match: {
  //           $expr: { $eq: ['$clientId', '$$id'] },
  //         },
  //       },
  //       {
  //         $match: {
  //           state: 1,
  //         },
  //       },
  //     ],
  //   },
  // },
  // {
  //   $lookup: {
  //     from: 'client_locations',
  //     // localField: '_id',
  //     // foreignField: 'providerId',
  //     let: { id: '$_id' },
  //     as: 'locations',
  //     pipeline: [
  //       {
  //         $lookup: {
  //           from: 'subscriptions',
  //           // localField: '_id',
  //           // foreignField: 'providerId',
  //           let: { id: '$_id' },
  //           as: 'subscriptions',
  //           pipeline: [
  //             {
  //               $match: {
  //                 state: 1,
  //               },
  //             },
  //             {
  //               $match: {
  //                 $expr: { $eq: ['$location', '$$id'] },
  //               },
  //             },
  //           ],
  //         },
  //       },
  //       {
  //         $match: {
  //           $expr: { $eq: ['$clientId', '$$id'] },
  //         },
  //       },
  //     ],
  //   },
  // },
  // {
  //   $lookup: {
  //     from: 'client_payment_methods',
  //     // localField: '_id',
  //     // foreignField: 'clientId',
  //     let: { id: '$_id' },
  //     as: 'payments',
  //     pipeline: [
  //       {
  //         $match: {
  //           $expr: { $eq: ['$clientId', '$$id'] },
  //         },
  //       },
  //       // { $project: { bankTransfer: 1, _id: 0 } },
  //     ],
  //   },
  // },
  // {
  //   $lookup: {
  //     from: 'transactions',
  //     // localField: '_id',
  //     // foreignField: 'providerId',
  //     let: { id: '$_id' },
  //     as: 'transactions',
  //     pipeline: [
  //       {
  //         $match: {
  //           state: 1,
  //         },
  //       },
  //       {
  //         $match: {
  //           $expr: { $eq: ['$from_client', '$$id'] },
  //         },
  //       },
  //     ],
  //   },
  // },
  // { $sort: sortObject },
  // ];
  // const finalAggregate = lookupFilter;
  // .concat(constFilter)
  // .concat(resellerFilterMatchObject)
  // .concat(balanceFilterMatchObject)
  // .concat(debtFilterMatchObject)
  // .concat(creditFilterMatchObject)
  // .concat(expiredFilterMatchObject);
  // const aggregate = Client.aggregate(finalAggregate).explain('executionStats');
  // return aggregate;
  // const list = await Client.aggregatePaginate(aggregate, curOptions);
  //
  // list.docs.forEach((elem, i) => {
  // list.docs[i].id = elem._id;
  // if (elem.balance && elem.balance < 0) {
  //   // eslint-disable-next-line no-param-reassign
  //   elem.debt = elem.balance;
  // }
  // // subscriptions
  // // eslint-disable-next-line prefer-destructuring
  // if (list.docs[i].priceGroupObject.length) list.docs[i].priceGroupObject = list.docs[i].priceGroupObject[0];
  // else delete list.docs[i].priceGroupObject;
  // let pauseCount = 0;
  // let blockCount = 0;
  // list.docs[i].locations.forEach((item) => {
  //   if (item.isPauseSubscriptions) pauseCount += 1;
  //   if (item.isBlockLocation) blockCount += 1;
  //   // eslint-disable-next-line no-param-reassign
  //   item.activePackages = item.subscriptions?.length;
  //   // eslint-disable-next-line prefer-destructuring
  //
  //   const myArray = item.subscriptions;
  //   if (myArray.length) {
  //     const min = Math.min.apply(
  //       null,
  //       myArray.map(function (a) {
  //         return a.endDate;
  //       })
  //     );
  //     // eslint-disable-next-line no-param-reassign
  //     item.packageExpireDate = new Date(min);
  //   }
  //   const subs = item.subscriptions[item.subscriptions.length - 1];
  //   // eslint-disable-next-line no-param-reassign
  //   elem.subscriptionRecurringPayment = subs?.recurringPayment ? subs?.recurringPayment : null;
  // });
  //
  // let inPause = 0;
  // if (pauseCount !== 0) {
  //   if (pauseCount === list.docs[i].locations.length) {
  //     inPause = 1;
  //   } else {
  //     inPause = 2;
  //   }
  // }
  // // eslint-disable-next-line no-param-reassign
  // elem.inPause = inPause;
  //
  // let inBlock = 0;
  // if (blockCount !== 0) {
  //   if (blockCount === list.docs[i].locations.length) {
  //     inBlock = 1;
  //   } else {
  //     inBlock = 2;
  //   }
  // }
  // // eslint-disable-next-line no-param-reassign
  // elem.inBlock = inBlock;
  //
  //
  // // credits
  // if (elem.credits.length) {
  //   const currentCredit = elem.credits[elem.credits.length - 1];
  //   if (currentCredit.days) {
  //     // eslint-disable-next-line no-param-reassign
  //     elem.creditExpireDate = priceUtils.addUTCDays(currentCredit.creditStartDate, currentCredit.creditTerm);
  //   }
  //   if (currentCredit.months) {
  //     // eslint-disable-next-line no-param-reassign
  //     elem.creditExpireDate = priceUtils.addMonths(currentCredit.creditStartDate, currentCredit.creditTerm);
  //   }
  //   // eslint-disable-next-line no-param-reassign
  //   elem.daysRemain = priceUtils.dateDiffDays(new Date(), elem.creditExpireDate);
  //   // eslint-disable-next-line no-param-reassign
  //   elem.creditAutoextend = currentCredit.creditAutoextend;
  // }
  // delete list.docs[i]._id;
  // });

  // for some users access to the table should be limited
  // const accessToTable = !filter.search ? [] : list.docs;
  // const { cashier } = user.rolesInfo;
  // return {
  //   results: cashier ? accessToTable : list.docs,
  //   page: list.page,
  //   limit: list.limit,
  //   totalPages: list.totalPages,
  //   totalResults: list.totalDocs,
  //   balanceMin: 0,
  //   balanceMax: 0,
  //   debtMin: 0,
  //   debtMax: 0,
  // };
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const getClientsByName = async (filter, options, user) => {
  const curOptions = {
    page: options.page ?? 1,
    all: options.all ?? false,
    limit: options.all ? 10000000 : options.limit ?? 10,
  };
  // const curOptions = {
  //   page: 1,
  //   limit: 30,
  // };
  // Client.find({ })
  // const result = await Client.find({ $expr: { $and: lookupFilter } }).exec();
  let search = filter.search.replace('%20', ' ');
  search = filter.search.replaceAll('+', '');

  const phoneRegexPattern = search.split('').join('\\s*-?');

  if (filter.search) {
    const clients = await Client.paginate(
      {
        $and: [
          {
            $or: [
              {
                $expr: {
                  $regexMatch: {
                    input: { $concat: ['$personalInfo.firstname', ' ', '$personalInfo.lastname'] },
                    regex: search,
                    options: 'i',
                  },
                },
              },
              { 'info.locations.login': { $regex: search, $options: 'i' } },
              { 'phones.phone': { $regex: phoneRegexPattern, $options: 'i' } },
              { 'addresses.address': { $regex: search, $options: 'i' } },
              {
                $expr: {
                  $regexMatch: {
                    input: {
                      $reduce: {
                        input: {
                          $map: {
                            input: '$addresses',
                            in: {
                              $replaceAll: {
                                input: {
                                  $concat: [
                                    '$$this.address',
                                    '$$this.suite',
                                    '$$this.city',
                                    '$$this.province',
                                    '$$this.zip',
                                  ],
                                },
                                find: ' ',
                                replacement: '',
                              },
                            },
                          },
                        },
                        initialValue: '',
                        in: { $concat: ['$$value', '$$this'] },
                      },
                    },
                    regex: search.replaceAll(' ', ''),
                    options: 'i',
                  },
                },
              },
            ],
          },
          { provider: { $in: filter.providers } },
          { status: 1 },
        ],
      },
      curOptions,
      {},
      [
        {
          path: 'provider',
        },
        {
          path: 'locations',
        },
      ]
    );

    clients.results.forEach((current, i) => {
      const elem = current.toJSON();
      clients.results[i] = elem;
      // in Pause and block parts
      let pauseCount = 0;
      let blockCount = 0;
      elem.locations.forEach((item) => {
        if (item.isPauseSubscriptions) pauseCount += 1;
        if (item.isBlockLocation) blockCount += 1;
        // eslint-disable-next-line no-param-reassign
        item.activePackages = item.subscriptions?.length;
        // eslint-disable-next-line prefer-destructuring
        const myArray = item.subscriptions;
        if (myArray.length) {
          const min = Math.min.apply(
            null,
            myArray.map(function (a) {
              return a.endDate;
            })
          );
          // eslint-disable-next-line no-param-reassign
          item.packageExpireDate = new Date(min);
        }
        const subs = item.subscriptions[item.subscriptions.length - 1];
        // eslint-disable-next-line no-param-reassign
        elem.subscriptionRecurringPayment = subs?.recurringPayment ? subs?.recurringPayment : null;
      });
      let inPause = 0;
      if (pauseCount !== 0) {
        if (pauseCount === elem.locations.length) {
          inPause = 1;
        } else {
          inPause = 2;
        }
      }
      // eslint-disable-next-line no-param-reassign
      elem.inPause = inPause;
      let inBlock = 0;
      if (blockCount !== 0) {
        if (blockCount === elem.locations.length) {
          inBlock = 1;
        } else {
          inBlock = 2;
        }
      }
      // eslint-disable-next-line no-param-reassign
      elem.inBlock = inBlock;
      // credits
    });
    return clients;
  }

  return [];
};

/**
 * check email
 * @param clientId
 * @param {Object} updateBody
 * @returns {Promise<Client>}
 */
const updateClientEmailById = async (clientId, updateBody) => {
  const item = await getClientById(clientId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientEmail not found');
  }
  if (item && item.emails && item.emails.length) {
    const list = item.emails[item.emails.length - 1];
    const mainUpdated = list.isMain !== updateBody.isMain;
    if (mainUpdated) {
      if (updateBody.isMain) {
        await removeMain(item._id);
      } else {
        await selectOneMain(item._id);
      }
    }
  }
  Object.assign(item, updateBody);
  await item.save();
  return item;
};

/**
 * Update item by id
 * @param {ObjectId} clientId
 * @param {Object} updateBody
 * @returns {Promise<Client>}
 */
const updateClientById = async (clientId, updateBody) => {
  try {
    const item = await getClientById(clientId);
    if (!item) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');
    }
    if (updateBody?.personalInfo?.provider && updateBody?.personalInfo?.provider !== item?.provider._id?.toString()) {
      // TODO important check if provider exists
      item.provider = updateBody.personalInfo.provider;
    }
    if (updateBody.phones) {
      item.phones = updateSubDocument(item, 'phones', updateBody, 'phones');
      // eslint-disable-next-line no-param-reassign
      delete updateBody.phones;
    }
    if (updateBody.emails) {
      // eslint-disable-next-line no-restricted-syntax,guard-for-in
      for (const i in updateBody.emails) {
        const val = updateBody.emails[i];
        // eslint-disable-next-line no-await-in-loop
        try {
          // eslint-disable-next-line no-await-in-loop
          await updateClientEmailById(item._id, val);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
        }
      }
    }
    if (updateBody.notifications) {
      item.notifications = updateSubDocument(item, 'notifications', updateBody, 'notifications');
      // eslint-disable-next-line no-param-reassign
      delete updateBody.notifications;
    }
    if (updateBody.addresses) {
      item.addresses = updateSubDocument(item, 'addresses', updateBody, 'addresses');
      // eslint-disable-next-line no-param-reassign
      delete updateBody.addresses;
    }
    // paperlessBilling check, if client have one for Contacts/Invoices email
    // if (item.emails) {
    //   // esli`h
    //   for (let i = 0; i < item.emails.length; i++) {
    //     if (item.emails[i].forContactInvoice) {
    //       item.finance.paperlessBilling = true;
    //       // eslint-disable-next-line no-await-in-loop
    //       await item.save();
    //     }
    //   }
    // }
    // return item;
    Object.assign(item, updateBody);
    await item.save();
    return getClientById(clientId);
  } catch (e) {
    throw new ApiError(httpStatus.BAD_REQUEST, e);
  }
};

/**
 * Update channel by actions
 * @param clientIdList
 * @param {Object} updateBody
 * @returns {Promise<Client>}
 */
const updateClientAction = async (clientIdList, updateBody) => {
  if (!updateBody) throw new ApiError(httpStatus.BAD_REQUEST, 'Client action not found');
  // eslint-disable-next-line no-plusplus,no-restricted-syntax
  for (const clientId of clientIdList) {
    // eslint-disable-next-line no-await-in-loop
    const client = await getClientById(clientId);
    if (updateBody.server) {
      // eslint-disable-next-line no-await-in-loop
      await client.locations.map(function (l) {
        return l.server;
      });
      // eslint-disable-next-line no-await-in-loop
      await Client.updateOne(
        {
          _id: client._id,
        },
        { $set: { 'location.server': updateBody.server } },
        { multi: true }
      );
    }
  }
};

/**
 * Update client Settings by id
 * @param {ObjectId} clientId
 * @param {Object} updateBody
 * @returns {Promise<OttProvider>}
 */
const updateClientSettingsById = async (clientId, updateBody) => {
  const item = await getClientById(clientId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');
  }
  if (updateBody) {
    item.settings = updateBody;
    // eslint-disable-next-line no-param-reassign
  }
  await item.save();
  return item.settings;
};

/**
 * Update client total price by id
 * @param {ObjectId} clientId
 * @param totalPrice
 * @returns {Promise<Client>}
 */
const addTotalPrice = async (clientId, totalPrice) => {
  const client = await getClientById(clientId);
  if (!client) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');
  }
  await Client.updateOne(
    {
      _id: client._id,
    },
    { $set: { totalPrice: client.totalPrice + totalPrice } },
    { multi: false }
  );
  return client;
};

/**
 * Update client by id
 * @param {ObjectId} clientId
 * @param {Object} balance
 * @returns {Promise<Client>}
 */
const addBalance = async (clientId, balance) => {
  const client = await getClientById(clientId);
  if (!client) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');
  }
  return Client.updateOne(
    {
      _id: client._id,
    },
    { $set: { balance: client.balance + balance } },
    { multi: false }
  );
};

/**
 * Delete item by id
 * @param {ObjectId} clientId
 * @returns {Promise<Client>}
 */
const deleteClientById = async (clientId) => {
  const client = await getClientById(clientId);
  return Client.updateOne({ _id: client._id }, { $set: { status: 0 } }, { multi: false });
};

/**
 * Delete item by id
 * @param {Object} updateBody
 * @returns {Promise<Client>}
 */
const clientActionDeleteById = async (updateBody) => {
  const item = updateBody.clientId;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < item.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    const client = await getClientById(item[i]);
    // eslint-disable-next-line no-await-in-loop
    await Client.updateOne({ _id: client._id }, { $set: { status: 0 } }, { multi: true });
  }
  return item;
};

/**
 * get client isMain email
 * @param {ObjectId} clientId
 * @returns {Promise<Client>}
 */
const getClientEmailById = async (clientId) => {
  const item = await getClientById(clientId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');
  }
  const newItem = item.emails;
  // eslint-disable-next-line no-restricted-syntax,guard-for-in
  for (const i in newItem) {
    if (newItem[i].isMain) {
      return newItem[i].email;
    }
    if (!newItem[i].isMain) {
      return null;
    }
  }
  // throw new ApiError(httpStatus.BAD_REQUEST, 'Email has not isMain email address');
};

/**
 * get client firstname
 * @param {ObjectId} clientId
 * @returns {Promise<Client>}
 */
const getClientFirstname = async (clientId) => {
  const item = await getClientById(clientId);
  return item.personalInfo.firstname;
};

/**
 * Get client by id
 * @param {ObjectId} filter
 * @returns {Promise<User>}
 */
const getAll = async (filter) => {
  return Client.find(filter);
};

/**
 * update many
 */
// eslint-disable-next-line no-unused-vars
const updateAll = async (filter = {}, fields = {}) => {
  await Client.updateMany(filter, fields);
};

/**
 * delete many
 */
// eslint-disable-next-line no-unused-vars
const deleteMany = async (filter = {}) => {
  await Client.deleteMany(filter);
};

module.exports = {
  resetBalances,
  getAll,
  deleteMany,
  updateAll,
  resetTimezones,
  createClient,
  queryClients,
  getClientsByName,
  getClientById,
  getClientSettingsById,
  clientCheckEmailPhone,
  updateClientById,
  updateClientAction,
  deleteClientById,
  clientActionDeleteById,
  addTotalPrice,
  addBalance,
  updateClientEmailById,
  updateClientSettingsById,
  getClientEmailById,
  getClientFirstname,
};
