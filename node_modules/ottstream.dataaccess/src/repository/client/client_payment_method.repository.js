const httpStatus = require('http-status');
const { ClientPaymentMethod } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');
const { addToClient, removeFromClient } = require('./client.shared.repository');

const removeMain = async (clientId) => {
  if (clientId) {
    await ClientPaymentMethod.updateMany(
      {
        clientId,
      },
      { $set: { default: false } },
      { multi: true }
    );
  }
};

const selectOneMain = async (clientId) => {
  if (clientId) {
    await ClientPaymentMethod.updateOne(
      {
        clientId,
      },
      { $set: { default: true, inUse: true } },
      { multi: false }
    );
  }
};
// to organize from front
// const capitalizeCard = async (cardholderName) => {
//   return cardholderName
//     .toLowerCase()
//     .split(' ')
//     .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
//     .join(' ');
// };

/**
 * Get ClientPaymentMethod by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<ClientPaymentMethod>}
 */
// eslint-disable-next-line no-unused-vars
const getClientPaymentMethodById = async (id, options = {}) => {
  return ClientPaymentMethod.findById(id);
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
 * Create a clientPaymentMethod
 * @param {Object} clientPaymentMethodBody
 * @returns {Promise<ClientPaymentMethod>}
 */
const createClientPaymentMethod = async (clientPaymentMethodBody) => {
  const body = clientPaymentMethodBody;
  try {
    const list = await ClientPaymentMethod.find({ clientId: body.clientId });
    if (list && list.length === 0) {
      body.default = true;
    }
    if (body.paymentMethod === 0) {
      if (body.creditCard.cardholderName) {
        if (body.creditCard.billingAddress && typeof body.creditCard.billingAddress.phone === 'object') {
          body.creditCard.phone = body.creditCard.billingAddress.phone.number;
        }
        body.creditCard.cardholderName = await capitalizeCard(body.creditCard.cardholderName);
      }
    }
    if (body.default) {
      // eslint-disable-next-line no-use-before-define
      await removeMain(body.clientId);
    }
    const created = await ClientPaymentMethod.create(body);
    if (created) {
      await addToClient(body.clientId, 'paymentMethods', created._id);
    }
    return getClientPaymentMethodById(created._id);
  } catch (e) {
    throw new ApiError(httpStatus.BAD_REQUEST, e);
  }
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
const queryClientPaymentMethods = async (filter, options) => {
  return ClientPaymentMethod.paginate(filter, options);
};

/**
 * @returns {Promise<QueryResult>}
 * @param clientId
 */
const getClientPaymentMethods = async (clientId) => {
  return ClientPaymentMethod.find({
    clientId,
  });
};

/**
 * Get ClientPaymentMethod by clientId
 * @param {ObjectId} clientId
 * @param options
 * @returns {Promise<ClientPaymentMethod>}
 */
// eslint-disable-next-line no-unused-vars
const getClientPaymentMethodByClientId = async (clientId, options) => {
  return ClientPaymentMethod.find({ clientId });
};

/**
 * Update ClientPaymentMethod by id
 * @param {ObjectId} clientPaymentMethodId
 * @param {Object} updateBody
 * @returns {Promise<ClientPaymentMethod>}
 */
const updateClientPaymentMethodById = async (clientPaymentMethodId, updateBody) => {
  const clientPaymentMethod = await getClientPaymentMethodById(clientPaymentMethodId);
  if (!clientPaymentMethod) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientPaymentMethod not found');
  }
  const existingUpdated = clientPaymentMethod.anExistingAddress === updateBody.anExistingAddress;
  const mainUpdated = clientPaymentMethod.default !== updateBody.default;
  Object.assign(clientPaymentMethod, updateBody);
  if (mainUpdated) {
    if (updateBody.default) {
      await removeMain(clientPaymentMethod.clientId);
    } else {
      await selectOneMain(clientPaymentMethod.clientId);
    }
  }
  if (!existingUpdated) {
    if (updateBody.anExistingAddress) {
      clientPaymentMethod.billingAddress = undefined;
    } else if (!updateBody.anExistingAddress) {
      clientPaymentMethod.existingAddress = undefined;
    }
  }
  if (updateBody.bankTransfer) {
    clientPaymentMethod.creditCard = undefined;
  }
  if (updateBody.creditCard) {
    clientPaymentMethod.bankTransfer = undefined;
  }
  await clientPaymentMethod.save();
  return getClientPaymentMethodById(clientPaymentMethod.id);
};

/**
 * Delete ClientPaymentMethod by id
 * @param {ObjectId} clientPaymentMethodId
 * @returns {Promise<ClientPaymentMethod>}
 */
const deleteClientPaymentMethodById = async (clientPaymentMethodId) => {
  const clientPaymentMethod = await getClientPaymentMethodById(clientPaymentMethodId);
  if (!clientPaymentMethod) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientPaymentMethod not found');
  }
  const isMain = clientPaymentMethod.default;
  const { clientId } = clientPaymentMethod;
  await clientPaymentMethod.remove();
  if (isMain) selectOneMain(clientId);
  await removeFromClient(clientId, 'paymentMethods', clientPaymentMethodId);
  return clientPaymentMethod;
};

/**
 * Get list
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getList = async (filter = {}, populate = [], projection = null) => {
  const query = ClientPaymentMethod.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

module.exports = {
  getList,
  createClientPaymentMethod,
  getClientPaymentMethods,
  queryClientPaymentMethods,
  getClientPaymentMethodById,
  getClientPaymentMethodByClientId,
  updateClientPaymentMethodById,
  deleteClientPaymentMethodById,
};
