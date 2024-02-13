const httpStatus = require('http-status');
const { OttProviderEmail } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

const removeMain = async (providerId) => {
  if (providerId) {
    await OttProviderEmail.updateMany(
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
    await OttProviderEmail.updateOne(
      {
        providerId,
      },
      { $set: { isMain: true, inUse: true } },
      { multi: false }
    );
  }
};

/**
 * Create a ottProviderEmail
 * @param {Object} ottProviderEmailBody
 * @param providerId
 * @returns {Promise<OttProviderEmail>}
 */
const createOttProviderEmail = async (ottProviderEmailBody) => {
  const body = ottProviderEmailBody;
  try {
    const list = await OttProviderEmail.find({ providerId: body.providerId });
    if (list && list.length === 0) {
      body.isMain = true;
    }
    if (body.isMain) {
      // eslint-disable-next-line no-use-before-define
      await removeMain(body.providerId);
    }
    return OttProviderEmail.create(body);
  } catch (e) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OttProviderEmail error');
  }
};

/**
 * Check a ottProviderEmail
 * @param {Object} ottProviderEmailBody
 * @param user
 * @returns {Promise<OttProviderEmail>}
 */
const ottProviderCheckEmail = async (ottProviderEmailBody = {}) => {
  return OttProviderEmail.isEmailTaken(ottProviderEmailBody.email, ottProviderEmailBody.providerId);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
const queryOttProviderEmails = async (filter, options) => {
  return OttProviderEmail.paginate(filter, options);
};

/**
 * Get ottProviderEmail by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProviderEmail>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderEmailById = async (id, options = {}) => {
  return OttProviderEmail.findById(id);
};

/**
 * Get ottProviderEmails
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProviderEmail>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderEmails = async (id, options = {}) => {
  return OttProviderEmail.find({ providerId: id });
};

/**
 * Update ottProviderEmail by id
 * @param {ObjectId} ottProviderEmailId
 * @param {Object} updateBody
 * @returns {Promise<OttProviderEmail>}
 */
const updateOttProviderEmailById = async (ottProviderEmailId, updateBody) => {
  const ottProviderEmail = await getOttProviderEmailById(ottProviderEmailId);
  if (!ottProviderEmail) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderEmail not found');
  }
  const mainUpdated = ottProviderEmail.isMain !== updateBody.isMain;
  Object.assign(ottProviderEmail, updateBody);
  if (mainUpdated) {
    if (updateBody.isMain) {
      await removeMain(ottProviderEmail.providerId);
    } else {
      await selectOneMain(ottProviderEmail.providerId);
    }
  }
  await ottProviderEmail.save();
  return ottProviderEmail;
};

/**
 * Delete ottProviderEmail by id
 * @param {ObjectId} ottProviderEmailId
 * @returns {Promise<OttProviderEmail>}
 */
const deleteOttProviderEmailById = async (ottProviderEmailId) => {
  const ottProviderEmail = await getOttProviderEmailById(ottProviderEmailId);
  if (!ottProviderEmail) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderAddress not found');
  }
  const { isMain } = ottProviderEmail;
  const { providerId } = ottProviderEmail;
  await ottProviderEmail.remove();
  if (isMain) selectOneMain(providerId);
  return ottProviderEmail;
};

/**
 * Delete ottProviderEmail by id
 * @returns {Promise<OttProviderEmail>}
 */
const removeOttEmails = async (providerId) => {
  return OttProviderEmail.remove({ providerId });
};

const getProviderEmails = async (providerId) => {
  return OttProviderEmail.find({
    providerId,
  });
};

module.exports = {
  getProviderEmails,
  createOttProviderEmail,
  ottProviderCheckEmail,
  queryOttProviderEmails,
  removeOttEmails,
  getOttProviderEmailById,
  updateOttProviderEmailById,
  deleteOttProviderEmailById,
  getOttProviderEmails,
};
