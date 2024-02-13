const httpStatus = require('http-status');
const { PaymentMethod } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');
const langPick = require('../../utils/helpers/langPick');

/**
 * Create a paymentMethod
 * @param {Object} paymentMethodBody
 * @param user
 * @returns {Promise<PaymentMethod>}
 */
// eslint-disable-next-line no-unused-vars
const createPaymentMethod = async (paymentMethodBody, user) => {
  return PaymentMethod.create(paymentMethodBody);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
const queryPaymentMethods = async (filter, options, user) => {
  return PaymentMethod.paginate(filter, options, {
    name: { $elemMatch: { lang: { $eq: langPick(options, user) } } },
    state: true,
    user: true,
  });
};

/**
 * Get paymentMethod by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<PaymentMethod>}
 */
const getPaymentMethodById = async (id, options = {}) => {
  const projection = {
    name: true,
    state: true,
    user: true,
    categorys: true,
  };
  if (options.lang) projection.name = { $elemMatch: { lang: { $eq: options.lang } } };
  return PaymentMethod.findById(id, projection).populate('categorys');
};

/**
 * Get paymentMethod by key
 * @param {String} key
 * @returns {Promise<PaymentMethod>}
 */
const getPaymentMethodByKey = async (key) => {
  return PaymentMethod.findOne({ identifier: key });
};

/**
 * Update paymentMethod by id
 * @param {ObjectId} paymentMethodId
 * @param {Object} updateBody
 * @returns {Promise<PaymentMethod>}
 */
const updatePaymentMethodById = async (paymentMethodId, updateBody) => {
  const paymentMethod = await getPaymentMethodById(paymentMethodId);
  if (!paymentMethod) {
    throw new ApiError(httpStatus.NOT_FOUND, 'PaymentMethod not found');
  }
  Object.assign(paymentMethod, updateBody);
  await paymentMethod.save();
  return paymentMethod;
};

/**
 * Delete paymentMethod by id
 * @param {ObjectId} paymentMethodId
 * @returns {Promise<PaymentMethod>}
 */
const deletePaymentMethodById = async (paymentMethodId) => {
  const paymentMethod = await getPaymentMethodById(paymentMethodId);
  if (!paymentMethod) {
    throw new ApiError(httpStatus.NOT_FOUND, 'PaymentMethod not found');
  }
  await paymentMethod.remove();
  return paymentMethod;
};

module.exports = {
  createPaymentMethod,
  queryPaymentMethods,
  getPaymentMethodById,
  getPaymentMethodByKey,
  updatePaymentMethodById,
  deletePaymentMethodById,
};
