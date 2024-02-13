const httpStatus = require('http-status');
const { OttProviderPaymentMethod } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

const removeMain = async (providerId) => {
  if (providerId) {
    await OttProviderPaymentMethod.updateMany(
      {
        providerId,
      },
      { $set: { default: false } },
      { multi: true }
    );
  }
};

const selectOneMain = async (providerId) => {
  if (providerId) {
    await OttProviderPaymentMethod.updateOne(
      {
        providerId,
      },
      { $set: { default: true, inUse: true } },
      { multi: false }
    );
  }
};

// The first letters of the cardholder's name must be in uppercase
const capitalizeCard = async (cardholderName) => {
  return cardholderName
    .toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');
};

/**
 * Get ottProviderPaymentMethods
 * @returns {Promise<OttProviderPaymentMethod>}
 * @param providerId
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderPaymentMethods = async (providerId) => {
  return OttProviderPaymentMethod.find({
    providerId,
  });
};
/**

/**
 * Get ottProviderPaymentMethod by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProviderPaymentMethod>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderPaymentMethodById = async (id, options = {}) => {
  return OttProviderPaymentMethod.findById(id);
};
/**
 * Create a ottProviderPaymentMethod
 * @param {Object} ottProviderPaymentMethodBody
 * @returns {Promise<OttProviderPaymentMethod>}
 */
const createOttProviderPaymentMethod = async (ottProviderPaymentMethodBody) => {
  const body = ottProviderPaymentMethodBody;
  try {
    const list = await OttProviderPaymentMethod.find({ providerId: body.providerId });
    if (list && list.length === 0) {
      body.default = true;
    }
    if (body.default) {
      // eslint-disable-next-line no-use-before-define
      await removeMain(body.providerId);
    }
    if (body.paymentMethod === 0) {
      if (body.creditCard.cardholderName) {
        if (body.creditCard.billingAddress && typeof body.creditCard.billingAddress.phone === 'object') {
          body.creditCard.phone = body.creditCard.billingAddress.phone.number;
        }
        body.creditCard.cardholderName = await capitalizeCard(body.creditCard.cardholderName);
      }
    }
    const created = await OttProviderPaymentMethod.create(body);
    return getOttProviderPaymentMethodById(created._id);
  } catch (e) {
    throw new ApiError(httpStatus.BAD_REQUEST, e);
  }
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
const queryOttProviderPaymentMethods = async (filter, options) => {
  return OttProviderPaymentMethod.paginate(filter, options);
};

/**
 * Update ottProviderPaymentMethod by id
 * @param {ObjectId} ottProviderPaymentMethodId
 * @param {Object} updateBody
 * @returns {Promise<OttProviderPaymentMethod>}
 */
const updateOttProviderPaymentMethodById = async (ottProviderPaymentMethodId, updateBody) => {
  const ottProviderPaymentMethod = await getOttProviderPaymentMethodById(ottProviderPaymentMethodId);
  if (!ottProviderPaymentMethod) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderPaymentMethod not found');
  }
  const mainUpdated = ottProviderPaymentMethod.default !== updateBody.default;
  const existingUpdated = ottProviderPaymentMethod.anExistingAddress === updateBody.anExistingAddress;
  Object.assign(ottProviderPaymentMethod, updateBody);
  if (mainUpdated) {
    if (updateBody.default) {
      await removeMain(ottProviderPaymentMethod.providerId);
    } else {
      await selectOneMain(ottProviderPaymentMethod.providerId);
    }
  }
  if (!existingUpdated) {
    if (updateBody.anExistingAddress) {
      ottProviderPaymentMethod.billingAddress = undefined;
    } else if (!updateBody.anExistingAddress) {
      ottProviderPaymentMethod.existingAddress = undefined;
    }
  }
  if (ottProviderPaymentMethod.paymentMethod === 0) {
    if (updateBody.creditCard) {
      if (updateBody.creditCard.cardholderName) {
        ottProviderPaymentMethod.creditCard.cardholderName = await capitalizeCard(updateBody.creditCard.cardholderName);
      }
    }
  }
  if (updateBody.bankTransfer) {
    ottProviderPaymentMethod.creditCard = undefined;
  }
  if (updateBody.creditCard) {
    ottProviderPaymentMethod.bankTransfer = undefined;
  }
  await ottProviderPaymentMethod.save();
  return getOttProviderPaymentMethodById(ottProviderPaymentMethod.id);
};

/**
 * Delete ottProviderPaymentMethod by id
 * @param {ObjectId} ottProviderPaymentMethodId
 * @returns {Promise<OttProviderPaymentMethod>}
 */
const deleteOttProviderPaymentMethodById = async (ottProviderPaymentMethodId) => {
  const ottProviderPaymentMethod = await getOttProviderPaymentMethodById(ottProviderPaymentMethodId);
  if (!ottProviderPaymentMethod) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderPaymentMethod not found');
  }
  const { isMain } = ottProviderPaymentMethod;
  const { providerId } = ottProviderPaymentMethod;
  await ottProviderPaymentMethod.remove();
  if (isMain) selectOneMain(providerId);
  return ottProviderPaymentMethod;
};

module.exports = {
  createOttProviderPaymentMethod,
  queryOttProviderPaymentMethods,
  getOttProviderPaymentMethodById,
  getOttProviderPaymentMethods,
  updateOttProviderPaymentMethodById,
  deleteOttProviderPaymentMethodById,
};
