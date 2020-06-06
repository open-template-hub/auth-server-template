var RC4 = require("crypto-js/rc4");

const service = {
  encrypt: (args) => {
    if (args === undefined || args === null) return args;
    if (!process.env.RESPONSE_ENCRYPTION_SECRET) {
      throw new Error("Encryption secret not found");
    }
    const secret = process.env.RESPONSE_ENCRYPTION_SECRET;

    for (let i = 0; i < args.length; i++) {
      let encrypted = RC4.encrypt(args[i].toString(), secret);
      args[i] = JSON.stringify(encrypted);
    }

    return args;
  }
}

module.exports = service;