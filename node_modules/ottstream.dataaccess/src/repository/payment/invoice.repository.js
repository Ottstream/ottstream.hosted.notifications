/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const priceUtils = require('../../utils/price/price_utils');
// eslint-disable-next-line no-unused-vars
const { Invoice, Server } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');
const ottProviderRepository = require('../ottprovider/ottprovider.repository');
// const userRepository = require('../user/user.repository');
const { randomNumberSequence } = require('../../utils/crypto/random');

/**
 * Get invoice by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Invoice>}
 */
const getInvoiceById = async (id) => {
  return Invoice.findById(id);
};

/**
 * Create a invoice
 * @param filter
 * @param user
 * @returns {Promise<Invoice>}
 */

const getInvoices = async (filter, user) => {
  const _filter = filter;
  _filter.provider = user.provider._id.toString();
  return Invoice.find(_filter);
};

/**
 * Delete invoice by id
 * @param {ObjectId} invoiceId
 * @returns {Promise<Invoice>}
 */
const deleteInvoiceById = async (invoiceId) => {
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invoice not found');
  }
  await invoice.remove();
  return invoice;
};

/**
 * Create a invoice
 * @param {Object} invoiceBody
 * @param user
 * @returns {Promise<Invoice>}
 */
const createInvoice = async (invoiceBody, user) => {
  const body = invoiceBody;
  if (user._id) body.user = user._id;

  body.number = `INV-${randomNumberSequence(6)}`;

  const invoice = await Invoice.create(body);
  if (invoice && invoice._id && invoice.invoice) {
    await ottProviderRepository.addInvoice(invoice.providerId, invoice.invoice);
  }
  return invoice;
};

/**
 * Create left days invoice
 * @param generateDisplayInfo
 * @param amount
 * @param {Object} _payload
 * @param payloadCalculated
 * @param to
 * @param clientId
 * @param user
 * @returns {Promise<Invoice>}
 */
// eslint-disable-next-line no-unused-vars
const createLeftDaysInvoice = async (amount, _payload, payloadCalculated, generateDisplayInfo, to, clientId, user) => {
  const body = {
    payload: _payload,
    payloadCalculated,
    generateDisplayInfo,
    type: 2,
    from_type: 2,
    from_client: clientId,
    state: 2,
    number: `INV-${randomNumberSequence(6)}`,
    startDate: new Date(),
    client: clientId,
    amount,
    totalAmount: amount,
    to_type: 1,
    to_provider: to,
    provider: user.provider._id.toString(),
  };
  // check if exists subsciption Invice
  // const invoices = await getInvoices(
  //   {
  //     type: 1,
  //     state: 2,
  //     client: clientId,
  //   },
  //   user
  // );
  // // remove old ones
  // // eslint-disable-next-line no-restricted-syntax
  // for (const item of invoices) {
  //   // eslint-disable-next-line no-await-in-loop
  //   await deleteInvoiceById(item._id);
  // }
  if (user._id) body.user = user._id;
  return Invoice.create(body);
};

/**
 * Create a invoice
 * @param generateDisplayInfo
 * @param amount
 * @param {Object} _payload
 * @param payloadCalculated
 * @param to
 * @param clientId
 * @param location
 * @param user
 * @returns {Promise<Invoice>}
 */
const createSubscriptionInvoice = async (
  type,
  autopayment,
  amount,
  _payload,
  payloadCalculated,
  generateDisplayInfo,
  to,
  clientId,
  location,
  user
) => {
  const body = {
    payload: _payload,
    payloadCalculated,
    generateDisplayInfo,
    type,
    from_type: 2,
    from_client: clientId,
    state: 2,
    number: `INV-${randomNumberSequence(6)}`,
    startDate: new Date(),
    client: clientId,
    location,
    amount,
    autopayment,
    totalAmount: amount,
    to_type: 1,
    to_provider: to,
    provider: to,
  };
  // check if exists subsciption Invice
  // const invoices = await getInvoices(
  //   {
  //     type: 1,
  //     state: 2,
  //     client: clientId,
  //   },
  //   user
  // );
  // // remove old ones
  // // eslint-disable-next-line no-restricted-syntax
  // for (const item of invoices) {
  //   // eslint-disable-next-line no-await-in-loop
  //   await deleteInvoiceById(item._id);
  // }
  if (user._id) body.user = user._id;
  return Invoice.create(body);
};

