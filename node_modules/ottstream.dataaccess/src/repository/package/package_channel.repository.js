require('http-status');
const { PackageChannel } = require('../../models');
require('../../api/utils/error/ApiError');

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Package>}
 */

// eslint-disable-next-line no-unused-vars
const getPackageChannels = async (id, options = {}) => {
  return PackageChannel.find({
    package: id,
  }).populate([
    {
      path: 'package',
    },
    {
      path: 'channel',
    },
  ]);
};

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Package>}
 */
// eslint-disable-next-line no-unused-vars
const getPackageChannelsByPackageMiddlewareId = async (id, options = {}) => {
  return PackageChannel.find({
    packageMiddlewareId: id,
  }).populate([
    {
      path: 'package',
    },
    {
      path: 'channel',
    },
  ]);
};

/**
 * Get item by id
 * @returns {Promise<Package>}
 * @param _package
 * @param channel
 */
// eslint-disable-next-line no-unused-vars
const getPackageChannelByIds = async (_package, channel) => {
  const packages = await PackageChannel.find({
    package: _package,
    channel,
  }).populate([
    {
      path: 'package',
    },
    {
      path: 'channel',
    },
  ]);
  if (packages && packages.length) return packages[0];
  return null;
};

/**
 * Create a item package
 * @param _package
 * @param _channel
 * @param packageMiddlewareId
 * @param channelMiddlewareId
 */
const AddChannelToPackage = async (_package, _channel, packageMiddlewareId, channelMiddlewareId) => {
  const prev = await getPackageChannelByIds(_package, _channel);
  if (prev) return;

  const body = {};
  // eslint-disable-next-line no-console
  body.package = _package;
  body.channel = _channel;
  body.packageMiddlewareId = packageMiddlewareId;
  body.channelMiddlewareId = channelMiddlewareId;
  return PackageChannel.create(body);
};

/**
 * Create a item package
 * @returns {Promise<Package>}
 * @param _package
 * @param _channel
 */
const RemoveChannelFromPackage = async (_package, _channel) => {
  const prev = await getPackageChannelByIds(_package, _channel);
  if (prev) {
    await prev.remove();
    return prev;
  }
};

/**
 * Delete package channel by id
 * @param {ObjectId} id
 * @returns {Promise<Currency>}
 */
const RemovePackageChannel = async (id) => {
  const item = await PackageChannel.findById(id);
  if (item) {
    await item.remove();
  }
  return item;
};

module.exports = {
  getPackageChannels,
  getPackageChannelByIds,
  getPackageChannelsByPackageMiddlewareId,
  AddChannelToPackage,
  RemoveChannelFromPackage,
  RemovePackageChannel,
};
