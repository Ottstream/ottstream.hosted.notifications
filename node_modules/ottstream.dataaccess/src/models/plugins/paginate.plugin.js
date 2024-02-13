/* eslint-disable no-param-reassign */

const paginate = (schema) => {
  /**
   * @typedef {Object} QueryResult
   * @property {Document[]} results - Results found
   * @property {number} page - Current page
   * @property {number} limit - Maximum number of results per page
   * @property {number} totalPages - Total number of pages
   * @property {number} totalResults - Total number of documents
   */
  /**
   * Query for documents with pagination
   * @param {Object} [filter] - Mongo filter
   * @param {Object} [options] - Query options
   * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
   * @param {number} [options.limit] - Maximum number of results per page (default = 10)
   * @param {number} [options.page] - Current page (default = 1)
   * @param {Object} [projects] - projection options
   * @param {Object} [populateObject] - populate options
   * @returns {Promise<QueryResult>}
   */
  schema.statics.paginate = async function (filter, options, projects = {}, populateObject = undefined) {
    const sort = {};
    if (options.sortBy) {
      if (typeof options.sortBy === 'object') {
        options.sortBy.forEach(function (sortOption) {
          const parts = sortOption.split(':');
          sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        });
      } else if (typeof options.sortBy === 'string') {
        const parts = options.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
      }
    }
    const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 20;
    const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
    const skip = (page - 1) * limit;
    const countPromise = this.countDocuments(filter).exec();
    let docsPromise = this.find(filter).select(projects);

    // population
    if (populateObject !== undefined) {
      if (Array.isArray(populateObject)) {
        Object.values(populateObject).forEach((item) => docsPromise.populate(item));
        // for (const item in Object.values(populateObject)) {
        //   docsPromise = docsPromise.populate(item);
        // }
      } else docsPromise = docsPromise.populate(populateObject);
    }
    docsPromise = docsPromise.sort(sort).skip(skip).limit(limit).exec();

    return Promise.all([countPromise, docsPromise]).then((values) => {
      const [totalResults, results] = values;
      const totalPages = Math.ceil(totalResults / limit);
      const result = {
        results,
        page,
        limit,
        totalPages,
        totalResults,
      };
      return Promise.resolve(result);
    });
  };
};

module.exports = paginate;
