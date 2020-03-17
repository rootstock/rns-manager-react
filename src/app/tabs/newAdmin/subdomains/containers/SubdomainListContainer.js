import { connect } from 'react-redux';
import { SubdomainListComponent } from '../components';

const mapStateToProps = state => ({
  domain: state.auth.name,
  subdomains: state.newAdmin.subdomains.subdomains,
  strings: {
    value_prefix: '',
  },
});

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SubdomainListComponent);
