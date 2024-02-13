const httpStatus = require('http-status');
const { OttProviderPhone } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

const removeMain = async (providerId) => {
  if (providerId) {
    await OttProviderPhone.updateMany(
      {
        providerId,
      },
      { $set: { isMain: false } },
      { multi: true }
    );
  }
};

const selectOneMain = async (providerId) => {
  if (providerId) {
    await OttProviderPhone.updateOne(
      {
        providerId,
      },
      { $set: { isMain: true, inUse: true } },
      { multi: false }
    );
  }
};

/**
 * Create a ottProviderPhone
 * @param {Object} ottProviderPhoneBody
 * @param providerId
 * @returns {Promise<OttProviderPhone>}
 */
const createOttProviderPhone = async (ottProviderPhoneBody) => {
  const body = ottProviderPhoneBody;
  try {
    const list = await OttProviderPhone.find({ providerId: body.providerId });
    if (list && list.length === 0) {
      body.isMain = true;
    }
    if (body.isMain) {
      // eslint-disable-next-line no-use-before-define
      await removeMain(body.providerId);
    }
    return OttProviderPhone.create(body);
  } catch (e) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OttProviderPhone error');
  }
};

/**
 * Check a ottProviderPhone
 * @param {Object} ottProviderPhoneBody
 * @param user
 * @returns {Promise<OttProviderPhone>}
 */
const ottProviderCheckPhone = async (ottProviderPhoneBody = {}) => {
  return OttProviderPhone.isPhoneTaken(ottProviderPhoneBody.phone, ottProviderPhoneBody.providerId);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
const queryOttProviderPhones = async (filter, options) => {
  return OttProviderPhone.paginate(filter, options);
};

/**
 * Get ottProviderPhone by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProviderPhone>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderPhoneById = async (id, options = {}) => {
  return OttProviderPhone.findById(id);
};

/**
 * Get ottProviderPhones
 * * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProviderPhone>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderPhones = async (id, options = {}) => {
  return OttProviderPhone.find({ providerId: id });
};

/**
 * Update ottProviderPhone by id
 * @param {ObjectId} ottProviderPhoneId
 * @param {Object} updateBody
 * @returns {Promise<OttProviderPhone>}
 */
const updateOttProviderPhoneById = async (ottProviderPhoneId, updateBody) => {
  const ottProviderPhone = await getOttProviderPhoneById(ottProviderPhoneId);
  if (!ottProviderPhone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderPhone not found');
  }
  const mainUpdated = ottProviderPhone.isMain !== updateBody.isMain;
  Object.assign(ottProviderPhone, updateBody);
  if (mainUpdated) {
    if (updateBody.isMain) {
      await removeMain(ottProviderPhone.providerId);
    } else {
      await selectOneMain(ottProviderPhone.providerId);
    }
  }
  await ottProviderPhone.save();
  return ottProviderPhone;
};

/**
 * Delete ottProviderPhone by id
 * @returns {Promise<OttProviderEmail>}
 */
const removeOttPhones = async (providerId) => {
  return OttProviderPhone.remove({ providerId });
};

/**
 * Delete ottProviderPhone by id
 * @param {ObjectId} ottProviderPhoneId
 * @param {Object} updateBody
 * @returns {Promise<OttProviderPhone>}
 */
// eslint-disable-next-line no-unused-vars
const deleteOttProviderPhoneById = async (ottProviderPhoneId, updateBody) => {
  const ottProviderPhone = await getOttProviderPhoneById(ottProviderPhoneId);
  if (!ottProviderPhone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderAddress not found');
  }
  const { isMain } = ottProviderPhone;
  const { providerId } = ottProviderPhone;
  await ottProviderPhone.remove();
  if (isMain) selectOneMain(providerId);
  return ottProviderPhone;
};

module.exports = {
  createOttProviderPhone,
  ottProviderCheckPhone,
  queryOttProviderPhones,
  getOttProviderPhoneById,
  getOttProviderPhones,
  removeOttPhones,
  updateOttProviderPhoneById,
  deleteOttProviderPhoneById,
};
