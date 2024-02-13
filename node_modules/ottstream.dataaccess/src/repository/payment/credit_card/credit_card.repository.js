const httpStatus = require('http-status');
const { CreditCard } = require('../../../models');
const ApiError = require('../../../api/utils/error/ApiError');

/**
 * Create a creditCard
 * @param {Object} creditCardBody
 * @param user
 * @returns {Promise<CreditCard>}
 */
const createCreditCard = async (creditCardBody, user) => {
  const body = creditCardBody;
  body.user = user._id;
  return CreditCard.create(body);
};
/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
const queryCreditCards = async (filter, options) => {
  return CreditCard.paginate(filter, options, {
    number: true,
    name: true,
  });
};

/**
 * Get creditCard by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<CreditCard>}
 */
const getCreditCardById = async (id, options = {}) => {
  const projection = {
    cardNumber: true,
    cardholderName: true,
    expireDate: true,
    user: true,
    cvc: true,
    address: true,
    country: true,
    city: true,
    suit: true,
    zip: true,
    state: true,
  };
  if (options.lang) projection.name = { $elemMatch: { lang: { $eq: options.lang } } };
  return CreditCard.findById(id, projection).populate('categorys');
};

/**
 * Update creditCard by id
 * @param {ObjectId} creditCardId
 * @param {Object} updateBody
 * @returns {Promise<CreditCard>}
 */
const updateCreditCardById = async (creditCardId, updateBody) => {
  const creditCard = await getCreditCardById(creditCardId);
  if (!creditCard) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CreditCard not found');
  }
  Object.assign(creditCard, updateBody);
  await creditCard.save();
  return creditCard;
};

/**
 * Delete creditCard by id
 * @param {ObjectId} creditCardId
 * @returns {Promise<CreditCard>}
 */
const deleteCreditCardById = async (creditCardId) => {
  const creditCard = await getCreditCardById(creditCardId);
  if (!creditCard) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CreditCard not found');
  }
  await creditCard.remove();
  return creditCard;
};

module.exports = {
  createCreditCard,
  queryCreditCards,
  getCreditCardById,
  updateCreditCardById,
  deleteCreditCardById,
};
