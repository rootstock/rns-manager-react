import { connect } from 'react-redux';
import MyUrlComponent from '../components/MyUrlComponent';
import { supportedInterfaces, setContentHash } from '../../resolver/operations';

const mapStateToProps = state => ({
  resolverAddress: state.newAdmin.resolver.resolverAddr,
  domain: state.auth.name,
  receiveContent: state.newAdmin.resolver.receiveContent,
  url: state.newAdmin.resolver.content.CONTENT_HASH,
});

const mapDispatchToProps = dispatch => ({
  start: (resolverAddress, domain) => dispatch(supportedInterfaces(resolverAddress, domain)),
  handleSave: (domain, value) => dispatch(setContentHash(domain, value)),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...ownProps,
  ...stateProps,
  ...dispatchProps,
  start: () => (!stateProps.receiveContent)
    && dispatchProps.start(stateProps.resolverAddress, stateProps.domain),
  handleSave: value => dispatchProps.handleSave(stateProps.domain, value),
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(MyUrlComponent);
