const httpStatus = require('http-status');
const { OttProviderPermission, OttProvider } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Create a OttProviderPermission
 * @param {Object} ottProviderPermissionBody
 * @returns {Promise<OttProviderPermission>}
 */
const createOttProviderPermission = async (ottProviderPermissionBody) => {
  try {
    return OttProviderPermission.create(ottProviderPermissionBody);
  } catch {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OttProviderPermission is duplicate');
  }
};

/**
 * @param filter
 *  @param options
 * @returns {Promise<QueryResult>}
 */
const queryOttProviderPermissions = async (filter, options) => {
  return OttProviderPermission.paginate(filter, options);
};

/**
 * Get OttProviderPermission by OttProvider id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProviderPermission>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderPermission = async (id, options = {}) => {
  const provider = await OttProvider.findById(id);
  if (!provider) {
    throw new ApiError(httpStatus.NOT_FOUND, 'provider not found');
  }
  if (!provider.permission) {
    provider.permission = {
      permissions: [],
    };
    await provider.save();
  }
  return provider.permission;
};

/**
 * Update OttProviderPermission
 * @param {Object} ottProviderId
 * @param {Object} ottProviderId
 * @param {Object} permissionObject
 * @returns {Promise<OttProviderPermission>}
 */
const updateOttProviderPermission = async (ottProviderId, permissionObject) => {
  await getOttProviderPermission(ottProviderId);
  const ottProvider = await OttProvider.findById(ottProviderId);
  const permissions = ottProvider.permission?.permissions || [];

  const found = permissions.filter((r) => r.permission === permissionObject.permissions.permission).length;
  if (!found) permissions.push(permissionObject.permissions);
  else {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < permissions.length; i++) {
      if (permissions[i].permission === permissionObject.permissions.permission) {
        permissions[i].onOff = permissionObject.permissions.onOff;
        permissions[i].onOffChild = permissionObject.permissions.onOffChild;
      }
    }
  }
  const updateObject = { permission: { permissions } };
  await OttProvider.updateOne({ _id: ottProvider.id }, updateObject);
  return updateObject;
};

module.exports = {
  createOttProviderPermission,
  queryOttProviderPermissions,
  updateOttProviderPermission,
  getOttProviderPermission,
};
