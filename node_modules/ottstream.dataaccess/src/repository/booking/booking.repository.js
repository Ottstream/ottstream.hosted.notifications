const httpStatus = require('http-status');
const { Booking } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');

const populateObject = [
  {
    path: 'package',
    populate: [
      {
        path: 'prices',
        populate: [
          {
            path: 'priceGroup',
          },
          {
            path: 'channelPackageDiscount',
          },
          {
            path: 'currencyCountry',
            populate: [
              {
                path: 'currency',
              },
              {
                path: 'country',
              },
            ],
          },
          {
            path: 'priceItems',
            populate: [
              {
                path: 'channelPackageRoom',
              },
            ],
          },
        ],
      },
    ],
  },
];

/**
 * Create a channel package
 * @param {Object} channelBody
 * @param user
 * @returns {Promise<Booking>}
 */
const createBooking = async (channelBody, user) => {
  const body = channelBody;
  body.user = user._id;
  body.provider = user.provider.id;
  const list = await Booking.find({
    package: body.package,
    provider: body.provider,
  }).populate(populateObject);

  if (list.length === 0) return Booking.create(body);
  throw new ApiError('Package already bookied');
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryBookings = async (filter, options, user) => {
  const currentFilter = filter;
  if (user.provider) currentFilter.provider = user.provider.id;
  const currentOptions = options;
  const sortBy = [];
  sortBy.push('order:desc');
  currentOptions.sortBy = sortBy;
  return Booking.paginate(currentFilter, currentOptions, {}, populateObject);
};

/**
 * Get channel by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Booking>}
 */
// eslint-disable-next-line no-unused-vars
const getBookingById = async (id, options = {}) => {
  return Booking.findById(id).populate(populateObject);
};

/**
 * Update channel by id
 * @param {ObjectId} bookingId
 * @param {Object} updateBody
 * @returns {Promise<Booking>}
 */
const updateBookingById = async (bookingId, updateBody) => {
  const channel = await getBookingById(bookingId);
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  Object.assign(channel, updateBody);
  await channel.save();
  return channel;
};

/**
 * Delete channel by id
 * @param {ObjectId} bookingId
 * @returns {Promise<Booking>}
 */
const deleteBookingById = async (bookingId) => {
  const channel = await getBookingById(bookingId);
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  await channel.remove();
  return channel;
};

module.exports = {
  createBooking,
  queryBookings,
  getBookingById,
  updateBookingById,
  deleteBookingById,
};
