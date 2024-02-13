const httpStatus = require('http-status');
const { SystemVariable } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Create a systemVariable
 * @param {Object} systemVariableBody
 * @param user
 * @returns {Promise<SystemVariable>}
 */
const createSystemVariable = async (systemVariableBody, user) => {
  const body = systemVariableBody;
  body.user = user._id;
  return SystemVariable.create(body);
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
const querySystemVariables = async (filter, options) => {
  return SystemVariable.paginate(filter, options, {});
};

/**
 * Get systemVariable by id
 * @param {ObjectId} id
 * @returns {Promise<SystemVariable>}
 */
const getSystemVariableById = async (id) => {
  return SystemVariable.findById(id);
};

/**
 * Get systemVariable by id
 * @returns {Promise<SystemVariable>}
 */
const getSystemVariable = async () => {
  return SystemVariable.findOne({ state: 1 });
};

/**
 * Update systemVariable by id
 * @param {ObjectId} systemVariableId
 * @param {Object} updateBody
 * @returns {Promise<SystemVariable>}
 */
const updateSystemVariableById = async (systemVariableId, updateBody) => {
  const systemVariable = await getSystemVariableById(systemVariableId);
  if (!systemVariable) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SystemVariable not found');
  }
  Object.assign(systemVariable, updateBody);
  await systemVariable.save();
  return systemVariable;
};

/**
 * Delete systemVariable by id
 * @param {ObjectId} systemVariableId
 * @returns {Promise<SystemVariable>}
 */
const deleteSystemVariableById = async (systemVariableId) => {
  const systemVariable = await getSystemVariableById(systemVariableId);
  if (!systemVariable) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SystemVariable not found');
  }
  await systemVariable.remove();
  return systemVariable;
};

module.exports = {
  createSystemVariable,
  querySystemVariables,
  getSystemVariableById,
  getSystemVariable,
  updateSystemVariableById,
  deleteSystemVariableById,
};
