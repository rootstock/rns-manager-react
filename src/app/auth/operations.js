import { hash as namehash } from 'eth-ens-namehash';
import { push } from 'connected-react-router';
import { rns as registryAddress } from '../adapters/configAdapter';
import { checkResolver } from '../notifications';

import {
  receiveHasMetamask,
  requestEnable,
  receiveEnable,
  requestLogin,
  receiveLogin,
  errorLogin,
  errorEnable,
  logOut,
  closeModal,
} from './actions';

export const saveDomainToLocalStorage = (domain) => {
  let storedDomains = JSON.parse(localStorage.getItem('domains'));
  if (!storedDomains) storedDomains = [];
  if (!storedDomains.includes(domain)) {
    storedDomains.push(domain);
    localStorage.setItem('domains', JSON.stringify(storedDomains));
  }
};

export const authenticate = (name, address, noRedirect) => (dispatch) => {
  dispatch(requestLogin());

  const registry = window.web3.eth.contract([
    {
      constant: true,
      inputs: [
        { name: 'node', type: 'bytes32' },
      ],
      name: 'owner',
      outputs: [
        { name: '', type: 'address' },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
  ]).at(registryAddress);

  const hash = namehash(name);

  return new Promise((resolve) => {
    registry.owner(hash, (error, result) => {
      if (error) return resolve(dispatch(errorLogin(error)));

      if (address !== result) {
        localStorage.removeItem('name');
        return resolve(dispatch(receiveLogin(name, false)));
      }

      dispatch(checkResolver(name));

      if (!noRedirect) {
        dispatch(push('/admin'));
      }

      localStorage.setItem('name', name);
      saveDomainToLocalStorage(name);

      dispatch(closeModal());
      return resolve(dispatch(receiveLogin(name, true)));
    });
  });
};

export const start = callback => (dispatch) => {
  const hasMetamask = window.ethereum !== undefined;

  dispatch(receiveHasMetamask(hasMetamask));

  if (hasMetamask) {
    dispatch(requestEnable());

    window.ethereum.enable()
      .then((accounts) => {
        dispatch(receiveEnable(
          accounts[0],
          window.ethereum.publicConfigStore.getState().networkVersion,
          window.ethereum.publicConfigStore.getState().networkVersion
            === process.env.REACT_APP_ENVIRONMENT_ID,
          accounts.length !== 0,
        ));

        if (localStorage.getItem('name')) {
          dispatch(authenticate(localStorage.getItem('name'), accounts[0], true));
        }
      })
      .then(() => callback && callback())
      .catch(e => dispatch(errorEnable(e.message)));

    window.ethereum.on('accountsChanged', () => dispatch(start()));
  }
};

export const logoutManager = (redirect = '') => (dispatch) => {
  localStorage.removeItem('name');
  dispatch(logOut());
  dispatch(push(`/${redirect}`));
  dispatch(start());
};

export const autoLogin = domain => async (dispatch) => {
  const accounts = await window.ethereum.enable();
  dispatch(authenticate(domain, accounts[0]));
};
