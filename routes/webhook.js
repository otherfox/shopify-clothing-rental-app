const axios = require('axios');
const _ = require('lodash');
const { ENDLESS_CREATE_CLOSET, ENDLESS_TYPES, ENDLESS_GET_CUSTOMER } = require('../graphql/variables');
const { updateCustomerClosetMetaQuery } = require('../graphql/mutations');
const { getEndlessCustomerQuery } = require('../graphql/queries');

const webhookRoute = (shopCreds) => {
  const { shop, apiKey, password } = shopCreds;
  return async (ctx) => {
    let customer = ctx.request.body;
    console.log('webhook fire get customer: ', customer);
    customer.id = customer.admin_graphql_api_id;
    let orderLimit;
    if (customer.tags) {
      // double check this with Nick
      orderLimit = customer.tags.indexOf(ENDLESS_TYPES[0]) > -1 ? 1 : '';
      orderLimit = customer.tags.indexOf(ENDLESS_TYPES[1]) > -1 ? 2 : '';
      orderLimit = customer.tags.indexOf(ENDLESS_TYPES[2]) > -1 ? 3 : orderLimit;
      if (orderLimit) {
        axios({
          method: 'post',
          url: `https://${apiKey}:${password}@${shop}/admin/api/graphql.json`,
          data: {
            query: getEndlessCustomerQuery,
            variables: ENDLESS_GET_CUSTOMER({ id: customer.id }),
          }
        })
          .then(response => {
            console.log('recieved customer data: ', response.data);
            if (!response.data.data.customer.metafield) {
              console.log('No customer closet');
              axios({
                method: 'post',
                url: `https://${apiKey}:${password}@${shop}/admin/api/graphql.json`,
                data: {
                  query: updateCustomerClosetMetaQuery,
                  variables: { input: ENDLESS_CREATE_CLOSET(customer, orderLimit) },
                }
              })
                .then(response => {
                  console.log('customer closet created', response.data);
                })
                .catch(err => {
                  console.log('error: ', err);
                });
            } else {
              console.log('closet already created');
            }
          })
          .catch(err => {
            console.log('error: ', err);
          });
      }
    }
    ctx.res.statusCode = 200;
  };
}

module.exports = { webhookRoute };