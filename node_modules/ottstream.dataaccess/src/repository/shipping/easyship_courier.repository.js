const httpStatus = require('http-status');
const { EasyshipCourier } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

// eslint-disable-next-line no-unused-vars
const easyshipCourierPopulateObject = [];

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<EasyshipCourier>}
 */
// eslint-disable-next-line no-unused-vars
const getEasyshipCourierById = async (id, options = {}) => {
  return EasyshipCourier.findById(id);
};

/**
 * Get item by id
 * @returns {Promise<EasyshipCourier>}
 * @param filter
 */
// eslint-disable-next-line no-unused-vars
const getEasyshipCouriers = async (filter) => {
  return EasyshipCourier.find(filter);
};

/**
 * Create a item easyshipCourier
 * @param {Object} itemBody
 * @param user
 * @returns {Promise<EasyshipCourier>}
 */
const createEasyshipCourier = async (itemBody, user) => {
  const body = itemBody;
  // eslint-disable-next-line no-console
  if (user) body.user = user._id;
  const created = await EasyshipCourier.create(body);
  return getEasyshipCourierById(created.id);
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryEasyshipCouriers = async (filter, options) => {
  return EasyshipCourier.paginate(filter, options, null, easyshipCourierPopulateObject);
};

/**
 * Update Option by id
 * @param {ObjectId} easyshipCourierId
 * @param {Object} updateBody
 * @returns {Promise<EasyshipCourier>}
 */
const updateEasyshipCourierById = async (easyshipCourierId, updateBody) => {
  const item = await getEasyshipCourierById(easyshipCourierId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'EasyshipCourier not found');
  }
  Object.assign(item, updateBody);
  await item.save();
  return getEasyshipCourierById(easyshipCourierId);
};

/**
 * easyshipCourier action by id
 * @returns {Promise<EasyshipCourier>}
 * @param {Object} updateBody
 */
const easyshipCouriersActionById = async (updateBody) => {
  try {
    if (!updateBody) throw new ApiError(httpStatus.BAD_REQUEST, 'EasyshipCourier not found');
    const { easyshipCourierId } = updateBody;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < easyshipCourierId.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const easyshipCourier = await getEasyshipCourierById(easyshipCourierId[i]);
      // eslint-disable-next-line no-await-in-loop
      await EasyshipCourier.updateMany(
        {
          _id: easyshipCourier._id,
        },
        { $set: { enableForSale: updateBody.enableForSale } },
        { multi: true }
      );
    }
    return easyshipCourierId;
  } catch (e) {
    throw new ApiError(httpStatus.BAD_REQUEST, e);
  }
};

/**
 * Delete easyshipCourier by id
 * @param {Object} easyshipCourierId
 * @returns {Promise<Balance>}
 */
const deleteEasyshipCourierById = async (easyshipCourierId) => {
  // eslint-disable-next-line no-await-in-loop
  const _easyshipCourier = await getEasyshipCourierById(easyshipCourierId);
  if (!_easyshipCourier) {
    throw new ApiError(httpStatus.NOT_FOUND, 'EasyshipCourier not found');
  }
  // eslint-disable-next-line no-await-in-loop
  await _easyshipCourier.remove();
  return _easyshipCourier;
};

module.exports = {
  createEasyshipCourier,
  getEasyshipCouriers,
  queryEasyshipCouriers,
  getEasyshipCourierById,
  updateEasyshipCourierById,
  easyshipCouriersActionById,
  deleteEasyshipCourierById,
};
