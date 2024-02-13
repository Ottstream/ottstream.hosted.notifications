const httpStatus = require('http-status');
const { Role } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Create a role
 * @param {Object} roleBody
 * @param user
 * @returns {Promise<Role>}
 */
const createRole = async (roleBody, user = {}) => {
  const body = roleBody;
  body.user = user._id;
  return Role.create(body);
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
const queryRoles = async (filter, options) => {
  return Role.paginate(
    filter,
    options,
    {
      name: true,
      state: true,
      user: true,
      keyword: true,
      permissions: true,
    },
    'permissions'
  );
};

/**
 * Get role by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Role>}
 */
const getRoleById = async (id, options = {}) => {
  const projection = {
    name: true,
    state: true,
    user: true,
    keyword: true,
    permissions: true,
  };
  if (options.lang) projection.name = { $elemMatch: { lang: { $eq: options.lang } } };
  return Role.findById(id, projection).populate('permissions');
};

/**
 * Get role by keyword
 * @param {String} keyword
 * @param options
 * @returns {Promise<Role>}
 */
const getRoleByKeyword = async (keyword, options = {}) => {
  const projection = {
    name: true,
    state: true,
    user: true,
    keyword: true,
    permissions: true,
  };
  if (options.lang) projection.name = { $elemMatch: { lang: { $eq: options.lang } } };
  return Role.findOne(
    {
      keyword,
    },
    projection
  ).populate('permissions');
};

/**
 * Update role by id
 * @param {ObjectId} roleId
 * @param {Object} updateBody
 * @returns {Promise<Role>}
 */
const updateRoleById = async (roleId, updateBody) => {
  const role = await getRoleById(roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }
  Object.assign(role, updateBody);
  await role.save();
  return role;
};

/**
 * Delete role by id
 * @param {ObjectId} roleId
 * @returns {Promise<Role>}
 */
const deleteRoleById = async (roleId) => {
  const role = await getRoleById(roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }
  await role.remove();
  return role;
};

module.exports = {
  createRole,
  queryRoles,
  getRoleById,
  getRoleByKeyword,
  updateRoleById,
  deleteRoleById,
};
