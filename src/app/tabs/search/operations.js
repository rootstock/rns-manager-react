import Web3 from 'web3';
import { keccak_256 as sha3 } from 'js-sha3';
import {
  requestDomainState, receiveDomainState, blockedDomain,
  requestDomainOwner, receiveDomainOwner, requestDomainCost, receiveDomainCost,
} from './actions';
import {
  rskOwner as rskOwnerAddress,
  fifsAddrRegistrar as fifsAddrRegistrarAddress,
  registrar as auctionRegistrarAddress,
  getCurrentPartnerAddresses,
} from '../../adapters/configAdapter';

import { notifyError } from '../../notifications';
import { rskNode } from '../../adapters/nodeAdapter';
import {
  rskOwnerAbi,
  fifsAddrRegistrarAbi,
  auctionRegistrarAbi,
  deedRegistrarAbi,
} from './abis.json';

export default (domain, partnerId) => (dispatch) => {
  if (!domain) {
    return dispatch(receiveDomainState(''));
  }

  dispatch(requestDomainState(domain));

  const web3 = new Web3(rskNode);

  const rskOwner = new web3.eth.Contract(rskOwnerAbi, rskOwnerAddress);

  const registrar = new web3.eth.Contract(fifsAddrRegistrarAbi, fifsAddrRegistrarAddress);

  const hash = `0x${sha3(domain.split('.')[0])}`;

  return rskOwner.methods.available(hash).call()
    .then(async (available) => {
      if (!available) {
        dispatch(receiveDomainState(false));
        dispatch(requestDomainOwner());

        const auctionRegistrar = new web3.eth.Contract(
          auctionRegistrarAbi,
          auctionRegistrarAddress,
        );

        return auctionRegistrar.methods.entries(hash).call()
          .then((results) => {
            if (results[0] === '2') {
              const deedContract = new web3.eth.Contract(deedRegistrarAbi, results[1]);
              return deedContract.methods.owner().call()
                .then(owner => dispatch(receiveDomainOwner(owner)))
                .catch(error => dispatch(notifyError(error.message)));
            }

            return rskOwner.methods.ownerOf(hash).call()
              .then(owner => dispatch(receiveDomainOwner(owner)))
              .catch(error => dispatch(notifyError(error.message)));
          })
          .catch(error => dispatch(notifyError(error.message)));
      }

      if (domain.length < 5) {
        return dispatch(blockedDomain());
      }

      dispatch(requestDomainCost());
      const partnerAddresses = await getCurrentPartnerAddresses(partnerId);
      console.log(partnerAddresses, 'partnerAddresses');
      return registrar.methods.price(domain, 0, 1, partnerAddresses.account).call()
        .then((result) => {
          const rifCost = web3.utils.toBN(result).div(web3.utils.toBN('1000000000000000000'));
          dispatch(receiveDomainCost(web3.utils.toDecimal(rifCost)));
          dispatch(receiveDomainState(available));
        })
        .catch(error => dispatch(notifyError(error.message)));
    })
    .catch(error => dispatch(notifyError(error.message)));
};
