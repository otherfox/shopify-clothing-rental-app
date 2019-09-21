const verifyHmac = require('../helpers').verifyHmac;
/**
 * Express middleware to verify hmac and requests from shopify.
 * This middleware adds two items to the req object:
 * req.topic - A string containing the topic of the middlware
 * req.shop - The shop url of the store posting to the webhook url
 * @param {object} req - Express/Node request object
 * @param {object} res - Expres/Node response object
 * @param {function} next - Function that represents the next piece of middleware.
 * @param {string} secret - Shopify App Secret.
 */
function verifyProxy(_a) {
  let { secret } = _a;
  function verifyProxyMiddleware(ctx, next) {
    let hmac;
    let data;
    try {
      hmac = ctx.get('X-Shopify-Hmac-SHA256');
      data = ctx.request.rawBody;
    } catch (e) {
      console.log(`Proxy request failed from: ${ctx.get('X-Shopify-Shop-Domain')}`);
      ctx.res.statusCode = 200;
    }

    if (verifyHmac(JSON.stringify(data), hmac, secret)) {
      console.log('proxy request passed');
      return next();
    }

    return ctx.res.statusCode = 200;
  }
  return verifyProxyMiddleware;
}

module.exports = {
  verifyProxy
};