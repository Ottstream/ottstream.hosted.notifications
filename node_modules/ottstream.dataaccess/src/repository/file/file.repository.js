const httpStatus = require('http-status');
const fs = require('fs');
const path = require('path');
const { File } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');
const langPick = require('../../utils/helpers/langPick');
const config = require('../../config/config');
const { resizeImage } = require('../../utils/image_processing/sharp_helper');

/**
 * Create a file
 * @param {Object} file
 * @param {Object} body
 * @param user
 * @returns {Promise<File>}
 */
const createFile = async (file, body, user) => {
  const entity = new File();
  entity.user = user._id;
  entity.name = file.originalname;
  entity.path = file.path;
  entity.destination = file.destination;
  entity.filename = file.filename;
  entity.mimetype = file.mimetype;
  entity.encoding = file.encoding;
  entity.size = file.size;
  return entity.save();
};

/**
 * Create a file
 * @param {Object} file
 * @param {Object} body
 * @param user
 * @returns {Promise<File>}
 */
const createChannelIconFile = async (file, body, user) => {
  const entity = new File();
  entity.user = user._id;
  entity.name = file.originalname;
  entity.path = file.path;
  entity.destination = file.destination;
  entity.filename = file.filename;
  entity.mimetype = file.mimetype;
  entity.encoding = file.encoding;
  entity.size = file.size;
  return entity.save();
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
const queryFiles = async (filter, options, user) => {
  return File.paginate(filter, options, {
    name: { $elemMatch: { lang: { $eq: langPick(options, user) } } },
    state: true,
    user: true,
  });
};

/**
 * Get file by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<File>}
 */
// eslint-disable-next-line no-unused-vars
const getFileById = async (id, options = {}) => {
  return File.findById(id);
};

/**
 * Get channel icon
 * @param params
 * @param options
 * @returns {Promise<string>}
 */
// eslint-disable-next-line no-unused-vars
const getChannelIcon = async (params, options = {}) => {
  let finalFilePath = null;
  const fileNameSplit = params.channelIdPlusExt.split('.');
  const channelNumber = fileNameSplit[0];
  const extension = fileNameSplit[1];
  const dimension = params.width;
  const folderPath = path.join(
    config.file.file_storage_path,
    'channels',
    channelNumber,
    params.setId.toString(),
    `${params.ratiox.toString()}x${params.ratioy.toString()}`
  );
  finalFilePath = path.join(folderPath, `${channelNumber}_${dimension}.${extension}`);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  // if (!fs.existsSync(finalFilePath)) {
  const cutedFilePath = path.join(folderPath, `${channelNumber}.jpg`);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(cutedFilePath)) {
    return null;
  }
  if (dimension !== 'original') {
    // eslint-disable-next-line radix
    await resizeImage(cutedFilePath, finalFilePath, parseInt(dimension), extension);
  } else {
    finalFilePath = cutedFilePath;
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return fs.existsSync(finalFilePath) ? finalFilePath : null;
};

/**
 * Update file by id
 * @param {ObjectId} fileId
 * @param {Object} updateBody
 * @returns {Promise<File>}
 */
const updateFileById = async (fileId, updateBody) => {
  const file = await getFileById(fileId);
  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }
  Object.assign(file, updateBody);
  await file.save();
  return file;
};

/**
 * Delete file by id
 * @param {ObjectId} fileId
 * @returns {Promise<File>}
 */
const deleteFileById = async (fileId) => {
  const file = await getFileById(fileId);
  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }
  await file.remove();
  return file;
};

module.exports = {
  createFile,
  createChannelIconFile,
  queryFiles,
  getFileById,
  getChannelIcon,
  updateFileById,
  deleteFileById,
};
