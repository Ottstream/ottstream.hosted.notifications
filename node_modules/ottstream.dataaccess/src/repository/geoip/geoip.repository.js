const httpStatus = require('http-status');
const { Geoip, GeoipOption } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

const geoipPopulateObject = [
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
];

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Geoip>}
 */
// eslint-disable-next-line no-unused-vars
const getGeoipByIp = async (ip, options = {}) => {
  const list = await Geoip.find({ ip }).populate(geoipPopulateObject);
  return list.length ? list[0] : null;
};

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Geoip>}
 */
// eslint-disable-next-line no-unused-vars
const getGeoipById = async (id, options = {}) => {
  return Geoip.findById(id).populate(geoipPopulateObject);
};

/**
 * Get item by id
 * @param geoipId
 * @param providerId
 * @param options
 * @returns {Promise<Geoip>}
 */
// eslint-disable-next-line no-unused-vars
const getGeoipOption = async (geoipId, providerId, options = {}) => {
  const items = await GeoipOption.find({
    provider: providerId,
    geoip: geoipId,
  }).populate(geoipPopulateObject);
  if (items && items.length) return items[0];
  return null;
};

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Geoip>}
 */
// eslint-disable-next-line no-unused-vars
const getGeoipByMiddlewareId = async (id, options = {}) => {
  const geoips = await Geoip.find({
    middlewareId: id,
  }).populate(geoipPopulateObject);
  if (geoips.length) return geoips[0];
  return null;
};

/**
 * Create a item geoip
 * @param {Object} itemBody
 * @param user
 * @returns {Promise<Geoip>}
 */
const createGeoip = async (itemBody) => {
  // eslint-disable-next-line no-console
  const created = await Geoip.create(itemBody);
  return getGeoipByIp(created.ip);
};

/**
 * Get list
 * @returns {Promise<OttProvider>}
 */
// eslint-disable-next-line no-unused-vars
const getList = async (filter = {}, populate = [], projection = null) => {
  const query = Geoip.find(filter).populate(populate);
  if (projection) query.projection(projection);
  return query;
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
const queryGeoips = async (filter, options) => {
  return Geoip.paginate(filter, options);
};

/**
 * @param id
 * @param options
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const getGeoipsList = async (id, options = {}) => {
  const geoips = await Geoip.find({
    ip: id.ip,
  }).populate(geoipPopulateObject);
  if (geoips.length) return geoips[0];
  return null;
};

/**
 * Update Option by id
 * @param {ObjectId} geoipId
 * @param {Object} updateBody
 * @returns {Promise<Geoip>}
 */
const updateGeoipById = async (geoipId, updateBody) => {
  const item = await getGeoipById(geoipId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Geoip not found');
  }
  Object.assign(item, updateBody);
  await item.save();
  return getGeoipById(geoipId);
};

/**
 * Delete item by id
 * @param {ObjectId} geoipId
 * @param action
 * @returns {Promise<Geoip>}
 */
const disableEnableGeoipById = async (geoipId, action) => {
  const _geoip = await getGeoipById(geoipId);
  return Geoip.updateOne({ _id: _geoip._id }, { $set: { status: action ? 1 : 0 } }, { multi: false });
};

/**
 * Delete geoip by id
 * @param {ObjectId} geoipId
 * @returns {Promise<Balance>}
 */
const deleteGeoipById = async (geoipId) => {
  const _geoip = await getGeoipById(geoipId);
  if (!_geoip) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Balance not found');
  }
  await _geoip.remove();
  return _geoip;
};

module.exports = {
  createGeoip,
  queryGeoips,
  getGeoipById,
  getGeoipByIp,
  getGeoipByMiddlewareId,
  updateGeoipById,
  disableEnableGeoipById,
  deleteGeoipById,
  getGeoipsList,
  getList,
};
