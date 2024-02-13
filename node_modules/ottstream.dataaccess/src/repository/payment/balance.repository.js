const httpStatus = require('http-status');
const { Balance } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');
const ottProviderRepository = require('../ottprovider/ottprovider.repository');
const clientRepository = require('../client/client.repository');
/**
 * Create a balance
 * @param {Object} balanceBody
 * @param user
 * @returns {Promise<Balance>}
 */
const createBalance = async (balanceBody, user) => {
  const body = balanceBody;
  if (user._id) body.user = user._id;

  const balance = await Balance.create(body);
  if (balance.clientId && balance && balance._id && balance.balance) {
    await clientRepository.addBalance(balance.clientId, balance.balance);
  }
  if (balance.providerId && balance && balance._id && balance.balance) {
    await ottProviderRepository.addBalance(balance.providerId, balance.balance);
  }
  return balance;
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
const queryBalances = async (filter, options) => {
  return Balance.paginate(filter, options, {}, {});
};

/**
 * Get balance by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Balance>}
 */
const getBalanceById = async (id) => {
  return Balance.findById(id);
};

/**
 * Update balance by id
 * @param {ObjectId} balanceId
 * @param {Object} updateBody
 * @returns {Promise<Balance>}
 */
const updateBalanceById = async (balanceId, updateBody) => {
  const balance = await getBalanceById(balanceId);
  if (!balance) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Balance not found');
  }
  Object.assign(balance, updateBody);
  await balance.save();
  return balance;
};

/**
 * Delete balance by id
 * @param {ObjectId} balanceId
 * @returns {Promise<Balance>}
 */
const deleteBalanceById = async (balanceId) => {
  const balance = await getBalanceById(balanceId);
  if (!balance) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Balance not found');
  }
  await balance.remove();
  return balance;
};

module.exports = {
  createBalance,
  queryBalances,
  getBalanceById,
  updateBalanceById,
  deleteBalanceById,
};
