import { connect } from 'react-redux';
import { AddNewAddressComponent } from '../components';

import { setChainAddress } from '../operations';
import { closeSetChainAddress } from '../actions';

// return networks not assigned:
const networksFilter = networks => Object.entries(networks).filter(
  chainAddress => chainAddress[1].address === ''
    || chainAddress[1].address === '0x0000000000000000000000000000000000000000',
);

const mapStateToProps = state => ({
  domain: state.auth.name,
  resolver: state.newAdmin.resolver.resolverAddr,
  networks: networksFilter(state.newAdmin.addresses.chainAddresses),
  chainAddresses: state.newAdmin.addresses.chainAddresses,
  targetAddress: state.newAdmin.addresses.targetAddress,
});

const mapDispatchToProps = dispatch => ({
  handleClick: (domain, networkId, address) => dispatch(
    setChainAddress(domain, networkId, address),
  ),
  handleClose: chainName => dispatch(closeSetChainAddress(chainName)),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...ownProps,
  ...stateProps,
  ...dispatchProps,
  handleClick: (networkId, address) => dispatchProps.handleClick(
    stateProps.domain, networkId, address,
  ),
  handleClose: chainName => dispatchProps.handleClose(chainName),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(AddNewAddressComponent);
