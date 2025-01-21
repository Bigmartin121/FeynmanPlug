import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'feynman-learning-assistant-key';

export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

export const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
