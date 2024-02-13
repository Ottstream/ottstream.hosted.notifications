const httpStatus = require('http-status');
const { Credit } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');
const ottProviderRepository = require('../ottprovider/ottprovider.repository');
// const SocketService = require('../../services/socket/ws.services');
const serviceCollection = require('../../services/service_collection');
const { addToClient, removeFromClient } = require('../client/client.shared.repository');
/**
 * Create a credit
 * @param {Object} creditBody
 * @param user
 * @returns {Promise<Credit>}
 */
const createCredit = async (creditBody, user) => {
  const body = creditBody;
  if (user._id) body.user = user._id;
  const created = await Credit.create(body);
  if (created?.clientId) {
    await addToClient(created.clientId, 'credits', created._id);
  }
  return created;
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
const queryCredits = async (filter, options) => {
  return Credit.paginate(filter, options, {});
};

/**
 * Get credit by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Credit>}
 */
const getCreditById = async (id) => {
  return Credit.findById(id);
};

/**
 * Get credit by client id
 * @param {ObjectId} id
 * @returns {Promise<Credit>}
 */
const getCreditByClientId = async (id) => {
  return Credit.find({ clientId: id, state: 1 });
};

/**
 * Update credit by id
 * @param {ObjectId} creditId
 * @param {Object} updateBody
 * @returns {Promise<Credit>}
 */
const updateCreditById = async (creditId, updateBody) => {
  const credit = await getCreditById(creditId);
  if (!credit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Credit not found');
  }
  Object.assign(credit, updateBody);
  await credit.save();
  return credit;
};

/**
 * Update credit by id
 * @param {ObjectId} creditId
 * @param {Object} updateBody
 * @returns {Promise<Credit>}
 */
const stopCredit = async (ottProviderId) => {
  const credit = await Credit.find({
    providerId: ottProviderId,
    state: 1,
  });
  if (!credit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Credit not found');
  }
  if (credit && credit.length) {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < credit.length; i++) {
      credit[i].state = 0;
      // eslint-disable-next-line no-await-in-loop
      const provider = await ottProviderRepository.addBalance(credit[i].providerId, -credit[i].creditAmount);
      // eslint-disable-next-line no-await-in-loop
      await updateCreditById(credit[i].id, {
        paymentState: 1,
      });
      const ss = serviceCollection.getService('socketService');
      ss.send(provider.id, 'user', {
        balance: provider.balance,
      });
      // eslint-disable-next-line no-await-in-loop
      await credit[i].save();
    }
  }
  return credit;
};

/**
 * Delete credit by id
 * @param {ObjectId} creditId
 * @returns {Promise<Credit>}
 */
const deleteCreditById = async (creditId) => {
  const credit = await getCreditById(creditId);
  if (!credit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Credit not found');
  }
  await credit.remove();
  if (credit?.clientId) {
    await removeFromClient(credit.clientId, 'credits', creditId);
  }
  return credit;
};

/**
 * stop credit by client is
 * @param {ObjectId} clientId
 * @returns {Promise<Credit>}
 */
const stopClientCredit = async (clientId) => {
  try {
    const credit = await Credit.find({
      clientId,
      state: 1,
    });
    if (!credit) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Credit not found');
    }
    if (credit && credit.length) {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < credit.length; i++) {
        credit[i].state = 0;
        // eslint-disable-next-line no-await-in-loop
        // const client = await clientRepository.addBalance(credit[i].clientId, -credit[i].creditAmount);
        // eslint-disable-next-line no-await-in-loop
        await updateCreditById(credit[i].id, {
          paymentState: 1,
        });
        // const socketService = serviceCollection.getService('socketService');
        // socketService.send(client.id, 'user', {
        //   balance: client.balance,
        // });
        // eslint-disable-next-line no-await-in-loop
        await credit[i].save();
      }
    }
    return credit;
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, err);
  }
};

module.exports = {
  createCredit,
  queryCredits,
  getCreditById,
  getCreditByClientId,
  stopCredit,
  stopClientCredit,
  updateCreditById,
  deleteCreditById,
};
