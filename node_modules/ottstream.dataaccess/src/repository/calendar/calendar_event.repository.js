/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const moment = require('moment-timezone');
const { User, Client } = require('../../models');
const { CalendarEvent } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');
const { updateSubDocument } = require('../../utils/repository/subdocument_update');

// eslint-disable-next-line no-unused-vars
const calendarEventPopulateObject = [
  {
    path: 'client',
  },
  {
    path: 'location',
  },
  {
    path: 'equipmentInstaller',
  },
];

/**
 * Get item by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<CalendarEvent>}
 */
// eslint-disable-next-line no-unused-vars
const getCalendarEventById = async (id, options = {}) => {
  const item = await CalendarEvent.findById(id).populate(calendarEventPopulateObject);
  // if (item) {
  //   item.typeName = calendarEventTypes.filter((r) => r.type === item.type)[0].name;
  // }
  return item;
};

/**
 * Get item by id
 * @param {ObjectId} EqInstallerId
 * @returns {Promise<CalendarEvent>}
 */
const getCalendarEventByEqInstaller = async (EqInstaller, filter) => {
  const calendarFilter = {
    $and: [],
  };
  if (filter.startDate) {
    // Input timezone string
    const timezoneString = EqInstaller.provider.timezone;

    // Get the current offset in minutes
    const offsetInMinutes = moment.tz(timezoneString).utcOffset();

    // Convert offset to hours and minutes
    const offsetHours = Math.floor(offsetInMinutes / 60);
    filter.startDate = new Date(filter.startDate);
    filter.startDate.setHours(0, 0, 0);

    // Get the time zone offset in minutes
    let timeZoneOffsetInMinutes = moment(filter.startDate).utcOffset();

    // Convert the offset to hours
    let timeZoneOffsetInHours = timeZoneOffsetInMinutes / 60;

    // Add the offset hours to the date
    filter.startDate.setHours(filter.startDate.getHours() + timeZoneOffsetInHours - offsetHours);
    filter.endDate = new Date(filter.startDate);
    filter.endDate.setHours(23, 59, 59);

    // Get the time zone offset in minutes
    timeZoneOffsetInMinutes = moment(filter.endDate).utcOffset();

    // Convert the offset to hours
    timeZoneOffsetInHours = timeZoneOffsetInMinutes / 60;

    // Add the offset hours to the date
    filter.endDate.setHours(filter.endDate.getHours() + timeZoneOffsetInHours - offsetHours);
    calendarFilter.$and.push({
      startDate: {
        $gte: filter.startDate,
        $lte: filter.endDate,
      },
    });
  }
  const items = await CalendarEvent.find({
    equipmentInstaller: EqInstaller._id,
    ...calendarFilter,
  });
  return items;
};

/**
 * Get item by id
 * @returns {Promise<CalendarEvent>}
 * @param filter
 */
// eslint-disable-next-line no-unused-vars
const getCalendarEvents = async (filter) => {
  const items = await CalendarEvent.find(filter).populate(calendarEventPopulateObject);
  // items.forEach((elem) => {
  //   // eslint-disable-next-line no-param-reassign
  //   elem.typeName = calendarEventTypes.filter((r) => r.type === elem.type)[0].name;
  // });
  return items;
};

/**
 * Create a item calendarEvent
 * @param {Object} itemBody
 * @param user
 * @returns {Promise<CalendarEvent>}
 */
const createCalendarEvent = async (itemBody, user) => {
  const body = itemBody;
  // eslint-disable-next-line no-console
  if (!user.provider) throw new ApiError('no provider for user');
  body.user = user._id;
  body.provider = user.provider.id;
  const created = await CalendarEvent.create(body);
  return getCalendarEventById(created.id);
};

