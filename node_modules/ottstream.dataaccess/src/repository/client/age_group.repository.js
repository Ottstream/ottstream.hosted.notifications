const httpStatus = require('http-status');
const { AgeGroup } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Create a channel package
 * @param {Object} channelBody
 * @param user
 * @returns {Promise<AgeGroup>}
 */
const createAgeGroup = async (channelBody, user) => {
  const body = channelBody;
  body.user = user._id;
  return AgeGroup.create(body);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryAgeGroups = async (filter, options, user) => {
  return AgeGroup.paginate(filter, options);
};

/**
 * Get channel by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<AgeGroup>}
 */
// eslint-disable-next-line no-unused-vars
const getAgeGroupById = async (id, options = {}) => {
  return AgeGroup.findById(id);
};

/**
 * Update channel by id
 * @param {ObjectId} ageGroupId
 * @param {Object} updateBody
 * @returns {Promise<AgeGroup>}
 */
const updateAgeGroupById = async (ageGroupId, updateBody) => {
  const channel = await getAgeGroupById(ageGroupId);
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'AgeGroup not found');
  }
  Object.assign(channel, updateBody);
  await channel.save();
  return channel;
};

/**
 * Delete channel by id
 * @param {ObjectId} ageGroupId
 * @returns {Promise<AgeGroup>}
 */
const deleteAgeGroupById = async (ageGroupId) => {
  const channel = await getAgeGroupById(ageGroupId);
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'AgeGroup not found');
  }
  await channel.remove();
  return channel;
};

module.exports = {
  createAgeGroup,
  queryAgeGroups,
  getAgeGroupById,
  updateAgeGroupById,
  deleteAgeGroupById,
};
