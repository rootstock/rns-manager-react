import Production from '../../config/contracts.json';
import Testnet from '../../config/contracts.testnet.json';
import Local from '../../config/contracts.local.json';
import Testing from '../../config/contracts.testing.json';

const env = process.env.REACT_APP_ENVIRONMENT
  ? process.env.REACT_APP_ENVIRONMENT : 'production';

const returnValue = (name) => {
  switch (env) {
    case 'test':
      return Testnet[name];
    case 'local':
      return Local[name];
    case 'testing':
      return Testing[name];
    case 'production':
    default:
      return Production[name];
  }
};

export const rns = returnValue('rns');
export const registrar = returnValue('registrar');
export const reverseRegistrar = returnValue('reverseRegistrar');
export const publicResolver = returnValue('publicResolver');
export const nameResolver = returnValue('nameResolver');
export const multiChainResolver = returnValue('multiChainResolver');
export const rif = returnValue('rif');
export const fifsRegistrar = returnValue('fifsRegistrar');
export const fifsAddrRegistrar = returnValue('fifsAddrRegistrar');
export const rskOwner = returnValue('rskOwner');
export const renewer = returnValue('renewer');
export const stringResolver = returnValue('stringResolver');
export const definitiveResolver = returnValue('definitiveResolver');
export const partnerConfiguration = returnValue('defaultPartnerConfiguration');
export const partner = returnValue('partner');

export const getPartnerAddresses = id => returnValue('partners')[id];


export const defaultPartnerAddresses = () => getPartnerAddresses('default');

export const getCurrentPartnerAddresses = id => getPartnerAddresses(id)
|| defaultPartnerAddresses();
