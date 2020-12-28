/**
 * @description holds encryption util
 */

import CryptoJS from 'crypto-js';
import crypto from 'crypto';

export class EncryptionUtil {
  /**
   * encrpyts response
   * @param args arguments
   */
  encrypt = (args: IArguments) => {
    if (
      args === undefined ||
      args === null ||
      !process.env.RESPONSE_ENCRYPTION_SECRET
    )
      return args;

    const secret: string = process.env.RESPONSE_ENCRYPTION_SECRET;

    for (let i = 0; i < args.length; i++) {
      let encrypted = CryptoJS.RC4.encrypt(args[i].toString(), secret);
      args[i] = JSON.stringify(encrypted);
    }

    return args;
  };

  /**
   * hashes string with key
   * @param base_string base string
   * @param key key
   */
  hash_function_sha1(base_string: string, key: string) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  }
}
