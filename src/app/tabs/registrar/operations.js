import Web3 from 'web3';
import { keccak_256 as sha3 } from 'js-sha3';
import {
  requestGetCost,
  receiveGetCost,
  requestCommitRegistrar,
  receiveCommitRegistrar,
  errorRegistrarCommit,
  requestRevealCommit,
  receiveRevealCommit,
  receiveCanRevealCommit,
  errorRevealCommit,
  optionsNotFound,
  commitTxMined,
  revealTxMined,
  requestConversionRate,
  recieveConversionRate,
  errorConversionRate,
  requestCheckCommitRegistrar,
  requestIsCommitmentRequired,
  receiveIsCommitmentRequired,
} from './actions';
import {
  fifsRegistrar as fifsRegistrarAddress,
  fifsAddrRegistrar as fifsAddrRegistrarAddress,
  rif as rifAddress,
  getCurrentPartnerAddresses,
} from '../../adapters/configAdapter';
import { gasPrice as defaultGasPrice } from '../../adapters/gasPriceAdapter';
import transactionListener from '../../helpers/transactionListener';
import estimateGas from '../../helpers/estimateGas';
import { notifyError } from '../../notifications';
import {
  fifsRegistrarAbi,
  fifsAddrRegistrarAbi,
  rifAbi,
  partnerConfigurationAbi,
} from './abis.json';
import { getRegisterData, getAddrRegisterData } from './helpers';
import { FIFS_REGISTRER, FIFS_ADDR_REGISTRER } from './types';
import { sendBrowserNotification } from '../../browerNotifications/operations';
import { CONTENT_BYTES_BLANK } from '../newAdmin/resolver/types';
import { rskNode } from '../../adapters/nodeAdapter';
import { start } from '../../auth/operations';

/**
 * Get the cost for a domain
 * @param {string} domain domain to be registered
 * @param {number} duration number of years
 */
export const getCost = (domain, duration, partnerId) => async (dispatch) => {
  const web3 = new Web3(rskNode);
  const registrar = new web3.eth.Contract(
    fifsAddrRegistrarAbi,
    fifsAddrRegistrarAddress,
  );
  const partner = await getCurrentPartnerAddresses(partnerId);
  dispatch(requestGetCost(duration));

  registrar.methods
    .price(domain, 0, duration, partner.account)
    .call((error, cost) => {
      if (error) {
        dispatch(notifyError(error.message));
      } else {
        dispatch(receiveGetCost(cost / (10 ** 18)));

        let options = localStorage.getItem(`${domain}-options`);

        options = JSON.parse(options);

        localStorage.setItem(
          `${domain}-options`,
          JSON.stringify({
            ...options,
            duration,
            rifCost: cost / (10 ** 18),
          }),
        );
      }
    });
};

/**
 * Get an account's RIF balance by their address, if rLogin is not set, promot first
 * @param {cost} price amount of RIF needed
 */
export const hasEnoughRif = cost => dispatch => new Promise((resolve, reject) => {
  const checkBalance = () => {
    const web3 = new Web3(window.rLogin);
    const rif = new web3.eth.Contract(rifAbi, rifAddress);

    web3.eth.getAccounts().then((accounts) => {
      rif.methods
        .balanceOf(accounts[0])
        .call((balanceError, balance) => (balanceError
          ? reject(balanceError.message)
          : resolve((balance / (10 ** 18)) >= cost)));
    });
  };

  // eslint-disable-next-line no-unused-expressions
  window.rLogin
    ? checkBalance()
    : dispatch(start(checkBalance, err => reject(err)));
});

export const getConversionRate = () => async (dispatch) => {
  dispatch(requestConversionRate());

  return new Promise((resolve) => {
    fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=rif-token&vs_currencies=usd',
    )
      .then(res => res.json())
      .then(data => resolve(
        dispatch(recieveConversionRate(parseFloat(data['rif-token'].usd))),
      ))
      .catch(() => dispatch(errorConversionRate()));
  });
};

/**
 * Commit to registering a domain, first step
 * @param {string} domain domain to be registered
 * @param {number} duration amount of time in years to register
 * @param {number} rifCost the cost for the duration
 * @param {bool} setupAddr should the domain setup the resolution for RSK
 */
