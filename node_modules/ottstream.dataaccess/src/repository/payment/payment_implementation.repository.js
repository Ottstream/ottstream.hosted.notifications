const httpStatus = require('http-status');
const { PaymentImplementation } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');
const langPick = require('../../utils/helpers/langPick');

/**
 * Create a paymentImplementation
 * @param {Object} paymentImplementationBody
 * @param user
 * @returns {Promise<PaymentImplementation>}
 */
// eslint-disable-next-line no-unused-vars
const createPaymentImplementation = async (paymentImplementationBody, user) => {
  return PaymentImplementation.create(paymentImplementationBody);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
const queryPaymentImplementations = async (filter, options, user) => {
  return PaymentImplementation.paginate(filter, options, {
    name: { $elemMatch: { lang: { $eq: langPick(options, user) } } },
    state: true,
    user: true,
  });
};

/**
 * Get paymentImplementation by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<PaymentImplementation>}
 */
const getPaymentImplementationById = async (id, options = {}) => {
  const projection = {
    name: true,
    state: true,
    user: true,
    categorys: true,
  };
  if (options.lang) projection.name = { $elemMatch: { lang: { $eq: options.lang } } };
  return PaymentImplementation.findById(id, projection).populate('categorys');
};

/**
 * Get paymentImplementation by key
 * @param {String} key
 * @returns {Promise<PaymentImplementation>}
 */
const getPaymentImplementationByKey = async (key) => {
  return PaymentImplementation.findOne({ identifier: key });
};

/**
 * Update paymentImplementation by id
 * @param {ObjectId} paymentImplementationId
 * @param {Object} updateBody
 * @returns {Promise<PaymentImplementation>}
 */
const updatePaymentImplementationById = async (paymentImplementationId, updateBody) => {
  const paymentImplementation = await getPaymentImplementationById(paymentImplementationId);
  if (!paymentImplementation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'PaymentImplementation not found');
  }
  Object.assign(paymentImplementation, updateBody);
  await paymentImplementation.save();
  return paymentImplementation;
};

/**
 * Delete paymentImplementation by id
 * @param {ObjectId} paymentImplementationId
 * @returns {Promise<PaymentImplementation>}
 */
const deletePaymentImplementationById = async (paymentImplementationId) => {
  const paymentImplementation = await getPaymentImplementationById(paymentImplementationId);
  if (!paymentImplementation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'PaymentImplementation not found');
  }
  await paymentImplementation.remove();
  return paymentImplementation;
};

module.exports = {
  createPaymentImplementation,
  queryPaymentImplementations,
  getPaymentImplementationById,
  getPaymentImplementationByKey,
  updatePaymentImplementationById,
  deletePaymentImplementationById,
};
