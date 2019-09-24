const axios = require('axios');
const {
  ENDLESS_GET_CUSTOMER, ENDLESS_ADD_ITEMS, ENDLESS_UPDATE_CLOSET
} = require('../graphql/variables');
const { getEndlessCustomerQuery } = require('../graphql/queries');
const { updateCustomerClosetMetaQuery } = require('../graphql/mutations');

const addItemsToCloset = (customerId, shopCreds, ctx) => {
  const { shop, apiKey, password } = shopCreds;
  let msg = ''
  return axios({
    method: 'post',
    url: `https://${apiKey}:${password}@${shop}/admin/api/graphql.json`,
    data: {
      query: getEndlessCustomerQuery,
      variables: ENDLESS_GET_CUSTOMER({ id: customerId }),
    }
  })
    .then(response => {
      console.log('recieved customer data: ', response.data);
      const customer = response.data.data.customer;
      if (customer.metafield) {
        const newCloset = ENDLESS_ADD_ITEMS(customer.metafield.value, [ctx.request.body]);
        const variables = { input: ENDLESS_UPDATE_CLOSET(customer, { items: newCloset }) };
        return axios({
          method: 'post',
          url: `https://${apiKey}:${password}@${shop}/admin/api/graphql.json`,
          data: {
            query: updateCustomerClosetMetaQuery,
            variables: variables
          }
        })
          .then(response => {
            msg = 'Added item to closet: ' + JSON.stringify(response.data);
            console.log(msg);
            ctx.body = { data: msg };
            ctx.res.statusCode = 200;
          })
          .catch(err => {
            msg = 'Error adding item to closet: ' + err;
            console.log(msg);
            ctx.body = { data: msg };
            ctx.res.statusCode = 200;
          });
      } else {
        msg = 'Customer metafeild undefined';
        console.log(msg);
        ctx.body = { data: msg };
        ctx.res.statusCode = 200;
      }
    })
    .catch(err => {
      msg = 'error: ' + err;
      console.log(msg);
      ctx.body = { data: msg };
      ctx.res.statusCode = 200;
    });
}

const orderEndlessItems = (customerId, shopCreds, ctx) => {
  ctx.res.statusCode = 200;
}

const proxyRoute = (shopCreds) => {
  return async (ctx) => {
    const query = ctx.query;
    const customerId = 'gid://shopify/Customer/' + query.customer_id;
    if (customerId) {
      switch (query.q) {
        case 'addItemsToCloset':
          console.log('addItemsToCloset: ', customerId, ctx.request.body);
          return addItemsToCloset(customerId, shopCreds, ctx);
        case 'orderEndlessItems':
          console.log('orderEndlessItems: ', customerId, ctx.request.body);
          return orderEndlessItems(customerId, shopCreds, ctx);
        default:
          ctx.res.statusCode = 200;
          break;
      }
    }
  };
}

module.exports = { proxyRoute };