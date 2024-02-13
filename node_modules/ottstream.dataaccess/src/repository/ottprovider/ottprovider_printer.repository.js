const httpStatus = require('http-status');
const { OttProviderPrinter } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

/**
 * Create a ottProviderPrinter
 * @param {Object} ottProviderPrinterBody
 * @param providerId
 * @returns {Promise<OttProviderPrinter>}
 */
const createOttProviderPrinter = async (ottProviderPrinterBody) => {
  const body = ottProviderPrinterBody;
  return OttProviderPrinter.create(body);
};

/**
 * Check a ottProviderPrinter
 * @param {Object} ottProviderPrinterBody
 * @param user
 * @returns {Promise<OttProviderPrinter>}
 */
const ottProviderCheckPrinter = async (ottProviderPrinterBody = {}) => {
  return OttProviderPrinter.isPrinterTaken(ottProviderPrinterBody.printer, ottProviderPrinterBody.providerId);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
const queryOttProviderPrinters = async (filter, options) => {
  return OttProviderPrinter.paginate(filter, options);
};

/**
 * Get ottProviderPrinter by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<OttProviderPrinter>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderPrinterById = async (id, options = {}) => {
  return OttProviderPrinter.findById(id);
};

/**
 * Get ottProviderPrinter by provider id
 * @param {ObjectId} providerId
 * @param options
 * @returns {Promise<OttProviderPrinter>}
 */
// eslint-disable-next-line no-unused-vars
const getOttProviderPrinterByProviderId = async (providerId, options = {}) => {
  return OttProviderPrinter.find({ providerId });
};

/**
 * Update ottProviderPrinter by id
 * @param {ObjectId} ottProviderPrinterId
 * @param {Object} updateBody
 * @returns {Promise<OttProviderPrinter>}
 */
const updateOttProviderPrinterById = async (ottProviderPrinterId, updateBody) => {
  const ottProviderPrinter = await getOttProviderPrinterById(ottProviderPrinterId);
  if (!ottProviderPrinter) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderPrinter not found');
  }
  Object.assign(ottProviderPrinter, updateBody);
  await ottProviderPrinter.save();

  return ottProviderPrinter;
};

/**
 * Delete ottProviderPrinter by id
 * @param {ObjectId} ottProviderPrinterId
 * @returns {Promise<OttProviderPrinter>}
 */
const deleteOttProviderPrinterById = async (ottProviderPrinterId) => {
  const ottProviderPrinter = await getOttProviderPrinterById(ottProviderPrinterId);
  if (!ottProviderPrinter) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OttProviderPrinter not found');
  }
  await ottProviderPrinter.remove();
  // if (ottProviderPrinter && ottProviderPrinter.isMain) {
  //   await ottProviderPrinter.updateOne(
  //     {
  //       providerId: ottProviderPrinter.providerId,
  //     },
  //     { $set: { isMain: true } },
  //     { new: true }
  //   );
  //   await ottProviderPrinter.save();
  // }
  return ottProviderPrinter;
};

module.exports = {
  createOttProviderPrinter,
  ottProviderCheckPrinter,
  getOttProviderPrinterByProviderId,
  queryOttProviderPrinters,
  getOttProviderPrinterById,
  updateOttProviderPrinterById,
  deleteOttProviderPrinterById,
};