export const commit = (domain, duration, rifCost, setupAddr, partnerId) => async (dispatch) => {
  dispatch(requestCommitRegistrar());

  const randomBytes = window.crypto.getRandomValues(new Uint8Array(32));
  const strSalt = Array.from(randomBytes)
    .map(byte => byte.toString(16))
    .join('');
  const salt = `0x${strSalt.padEnd(64, '0')}`;

  const accounts = await window.rLogin.request({ method: 'eth_accounts' });
  const currentAddress = accounts[0];

  const web3 = new Web3(window.rLogin);

  const abi = setupAddr ? fifsAddrRegistrarAbi : fifsRegistrarAbi;
  const address = setupAddr ? fifsAddrRegistrarAddress : fifsRegistrarAddress;

  const registrar = new web3.eth.Contract(abi, address, {
    from: currentAddress,
    gasPrice: defaultGasPrice,
  });
  const currentPartner = await getCurrentPartnerAddresses(partnerId);
  const options = {
    from: currentAddress,
    gas: await estimateGas(registrar.methods.commit(CONTENT_BYTES_BLANK, currentPartner.account)),
  };
  return new Promise((resolve) => {
    registrar.methods
      .makeCommitment(`0x${sha3(domain)}`, currentAddress, salt, duration, currentAddress)
      .call((error, hashCommit) => {
        if (error) {
          return resolve(dispatch(errorRegistrarCommit(error.message)));
        }

        return registrar.methods
          .commit(hashCommit, currentPartner.account)
          .send(options, (_error, result) => {
            if (_error) {
              return dispatch(errorRegistrarCommit(_error.message));
            }

            localStorage.setItem(
              `${domain}-options`,
              JSON.stringify({
                salt,
                duration,
                rifCost,
                contract: setupAddr ? FIFS_ADDR_REGISTRER : FIFS_REGISTRER,
              }),
            );

            const transactionFailed = listenerParams => (listenerDispatch) => {
              localStorage.removeItem(`${listenerParams.domain}-options`);
              listenerDispatch(
                errorRegistrarCommit(listenerParams.errorReason),
              );
            };

            dispatch(receiveCommitRegistrar(hashCommit));
            return dispatch(
              transactionListener(
                result,
                () => listenerDispatch => listenerDispatch(commitTxMined()),
                {},
                transactionFailed,
                { domain },
              ),
            );
          });
      });
  });
};

export const checkCanReveal = (hash, domain) => async (dispatch) => {
  let options = localStorage.getItem(`${domain}-options`);
  if (!options) {
    return dispatch(optionsNotFound());
  }

  options = JSON.parse(options);
  const { contract, notificationReady } = options;

  const abi = contract === FIFS_ADDR_REGISTRER ? fifsAddrRegistrarAbi : fifsRegistrarAbi;
  const address = contract === FIFS_ADDR_REGISTRER
    ? fifsAddrRegistrarAddress
    : fifsRegistrarAddress;

  const web3 = new Web3(window.rLogin);
  const registrar = new web3.eth.Contract(abi, address);

  return new Promise((resolve) => {
    registrar.methods.canReveal(hash).call((error, canReveal) => {
      if (error) return resolve(dispatch(notifyError(error.message)));
      if (canReveal && !notificationReady) {
        sendBrowserNotification(
          `${domain}.rsk`,
          'notification_domain_ready_register',
        );
      }
      localStorage.setItem(
        `${domain}-options`,
        JSON.stringify({
          ...options,
          notificationReady: true,
        }),
      );
      if (canReveal) {
        return dispatch(receiveCanRevealCommit(canReveal));
      }
      return null;
    });
  });
};

export const checkIfAlreadyCommitted = domain => async (dispatch) => {
  let options = localStorage.getItem(`${domain}-options`);
  if (!options) {
    return dispatch(optionsNotFound());
  }

  options = JSON.parse(options);
  const { salt, contract } = options;

  dispatch(requestCheckCommitRegistrar());

  const accounts = await window.rLogin.request({ method: 'eth_accounts' });
  const currentAddress = accounts[0];

  const abi = contract === FIFS_ADDR_REGISTRER ? fifsAddrRegistrarAbi : fifsRegistrarAbi;
  const address = contract === FIFS_ADDR_REGISTRER
    ? fifsAddrRegistrarAddress
    : fifsRegistrarAddress;

  const web3 = new Web3(window.rLogin);
  const registrar = new web3.eth.Contract(abi, address);

  return new Promise((resolve) => {
    registrar.methods
      .makeCommitment(`0x${sha3(domain)}`, currentAddress, salt)
      .call((error, hashCommit) => {
        if (error) return resolve(dispatch(notifyError(error.message)));

        dispatch(receiveCommitRegistrar(hashCommit, true));

        return resolve(dispatch(checkCanReveal(hashCommit, domain)));
      });
  });
};

