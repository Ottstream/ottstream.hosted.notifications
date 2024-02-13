const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { ClientBill } = require('../../models');
const  clientRepository  = require('../client/client.repository');
const ApiError = require('../../api/utils/error/ApiError');
const priceUtils = require('../../utils/price/price_utils');
const logger = require('../../utils/logger/logger');

// generate random number for billNumber
function generateRandomNumber() {
  // eslint-disable-next-line no-restricted-properties
  return `${Math.floor(10000 + Math.random() * Math.pow(8, 10))}`;
}

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryClientsBills = async (filter, options, user) => {
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
  match.$or = [];
  searchMatch.$or = [];

  // search filter
  if (filter.search && filter.search.length) {
    filter.search.replace('%20', ' ');
    searchMatch.$or.push({
      billName: { $regex: `.*${filter.search}.*`, $options: 'i' },
    });
    searchMatch.$or.push({
      'clients.personalInfo.firstname': { $regex: `.*${filter.search}.*`, $options: 'i' },
    });
    searchMatch.$or.push({
      'clients.personalInfo.lastname': { $regex: `.*${filter.search}.*`, $options: 'i' },
    });
    searchMatch.$or.push({
      'clients.phones.phone': { $regex: `.*${filter.search}.*`, $options: 'i' },
    });
    searchMatch.$or.push({
      'clients.emails.email': { $regex: `.*${filter.search}.*`, $options: 'i' },
    });
    searchMatch.$or.push({
      'clients.addresses.address': { $regex: `.*${filter.search}.*`, $options: 'i' },
    });
    searchMatch.$or.push({
      'clients.locations.login': { $regex: `.*${filter.search}.*` },
    });
    searchMatch.$or.push({
      'clients.payments.creditCard.cardNumber': { $regex: `.*${filter.search}.*` },
    });
    searchMatch.$or.push({
      'clients.payments.creditCard.cardNumber': { $regex: `.*${filter.search}.*` },
    });
    searchMatch.$or.push({
      transactionId: { $regex: `.*${filter.search}.*` },
    });
  }

  // provider
  if (user.provider) {
    match.provider = { $eq: mongoose.Types.ObjectId(user.provider._id.toString()) };
  }

  // clientId
  if (filter.clientId) {
    match.client = { $eq: mongoose.Types.ObjectId(filter.clientId) };
  }

  // login
  if (filter.loginId) {
    match.$or.push({
      'clients.locations.login': { $eq: filter.loginId },
    });
  }

  // таблица доступны только для ролей “Admin”, “Cashier"
  match.$or.push({
    'clients.users.rolesInfo.admin': { $eq: true },
  });
  match.$or.push({
    'clients.users.rolesInfo.cashier': { $eq: true },
  });

  // subscriptionAmount [from to]
  if (filter.subscriptionAmount) {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < filter.subscriptionAmount.length; i++) {
      match.subscriptionAmount = { $eq: filter.subscriptionAmount };
    }
  }

  // totalAmount [from to]
  if (filter.totalAmount) {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < filter.totalAmount.length; i++) {
      match.totalAmount = { $eq: filter.totalAmount };
    }
  }

  // dateForPayStart, dateForPayEnd
  if (typeof filter.dateForPayStart !== 'undefined' && typeof filter.dateForPayEnd !== 'undefined') {
    // eslint-disable-next-line no-undef
    match.$and.push({
      payments: { $gte: filter.dateForPayStart },
    });
    match.$and.push({
      payments: { $lte: filter.dateForPayEnd },
    });
  } else if (typeof filter.dateForPayStart !== 'undefined') {
    match.$or.push({
      payments: { $gte: filter.dateForPayStart },
    });
  } else if (typeof filter.dateForPayEnd !== 'undefined') {
    match.$or.push({
      payments: { $lte: filter.dateForPayEnd },
    });
  }

  // autoPayment from checkout
  if (filter.autoPayment) {
    match.$or.push({
      'clients.locations.autoPayment': { $eq: filter.autoPayment },
    });
  }

  // paymentActionBy from checkout
  if (filter.paymentActonBy) {
    match.$or.push({
      'clients.subscriptions.paymentActionBy': { $eq: filter.paymentActonBy },
    });
  }

  // paymentStatus from checkout
  if (filter.paymentStatus) {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < filter.paymentStatus.length; i++) {
      match.$or.push({
        'clients.subscriptions.paymentStatus': { $eq: filter.paymentStatus },
      });
    }
  }

  // paymentMethod
  if (filter.paymentMethod) {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < filter.paymentMethod.length; i++) {
      match.$or.push({
        'clients.subscription.paymentMethod': { $eq: filter.paymentMethod },
      });
    }
  }

  if (!match.$or.length) delete match.$or;
  if (!searchMatch.$or.length) delete searchMatch.$or;
  const constFilter = [
    {
      $match: match,
    },
    {
      $match: searchMatch,
    },
  ];

  const lookupFilter = [
    {
      $lookup: {
        from: 'clients',
        // localField: '_id',
        // foreignField: 'providerId',
        let: { id: '$client' },
        as: 'clients',
        pipeline: [
          // {
          //   $lookup: {
          //     from: 'ottproviders',
          //     // localField: 'provider',
          //     // foreignField: '_id',
          //     let: { id: '$provider' },
          //     as: 'providers',
          //     pipeline: [
          //       {
          //         $match: {
          //           status: 1,
          //         },
          //       },
          //       {
          //         $match: {
          //           $expr: { $eq: ['$_id', '$$id'] },
          //         },
          //       },
          //     ],
          //   },
          // },
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
                    state: 1,
                  },
                },
                {
                  $match: {
                    $expr: { $eq: ['$clientId', '$$id'] },
                  },
                },
              ],
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
                  $lookup: {
                    from: 'subscriptions',
                    // localField: '_id',
                    // foreignFiled: 'providerId,
                    let: { id: '$_id' },
                    as: 'subscriptions',
                    pipeline: [
                      {
                        $match: {
                          status: 1,
                        },
                      },
                      {
                        $match: {
                          $expr: { $eq: ['$location', '$$id'] },
                        },
                      },
                    ],
                  },
                },
                {
                  $match: {
                    $expr: { $eq: ['$clientId', '$$id'] },
                  },
                },
              ],
            },
          },
          {
            $lookup: {
              from: 'users',
              // localField: '_id',
              // foreignField: 'providerId',
              let: { id: '$user' },
              as: 'users',
              pipeline: [
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
            $lookup: {
              from: 'client_payment_methods',
              // localField: '_id',
              // foreignField: 'clientId',
              let: { id: '$_id' },
              as: 'payments',
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$clientId', '$$id'] },
                  },
                },
                // { $project: { bankTransfer: 1, _id: 0 } },
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
    { $sort: sortObject },
  ];
  const finalAggregate = lookupFilter.concat(constFilter);
  const aggregate = ClientBill.aggregate(finalAggregate);
  const list = await ClientBill.aggregatePaginate(aggregate, curOptions);

  list.docs.forEach((elem, i) => {
    list.docs[i].id = elem._id;
    list.docs[i].billNumber = generateRandomNumber();
    list.docs[i].logins = [];
    // Clients Info
    list.docs[i].clientId = generateRandomNumber();
    list.docs[i].clients.forEach((item) => {
      list.docs[i].clientFirstName = item.personalInfo.firstname;
      list.docs[i].clientLastName = item.personalInfo.lastname;
      list.docs[i].clientEmail = item.emails.map((r) => r.email).toString();
      list.docs[i].clientPhoneCode = item.phones.map((r) => r.code).toString();
      list.docs[i].clientPhoneNumber = item.phones.map((r) => r.phone).toString();
      list.docs[i].clientAddress = item.addresses.map((r) => r.address).toString();
      list.docs[i].clientBalance = item.balance;
      list.docs[i].currentDebt = item.debt;
      // credit
      if (item.credits.length) {
        const currentCredit = item.credits[item.credits.length - 1];
        list.docs[i].currentCredit = currentCredit.creditAmount;
        list.docs[i].creditStart = currentCredit.creditStartDate;
        if (currentCredit.days) {
          // eslint-disable-next-line no-param-reassign
          list.docs[i].creditExpire = priceUtils.addUTCDays(currentCredit.creditStartDate, currentCredit.creditTerm);
        }
        if (currentCredit.months) {
          // eslint-disable-next-line no-param-reassign
          list.docs[i].creditExpire = priceUtils.addMonths(currentCredit.creditStartDate, currentCredit.creditTerm);
        }
      }

      // Bill Info
      item.locations.forEach((it) => {
        list.docs[i].logins.push({ name: it.login, id: it._id });
        list.docs[i].subscriptionAmount = 0; // TODO after  get checkout
        list.docs[i].totalAmount = 0; // TODO after get checkout
      });

      // Payment Status
      list.docs[i].providerFirstName = item.users.map((r) => r.firstname).toString();
      list.docs[i].providerLastName = item.users.map((r) => r.firstname).toString();
      list.docs[i].userFirstName = item.users.map((r) => r.firstname).toString();
      list.docs[i].userLastName = item.users.map((r) => r.lastname).toString();
      item.payments.forEach((it) => {
        if (it.creditCard) {
          list.docs[i].paymentCardNumber = {
            brand: it.creditCard.brand,
            number: it.creditCard.cardNumber,
          };
        } else {
          list.docs[i].paymentCardNumber = {
            brand: it.bankTransfer.bankName,
            number: it.bankTransfer.accountNumber,
          };
        }
      });

      // timeForPay:
      // autoPayment:
      // paymentStatus:
      // paymentActonBy:
      // paymentActionTime:
      // paymentMethod:
      // billSentMethod:
      // lastSentTime:
    });

    // Bill Sent Status
    delete list.docs[i]._id;
  });

  return {
    // eslint-disable-next-line no-undef
    results: upcomingManual ? list.docs.sort((r) => r.credits.creditExpire) : list.docs,
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
 * filter on click table by clientId
 * @param {ObjectId} clientId
 * @param options
 * @param filter
 * @returns {Promise<ClientBill>}
 */
// eslint-disable-next-line no-unused-vars
const getClientBillByClientId = async (clientId, options, filter) => {
  const client = await clientRepository.getClientById(clientId);
  if (!client) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');
  }
  const list = await client.populate([
    {
      path: 'user',
    },
  ]);
  if (!list) {
    logger.error(`Client not found`);
  }
  const result = [];
  if (filter.clientId) {
    result.push({
      clientName: client.personalInfo.firstname,
      clientId: filter.clientId,
    });
  }
  if (filter.loginId) {
    result.push({
      login: filter.loginId,
    });
  }
  if (filter.paymentActionProviderName) {
    result.push({
      paymentActionProviderName: `${list.user.firstname} ${list.user.lastname}`,
    });
  }
  if (filter.paymentActionUserName) {
    result.push({
      paymentActionUserName: `${list.user.firstname} ${list.user.lastname}`,
    });
  }
  if (!filter.clientId && !filter.loginId && filter.searchLogin) {
    result.push({
      login: filter.searchLogin, // TODO in future
    });
  }
  if (filter.cardNumber) {
    result.push({
      cardNumber: filter.cardNumber, // TODO in future
    });
  }
  return result;
};

// actions
/**
 * full cancel
 * @param {ObjectId} clientId
 * @returns {Promise<ClientBill>}
 */
const fullCancelClientBillByClientId = async (clientId) => {
  const client = await clientRepository.getClientById(clientId);
  if (!client) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');
  }
  // TODO check for upcoming orders and unpaid expired invoices
  return ClientBill.updateMany(
    {
      clientId,
    },
    { $set: { billSendMethod: 1, autoPayment: 2 } }, // 1->don't send, 2->disabled
    { multi: false }
  );
};

module.exports = {
  queryClientsBills,
  getClientBillByClientId,
  fullCancelClientBillByClientId,
};