/**
 * Create a invoice
 * @param generateDisplayInfo
 * @param amount
 * @param {Object} _payload
 * @param payloadCalculated
 * @param to
 * @param clientId
 * @param user
 * @returns {Promise<Invoice>}
 */

const createSubscriptionRefundInvoice = async (
  amount,
  _payload,
  payloadCalculated,
  generateDisplayInfo,
  to,
  clientId,
  user
) => {
  const body = {
    payload: _payload,
    payloadCalculated,
    generateDisplayInfo,
    type: 1,
    from_type: 1,
    from_provider: to,
    state: 2,
    number: `INV-${randomNumberSequence(6)}`,
    startDate: new Date(),
    client: clientId,
    amount: Math.abs(amount),
    totalAmount: Math.abs(amount),
    to_type: 2,
    to_client: clientId,
    provider: to,
  };
  // // check if exists subsciption Invice
  // const invoices = await getInvoices(
  //   {
  //     type: 1,
  //     state: 2,
  //     client: clientId,
  //   },
  //   user
  // );
  // // remove old ones
  // // eslint-disable-next-line no-restricted-syntax
  // for (const item of invoices) {
  //   // eslint-disable-next-line no-await-in-loop
  //   await deleteInvoiceById(item._id);
  // }
  if (user._id) body.user = user._id;
  return Invoice.create(body);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
const queryInvoices = async (filter, options, user) => {
  const _filter = filter;
  _filter.provider = user.provider._id.toString();
  return Invoice.paginate(_filter, options, {}, [
    {
      path: 'client',
      // populate: [
      //   {
      //     path: 'client_payment_methods',
      //   },
      // ],
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
const queryBillInvoicesV2 = async (filter, options, user) => {
  // const isLimited = !user.rolesInfo.admin;
  const curOptions = {
    page: options.page ?? 1,
    all: options.all ?? false,
    limit: options.all ? 10000000 : options.limit ?? 20,
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
      sortObject[parts[0]] = parts[1] === 'desc' ? -1 : 1;
      sortBy.push(`${parts[0]}:${parts[1]}`);
    }
  } else {
    sortObject._id = -1;
    sortBy.push(`executionDate:desc`);
  }

  curOptions.sortBy = sortBy;
  const invoiceFilter = {};
  if (filter.search && filter.search.length) {
    filter.search.replace('%20', ' ');
    // eslint-disable-next-line security/detect-non-literal-regexp
    const regex = new RegExp(filter.search, 'i');
    invoiceFilter.$and = [
      {
        $or: [{ number: regex }],
      },
    ];
  }

  if (filter.dateForPayStart && filter.dateForPayEnd) {
    if (!invoiceFilter.$and) {
      invoiceFilter.$and = [];
    }

    // Input timezone string
    const timezoneString = user.provider.timezone;

    // Get the current offset in minutes
    const offsetInMinutes = moment.tz(timezoneString).utcOffset();

    // Convert offset to hours and minutes
    const offsetHours = Math.floor(offsetInMinutes / 60);
    // filter.dateForPayStart = new Date(Date.UTC(2023, 9, 2, 12, 0, 0));
    // filter.dateForPayEnd = new Date(Date.UTC(2023, 9, 2, 12, 0, 0));
    filter.dateForPayStart = new Date(filter.dateForPayStart);
    filter.dateForPayStart.setHours(0, 0, 0);

    // Get the time zone offset in minutes
    let timeZoneOffsetInMinutes = moment(filter.dateForPayStart).utcOffset();

    // Convert the offset to hours
    let timeZoneOffsetInHours = timeZoneOffsetInMinutes / 60;

    // Add the offset hours to the date
    filter.dateForPayStart.setHours(filter.dateForPayStart.getHours() + timeZoneOffsetInHours - offsetHours);
    filter.dateForPayEnd = new Date(filter.dateForPayEnd);
    filter.dateForPayEnd.setHours(23, 59, 59);

    // Get the time zone offset in minutes
    timeZoneOffsetInMinutes = moment(filter.dateForPayEnd).utcOffset();

    // Convert the offset to hours
    timeZoneOffsetInHours = timeZoneOffsetInMinutes / 60;

    // Add the offset hours to the date
    filter.dateForPayEnd.setHours(filter.dateForPayEnd.getHours() + timeZoneOffsetInHours - offsetHours);
    invoiceFilter.$and.push({
      createdAt: {
        $gte: filter.dateForPayStart,
        $lte: filter.dateForPayEnd,
      },
    });
  }

  if (filter.dateForBillSentStart && filter.dateForBillSentEnd) {
    if (!invoiceFilter.$and) {
      invoiceFilter.$and = [];
    }

    // Input timezone string
    const timezoneString = user.provider.timezone;

    // Get the current offset in minutes
    const offsetInMinutes = moment.tz(timezoneString).utcOffset();

    // Convert offset to hours and minutes
    const offsetHours = Math.floor(offsetInMinutes / 60);
    // filter.dateForBillSentStart = new Date(Date.UTC(2023, 9, 2, 12, 0, 0));
    // filter.dateForBillSentEnd = new Date(Date.UTC(2023, 9, 2, 12, 0, 0));
    filter.dateForBillSentStart = new Date(filter.dateForBillSentStart);
    filter.dateForBillSentStart.setHours(0, 0, 0);

    // Get the time zone offset in minutes
    let timeZoneOffsetInMinutes = moment(filter.dateForBillSentStart).utcOffset();

    // Convert the offset to hours
    let timeZoneOffsetInHours = timeZoneOffsetInMinutes / 60;

    // Add the offset hours to the date
    filter.dateForBillSentStart.setHours(filter.dateForBillSentStart.getHours() + timeZoneOffsetInHours - offsetHours);
    filter.dateForBillSentEnd = new Date(filter.dateForBillSentEnd);
    filter.dateForBillSentEnd.setHours(23, 59, 59);

    // Get the time zone offset in minutes
    timeZoneOffsetInMinutes = moment(filter.dateForBillSentEnd).utcOffset();

    // Convert the offset to hours
    timeZoneOffsetInHours = timeZoneOffsetInMinutes / 60;

    // Add the offset hours to the date
    filter.dateForBillSentEnd.setHours(filter.dateForBillSentEnd.getHours() + timeZoneOffsetInHours - offsetHours);
    invoiceFilter.$and.push({
      updatedAt: {
        $gte: filter.dateForBillSentStart,
        $lte: filter.dateForBillSentEnd,
      },
    });
  }

  if (typeof filter.subscriptionAmountFrom !== 'undefined' && typeof filter.subscriptionAmountTo !== 'undefined') {
    if (!invoiceFilter.$and) {
      invoiceFilter.$and = [];
    }
    invoiceFilter.$and.push({
      totalAmount: {
        $gte: filter.subscriptionAmountFrom,
        $lte: filter.subscriptionAmountTo,
      },
    });
  }

  if (filter.paymentStatus?.length) {
    const statuses = [];
    if (filter.paymentStatus.filter((r) => r === 2).length) statuses.push(2);
    if (filter.paymentStatus.filter((r) => r === 1).length) statuses.push(1);
    invoiceFilter.state = { $in: statuses };
  }

  if (filter.billSentMethod?.length) {
    const sentTypes = [];
    if (filter.billSentMethod.filter((r) => r === 1).length) {
      sentTypes.push('postal');
    }
    if (filter.billSentMethod.filter((r) => r === 2).length) {
      sentTypes.push('print');
    }
    if (filter.billSentMethod.filter((r) => r === 3).length) {
      sentTypes.push('email');
    }
    if (sentTypes.length) {
      invoiceFilter.sentType = { $in: sentTypes };
    }
  }

  if (filter.transactionType) {
    invoiceFilter.transaction_type = filter.transactionType;
  }
  if (typeof filter.isRefund !== 'undefined') {
    if (filter.isRefund) invoiceFilter.isRefund = filter.isRefund;
    else invoiceFilter.isRefund = { $ne: true };
  }

  if (filter.own && !filter.resellers?.length) {
    // invoiceFilter.provider = { $eq: filter.providers.length ? filter.providers[0]filter.baseprovider };
    // invoiceFilter.provider = filter.baseprovider;
  }

  if (typeof filter.autopayment !== 'undefined') {
    invoiceFilter.autopayment = filter.autopayment;
  }
  if (typeof filter.transactionState !== 'undefined') {
    invoiceFilter.state = filter.transactionState;
  }
  if (typeof filter.merchant !== 'undefined') {
    if (!invoiceFilter.$and) {
      invoiceFilter.$and = [];
    }
    invoiceFilter.$and.push({
      'sourcePay.merchant': {
        $eq: filter.merchant,
      },
    });
  }

  if (filter.client) {
    invoiceFilter.client = { $eq: filter.client };
  } else if (filter.providers.length) {
    invoiceFilter.provider = { $in: filter.providers };
  }
  invoiceFilter.type = 2;
  if (typeof filter.sent !== 'undefined') {
    invoiceFilter.sent = filter.sent;
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
  // invoiceFilter.status = { $eq: 1 };
  // invoiceFilter.provider = { $in: filter.providers };
  invoiceFilter.fixed = { $ne: true };
  const invoiceResults = await Invoice.paginate(invoiceFilter, curOptions, {}, [
    {
      path: 'provider',
    },
    {
      path: 'client',
    },
    {
      path: 'user',
    },
  ]);

  const allInvoices = await Invoice.find(
    { ...invoiceFilter },
    {
      sent: 1,
      totalAmount: 1,
      createdAt: 1,
    }
  );
  const sent = allInvoices.filter((r) => r.sent).length;
  const inQueue = allInvoices.filter((r) => !r.sent).length;

  const totalSum = allInvoices.reduce((total, invoice) => {
    return total + invoice.totalAmount; // replace yourFieldName with the field you want to calculate the sum of
  }, 0);

  return { totalSum, sent, inQueue, invoiceResults };
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryBillInvoices = async (filter, options, user) => {
  // return Invoice.paginate(filter, options, {});
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
  const clientMatch = {};
  const searchMatch = {};
  const rangeMatch = {};
  searchMatch.$or = [];
  clientMatch.$or = [];
  match.$or = [];
  rangeMatch.$and = [];

  // search filter
  if (filter.search && filter.search.length) {
    searchMatch.$or.push({
      number: { $regex: `.*${filter.search}.*`, $options: 'i' },
    });
    searchMatch.$or.push({
      'client.personalInfo.firstname': { $regex: `.*${filter.search}.*`, $options: 'i' },
    });
    searchMatch.$or.push({
      'client.personalInfo.lastname': { $regex: `.*${filter.search}.*`, $options: 'i' },
    });
    searchMatch.$or.push({
      'client.phones.phone': { $regex: `.*${filter.search}.*`, $options: 'i' },
    });
    searchMatch.$or.push({
      'client.emails.email': { $regex: `.*${filter.search}.*`, $options: 'i' },
    });
    searchMatch.$or.push({
      'client.addresses.address': { $regex: `.*${filter.search}.*`, $options: 'i' },
    });
    searchMatch.$or.push({
      'transaction.number': { $regex: `.*${filter.search}.*` },
    });
  }
  // if (filter.client) {
  //   clientMatch.$and = [];
  //   clientMatch.$and.push({
  //     from_client: mongoose.Types.ObjectId(filter.client),
  //   });
  // }

  // const elemMatches = [];
  // filter.providers.forEach((providerId) => {
  //   // elemMatches.push({ $elemMatch:discounts { id: mongoose.Types.ObjectId(role) } });
  //   elemMatches.push(mongoose.Types.ObjectId(providerId));
  // });
  // // match['roles._id'] = mongoose.Types.ObjectId(roles[0]);
  //
  // match.provider = {
  //   $in: elemMatches,
  // };

  const providers = [];
  filter.providers.forEach((provider) => {
    providers.push(mongoose.Types.ObjectId(provider));
  });
  match.provider = { $in: providers };

  if (filter.type) {
    match.type = filter.type;
  }
  if (filter.searchLogin) {
    match.$or = [
      {
        // eslint-disable-next-line security/detect-non-literal-regexp
        'payloadCalculated.locations.locationLogin': { $regex: new RegExp(`.*${filter.searchLogin}.*`, 'i') },
      },
    ];
  }

  if (filter.searchCardNumber && filter.searchCardNumber.length >= 4) {
    match.$or = [
      {
        // eslint-disable-next-line security/detect-non-literal-regexp
        'transaction.sourcePay.cardNumber': { $regex: new RegExp(`.*${filter.searchCardNumber}.*`, 'i') },
      },
      {
        // eslint-disable-next-line security/detect-non-literal-regexp
        'transaction.sourcePay.accountNumber': { $regex: new RegExp(`.*${filter.searchCardNumber}.*`, 'i') },
      },
    ];
  }

  if (typeof filter.sent !== 'undefined') {
    match.sent = filter.sent;
  }

  if (filter.paymentActonBy) {
    // eslint-disable-next-line no-plusplus
    // for (let i = 0; i < filter.paymentActonBy; i++) {
    //   match.from_type = { $eq: filter.paymentActonBy };
    // }
    match.from_type = { $eq: filter.paymentActonBy };
  }

  if (filter.paymentMethod) {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < filter.paymentMethod; i++) {
      match.$or = [
        {
          'transaction.transaction_type': { $regex: `.*${filter.paymentMethod}.*`, $options: 'i' },
        },
      ];
    }
  }

  if (filter.paymentStatus) {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < filter.paymentStatus; i++) {
      match.state = { $eq: filter.paymentStatus };
    }
  }

  if (typeof filter.subscriptionAmountFrom !== 'undefined' && typeof filter.subscriptionAmountTo !== 'undefined') {
    rangeMatch.$and.push({
      'payloadCalculated.locations.totalPrice': { $gte: filter.subscriptionAmountFrom },
    });
    rangeMatch.$and.push({
      'payloadCalculated.locations.totalPrice': { $lte: filter.subscriptionAmountTo },
    });
  } else if (typeof filter.subscriptionAmountFrom !== 'undefined') {
    match.$or.push({
      'payloadCalculated.locations.totalPrice': { $eq: filter.subscriptionAmountFrom },
    });
  } else if (typeof filter.subscriptionAmountTo !== 'undefined') {
    match.$or.push({
      'payloadCalculated.locations.totalPrice': { $eq: filter.subscriptionAmountTo },
    });
  }

  if (typeof filter.totalAmountFrom !== 'undefined' && typeof filter.totalAmountTo !== 'undefined') {
    rangeMatch.$and.push({
      amount: { $gte: filter.totalAmountFrom },
    });
    rangeMatch.$and.push({
      amount: { $lte: filter.totalAmountTo },
    });
  } else if (typeof filter.totalAmountFrom !== 'undefined') {
    match.amount = { $eq: filter.totalAmountFrom };
  } else if (typeof filter.totalAmountTo !== 'undefined') {
    match.amount = { $eq: filter.totalAmountTo };
  }

  // paymentActionTime
  if (typeof filter.dateForPaymentStart !== 'undefined' && typeof filter.dateForPaymentEnd !== 'undefined') {
    rangeMatch.$and.push({
      'transaction.createdAt': { $gte: filter.dateForPaymentStart },
    });
    rangeMatch.$and.push({
      'transaction.createdAt': { $lte: filter.dateForPaymentEnd },
    });
  } else if (typeof filter.dateForPaymentStart !== 'undefined') {
    match.$or.push({
      'transaction.createdAt': { $gte: filter.dateForPaymentStart },
    });
  } else if (typeof filter.dateForPaymentEnd !== 'undefined') {
    match.$or.push({
      'transaction.createdAt': { $lte: filter.dateForPaymentEnd },
    });
  }

  // lastSentTime
  if (typeof filter.dateForBillSentStart !== 'undefined' && typeof filter.dateForBillSentEnd !== 'undefined') {
    rangeMatch.$and.push({
      'transaction.updatedAt': { $gte: filter.dateForBillSentStart },
    });
    rangeMatch.$and.push({
      'transaction.updatedAt': { $lte: filter.dateForBillSentEnd },
    });
  } else if (typeof filter.dateForBillSentStart !== 'undefined') {
    match.$or.push({
      'transaction.updatedAt': { $gte: filter.dateForBillSentStart },
    });
  } else if (typeof filter.dateForBillSentEnd !== 'undefined') {
    match.$or.push({
      'transaction.updatedAt': { $lte: filter.dateForBillSentEnd },
    });
  }

  if (!match.$or.length) delete match.$or;
  if (!searchMatch.$or.length) delete searchMatch.$or;
  if (!clientMatch.$or.length) delete clientMatch.$or;
  if (!rangeMatch.$and.length) delete rangeMatch.$and;
  const constFilter = [
    {
      $match: match,
    },
    {
      $match: searchMatch,
    },
    {
      $match: clientMatch,
    },
    {
      $match: rangeMatch,
    },
  ];
  const lookupFilter = [
    {
      $lookup: {
        from: 'clients',
        // localField: '_id',
        // foreignField: 'providerId',
        let: { id: '$client' },
        as: 'client',
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
        from: 'transactions',
        // localField: '_id',
        // foreignField: 'providerId',
        let: { id: '$_id' },
        as: 'transaction',
        pipeline: [
          {
            $match: {
              state: 1,
            },
          },
          {
            $match: {
              $expr: { $eq: ['$invoice', '$$id'] },
            },
          },
          // {
          //   $project: { number: 1, invoice: 1 },
          // },
        ],
      },
    },
    {
      $lookup: {
        from: 'ottproviders',
        // localField: 'provider',
        // foreignField: '_id',
        let: { id: '$from_provider' },
        as: 'provider',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: 'provider',
              as: 'user',
            },
          },
          {
            $match: {
              $expr: { $eq: ['$_id', '$$id'] },
            },
          },
          {
            $project: { user: 1, name: 1 },
          },
        ],
      },
    },
    { $sort: sortObject },
  ];
  const finalAggregate = constFilter.concat(lookupFilter);
  const aggregate = Invoice.aggregate(finalAggregate);
  const list = await Invoice.aggregatePaginate(aggregate, curOptions);

  list.docs.forEach((elem, i) => {
    list.docs[i].id = elem._id;
    if (elem.client && elem.client.length) {
      // credits
      elem.client.forEach((e) => {
        if (e.credits?.length) {
          const currentCredit = e.credits[e.credits.length - 1];
          e.currentCredit = currentCredit.creditAmount;
          e.creditStart = currentCredit.creditStartDate;
          if (currentCredit.days) {
            // eslint-disable-next-line no-param-reassign
            e.creditExpireDate = priceUtils.addUTCDays(currentCredit.creditStartDate, currentCredit.creditTerm);
          }
          if (currentCredit.months) {
            // eslint-disable-next-line no-param-reassign
            e.creditExpireDate = priceUtils.addMonths(currentCredit.creditStartDate, currentCredit.creditTerm);
          }
        }
      });
    }

    list.docs[i].timeForPay = elem.startDate;
    if (elem.transaction && elem.transaction.length) {
      elem.transaction.forEach((e) => {
        list.docs[i].paymentActionTime = e.createdAt;
        list.docs[i].lastSentTime = e.updatedAt;
      });
    }
    if (elem.from_provider && elem.from_provider === user.provider.parent && elem.to_provider === user.provider._id) {
      list.docs[i].providerName = elem.provider?.name[0]?.name;
      // const currentUserName = `${user.firstname} ${user.lastname}`;
      // const initiatorUserName = `${initiatorUser.firstname} ${initiatorUser.lastname}`;
      // list.docs[i].userName = initiatorProvider ? initiatorUserame : currentUserName;
    }
    // if (elem.transaction?.length) {
    //   const transaction = elem.transaction[elem.transaction.length - 1];
    //   list.docs[i].transactionId = transaction.number;
    // }
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
 * @param subscriptionId
 */
const getInvoicesBySubscriptionId = async (subscriptionId) => {
  return Invoice.find({
    subscription: subscriptionId,
    state: 1,
  }).populate([
    {
      path: 'room',
    },
  ]);
};

/**
 * Update invoice by id
 * @param {ObjectId} invoiceId
 * @param {Object} updateBody
 * @returns {Promise<Invoice>}
 */
const updateInvoiceById = async (invoiceId, updateBody) => {
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invoice not found');
  }
  Object.assign(invoice, updateBody);
  await invoice.save();
  return invoice;
};

/**
 * @param filter
 * @param options
 * @param {ObjectId} clientId
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const getInvoiceByClientId = async (clientId, options, filter) => {
  const match = {};
  match.client = { $eq: mongoose.Types.ObjectId(clientId) };
  const lookupFilter = [
    {
      $match: match,
    },
    {
      $lookup: {
        from: 'clients',
        // localField: '_id',
        // foreignField: 'providerId',
        let: { id: '$client' },
        as: 'client',
        pipeline: [
          {
            $lookup: {
              from: 'client_payment_methods',
              // localField: '_id',
              // foreignField: 'providerId',
              let: { id: '$_id' },
              as: 'payment',
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
            $match: {
              $expr: { $eq: ['$_id', '$$id'] },
            },
          },
        ],
      },
    },
  ];
  return Invoice.aggregate(lookupFilter);
};

/**
 * Get list
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getList = async (filter = {}, populate = [], projection = null) => {
  const query = Invoice.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

module.exports = {
  createInvoice,
  createLeftDaysInvoice,
  queryBillInvoicesV2,
  queryInvoices,
  queryBillInvoices,
  getInvoicesBySubscriptionId,
  getInvoiceById,
  updateInvoiceById,
  deleteInvoiceById,
  createSubscriptionInvoice,
  createSubscriptionRefundInvoice,
  getInvoices,
  getInvoiceByClientId,
  getList,
};
