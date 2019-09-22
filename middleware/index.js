const crypto = require('crypto');

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
    var parameters = [];
    for (var key in ctx.query) {
      if (key != 'signature') {
        parameters.push(key + '=' + ctx.query[key])
      }
    }
    var message = parameters.sort().join('');
    var signature = Buffer.from(ctx.query.signature, 'utf-8');
    var digest = Buffer.from(crypto.createHmac('sha256', secret).update(message).digest('hex'), 'utf-8');

    try {
      if (!crypto.timingSafeEqual(digest, signature)) {
        throw new Error('Security Error - The request was not authentic');
      }
    } catch (err) {
      err.message = 'Security Error - The request was not authentic';
      throw err;
    }

    console.log('Proxy Success!');
    return next();
  }
  return verifyProxyMiddleware;
}

module.exports = {
  verifyProxy
};