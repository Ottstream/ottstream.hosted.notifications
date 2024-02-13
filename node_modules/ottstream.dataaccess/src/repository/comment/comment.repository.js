const httpStatus = require('http-status');
const { Comment } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

// eslint-disable-next-line no-unused-vars
const commentPopulateObject = [
  {
    path: 'client',
    select: 'personalInfo provider id',
    populate: [
      {
        path: 'provider',
        select: 'id name parent',
      },
    ],
  },
  {
    path: 'updateUser',
  },
  {
    path: 'user',
    select: 'firstname lastname',
  },
  {
    path: 'notification',
    populate: [
      {
        path: 'updateUser',
      },
    ],
  },
];

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Comment>}
 */
// eslint-disable-next-line no-unused-vars
const getCommentById = async (id, options = {}) => {
  return Comment.findById(id).populate(commentPopulateObject);
};

/**
 * Get item by id
 * @returns {Promise<Comment>}
 * @param filter
 */
// eslint-disable-next-line no-unused-vars
const getComments = async (filter) => {
  return Comment.find(filter).populate(commentPopulateObject);
};

/**
 * Create a item comment
 * @param {Object} itemBody
 * @param user
 * @returns {Promise<Comment>}
 */
const createComment = async (itemBody, user) => {
  const body = itemBody;
  body.user = user._id;
  const created = await Comment.create(body);
  return getCommentById(created.id);
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryComments = async (filter, options) => {
  return Comment.paginate(filter, options, null, commentPopulateObject);
};

/**
 * Update Option by id
 * @param {ObjectId} commentId
 * @param {Object} updateBody
 * @returns {Promise<Comment>}
 */
const updateCommentById = async (commentId, updateBody) => {
  const item = await getCommentById(commentId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }
  Object.assign(item, updateBody);
  await item.save();
  return getCommentById(commentId);
};

/**
 * comment action by id
 * @returns {Promise<Comment>}
 * @param {Object} updateBody
 */
const commentsActionById = async (updateBody) => {
  try {
    if (!updateBody) throw new ApiError(httpStatus.BAD_REQUEST, 'Comment not found');
    const { commentId } = updateBody;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < commentId.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const comment = await getCommentById(commentId[i]);
      // eslint-disable-next-line no-await-in-loop
      await Comment.updateMany(
        {
          _id: comment._id,
        },
        { $set: { enableForSale: updateBody.enableForSale } },
        { multi: true }
      );
    }
    return commentId;
  } catch (e) {
    throw new ApiError(httpStatus.BAD_REQUEST, e);
  }
};

/**
 * Delete comment by id
 * @param {Object} commentId
 * @returns {Promise<Balance>}
 */
const deleteCommentById = async (commentId) => {
  // eslint-disable-next-line no-await-in-loop
  const _comment = await getCommentById(commentId);
  if (!_comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }
  // eslint-disable-next-line no-await-in-loop
  await _comment.remove();
  return _comment;
};

/**
 * delete many
 */
// eslint-disable-next-line no-unused-vars
const deleteMany = async (filter = {}) => {
  await Comment.deleteMany(filter);
};

module.exports = {
  createComment,
  getComments,
  queryComments,
  getCommentById,
  updateCommentById,
  commentsActionById,
  deleteCommentById,
  deleteMany,
};
