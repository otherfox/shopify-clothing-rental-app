const { getCustomer, getCustomerQuery } = require('./getCustomer');
const { getEndlessCustomer, getEndlessCustomerQuery } = require('./getEndlessCustomer');
const { getEndlessCustomers } = require('./getEndlessCustomers');
const { getLocations } = require('./getLocations');
const { getProducts } = require('./getProducts');

module.exports = {
  getCustomer,
  getCustomerQuery,
  getEndlessCustomer,
  getEndlessCustomerQuery,
  getEndlessCustomers,
  getLocations,
  getProducts
};