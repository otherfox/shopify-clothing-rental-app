const { getCustomer } = require('./getCustomer');
const { getEndlessCustomer, getEndlessCustomerQuery } = require('./getEndlessCustomer');
const { getEndlessCustomers } = require('./getEndlessCustomers');
const { getLocations } = require('./getLocations');
const { getProducts } = require('./getProducts');

module.exports = {
  getCustomer,
  getEndlessCustomer,
  getEndlessCustomerQuery,
  getEndlessCustomers,
  getLocations,
  getProducts
};