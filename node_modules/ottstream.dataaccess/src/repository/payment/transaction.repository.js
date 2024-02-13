/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const moment = require('moment-timezone');
const { Transaction } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');
const { randomNumberSequence } = require('../../utils/crypto/random');
const { addToClient, removeFromClient } = require('../client/client.shared.repository');
const logger = require('../../utils/logger/logger');

// const calculateCredit = (creater, credit) => {
//   if (credit.days) {
//     // eslint-disable-next-line no-param-reassign
//     creater.creditEndDate = priceUtils.addUTCDays(credit.creditStartDate, credit.creditTerm);
//   }
//   if (creater.months) {
//     // eslint-disable-next-line no-param-reassign
//     creater.creditEndDate = priceUtils.addMonths(credit.creditStartDate, credit.creditTerm);
//   }
// };
/**
 * Create a transaction
 * @param _body
 * @param user
 * @returns {Promise<Transaction>}
 */
const createTransaction = async (_body, user) => {
  const body = _body;
  if (user._id) body.user = user._id;
  // body.provider = user.provider.id;
  body.number = `TR-${randomNumberSequence(6)}`;

  const created = await Transaction.create(body);
  if (created) {
    if (created.from_client) await addToClient(created.from_client, 'transactions', created._id);
    if (created.to_client) await addToClient(created.to_client, 'transactions', created._id);
  }
  return created;
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryTransactions = async (filter, options, user) => {
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
  const transactionFilter = {};
  if (filter.search && filter.search.length) {
    filter.search.replace('%20', ' ');
    // eslint-disable-next-line security/detect-non-literal-regexp
    const regex = new RegExp(filter.search, 'i');
    transactionFilter.$and = [
      {
        $or: [{ number: regex }],
      },
    ];
  }

  if (typeof filter.fee !== 'undefined') {
    if (filter.fee) transactionFilter.fee = { $ne: 0 };
    else transactionFilter.fee = { $eq: 0 };
  }

  if (typeof filter.amountMin !== 'undefined' && typeof filter.amountMax !== 'undefined') {
    if (!transactionFilter.$and) {
      transactionFilter.$and = [];
    }
    transactionFilter.$and.push({
      amount: {
        $gte: filter.amountMin,
        $lte: filter.amountMax,
      },
    });
  }

  if (filter.transactionType) {
    transactionFilter.transaction_type = filter.transactionType;
  }
  if (typeof filter.isRefund !== 'undefined') {
    if (filter.isRefund) transactionFilter.isRefund = filter.isRefund;
    else transactionFilter.isRefund = { $ne: true };
  }

  if (filter.executionStartDate && filter.executionEndDate) {
    if (!transactionFilter.$and) {
      transactionFilter.$and = [];
    }

    // Input timezone string
    const timezoneString = user.provider.timezone;

    // Get the current offset in minutes
    const offsetInMinutes = moment.tz(timezoneString).utcOffset();

    // Convert offset to hours and minutes
    const offsetHours = Math.floor(offsetInMinutes / 60);
    // filter.executionStartDate = new Date(Date.UTC(2023, 9, 2, 12, 0, 0));
    // filter.executionEndDate = new Date(Date.UTC(2023, 9, 2, 12, 0, 0));
    filter.executionStartDate = new Date(filter.executionStartDate);
    filter.executionStartDate.setHours(0, 0, 0);

    // Get the time zone offset in minutes
    let timeZoneOffsetInMinutes = moment(filter.executionStartDate).utcOffset();

    // Convert the offset to hours
    let timeZoneOffsetInHours = timeZoneOffsetInMinutes / 60;

    // Add the offset hours to the date
    filter.executionStartDate.setHours(filter.executionStartDate.getHours() + timeZoneOffsetInHours - offsetHours);
    filter.executionEndDate = new Date(filter.executionEndDate);
    filter.executionEndDate.setHours(23, 59, 59);

    // Get the time zone offset in minutes
    timeZoneOffsetInMinutes = moment(filter.executionEndDate).utcOffset();

    // Convert the offset to hours
    timeZoneOffsetInHours = timeZoneOffsetInMinutes / 60;

    // Add the offset hours to the date
    filter.executionEndDate.setHours(filter.executionEndDate.getHours() + timeZoneOffsetInHours - offsetHours);
    transactionFilter.$and.push({
      executionDate: {
        $gte: filter.executionStartDate,
        $lte: filter.executionEndDate,
      },
    });
  }

  if (filter.ownProviders.length && !filter.client) {
    transactionFilter.provider = { $in: filter.ownProviders };
    // transactionFilter.provider = filter.baseprovider;
  }

  if (typeof filter.autopayment !== 'undefined') {
    transactionFilter.autopayment = filter.autopayment;
  }
  if (typeof filter.transactionState !== 'undefined') {
    transactionFilter.state = filter.transactionState;
  }
  if (typeof filter.merchant !== 'undefined') {
    if (!transactionFilter.$and) {
      transactionFilter.$and = [];
    }
    transactionFilter.$and.push({
      'sourcePay.merchant': {
        $eq: filter.merchant,
      },
    });
  }
  if ((filter.in && filter.out) || (!filter.in && !filter.out)) {
    if (!transactionFilter.$or) {
      transactionFilter.$or = [];
    }
    if (filter.client) {
      transactionFilter.$or.push({
        to_client: { $eq: filter.client },
      });
      transactionFilter.$or.push({
        from_client: { $eq: filter.client },
      });
    } else {
      const toObject = {
        $and: [{ to_provider: filter.providers.length ? { $in: filter.providers } : { $eq: filter.baseprovider } }],
      };
      const fromObject = {
        $and: [{ from_provider: filter.providers.length ? { $in: filter.providers } : { $eq: filter.baseprovider } }],
      };
      if (filter.toProviders.length) {
        toObject.$and.push({ from_provider: { $in: filter.toProviders } });
        fromObject.$and.push({ to_provider: { $in: filter.toProviders } });
      }
      transactionFilter.$or = [toObject, fromObject];
    }
  } else if (filter.out) {
    if (!transactionFilter.$and) {
      transactionFilter.$and = [];
    }
    if (filter.client) {
      transactionFilter.$or.push({
        to_client: { $eq: filter.client },
      });
      transactionFilter.$or.push({
        from_client: { $eq: filter.client },
      });
    } else {
      transactionFilter.$and.push({
        from_provider: filter.providers.length ? { $in: filter.providers } : { $eq: filter.baseprovider },
      });
    }
  } else if (filter.in) {
    if (!transactionFilter.$and) {
      transactionFilter.$and = [];
    }
    if (filter.client) {
      transactionFilter.$or.push({
        to_client: { $eq: filter.client },
      });
      transactionFilter.$or.push({
        from_client: { $eq: filter.client },
      });
    } else {
      transactionFilter.$and.push({
        to_provider: filter.providers.length ? { $in: filter.providers } : { $eq: filter.baseprovider },
      });
    }
  }

  let compareProviders = [];
  if (filter.providers.length) {
    compareProviders = compareProviders.concat(filter.providers);
  } else {
    compareProviders.push(filter.baseprovider);
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
  // transactionFilter.status = { $eq: 1 };
  // transactionFilter.provider = { $in: filter.providers };
  transactionFilter.fixed = { $ne: true };
  const start = new Date();
  const transactions = await Transaction.paginate(transactionFilter, curOptions, {}, [
    {
      path: 'to_provider',
      select: 'id name hasValidSmtp hasValidTwilio',
    },
    {
      path: 'to_client',
      select: 'id personalInfo',
      populate: [{ path: 'provider', select: 'id name hasValidSmtp hasValidTwilio' }],
    },
    {
      path: 'from_provider',
      select: 'id name hasValidSmtp hasValidTwilio',
    },
    {
      path: 'from_client',
      select: 'id personalInfo',
      populate: [{ path: 'provider', select: 'id name hasValidSmtp hasValidTwilio' }],
    },
    {
      path: 'invoice',
      select: 'id number_id number totalAmount amount payloadCalculated generalDisplayInfo',
      populate: [{ path: 'user', select: 'id firstname lastname' }],
    },
    {
      path: 'user',
    },
  ]);

  const allTransactions = await Transaction.find(
    { ...transactionFilter },
    {
      amount: 1,
      totalAmount: 1,
      state: 1,
      from_provider: 1,
      to_provider: 1,
      from_client: 1,
      to_client: 1,
    }
  );

  const sum = allTransactions.reduce((total, transaction) => {
    return (
      total +
      (compareProviders &&
      compareProviders.filter((a) => transaction.from_provider && transaction.from_provider.toString() === a).length
        ? -transaction.totalAmount
        : transaction.totalAmount)
    ); // replace yourFieldName with the field you want to calculate the sum of
  }, 0);
  const balanceKey = user.provider.id;
  transactions.results.forEach((item, i) => {
    transactions.results[i] = transactions.results[i].toJSON();
    // if (transactions.results[i].provider?.toString() === transactions.results[i]?.from_provider?.id) {
    //   transactions.results[i].amount = -transactions.results[i].amount;
    // }
    if (item.balanceHistory && item.balanceHistory[balanceKey]) {
      transactions.results[i].balanceBefore = item.balanceHistory[balanceKey].balanceBefore;
      transactions.results[i].balanceAfter = item.balanceHistory[balanceKey].balanceAfter;
    }
    if (
      compareProviders &&
      transactions.results[i].from_provider &&
      compareProviders.filter((a) => transactions.results[i].from_provider.id === a).length
    ) {
      transactions.results[i].amount = -transactions.results[i].amount;
      transactions.results[i].totalAmount = -transactions.results[i].totalAmount;
    }
  });
  const end = new Date();
  logger.info(`clients query duration duration: ${end.getTime() - start.getTime()}`);
  return { sum, transactions };
  // const curOptions = {
  //   page: options.page ?? 1,
  //   limit: options.limit ?? 20,
  // };

  // const sortObject = {
  //   // _id: -1,
  // };

  // if (options.sortBy) {
  //   if (typeof options.sortBy === 'object') {
  //     options.sortBy.forEach(function (sortOption) {
  //       const parts = sortOption.split(':');
  //       sortObject[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  //     });
  //   } else if (typeof options.sortBy === 'string') {
  //     const parts = options.sortBy.split(':');
  //     sortObject[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  //   }
  // } else {
  //   sortObject._id = -1;
  // }
  // const match = {};
  // const searchMatch = {};
  // const rangeMatch = {};
  // searchMatch.$or = [];
  // const providerPatch = {};
  // providerPatch.$or = [];
  // match.$or = [];
  // rangeMatch.$and = [];

  // // search filter
  // if (filter.search && filter.search.length) {
  //   searchMatch.$or.push({
  //     number: { $regex: `.*${filter.search}.*`, $options: 'i' },
  //   });
  //   searchMatch.$or.push({
  //     transactionId: { $regex: `.*${filter.search}.*`, $options: 'i' },
  //   });
  //   searchMatch.$or.push({
  //     'invoices.number': { $regex: `.*${filter.search}.*`, $options: 'i' },
  //   });
  //   searchMatch.$or.push({
  //     'client.personalInfo.firstname': { $regex: `.*${filter.search}.*`, $options: 'i' },
  //   });
  //   searchMatch.$or.push({
  //     'client.personalInfo.lastname': { $regex: `.*${filter.search}.*`, $options: 'i' },
  //   });
  //   searchMatch.$or.push({
  //     'client.phones.phone': { $regex: `.*${filter.search}.*`, $options: 'i' },
  //   });
  //   searchMatch.$or.push({
  //     'client.emails.email': { $regex: `.*${filter.search}.*`, $options: 'i' },
  //   });
  //   searchMatch.$or.push({
  //     'client.addresses.address': { $regex: `.*${filter.search}.*`, $options: 'i' },
  //   });
  //   searchMatch.$or.push({
  //     'provider.name.name': { $regex: `.*${filter.search}.*`, $options: 'i' },
  //   });
  // }
  // if (filter.in && filter.out) {
  //   providerPatch.$or.push({
  //     to_provider: { $eq: mongoose.Types.ObjectId(user.provider._id.toString()) },
  //   });
  //   providerPatch.$or.push({
  //     from_provider: { $eq: mongoose.Types.ObjectId(user.provider._id.toString()) },
  //   });
  // } else if (filter.in) {
  //   providerPatch.to_provider = { $eq: mongoose.Types.ObjectId(user.provider._id.toString()) };
  //   providerPatch.transaction_type = { $eq: 'B_TO_B' };
  // } else if (filter.out) {
  //   providerPatch.from_provider = { $eq: mongoose.Types.ObjectId(user.provider._id.toString()) };
  // }

  // if (typeof filter.transactionDateStart !== 'undefined' && typeof filter.transactionDateEnd !== 'undefined') {
  //   rangeMatch.$and.push({
  //     createdAt: { $gte: filter.transactionDateStart },
  //   });
  //   rangeMatch.$and.push({
  //     createdAt: { $lte: filter.transactionDateEnd },
  //   });
  // } else if (typeof filter.transactionDateStart !== 'undefined') {
  //   rangeMatch.createdAt = { $gte: filter.transactionDateStart };
  // } else if (typeof filter.transactionDateEnd !== 'undefined') {
  //   rangeMatch.createdAt = { $lte: filter.transactionDateEnd };
  // }

  // if (typeof filter.transactionState !== 'undefined') {
  //   match.state = { $eq: filter.transactionState };
  // }

  // if (typeof filter.transactionType !== 'undefined') {
  //   match.transaction_type = { $eq: filter.transactionType };
  // }

  // if (typeof filter.transactionSubType !== 'undefined') {
  //   match.source_type = { $eq: filter.transactionSubType };
  // }

  // if (filter.client) {
  //   match.from_client = { $eq: mongoose.Types.ObjectId(filter.client) };
  // }

  // if (filter.searchBillNumber) {
  //   match.$or = [
  //     {
  //       'invoices.number': { $eq: filter.searchBillNumber },
  //     },
  //   ];
  // }

  // if (typeof filter.initiatorType !== 'undefined') {
  //   match.from_type = { $eq: filter.initiatorType };
  // }

  // if (typeof filter.participantType !== 'undefined') {
  //   match.to_type = { $eq: filter.participantType };
  // }

  // if (typeof filter.searchLogin !== 'undefined') {
  //   match.$or = [
  //     {
  //       // eslint-disable-next-line security/detect-non-literal-regexp
  //       'invoices.payloadCalculated.locations.locationLogin': { $regex: new RegExp(`.*${filter.searchLogin}.*`, 'i') },
  //     },
  //   ];
  // }

  // if (typeof filter.amountMin !== 'undefined' && typeof filter.amountMax !== 'undefined') {
  //   rangeMatch.$and.push({
  //     amount: { $gte: filter.amountMin },
  //   });
  //   rangeMatch.$and.push({
  //     amount: { $lte: filter.amountMax },
  //   });
  // } else if (typeof filter.amountMin !== 'undefined') {
  //   match.amount = { $eq: filter.amountMin };
  // } else if (typeof filter.amountMax !== 'undefined') {
  //   match.amount = { $eq: filter.amountMax };
  // }

  // if (filter.paymentMethodSearch) {
  //   match.$or = [
  //     {
  //       // eslint-disable-next-line security/detect-non-literal-regexp
  //       'sourcePay.cardNumber': { $regex: new RegExp(`.*${filter.paymentMethodSearch}.*`, 'i') },
  //     },
  //     {
  //       // eslint-disable-next-line security/detect-non-literal-regexp
  //       'sourcePay.accountNumber': { $regex: new RegExp(`.*${filter.paymentMethodSearch}.*`, 'i') },
  //     },
  //   ];
  // }

  // if (typeof filter.transactionType !== 'undefined') {
  //   match.transaction_type = { $eq: filter.transactionType };
  // }

  // if (typeof filter.billGenerationDateStart !== 'undefined' && typeof filter.billGenerationDateEnd !== 'undefined') {
  //   rangeMatch.$and.push({
  //     'invoices.createdAt': { $gte: filter.billGenerationDateStart },
  //   });
  //   rangeMatch.$and.push({
  //     'invoices.createdAt': { $lte: filter.billGenerationDateEnd },
  //   });
  // } else if (typeof filter.billGenerationDateStart !== 'undefined') {
  //   match.$or.push({
  //     'invoices.createdAt': { $eq: filter.billGenerationDateStart },
  //   });
  // } else if (typeof filter.billGenerationDateEnd !== 'undefined') {
  //   match.$or.push({
  //     'invoices.createdAt': { $eq: filter.billGenerationDateEnd },
  //   });
  // }

  // if (!match.$or.length) delete match.$or;
  // if (!searchMatch.$or.length) delete searchMatch.$or;
  // if (!rangeMatch.$and.length) delete rangeMatch.$and;
  // if (!providerPatch.$or.length) delete providerPatch.$or;

  // const constFilter = [
  //   {
  //     $match: match,
  //   },
  //   {
  //     $match: searchMatch,
  //   },
  //   {
  //     $match: rangeMatch,
  //   },
  //   {
  //     $match: providerPatch,
  //   },
  // ];
  // // TODO add invoice id in credits in order not to join invoice to client to credit
  // const lookupFilter = [
  //   {
  //     $lookup: {
  //       from: 'invoices',
  //       // localField: 'invoice',
  //       // foreignField: '_id',
  //       let: { id: '$invoice' },
  //       as: 'invoices',
  //       pipeline: [
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
  //       as: 'provider',
  //       pipeline: [
  //         {
  //           $match: {
  //             $expr: { $eq: ['$_id', '$$id'] },
  //           },
  //         },
  //         {
  //           $project: { balance: 1, debt: 1, credits: 1 },
  //         },
  //       ],
  //     },
  //   },
  //   { $sort: sortObject },
  // ];
  // const finalAggregate = lookupFilter.concat(constFilter);
  // const aggregate = Transaction.aggregate(finalAggregate);
  // const list = await Transaction.aggregatePaginate(aggregate, curOptions);

  // list.docs.forEach((elem, i) => {
  //   list.docs[i].id = elem._id;
  //   if (elem.invoices && elem.invoices.length) {
  //     elem.invoices.forEach((item) => {
  //       // initiator
  //       if (item.from_type === 1 && item.to_provider) {
  //         const provider = item.provider[item.provider.length - 1];
  //         list.docs[i].initiatorName = provider?.name[0]?.name;
  //       }
  //       if (item.from_type === 2 && item.from_client) {
  //         const client = item.client[item.client.length - 1];
  //         if (client) list.docs[i].initiatorName = `${client.personalInfo.firstname} ${client.personalInfo.lastname}`;
  //         // TODO small update was giving error
  //       }

  //       // participant
  //       if (item.to_type === 1 && item.to_provider) {
  //         const provider = item.provider[item.provider.length - 1];
  //         list.docs[i].participantName = provider?.name[0]?.name;
  //         // credits
  //         if (provider?.credits?.length) {
  //           const currentCredit = provider.credits[provider.credits.length - 1];
  //           provider.creditAfter = currentCredit.creditAmount;
  //           calculateCredit(provider, currentCredit);
  //         }
  //       }
  //       if (item.to_type === 2 && item.to_client) {
  //         const client = item.client[item.client.length - 1];
  //         if (client) {
  //           list.docs[i].participantName = `${client.personalInfo.firstname} ${client.personalInfo.lastname}`;
  //           // credits
  //           if (client.credits?.length) {
  //             const currentCredit = client.credits[client.credits.length - 1];
  //             client.creditAfter = currentCredit.creditAmount;
  //             calculateCredit(client, currentCredit);
  //           }
  //         }
  //       }
  //     });
  //   }
  //   // my balance/credit state
  //   if (elem.provider && elem.provider.length) {
  //     elem.provider.forEach((e) => {
  //       // credits
  //       if (e.credits?.length) {
  //         const currentCredit = e.credits[e.credits.length - 1];
  //         e.myCreditAfter = currentCredit.creditAmount;
  //         calculateCredit(e, currentCredit);
  //         e.myCreditBefore = currentCredit.creditAmount;
  //         e.myBalanceBefore = currentCredit.creditAmount;
  //       }
  //     });
  //   }
  //   delete list.docs[i]._id;
  // });

  // return {
  //   results: list.docs,
  //   page: list.page,
  //   limit: list.limit,
  //   totalPages: list.totalPages,
  //   totalResults: list.totalDocs,
  // };
};

/**
 * Get void transactions for credit card
 * @returns {Promise<Transaction>}
 * @param fromClient
 * @param fromProvider
 */
const getVoidTransactionsForCreditCard = async (fromClient, fromProvider) => {
  const filter = {
    source_type: 'VOID_TRANSACTION',
  };
  if (fromClient) filter.from_client = fromClient;
  if (fromProvider) filter.from_provider = fromProvider;
  return Transaction.find(filter);
};

/**
 * Get transaction by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Transaction>}
 */
const getTransactionById = async (id) => {
  return Transaction.findById(id);
};

/**
 * Get transaction by invoice number
 * @param {String} invoiceId
 * @returns {Promise<Transaction>}
 */
const getTransactionByInvoiceId = async (invoiceId) => {
  return Transaction.find({ invoice: invoiceId }, {});
};

/**
 * Update transaction by id
 * @param {ObjectId} transactionId
 * @param {Object} updateBody
 * @returns {Promise<Transaction>}
 */
const updateTransactionById = async (transactionId, updateBody) => {
  const transaction = await getTransactionById(transactionId);
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }
  Object.assign(transaction, updateBody);
  await transaction.save();
  return transaction;
};

/**
 * Update one
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<Transaction>}
 */
const updateOne = async (filter, updateBody) => {
  return Transaction.updateOne(filter, updateBody);
};

/**
 * Delete transaction by id
 * @param {ObjectId} transactionId
 * @returns {Promise<Transaction>}
 */
const deleteTransactionById = async (transactionId) => {
  const transaction = await getTransactionById(transactionId);
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }
  await transaction.remove();
  if (transaction) {
    if (transaction.from_client) await removeFromClient(transaction.from_client, 'transactions', transaction._id);
    if (transaction.to_client) await removeFromClient(transaction.to_client, 'transactions', transaction._id);
  }
  return transaction;
};

/**
 * Get list
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getList = async (filter = {}, populate = [], projection = null) => {
  const query = Transaction.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

module.exports = {
  createTransaction,
  queryTransactions,
  getVoidTransactionsForCreditCard,
  getTransactionById,
  getTransactionByInvoiceId,
  updateTransactionById,
  deleteTransactionById,
  getList,
  updateOne,
};
