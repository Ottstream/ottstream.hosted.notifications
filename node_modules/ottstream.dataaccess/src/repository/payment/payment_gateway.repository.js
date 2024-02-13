const httpStatus = require('http-status');
const { PaymentGateway } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');
const langPick = require('../../utils/helpers/langPick');

/**
 * Create a paymentGateway
 * @param {Object} paymentGatewayBody
 * @param user
 * @returns {Promise<PaymentGateway>}
 */
const createPaymentGateway = async (paymentGatewayBody, user) => {
  const body = paymentGatewayBody;
  if (user.provider && user.provider.id) body.provider = user.provider.id;
  if (user._id) body.user = user._id;
  return PaymentGateway.create(body);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
const queryPaymentGateways = async (filter, options, user) => {
  return PaymentGateway.paginate(filter, options, {
    name: { $elemMatch: { lang: { $eq: langPick(options, user) } } },
    state: true,
    user: true,
  });
};

/**
 * Get paymentGateway by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<PaymentGateway>}
 */
const getPaymentGatewayById = async (id, options = {}) => {
  const projection = {
    name: true,
    state: true,
    user: true,
    categorys: true,
  };
  if (options.lang) projection.name = { $elemMatch: { lang: { $eq: options.lang } } };
  return PaymentGateway.findById(id, projection).populate('categorys');
};

/**
 * Update paymentGateway by id
 * @param {ObjectId} paymentGatewayId
 * @param {Object} updateBody
 * @returns {Promise<PaymentGateway>}
 */
const updatePaymentGatewayById = async (paymentGatewayId, updateBody) => {
  const paymentGateway = await getPaymentGatewayById(paymentGatewayId);
  if (!paymentGateway) {
    throw new ApiError(httpStatus.NOT_FOUND, 'PaymentGateway not found');
  }
  Object.assign(paymentGateway, updateBody);
  await paymentGateway.save();
  return paymentGateway;
};

/**
 * Delete paymentGateway by id
 * @param {ObjectId} paymentGatewayId
 * @returns {Promise<PaymentGateway>}
 */
const deletePaymentGatewayById = async (paymentGatewayId) => {
  const paymentGateway = await getPaymentGatewayById(paymentGatewayId);
  if (!paymentGateway) {
    throw new ApiError(httpStatus.NOT_FOUND, 'PaymentGateway not found');
  }
  await paymentGateway.remove();
  return paymentGateway;
};

module.exports = {
  createPaymentGateway,
  queryPaymentGateways,
  getPaymentGatewayById,
  updatePaymentGatewayById,
  deletePaymentGatewayById,
};
