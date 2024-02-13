const httpStatus = require('http-status');
const { Group, GroupOption } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

const groupPopulateObject = [
  // {
  //   path: 'payment.balance.currency',
  //   model: 'Currency',
  // },
  // {
  //   path: 'payment.balance.priceGroup',
  //   model: 'PriceGroup',
  // },
  // {
  //   path: 'locations',
  //   populate: [
  //     {
  //       path: 'room',
  //     },
  //   ],
  // },
  {
    path: 'provider',
  },
];

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Group>}
 */
// eslint-disable-next-line no-unused-vars
const getGroupById = async (id, options = {}) => {
  return Group.findById(id).populate(groupPopulateObject);
};

/**
 * Get item by id
 * @param groupId
 * @param providerId
 * @param options
 * @returns {Promise<Group>}
 */
// eslint-disable-next-line no-unused-vars
const getGroupOption = async (groupId, providerId, options = {}) => {
  const items = await GroupOption.find({
    provider: providerId,
    group: groupId,
  }).populate(groupPopulateObject);
  if (items && items.length) return items[0];
  return null;
};

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Group>}
 */
// eslint-disable-next-line no-unused-vars
const getGroupByMiddlewareId = async (id, options = {}) => {
  const groups = await Group.find({
    middlewareId: id,
  }).populate(groupPopulateObject);
  if (groups.length) return groups[0];
  return null;
};

/**
 * Create a item group
 * @param {Object} itemBody
 * @param user
 * @returns {Promise<Group>}
 */
const createGroup = async (itemBody, user) => {
  const body = itemBody;
  // eslint-disable-next-line no-console
  if (!user.provider) throw new ApiError('no provider for user');
  body.provider = user.provider.id;
  const created = await Group.create(body);
  return getGroupById(created.id);
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
const queryGroups = async (filter, options) => {
  return Group.paginate(filter, options);
};

/**
 * Update Option by id
 * @param {ObjectId} groupId
 * @param {Object} updateBody
 * @returns {Promise<Group>}
 */
const updateGroupById = async (groupId, updateBody) => {
  const item = await getGroupById(groupId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Group not found');
  }
  Object.assign(item, updateBody);
  await item.save();
  return getGroupById(groupId);
};

/**
 * Delete item by id
 * @param {ObjectId} groupId
 * @param action
 * @returns {Promise<Group>}
 */
const disableEnableGroupById = async (groupId, action) => {
  const _group = await getGroupById(groupId);
  return Group.updateOne({ _id: _group._id }, { $set: { status: action ? 1 : 0 } }, { multi: false });
};

/**
 * Delete group by id
 * @param {ObjectId} groupId
 * @returns {Promise<Balance>}
 */
const deleteGroupById = async (groupId) => {
  const _group = await getGroupById(groupId);
  if (!_group) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Balance not found');
  }
  await _group.remove();
  return _group;
};

module.exports = {
  createGroup,
  queryGroups,
  getGroupById,
  getGroupByMiddlewareId,
  updateGroupById,
  disableEnableGroupById,
  deleteGroupById,
};
