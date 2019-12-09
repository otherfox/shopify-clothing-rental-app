const { completeCustomerOrder } = require('./completeCustomerOrder');
const { createCustomerOrder } = require('./createCustomerOrder');
const { fulfillCustomerOrder } = require('./fulfillCustomerOrder');
const { removeCustomerClosetMeta } = require('./removeCustomerClosetMeta');
const { updateCustomerClosetMeta, updateCustomerClosetMetaQuery } = require('./updateCustomerClosetMeta');
const { createCustomerClosetMetaQuery } = require('./createCustomerClosetMeta');


module.exports = {
  completeCustomerOrder,
  createCustomerClosetMetaQuery,
  createCustomerOrder,
  fulfillCustomerOrder,
  removeCustomerClosetMeta,
  updateCustomerClosetMeta,
  updateCustomerClosetMetaQuery
};