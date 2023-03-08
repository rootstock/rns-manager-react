import React, { useState } from 'react';
import propTypes from 'prop-types';
import { multilanguage } from 'redux-multilanguage';

import {
  Form, Row, Col,
} from 'react-bootstrap';
import { validateAddress } from '../../../../validations';

import UserErrorComponent from '../../../../components/UserErrorComponent';
import UserSuccessComponent from '../../../../components/UserSuccessComponent';
import UserWaitingComponent from '../../../../components/UserWaitingComponent';
import ChecksumErrorComponent from '../../../../components/ChecksumErrorComponent';
import { truncateString } from '../../helpers';

const NewSubdomainComponent = ({
  strings,
  domain,
  address,
  handleClick,
  errorMessage,
  handleErrorClose,
  handleSuccessClose,
  confirmedTx,
  newRequesting,
  newWaiting,
  initialSubdomain,
  initialOwner,
  chainId,
  advancedView,
  isWalletConnect,
}) => {
  const [localError, setLocalError] = useState('');
  const [checksumError, setChecksumError] = useState(false);

  const [subdomain, setSubdomain] = useState(initialSubdomain);
  const [owner, setOwner] = useState(initialOwner);
  const [setupRsk, setSetupRsk] = useState(false);

  const handleOnClick = (e) => {
    e.preventDefault();

    if (subdomain === '' || subdomain.match('^[a-z0-9!@#$%^&*()-_+={}[\]\\|;:\'",<>?/`~\\p{L}\\p{N}]*$')) { /* eslint-disable-line */
      return setLocalError(strings.invalid_name);
    }

    if (owner.endsWith('.rsk')) {
      return handleClick(subdomain, owner.toLowerCase(), setupRsk);
    }

    switch (validateAddress(owner, chainId)) {
      case 'Invalid address':
        return setLocalError('Invalid address');
      case 'Invalid checksum':
        return setChecksumError(true);
      default:
        return handleClick(subdomain, owner.toLowerCase(), setupRsk);
    }
  };

  const handleChecksum = (value) => {
    setOwner(value);
    setChecksumError(false);
    handleErrorClose();
    handleClick(subdomain, value);
  };

  const handleErrorClick = () => {
    setLocalError('');
    handleErrorClose();
  };

  if (confirmedTx !== '' && owner !== '') {
    setOwner('');
    setSubdomain('');
  }

  const disabled = newRequesting || newWaiting;

  return (
    <Form onSubmit={handleOnClick}>
      <Row>
        <Col>
          <h1>{strings.admin_your_domain_action_3}</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <p>{strings.purpose_subdomains}</p>
        </Col>
      </Row>
      <Row className="minor-section">
        <Col md={2} className="capitalize">
          {strings.name}
        </Col>
        <Col md={5}>
          <input
            value={subdomain}
            onChange={evt => setSubdomain(evt.target.value)}
            className="subdomain"
            disabled={disabled}
            placeholder={strings.subdomain_name}
          />
        </Col>
        <Col md={5}>
          <p className="blue break-above">
            {`.${domain}`}
          </p>
        </Col>
      </Row>
      <Row>
        <Col md={2} className="capitalize">
          {strings.owner}
        </Col>
        <Col md={8}>
          <input
            value={owner}
            onChange={evt => setOwner(evt.target.value)}
            className="owner"
            disabled={disabled}
            placeholder={strings.address_placeholder}
          />
        </Col>
        <Col>
          <button
            disabled={disabled}
            className="btn btn-primary"
            type="submit"
          >
            {strings.create}
          </button>
        </Col>
      </Row>

      <Row>
        <div className="col-md-8 offset-md-2">
          <ul className="suggestions">
            <li className="title">
              {strings.suggestion}
              :
            </li>
            <li>
              <button
                type="button"
                onClick={() => setOwner(address)}
                className="capitalize"
              >
                {`${strings.your_address} (${truncateString(address)})`}
              </button>
            </li>
          </ul>
        </div>
      </Row>

      {advancedView && (
        <>
          <Row>
            <Col className="col-md-10 offset-md-2">
              <Form.Check
                type="switch"
                id="setup-addr-switch"
                label={!isWalletConnect ? strings.set_subdomain_rsk : (
                  <>
                    {strings.set_subdomain_rsk}
                    <strong>{` ${strings.wallet_connect_feature}`}</strong>
                  </>
                )}
                checked={setupRsk}
                onChange={() => setSetupRsk(!setupRsk)}
                disabled={disabled || isWalletConnect}
              />
            </Col>
          </Row>
        </>
      )}

      <ChecksumErrorComponent
        show={checksumError}
        inputValue={owner}
        handleClick={value => handleChecksum(value)}
      />

      <UserErrorComponent
        visible={errorMessage !== '' || localError !== ''}
        message={errorMessage || localError}
        handleCloseClick={() => handleErrorClick()}
      />

      <UserSuccessComponent
        visible={confirmedTx !== ''}
        message={strings.subdomain_has_been_registered}
        address={confirmedTx}
        handleCloseClick={() => handleSuccessClose()}
      />

      <UserWaitingComponent
        visible={newWaiting === true}
        message={strings.wait_transation_confirmed}
      />
    </Form>
  );
};

NewSubdomainComponent.defaultProps = {
  initialSubdomain: '',
  initialOwner: '',
};

NewSubdomainComponent.propTypes = {
  strings: propTypes.shape({
    admin_your_domain_action_3: propTypes.string.isRequired,
    type_sudomain: propTypes.string.isRequired,
    type_owners_address: propTypes.string.isRequired,
    name: propTypes.string.isRequired,
    owner: propTypes.string.isRequired,
    create: propTypes.string.isRequired,
    invalid_name: propTypes.string.isRequired,
    subdomain_has_been_registered: propTypes.string.isRequired,
    wait_transation_confirmed: propTypes.string.isRequired,
    purpose_subdomains: propTypes.string.isRequired,
    Name: propTypes.string.isRequired,
    Owner: propTypes.string.isRequired,
    subdomain_name: propTypes.string.isRequired,
    address_placeholder: propTypes.string.isRequired,
    suggestion: propTypes.string.isRequired,
    your_address: propTypes.string.isRequired,
    set_subdomain_rsk: propTypes.string.isRequired,
    set_subdomain_rsk_other: propTypes.string.isRequired,
    wallet_connect_feature: propTypes.string.isRequired,
  }).isRequired,
  domain: propTypes.string.isRequired,
  address: propTypes.string.isRequired,
  handleClick: propTypes.func.isRequired,
  handleErrorClose: propTypes.func.isRequired,
  errorMessage: propTypes.string.isRequired,
  confirmedTx: propTypes.string.isRequired,
  handleSuccessClose: propTypes.func.isRequired,
  newRequesting: propTypes.bool.isRequired,
  newWaiting: propTypes.bool.isRequired,
  initialSubdomain: propTypes.string,
  initialOwner: propTypes.string,
  chainId: propTypes.number.isRequired,
  advancedView: propTypes.bool.isRequired,
  isWalletConnect: propTypes.bool.isRequired,
};

export default multilanguage(NewSubdomainComponent);
