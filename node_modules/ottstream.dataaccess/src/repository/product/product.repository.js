const httpStatus = require('http-status');
const { Product } = require('../../models');
const ApiError = require('../../api/utils/error/ApiError');
const { updateSubDocument } = require('../../utils/repository/subdocument_update');

const productPopulateObject = [
  {
    path: 'icons',
    populate: [
      {
        path: 'setItems',
        populate: [
          {
            path: 'originalImage',
          },
          {
            path: 'changedImage',
          },
        ],
      },
      {
        path: 'provider',
      },
    ],
  },
  {
    path: 'prices',
    populate: [
      {
        path: 'priceGroup',
      },
      {
        path: 'discount',
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
    ],
  },
  {
    path: 'provider',
  },
  {
    path: 'options',
  },
  {
    path: 'type',
  },
];

/**
 * Get channel by id
 * @param {ObjectId} id
 * @param options
 * @returns {Promise<Product>}
 */
// eslint-disable-next-line no-unused-vars
const getProductById = async (id, options = {}) => {
  return Product.findById(id).populate(productPopulateObject);
};

/**
 * Create a channel package
 * @param {Object} channelBody
 * @param user
 * @returns {Promise<Product>}
 */
const createProduct = async (channelBody, user) => {
  const body = channelBody;
  body.user = user._id;
  if (user.provider) body.provider = user.provider.id;
  const created = await Product.create(body);
  return getProductById(created.id);
};

/**
 * @param filter
 * @param options
 * @param user
 * @returns {Promise<QueryResult>}
 */
// eslint-disable-next-line no-unused-vars
const queryProducts = async (filter, sf, options, user) => {
  const currentFilter = filter;
  if (sf.forClient) {
    currentFilter.provider = user.provider.id;
    currentFilter.isClient = true;
  } else if (!sf.forClient) {
    if (sf.buy) {
      currentFilter.provider = user.provider.parent;
      currentFilter.isResale = true;
    } else {
      currentFilter.provider = user.provider.id;
    }
  }

  // currentFilter.isResale = true;
  // currentFilter.isClient = true;

  const result = await Product.paginate(filter, options, {}, productPopulateObject);
  const finalResult = [];
  result.results.forEach(function (product) {
    let valid = true;
    if (typeof sf.search !== 'undefined') {
      if (product.name.filter((r) => r.name.includes(sf.search)).length === 0) {
        valid = false;
      }
    }
    const isInStock = product.stock > 0;

    if (typeof sf.inStock !== 'undefined' && typeof sf.outStock !== 'undefined') {
      if ((isInStock !== sf.inStock && isInStock !== !sf.outStock) || (!sf.inStock && !sf.outStock)) {
        valid = false;
      }
    }
    if (
      typeof sf.minPrice !== 'undefined' &&
      typeof sf.maxPrice !== 'undefined' &&
      !(sf.minPrice === 0 && sf.maxPrice === 0)
    ) {
      product.prices.forEach(function (price) {
        price.priceItems.forEach(function (priceItem) {
          if (priceItem.price < sf.minPrice || priceItem.price > sf.maxPrice) valid = false;
        });
      });
    }

    if (valid) {
      // eslint-disable-next-line no-param-reassign
      product.creationDate = product.createdAt;
      finalResult.push(product);
    }
  });
  // eslint-disable-next-line no-unused-vars
  let minPrice = 0;
  let maxPrice = 0;
  if (typeof sf.getMinMax !== 'undefined') {
    if (sf.getMinMax) {
      finalResult.forEach(function (product) {
        product.prices.forEach(function (price) {
          price.priceItems.forEach(function (priceItem) {
            if (priceItem.price < minPrice) minPrice = priceItem.price;
            if (priceItem.price > maxPrice) maxPrice = priceItem.price;
          });
        });
      });
      result.minPrice = minPrice;
      result.maxPrice = maxPrice;
    }
  }
  result.results = finalResult;
  return result;
};

/**
 * Update channel by id
 * @param {ObjectId} productId
 * @param {Object} updateBody
 * @returns {Promise<Product>}
 */
const updateProductById = async (productId, updateBody) => {
  const channel = await getProductById(productId);
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  if (updateBody.icons) {
    channel.icons = updateSubDocument(channel, 'icons', updateBody, 'icons');
    // eslint-disable-next-line no-param-reassign
    delete updateBody.icons;
  }
  if (updateBody.options) {
    channel.options = updateSubDocument(channel, 'options', updateBody, 'options');
    // eslint-disable-next-line no-param-reassign
    delete updateBody.options;
  }
  Object.assign(channel, updateBody);
  await channel.save();
  return getProductById(productId);
};

/**
 * Delete channel by id
 * @param {ObjectId} productId
 * @returns {Promise<Product>}
 */
const deleteProductById = async (productId) => {
  const channel = await getProductById(productId);
  if (!channel) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  await channel.remove();
  return channel;
};

module.exports = {
  createProduct,
  queryProducts,
  getProductById,
  updateProductById,
  deleteProductById,
};
