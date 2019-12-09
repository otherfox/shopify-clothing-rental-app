const axios = require('axios');
const uuid = require('uuid/v1');
const moment = require('moment');
const {
  ENDLESS_GET_CUSTOMER, ENDLESS_ADD_ITEMS, ENDLESS_UPDATE_CLOSET, ENDLESS_DATE_FORMAT,
  ENDLESS_RETURN_ITEMS, ENDLESS_CREATE_CLOSET_AND_ADD_TAGS
} = require('../graphql/variables');
const { getEndlessCustomerQuery } = require('../graphql/queries');
const { updateCustomerClosetMetaQuery, createCustomerClosetMetaQuery } = require('../graphql/mutations');

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
        const newCloset = ENDLESS_ADD_ITEMS(customer.metafield.value, [ctx.request.body], false);
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
        msg = 'Customer metafield undefined';
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
  const { shop, apiKey, password } = shopCreds;
  let msg = '';
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
        let closet = ctx.request.body;
        closet.order = { id: uuid(), date: moment().format(ENDLESS_DATE_FORMAT) };
        closet.items = ENDLESS_ADD_ITEMS(JSON.stringify(closet), closet.items, true);
        const variables = { input: ENDLESS_UPDATE_CLOSET(customer, closet) };
        return axios({
          method: 'post',
          url: `https://${apiKey}:${password}@${shop}/admin/api/graphql.json`,
          data: {
            query: updateCustomerClosetMetaQuery,
            variables: variables
          }
        })
          .then(response => {
            msg = 'Order Added to closet: ' + JSON.stringify(response.data);
            console.log(msg);
            ctx.body = { data: msg };
            ctx.res.statusCode = 200;
          })
          .catch(err => {
            msg = 'Error adding order to closet: ' + err;
            console.log(msg);
            ctx.body = { data: msg };
            ctx.res.statusCode = 200;
          });
      } else {
        msg = 'Customer metafield undefined';
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

const updateCloset = (customerId, shopCreds, ctx) => {
  ctx.res.statusCode = 200;
  const { shop, apiKey, password } = shopCreds;
  let msg = '';
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
        let closet = ctx.request.body;
        console.log('new closet: ', closet);
        const variables = { input: ENDLESS_UPDATE_CLOSET(customer, closet) };
        return axios({
          method: 'post',
          url: `https://${apiKey}:${password}@${shop}/admin/api/graphql.json`,
          data: {
            query: updateCustomerClosetMetaQuery,
            variables: variables
          }
        })
          .then(response => {
            msg = 'Updated closet: ' + JSON.stringify(response.data);
            console.log(msg);
            ctx.body = { data: msg };
            ctx.res.statusCode = 200;
          })
          .catch(err => {
            msg = 'Error updating closet: ' + err;
            console.log(msg);
            ctx.body = { data: msg };
            ctx.res.statusCode = 200;
          });
      } else {
        msg = 'Customer metafield undefined';
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

const returnItems = (customerId, shopCreds, ctx) => {
  ctx.res.statusCode = 200;
  const { shop, apiKey, password } = shopCreds;
  let msg = '';
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
        let closet = ctx.request.body;
        closet.items = ENDLESS_RETURN_ITEMS(closet);
        const variables = { input: ENDLESS_UPDATE_CLOSET(customer, closet) };
        return axios({
          method: 'post',
          url: `https://${apiKey}:${password}@${shop}/admin/api/graphql.json`,
          data: {
            query: updateCustomerClosetMetaQuery,
            variables: variables
          }
        })
          .then(response => {
            msg = 'Returned items to closet: ' + JSON.stringify(response.data);
            console.log(msg);
            ctx.body = { data: msg };
            ctx.res.statusCode = 200;
          })
          .catch(err => {
            msg = 'Error returning items to closet: ' + err;
            console.log(msg);
            ctx.body = { data: msg };
            ctx.res.statusCode = 200;
          });
      } else {
        msg = 'Customer metafield undefined';
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

const createCustomerCloset = (customerId, shopCreds, ctx) => {
  ctx.res.statusCode = 200;
  const { shop, apiKey, password } = shopCreds;
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
      if (!customer.metafield) {
        let customerTag = ctx.request.body;
        orderLimit = customerTag.indexOf(ENDLESS_TYPES[0]) > -1 ? 1 : false;
        orderLimit = customerTag.indexOf(ENDLESS_TYPES[1]) > -1 ? 2 : false;
        orderLimit = customerTag.indexOf(ENDLESS_TYPES[2]) > -1 ? 3 : false;
        if (orderLimit) {
          return axios({
            method: 'post',
            url: `https://${apiKey}:${password}@${shop}/admin/api/graphql.json`,
            data: {
              query: updateCustomerClosetMetaQuery,
              variables: { input: ENDLESS_CREATE_CLOSET_AND_ADD_TAGS(customer, orderLimit, customerTag) },
            }
          })
            .then(response => {
              msg = 'Customer closet created: ' + JSON.stringify(response.data);
              console.log(msg);
              ctx.body = { data: msg };
              ctx.res.statusCode = 200;
            })
            .catch(err => {
              msg = ('error updating customer: ', err);
              console.log(msg);
              ctx.body = { data: msg };
              ctx.res.statusCode = 200;
            });
        } else {
          msg = 'No tag submitted or not formatted correctly (i.e. Endless I, Endless II, Endless III)';
          console.log(msg);
          ctx.body = { data: msg };
          ctx.res.statusCode = 200;
        }
      } else {
        msg = 'closet already created';
        console.log(msg);
        ctx.body = { data: msg };
        ctx.res.statusCode = 200;
      }
    })
    .catch(err => {
      msg = 'error getting customer: ' + err;
      console.log(msg);
      ctx.body = { data: msg };
      ctx.res.statusCode = 200;
    });
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
        case 'updateCloset':
          console.log('updateCloset: ', customerId, ctx.request.body);
          return updateCloset(customerId, shopCreds, ctx);
        case 'returnItems':
          console.log('returnItems: ', customerId, ctx.request.body);
          return returnItems(customerId, shopCreds, ctx);
        case 'createCustomerCloset':
          console.log('createCustomerCloset: ', customerId, ctx.request.body);
          return createCustomerCloset(customerId, shopCreds, ctx);
        default:
          ctx.res.statusCode = 200;
          break;
      }
    }
  };
}

module.exports = { proxyRoute };