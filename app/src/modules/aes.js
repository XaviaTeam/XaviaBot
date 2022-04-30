//use crypto-js to encrypt and decrypt Object
import AES from 'crypto-js/aes.js';
import encUtf8 from 'crypto-js/enc-utf8.js';

function encrypt (obj, secretKey) {
    return AES.encrypt(JSON.stringify(obj), secretKey).toString();
}

function decrypt (encryptedObj, secretKey) {
    return JSON.parse(AES.decrypt(encryptedObj, secretKey).toString(encUtf8));
}

export default {
    encrypt,
    decrypt
}