/**
 * @param filter
 * @param options
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryCalendarEvents = async (filter, options, user) => {
  // const isLimited = !user.rolesInfo.admin;
  const curOptions = {
    page: options.page ?? 1,
    all: options.all ?? false,
    limit: options.all ? 10000000 : options.limit ?? 20,
  };

  const sortObject = {
    // _id: -1,
  };
  const sortBy = [];

  if (options.sortBy) {
    if (typeof options.sortBy === 'object') {
      options.sortBy.forEach(function (sortOption) {
        const parts = sortOption.split(':');
        sortObject[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        sortBy.push(`${parts[0]}:${parts[1]}`);
      });
    } else if (typeof options.sortBy === 'string') {
      const parts = options.sortBy.split(':');
      sortObject[parts[0]] = parts[1] === 'desc' ? -1 : 1;
      sortBy.push(`${parts[0]}:${parts[1]}`);
    }
  } else {
    sortObject._id = -1;
    sortBy.push(`executionDate:desc`);
  }

  curOptions.sortBy = sortBy;
  const calendarFilter = {};
  let users = [];
  let clients = [];
  if (filter.search && filter.search.length) {
    filter.search.replace('%20', ' ');
    const regex = new RegExp(filter.search, 'i');
    // eslint-disable-next-line security/detect-non-literal-regexp
    const curUsers = await User.find(
      {
        $and: [
          {
            $or: [{ firstname: regex }, { lastname: regex }],
          },
        ],
      },
      { _id: 1 }
    );
    // eslint-disable-next-line security/detect-non-literal-regexp
    const curClients = await Client.find(
      {
        $and: [
          {
            $or: [{ 'personalInfo.firstname': regex }, { 'personalInfo.lastname': regex }],
          },
          {
            status: 1,
          },
        ],
      },
      { _id: 1 }
    );
    users = curUsers.map((r) => r._id.toString());
    clients = curClients.map((r) => r._id.toString());
    if (!calendarFilter.$and) {
      calendarFilter.$and = [];
    }
    calendarFilter.$and.push({
      $or: [
        {
          equipmentInstaller: { $in: users },
        },
        {
          client: { $in: clients },
        },
      ],
    });
  }
  if (filter.title) {
    calendarFilter.title = filter.title;
  }

  if (filter.startDate && filter.endDate) {
    if (!calendarFilter.$and) {
      calendarFilter.$and = [];
    }

    // Input timezone string
    const timezoneString = user.provider.timezone;

    // Get the current offset in minutes
    const offsetInMinutes = moment.tz(timezoneString).utcOffset();

    // Convert offset to hours and minutes
    const offsetHours = Math.floor(offsetInMinutes / 60);
    filter.startDate = new Date(filter.startDate);
    filter.startDate.setHours(0, 0, 0);

    // Get the time zone offset in minutes
    let timeZoneOffsetInMinutes = moment(filter.startDate).utcOffset();

    // Convert the offset to hours
    let timeZoneOffsetInHours = timeZoneOffsetInMinutes / 60;

    // Add the offset hours to the date
    filter.startDate.setHours(filter.startDate.getHours() + timeZoneOffsetInHours - offsetHours);
    filter.endDate = new Date(filter.endDate);
    filter.endDate.setHours(23, 59, 59);

    // Get the time zone offset in minutes
    timeZoneOffsetInMinutes = moment(filter.endDate).utcOffset();

    // Convert the offset to hours
    timeZoneOffsetInHours = timeZoneOffsetInMinutes / 60;

    // Add the offset hours to the date
    filter.endDate.setHours(filter.endDate.getHours() + timeZoneOffsetInHours - offsetHours);
    calendarFilter.$and.push({
      startDate: {
        $gte: filter.startDate,
        $lte: filter.endDate,
      },
    });
    calendarFilter.$and.push({
      endDate: {
        $gte: filter.startDate,
        $lte: filter.endDate,
      },
    });
  }

  if (filter.transactionType) {
    calendarFilter.transaction_type = filter.transactionType;
  }

  if (filter.state) {
    calendarFilter.state = filter.state;
  }

  if (filter.paymentType) {
    calendarFilter.paymentType = filter.paymentType;
  }

  if (filter.equipmentInstaller) {
    calendarFilter.equipmentInstaller = filter.equipmentInstaller;
  }

  calendarFilter.provider = { $eq: filter.provider };

  // if (isLimited) {
  //   const searchValue = filter.search;
  //   clientFilter.$and = [
  //     {
  //       $or: [
  //         { 'personalInfo.firstname': { $eq: searchValue } },
  //         { 'personalInfo.lastname': { $eq: searchValue } },
  //         { 'emails.email': { $eq: searchValue } },
  //         { 'addresses.address': { $eq: searchValue } },
  //         { 'locations.login': { $eq: searchValue } },
  //       ],
  //     },
  //   ];
  // }
  // status to 1
  // calendarFilter.status = { $eq: 1 };
  // calendarFilter.provider = { $in: filter.providers };
  return CalendarEvent.paginate(calendarFilter, curOptions, {}, [
    {
      path: 'equipmentInstaller',
    },
    {
      path: 'client',
      populate: [{ path: 'provider' }],
    },
    {
      path: 'location',
    },
    {
      path: 'user',
    },
  ]);
};

/**
 * Update Option by id
 * @param {ObjectId} calendarEventId
 * @param {Object} updateBody
 * @returns {Promise<CalendarEvent>}
 */
const updateCalendarEventById = async (calendarEventId, updateBody) => {
  const item = await getCalendarEventById(calendarEventId);

  if (updateBody.comments) {
    item.comments = updateSubDocument(item, 'comments', updateBody, 'comments');
    // eslint-disable-next-line no-param-reassign
    delete updateBody.comments;
  }
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CalendarEvent not found');
  }
  Object.assign(item, updateBody);
  await item.save();
  return getCalendarEventById(calendarEventId);
};

const updateCalendarEventByIdNew = async (calendarEventId, updateBody) => {
  const item = await getCalendarEventById(calendarEventId);

  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CalendarEvent not found');
  }
  Object.assign(item, updateBody);
  await item.save();
  return getCalendarEventById(calendarEventId);
};

/**
 * calendarEvent action by id
 * @returns {Promise<CalendarEvent>}
 * @param {Object} updateBody
 */
const calendarEventsActionById = async (updateBody) => {
  try {
    if (!updateBody) throw new ApiError(httpStatus.BAD_REQUEST, 'CalendarEvent not found');
    const { calendarEventId } = updateBody;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < calendarEventId.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const calendarEvent = await getCalendarEventById(calendarEventId[i]);
      // eslint-disable-next-line no-await-in-loop
      await CalendarEvent.updateMany(
        {
          _id: calendarEvent._id,
        },
        { $set: { enableForSale: updateBody.enableForSale } },
        { multi: true }
      );
    }
    return calendarEventId;
  } catch (e) {
    throw new ApiError(httpStatus.BAD_REQUEST, e);
  }
};

/**
 * Delete calendarEvent by id
 * @param {Object} calendarEventId
 * @returns {Promise<Balance>}
 */
const deleteCalendarEventById = async (calendarEventId) => {
  return CalendarEvent.deleteOne({ _id: calendarEventId });
};

module.exports = {
  createCalendarEvent,
  getCalendarEvents,
  queryCalendarEvents,
  getCalendarEventById,
  updateCalendarEventById,
  updateCalendarEventByIdNew,
  calendarEventsActionById,
  deleteCalendarEventById,
  getCalendarEventByEqInstaller,
};
