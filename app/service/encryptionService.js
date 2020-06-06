var RC4 = require("crypto-js/rc4");

const service = {
  encrypt: (args) => {
    if (args === undefined || args === null || !process.env.RESPONSE_ENCRYPTION_SECRET) return args;
    
    const secret = process.env.RESPONSE_ENCRYPTION_SECRET;

    for (let i = 0; i < args.length; i++) {
      let encrypted = RC4.encrypt(args[i].toString(), secret);
      args[i] = JSON.stringify(encrypted);
    }

    return args;
  }
}

module.exports = service;