/**
 * A mongoose schema plugin which applies the following in the toJSON transform call:
 *  - removes __v, createdAt, updatedAt, and any path that has private: true
 *  - replaces _id with id
 */
const toJSON = (schema) => {
  const tempScheme = schema;
  let transform;
  if (schema.options.toJSON && schema.options.toJSON.transform) {
    transform = schema.options.toJSON.transform;
  }

  tempScheme.options.toJSON = Object.assign(schema.options.toJSON || {}, {
    transform(doc, ret, options) {
      const tempRet = ret;
      Object.keys(schema.paths).forEach((path) => {
        if (schema.paths[path].options && schema.paths[path].options.private) {
          delete tempRet[path];
        }
      });
      if (ret._id) tempRet.id = ret._id.toString();
      delete tempRet._id;
      delete tempRet.__v;
      // delete tempRet.updatedAt;
      // delete tempRet.createdAt;
      if (transform) {
        return transform(doc, ret, options);
      }
    },
  });
};

module.exports = toJSON;
