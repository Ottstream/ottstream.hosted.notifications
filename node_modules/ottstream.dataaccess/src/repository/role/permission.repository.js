const httpStatus = require('http-status');
const { Permission } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Create a permission
 * @param {Object} permissionBody
 * @param user
 * @returns {Promise<Permission>}
 */
const createPermission = async (permissionBody, user = {}) => {
  const body = permissionBody;
  body.user = user._id;
  return Permission.create(body);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
const queryPermissions = async (filter, options) => {
  return Permission.paginate(filter, options, {
    keyword: true,
    description: true,
    state: true,
    user: true,
  });
};

/**
 * Get permission by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Permission>}
 */
// eslint-disable-next-line no-unused-vars
const getPermissionById = async (id, options = {}) => {
  const projection = {
    keyword: true,
    description: true,
    state: true,
    user: true,
  };
  return Permission.findById(id, projection);
};

/**
 * Get permission by keyword
 * @param {ObjectId} id
 * @param keyword
 * @returns {Promise<Permission>}
 */
// eslint-disable-next-line no-unused-vars
const getPermissionsByKeyword = async (id, keyword) => {
  const projection = {
    keyword: true,
    description: true,
    state: true,
    user: true,
  };
  return Permission.findOne({ keyword }, projection);
};

/**
 * Update permission by id
 * @param {ObjectId} permissionId
 * @param {Object} updateBody
 * @returns {Promise<Permission>}
 */
const updatePermissionById = async (permissionId, updateBody) => {
  const permission = await getPermissionById(permissionId);
  if (!permission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Permission not found');
  }
  Object.assign(permission, updateBody);
  await permission.save();
  return permission;
};

/**
 * Delete permission by id
 * @param {ObjectId} permissionId
 * @returns {Promise<Permission>}
 */
const deletePermissionById = async (permissionId) => {
  const permission = await getPermissionById(permissionId);
  if (!permission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Permission not found');
  }
  await permission.remove();
  return permission;
};

module.exports = {
  createPermission,
  queryPermissions,
  getPermissionById,
  updatePermissionById,
  deletePermissionById,
  getPermissionsByKeyword,
};
