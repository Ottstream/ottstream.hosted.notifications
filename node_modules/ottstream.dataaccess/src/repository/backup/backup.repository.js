const httpStatus = require('http-status');
const { Backup, BackupOption } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

const backupPopulateObject = [
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
 * @returns {Promise<Backup>}
 */
// eslint-disable-next-line no-unused-vars
const getBackupById = async (id, options = {}) => {
  return Backup.findById(id).populate(backupPopulateObject);
};

/**
 * Get item by id
 * @param backupId
 * @param providerId
 * @param options
 * @returns {Promise<Backup>}
 */
// eslint-disable-next-line no-unused-vars
const getBackupOption = async (backupId, providerId, options = {}) => {
  const items = await BackupOption.find({
    provider: providerId,
    backup: backupId,
  }).populate(backupPopulateObject);
  if (items && items.length) return items[0];
  return null;
};

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Backup>}
 */
// eslint-disable-next-line no-unused-vars
const getBackupByMiddlewareId = async (id, options = {}) => {
  const backups = await Backup.find({
    middlewareId: id,
  }).populate(backupPopulateObject);
  if (backups.length) return backups[0];
  return null;
};

/**
 * Create a item backup
 * @param {Object} itemBody
 * @param user
 * @returns {Promise<Backup>}
 */
const createBackup = async (itemBody, user) => {
  const body = itemBody;
  // eslint-disable-next-line no-console
  if (!user.provider) throw new ApiError('no provider for user');
  body.provider = user.provider.id;
  const created = await Backup.create(body);
  return getBackupById(created.id);
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
const queryBackups = async (filter, options) => {
  return Backup.paginate(filter, options);
};

/**
 * Get backups
 * @returns {Promise<Backup>}
 */
// eslint-disable-next-line no-unused-vars
const getBackups = async (filter = {}, populate = [], projection = null) => {
  const query = Backup.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

/**
 * @returns {Promise<QueryResult>}
 * @param middlewareId
 */
const getBackupsByPackageMiddlewareId = async (middlewareId) => {
  const curOptions = {
    page: 1,
    limit: 10000,
  };

  const lookupFilter = [{ $unwind: '$packets' }, { $match: { packets: middlewareId } }];

  const aggregate = Backup.aggregate(lookupFilter);
  const list = await Backup.aggregatePaginate(aggregate, curOptions);

  list.docs.forEach((elem, i) => {
    list.docs[i].id = elem._id;
    delete list.docs[i]._id;
  });
  return {
    page: curOptions.page,
    limit: curOptions.limit,
    results: list.docs,
    totalPages: list.totalPages,
    totalResults: list.totalDocs,
  };
};

/**
 * Update Option by id
 * @param {ObjectId} backupId
 * @param {Object} updateBody
 * @returns {Promise<Backup>}
 */
const updateBackupById = async (backupId, updateBody) => {
  const item = await getBackupById(backupId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Backup not found');
  }
  Object.assign(item, updateBody);
  await item.save();
  return getBackupById(backupId);
};

/**
 * Delete item by id
 * @param {ObjectId} backupId
 * @param action
 * @returns {Promise<Backup>}
 */
const disableEnableBackupById = async (backupId, action) => {
  const _backup = await getBackupById(backupId);
  return Backup.updateOne({ _id: _backup._id }, { $set: { status: action ? 1 : 0 } }, { multi: false });
};

/**
 * Delete backup by id
 * @param {ObjectId} backupId
 * @returns {Promise<Balance>}
 */
const deleteBackupById = async (backupId) => {
  const _backup = await getBackupById(backupId);
  if (!_backup) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Balance not found');
  }
  await _backup.remove();
  return _backup;
};

module.exports = {
  createBackup,
  queryBackups,
  getBackupById,
  getBackupByMiddlewareId,
  getBackupsByPackageMiddlewareId,
  updateBackupById,
  disableEnableBackupById,
  deleteBackupById,
  getBackups,
};
