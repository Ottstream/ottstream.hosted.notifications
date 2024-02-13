const httpStatus = require('http-status');
const { OttProviderAddress } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

const removeMain = async (providerId) => {
  if (providerId) {
    await OttProviderAddress.updateMany(
      {
        providerId,
      },
      { $set: { isMain: false } },
      { multi: true }
    );
  }
};
/**
 * Create a OttProviderAddress
 * @param {Object} ottProviderAddressBody
 * @param providerId
 * @returns {Promise<OttProviderAddress>}
 */
const createOttProviderAddress = async (ottProviderAddressBody) => {
  const body = ottProviderAddressBody;
  try {
    const list = await OttProviderAddress.find({ providerId: body.providerId });
    if (list && list.length === 0) {
      body.isMain = true;
    }
    if (body.isMain) {
      // eslint-disable-next-line no-use-before-define
      await removeMain(body.providerId);
    }
    return OttProviderAddress.create(body);
  } catch {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OttProviderAddress is duplicate');
  }
};

const selectOneMain = async (providerId) => {
  if (providerId) {
    await OttProviderAddress.updateOne(
      {
        providerId,
      },
      { $set: { isMain: true, inUse: true } },
      { multi: false }
    );
  }
};

/**
 * @param filter
 * @param options
 *  @param user
 * @returns {Promise<QueryResult>}
 */
const queryOttProviderAddresses = async (filter, options) => {
  return OttProviderAddress.paginate(filter, options);
};

/**
 * Get OttProviderAddress by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProviderAddress>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderAddressById = async (id, options = {}) => {
  return OttProviderAddress.findById(id);
};

/**
 * Update OttProviderAddress by id
 * @param {ObjectId} ottProviderAddressId
 * @param {Object} updateBody
 * @returns {Promise<OttProviderAddress>}
 */
const updateOttProviderAddressById = async (ottProviderAddressId, updateBody) => {
  const ottProviderAddress = await getOttProviderAddressById(ottProviderAddressId);
  if (!ottProviderAddress) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderAddress not found');
  }
  const mainUpdated = ottProviderAddress.isMain !== updateBody.isMain;
  const companyUpdated = ottProviderAddress.company === updateBody.company;
  Object.assign(ottProviderAddress, updateBody);
  if (mainUpdated) {
    if (updateBody.isMain) {
      await removeMain(ottProviderAddress.providerId);
    } else {
      await selectOneMain(ottProviderAddress.providerId);
    }
  }
  if (!companyUpdated) {
    if (updateBody.company) {
      ottProviderAddress.firstname = undefined;
      ottProviderAddress.lastname = undefined;
    } else if (!updateBody.company) {
      ottProviderAddress.companyName = undefined;
    }
  }

  await ottProviderAddress.save();
  return ottProviderAddress;
};

/**
 * Delete OttProviderAddress by id
 * @param {ObjectId} ottProviderAddressId
 * @returns {Promise<OttProviderAddress>}
 */
const deleteOttProviderAddressById = async (ottProviderAddressId) => {
  const ottProviderAddress = await getOttProviderAddressById(ottProviderAddressId);
  if (!ottProviderAddress) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderAddress not found');
  }
  const { isMain } = ottProviderAddress;
  const { providerId } = ottProviderAddress;
  await ottProviderAddress.remove();
  if (isMain) selectOneMain(providerId);
  return ottProviderAddress;
};

/**
 * Get OttProviderInfo by id
 * @param ottProviderId
 * @param options
 * @returns {Promise<OttProviderAddress>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderAddressesByProviderId = async (ottProviderId, options) => {
  return OttProviderAddress.find({ providerId: ottProviderId });
};

module.exports = {
  createOttProviderAddress,
  queryOttProviderAddresses,
  getOttProviderAddressById,
  updateOttProviderAddressById,
  deleteOttProviderAddressById,
  getOttProviderAddressesByProviderId,
};
