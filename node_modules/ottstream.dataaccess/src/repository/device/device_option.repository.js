const { DeviceOption } = require('../../models');

/**
 * Get DeviceOption by id
 * @param {ObjectId} providerId
 * @returns {Promise<DeviceOption>}
 */
const getDeviceOptions = async (providerId) => {
  const list = await DeviceOption.find({ provider: providerId });
  return list.length ? list[0] : null;
};

/**
 * Update deviceOption by id
 * @param {ObjectId} providerId
 * @param {Object} updateBody
 * @returns {Promise<DeviceOption>}
 */
const updateDeviceOptions = async (providerId, updateBody) => {
  let deviceOption = await getDeviceOptions(providerId);
  if (!deviceOption) {
    deviceOption = await DeviceOption.create(updateBody);
  }
  deviceOption.updatedAt = new Date();
  Object.assign(deviceOption, updateBody);
  await deviceOption.save();
  return deviceOption;
};

module.exports = {
  updateDeviceOptions,
  getDeviceOptions,
};
