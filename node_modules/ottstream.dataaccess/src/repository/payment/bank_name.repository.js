const httpStatus = require('http-status');
const { BankName } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');
require('./balance.repository');
// const SocketService = require('../../services/socket/ws.services');
/**
 * Create a bankName
 * @param {Object} bankNameBody
 * @param user
 * @returns {Promise<BankName>}
 */
const createBankName = async (bankNameBody, user) => {
  const body = bankNameBody;
  if (user.provider) body.provider = user.provider._id;
  return BankName.create(body);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
const queryBankNames = async (filter, options) => {
  return BankName.paginate(filter, options, {});
};

/**
 * Get bankName by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<BankName>}
 */
const getBankNameById = async (id) => {
  return BankName.findById(id);
};

/**
 * Get bankName by client id
 * @param {ObjectId} id
 * @returns {Promise<BankName>}
 */
const getBankNameByClientId = async (id) => {
  return BankName.find({ clientId: id, state: 1 });
};

/**
 * Update bankName by id
 * @param {ObjectId} bankNameId
 * @param {Object} updateBody
 * @returns {Promise<BankName>}
 */
const updateBankNameById = async (bankNameId, updateBody) => {
  const bankName = await getBankNameById(bankNameId);
  if (!bankName) {
    throw new ApiError(httpStatus.NOT_FOUND, 'BankName not found');
  }
  Object.assign(bankName, updateBody);
  await bankName.save();
  return bankName;
};

/**
 * Delete bankName by id
 * @param {ObjectId} bankNameId
 * @returns {Promise<BankName>}
 */
const deleteBankNameById = async (bankNameId) => {
  const bankName = await getBankNameById(bankNameId);
  if (!bankName) {
    throw new ApiError(httpStatus.NOT_FOUND, 'BankName not found');
  }
  return bankName;
};

module.exports = {
  createBankName,
  queryBankNames,
  getBankNameById,
  getBankNameByClientId,
  updateBankNameById,
  deleteBankNameById,
};