export const revealCommit = (domain, partnerId) => async (dispatch) => {
  const callback = async () => {
    let options = localStorage.getItem(`${domain}-options`);
    if (!options) {
      return dispatch(optionsNotFound());
    }

    options = JSON.parse(options);
    const {
      salt, contract, duration, rifCost,
    } = options;

    dispatch(requestRevealCommit());
    const currentPartner = await getCurrentPartnerAddresses(partnerId);

    const web3 = new Web3(window.rLogin);
    const weiValue = rifCost * (10 ** 18);
    const accounts = await window.rLogin.request({ method: 'eth_accounts' });
    const currentAddress = accounts[0];
    const durationBN = new web3.utils.BN(duration);
    const data = contract === FIFS_ADDR_REGISTRER
      ? getAddrRegisterData(
        domain,
        currentAddress,
        salt,
        durationBN,
        currentAddress,
        currentPartner.account,
      )
      : getRegisterData(domain, currentAddress, salt, durationBN);

    const fifsAddress = contract === FIFS_ADDR_REGISTRER
      ? fifsAddrRegistrarAddress
      : fifsRegistrarAddress;

    const rif = new web3.eth.Contract(rifAbi, rifAddress, {
      from: currentAddress,
      gasPrice: defaultGasPrice,
    });

    const contractOptions = {
      from: currentAddress,
      gas: await estimateGas(
        rif.methods.transferAndCall(fifsAddress, weiValue.toString(), data),
      ),
    };

    return new Promise((resolve) => {
      rif.methods
        .transferAndCall(fifsAddress, weiValue.toString(), data)
        .send(contractOptions, (error, result) => {
          if (error) {
            return dispatch(errorRevealCommit(error.message));
          }

          localStorage.setItem(
            `${domain}-options`,
            JSON.stringify({
              ...options,
              registerHash: result,
            }),
          );

          const transactionConfirmed = listenerParams => (listenerDispatch) => {
            const listnerDomain = listenerParams.domain;
            listenerDispatch(receiveRevealCommit());
            listenerDispatch(revealTxMined(listenerParams.resultTx));
            sendBrowserNotification(
              `${listnerDomain}.rsk`,
              'notifications_registrar_revealed',
            );
            localStorage.setItem('name', `${listnerDomain}.rsk`);
            localStorage.removeItem(`${listnerDomain}-options`);
          };

          return resolve(
            dispatch(
              transactionListener(
                result,
                transactionConfirmed,
                { domain },
                listenerParams => listenerDispatch => listenerDispatch(
                  errorRevealCommit(listenerParams.errorReason),
                ),
              ),
            ),
          );
        });
    });
  };

  return window.rLogin ? callback() : dispatch(start(callback));
};

export const checkIfAlreadyRegistered = (domain, intId) => async (dispatch) => {
  const options = JSON.parse(localStorage.getItem(`${domain}-options`));

  const web3 = new Web3(window.rLogin);
  return web3.eth.getTransactionReceipt(options.registerHash).then((result) => {
    let intervalId = intId;
    if (result && result.status) {
      clearInterval(intervalId);
      dispatch(revealTxMined());
      sendBrowserNotification(
        `${domain}.rsk`,
        'notifications_registrar_revealed',
      );
      localStorage.setItem('name', `${domain}.rsk`);
      localStorage.removeItem(`${domain}-options`);
    }

    dispatch(requestRevealCommit());
    if (!intervalId) {
      const checkAgain = () => dispatch(checkIfAlreadyRegistered(domain, intervalId));
      intervalId = setInterval(checkAgain, 5000);
    }
  });
};

/**
 * All in one function to check if registration is in progress. If so, check if rLogin exists first!
 * This function is only continued if the browser was refreshed.
 * @param {string} domain Domain to be registered
 */
export const checkIfInProgress = domain => (dispatch) => {
  const options = localStorage.getItem(`${domain}-options`);

  // no domain registration is in process
  if (!options) {
    return dispatch(optionsNotFound());
  }

  const callback = () => {
    const parsed = JSON.parse(options);

    // step 2, registering domain:
    if (parsed.registerHash) {
      dispatch(receiveCommitRegistrar(parsed.registerHash, true));
      dispatch(receiveCanRevealCommit(true));
      return dispatch(checkIfAlreadyRegistered(domain));
    }

    // Step 1, requesting domain:
    return dispatch(checkIfAlreadyCommitted(domain));
  };

  // if rLogin does not exist, start with the modal:
  return window.rLogin ? callback() : dispatch(start(callback));
};

export const checkIfRequiresCommitment = (domain, partnerId) => async (dispatch, getState) => {
  dispatch(requestIsCommitmentRequired());
  const currentPartner = await getCurrentPartnerAddresses(partnerId);

  if (!currentPartner.config) {
    return dispatch(receiveIsCommitmentRequired(true));
  }

  const web3 = new Web3(rskNode);
  const partnerConfiguration = new web3.eth.Contract(
    partnerConfigurationAbi,
    currentPartner.config,
  );

  try {
    const minCommitmentAge = await partnerConfiguration.methods
      .getMinCommitmentAge()
      .call();

    const isCommitmentRequired = minCommitmentAge !== '0';

    if (!isCommitmentRequired) {
      const randomBytes = window.crypto.getRandomValues(new Uint8Array(32));
      const strSalt = Array.from(randomBytes)
        .map(byte => byte.toString(16))
        .join('');
      const salt = `0x${strSalt.padEnd(64, '0')}`;

      const { rifCost, duration } = getState().registrar;

      localStorage.setItem(
        `${domain}-options`,
        JSON.stringify({
          salt,
          duration,
          rifCost,
          contract: FIFS_ADDR_REGISTRER,
        }),
      );
    }

    return dispatch(receiveIsCommitmentRequired(isCommitmentRequired));
  } catch (error) {
    return dispatch(notifyError(error.message));
  }
};
