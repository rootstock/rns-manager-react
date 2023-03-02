import Utils from 'web3-utils';
import { normalize } from '@ensdomains/eth-ens-namehash';
import { keccak_256 as sha3 } from 'js-sha3';
import { utils } from 'ethers';

function numberToUint32(number) {
  const hexDuration = Utils.numberToHex(number);
  let duration = '';
  for (let i = 0; i < 66 - hexDuration.length; i += 1) {
    duration += '0';
  }
  duration += hexDuration.slice(2);
  return duration;
}

export const utf8ToHexString = string => (string ? Utils.asciiToHex(string).slice(2) : '');

/**
 * registration with rif transferAndCall encoding
 * @param {string} name to register
 * @param {address} owner of the new name
 * @param {hex} secret of the commit
 * @param {BN} duration to register in years
 */
export const getRegisterData = (name, owner, secret, duration) => {
  // 0x + 8 bytes
  const dataSignature = '0xc2c414c8';

  // 20 bytes
  const dataOwner = owner.toLowerCase().slice(2);

  // 32 bytes
  const dataSecret = secret.slice(2);

  // 32 bytes
  const dataDuration = numberToUint32(duration);

  // variable length
  const dataName = sha3(normalize(name));

  return `${dataSignature}${dataOwner}${dataSecret}${dataDuration}${dataName}`;
};

/**
 * registration with rif transferAndCall encoding
 * @param {string} name to register
 * @param {address} owner of the new name
 * @param {hex} secret of the commit
 * @param {BN} duration to register in years
 */
export const getAddrRegisterData = (name, owner, secret, duration, addr, partner) => {
  // 0x + 8 bytes
  const dataSignature = '0x646c3681';

  // 20 bytes
  const dataOwner = owner.toLowerCase().slice(2);

  // 32 bytes
  let dataSecret = secret.slice(2);
  const padding = 64 - dataSecret.length;
  for (let i = 0; i < padding; i += 1) {
    dataSecret += '0';
  }

  // 32 bytes
  const dataDuration = numberToUint32(duration);

  // variable length
  // const dataName = sha3(normalize(name));
  const dataName = Buffer.from(utils.toUtf8Bytes(name)).toString('hex');

  // 20 bytes
  const dataAddr = addr.toLowerCase().slice(2);

  // 20 bytes
  const dataPartner = partner.toLowerCase().slice(2);

  return `${dataSignature}${dataOwner}${dataSecret}${dataDuration}${dataAddr}${dataPartner}${dataName}`;
};

/**
 * Shuffles an array
 * @param {array} array to be shuffled
 */
export const shuffle = (array) => {
  if (array.length === 0) {
    return array;
  }

  const returnArray = array.sort(() => Math.random() - 0.5);
  return returnArray;
};
