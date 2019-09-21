const crypto = require('crypto');

module.exports = {
  verifyHmac(data, hmac, secret) {
    if (!hmac) {
      return false;
    } else if (!data || typeof data !== 'object') {
      return false;
    }

    const sharedSecret = config.SHOPIFY_SHARED_SECRET;
    const calculatedSignature = crypto.createHmac('sha256', sharedSecret)
      .update(Buffer.from(data), 'utf8')
      .digest('base64');
    return calculatedSignature === hmac;
  }
};


