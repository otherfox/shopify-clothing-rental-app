require('isomorphic-fetch');
const Koa = require('koa');
const next = require('next');
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const dotenv = require('dotenv');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const session = require('koa-session');
const koaBody = require('koa-body');
const { default: graphQLProxy } = require('@shopify/koa-shopify-graphql-proxy');
const { ApiVersion } = require('@shopify/koa-shopify-graphql-proxy');
const Router = require('koa-router');
const { receiveWebhook, registerWebhook } = require('@shopify/koa-shopify-webhooks');
const { verifyProxy } = require('./middleware');

// Routes
const { proxyRoute } = require('./routes/proxy');
const { webhookRoute } = require('./routes/webhook');

dotenv.config();

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const {
  SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY, HOST,
  SHOP, PRIVATE_APP_API_KEY, PRIVATE_APP_PASSWORD
} = process.env;

app.prepare().then(() => {
  const server = new Koa();
  server.use(session(server));
  server.keys = [SHOPIFY_API_SECRET_KEY];

  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET_KEY,
      scopes: [
        'read_products', 'write_products', 'read_customers', 'write_customers',
        'read_all_orders', 'read_orders', 'write_orders', 'read_draft_orders',
        'write_draft_orders', 'write_fulfillments', 'read_fulfillments'
      ],
      async afterAuth(ctx) {
        const { shop, accessToken } = ctx.session;

        ctx.cookies.set('shopOrigin', shop, { httpOnly: false });

        const registerCustomer = await registerWebhook({
          address: `${HOST}/webhooks/customers/create`,
          topic: 'CUSTOMERS_CREATE',
          accessToken,
          shop,
        });

        if (registerCustomer.success) {
          console.log('Successfully registered customer create webhook!');
        } else {
          console.log('Failed to register customer create webhook ', JSON.stringify(registerCustomer.result));
        }

        const updateCustomer = await registerWebhook({
          address: `${HOST}/webhooks/customers/update`,
          topic: 'CUSTOMERS_UPDATE',
          accessToken,
          shop,
        });

        if (updateCustomer.success) {
          console.log('Successfully registered customer update webhook!');
        } else {
          console.log('Failed to register customer update webhook ', JSON.stringify(updateCustomer.result));
        }

        ctx.redirect('/');
      },
    }),
  );

  const webhook = receiveWebhook({ secret: SHOPIFY_API_SECRET_KEY });
  const webhookRouteFunc = webhookRoute({ shop: SHOP, apiKey: PRIVATE_APP_API_KEY, password: PRIVATE_APP_PASSWORD });
  const proxy = verifyProxy({ secret: SHOPIFY_API_SECRET_KEY });
  const proxyRouteFunc = proxyRoute({ shop: SHOP, apiKey: PRIVATE_APP_API_KEY, password: PRIVATE_APP_PASSWORD });
  const router = new Router();

  server.use(graphQLProxy({ version: ApiVersion.April19 }));

  // Webhook Routes

  router.post('/webhooks/customers/create', webhook, webhookRouteFunc);

  router.post('/webhooks/customers/update', webhook, webhookRouteFunc);

  // Proxy Routes

  router.post('/endless', proxy, koaBody(), proxyRouteFunc);

  router.get('(.*)', verifyRequest(), async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  });
  server.use(router.allowedMethods());
  server.use(router.routes());

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});