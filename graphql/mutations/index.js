const { completeCustomerOrder } = require('./completeCustomerOrder');
const { createCustomerOrder } = require('./createCustomerOrder');
const { fulfillCustomerOrder } = require('./fulfillCustomerOrder');
const { removeCustomerClosetMeta } = require('./removeCustomerClosetMeta');
const { updateCustomerClosetMeta, updateCustomerClosetMetaQuery } = require('./updateCustomerClosetMeta');


module.exports = {
  completeCustomerOrder,
  createCustomerOrder,
  fulfillCustomerOrder,
  removeCustomerClosetMeta,
  updateCustomerClosetMeta,
  updateCustomerClosetMetaQuery
};