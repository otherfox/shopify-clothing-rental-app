const axios = require('axios');
const { ENDLESS_GET_CUSTOMER } = require('../graphql/variables');
const { getEndlessCustomerQuery } = require('../graphql/queries');

const getClientPayload = (query) => {
  console.log('get client payload', query);
  return {
    query: `
      query getName {
        shop {
          name
        }
      }
    `
  }
}

const proxyRoute = (options) => {
  const { shop, apiKey, password } = options;
  return async (ctx) => {
    axios({
      method: 'post',
      url: `https://${apiKey}:${password}@${shop}/admin/api/graphql.json`,
      data: getClientPayload(ctx.query)
    })
      .then(response => {
        console.log('response: ', response.data);
      })
      .catch(err => {
        console.log('error: ', err);
      });
    ctx.res.statusCode = 200;
  };
}

module.exports = { proxyRoute: proxyRoute };