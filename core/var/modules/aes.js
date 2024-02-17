import AES from "crypto-js/aes.js";
import encUtf8 from "crypto-js/enc-utf8.js";

/**
 * Returns an encrypted object with the given secret key.
 *
 *
 * @example
 *    const encryptedObj = encrypt({ foo: 'bar' }, 'secretKey');
 */
function encrypt(obj, secretKey) {
    const encrypted = AES.encrypt(JSON.stringify(obj), secretKey).toString();
    return encrypted;
}

/**
 * Returns a decrypted object with the given secret key.
 *
 * @example
 *    const decryptedObj = decrypt("eyJmb28iOiJiYXIifQ", 'secretKey');
 */
function decrypt(encryptedObj, secretKey) {
    const decrypted = AES.decrypt(encryptedObj, secretKey).toString(encUtf8);
    return JSON.parse(decrypted);
}

export { encrypt, decrypt };
