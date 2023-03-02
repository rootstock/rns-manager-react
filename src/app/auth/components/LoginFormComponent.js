import React, { useState } from 'react';
import propTypes from 'prop-types';
import { multilanguage } from 'redux-multilanguage';
import { Button } from 'react-bootstrap';

const LoginFormComponent = ({
  strings, authError, handleLogin, showLoginInitState, domainInputInitialState,
}) => {
  const [domainInput, setDomainInput] = useState(domainInputInitialState);
  const [localError, setLocalError] = useState('');
  const [showLogin, setShowLogin] = useState(showLoginInitState);

  const handleLoginClick = () => {
    if (domainInput === '') {
      setLocalError('');
      return;
    }

    if (domainInput.match('^[a-z0-9!@#$%^&*()-_+={}[\]\\|;:\'",<>?/`~\\p{L}\\p{N}]*$') !== null) { /* eslint-disable-line */
      setLocalError(strings.invalid_name);
      return;
    }

    const appendRsk = domainInput.endsWith('.rsk') ? domainInput : `${domainInput}.rsk`;
    handleLogin(appendRsk);
    setLocalError('');
  };

  const AddAccountButton = () => (
    <button type="button" onClick={() => setShowLogin(!showLogin)} className={showLogin && 'active'}>
      {`+ ${strings.add_account}`}
    </button>
  );

  if (!showLogin) {
    return <li className="loginForm"><AddAccountButton /></li>;
  }

  return (
    <li className="loginForm">
      <AddAccountButton />
      <h3>{strings.your_domain}</h3>
      <form onSubmit={handleLoginClick}>
        <div className="rskinput">
          <input
            value={domainInput}
            onChange={evt => setDomainInput(evt.target.value)}
          />
          <span>.rsk</span>
        </div>
        <Button onClick={handleLoginClick}>
          {strings.enter}
        </Button>
      </form>
      {(localError === '' && authError)
        && <p className="error">{strings.not_domains_owner_message}</p>
      }
      {localError && <p className="error">{localError}</p>}
    </li>
  );
};

LoginFormComponent.defaultProps = {
  domainInputInitialState: '',
};

LoginFormComponent.propTypes = {
  strings: propTypes.shape({
    not_domains_owner_message: propTypes.string.isRequired,
    enter: propTypes.string.isRequired,
    your_domain: propTypes.string.isRequired,
    add_account: propTypes.string.isRequired,
    invalid_name: propTypes.string.isRequired,
  }).isRequired,
  authError: propTypes.bool.isRequired,
  handleLogin: propTypes.func.isRequired,
  showLoginInitState: propTypes.bool.isRequired,
  domainInputInitialState: propTypes.string,
};

export default multilanguage(LoginFormComponent);
