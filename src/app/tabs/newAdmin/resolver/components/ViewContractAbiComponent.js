import React, { useState } from 'react';
import propTypes from 'prop-types';
import { multilanguage } from 'redux-multilanguage';
import { Button } from 'react-bootstrap';

import { utils } from 'ethers';
import {
  UserWaitingComponent, UserErrorComponent, UserSuccessComponent, UserDeleteComponent,
} from '../../../../components';
import ContractAbiInputComponent from './ContractAbiInputComponent';
import edit from '../../../../../assets/img/edit.svg';
import editActive from '../../../../../assets/img/edit-active.svg';
import closeBlue from '../../../../../assets/img/close-blue.svg';

const ViewContractAbiComponent = ({
  strings, value, handleClick, isWaiting, errorMessage, handleCloseClick, successTx,
  prettyJson,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDelete, setIsDelete] = useState(false);

  const uri = value.filter(i => i.id === 8)[0].result;

  const prettyUri = (uri && parseInt(uri, 16) !== 0)
    ? utils.toUtf8String(uri) : null;

  if (successTx && isEditing) {
    setIsEditing(false);
  }

  const handleDeleteClick = (type) => {
    if (type === 'CANCEL') {
      return setIsDelete(false);
    }

    return handleClick({
      inputMethod: 'delete',
      encodings: {
        json: false, uri: false, zlib: false, cbor: false,
      },
    });
  };

  const storedAs = (encoding) => {
    if (!encoding.result || parseInt(encoding.result, 16) === 0) {
      return <></>;
    }

    const encodingNames = [
      { id: 1, name: 'JSON' },
      { id: 2, name: 'zlib-compressed JSON' },
      { id: 4, name: 'CBOR' },
      { id: 8, name: 'URI' },
    ];

    return (
      <li key={encoding.id}>
        {encodingNames.filter(item => item.id === encoding.id)[0].name}
      </li>
    );
  };

  return (
    <div className="row addressInput minor-section contract-abi-view">
      <div className="row view">
        <div className="col-md-3 label">
          {strings.contract_abi}
          <div>
            <Button onClick={() => setIsEditing(!isEditing)}>
              <img src={(!isEditing ? edit : editActive)} alt={strings.edit} />
            </Button>
            <Button onClick={() => setIsDelete(!isDelete)}>
              <img src={closeBlue} alt={strings.delete} />
            </Button>
          </div>
        </div>

        {!isEditing && (
        <div className="col-md-9">
          {prettyJson && (
            <>
              <p>Contract ABI Value</p>
              <pre className="contractAbi">{prettyJson}</pre>
            </>
          )}

          {prettyUri && (
            <>
              <p>URI</p>
              <div className="uri">{prettyUri}</div>
            </>
          )}
          <p>Stored as:</p>
          <ul>
            {value.map(encoding => storedAs(encoding))}
          </ul>
        </div>
        )}

        {isEditing && (
          <div className="col-md-9">
            <p><strong>Submit new ABI</strong></p>
            <ContractAbiInputComponent
              handleClick={data => handleClick(data)}
              disabled={isWaiting}
            />
          </div>
        )}
        {isDelete && (
          <UserDeleteComponent
            strings={{
              delete_confirm_text: 'Are you sure you want to remove the ABI?',
              delete: strings.delete,
              cancel: strings.cancel,
            }}
            handleClick={handleDeleteClick}
            isWaiting={isWaiting}
          />
        )}
        {isWaiting && <UserWaitingComponent />}
        {errorMessage && (
        <UserErrorComponent
          message={errorMessage}
          handleCloseClick={() => handleCloseClick()}
        />
        )}
        {successTx && (
        <UserSuccessComponent
          message="Updated"
          address={successTx}
          handleCloseClick={() => handleCloseClick()}
        />
        )}
      </div>
    </div>
  );
};

ViewContractAbiComponent.defaultProps = {
  errorMessage: null,
  successTx: null,
};

ViewContractAbiComponent.propTypes = {
  strings: propTypes.shape({
    contract_abi: propTypes.string.isRequired,
    edit: propTypes.string.isRequired,
    delete: propTypes.string.isRequired,
    cancel: propTypes.string.isRequired,
  }).isRequired,
  value: propTypes.arrayOf({
    id: propTypes.number,
    result: propTypes.string,
  }).isRequired,
  handleClick: propTypes.func.isRequired,
  isWaiting: propTypes.bool.isRequired,
  errorMessage: propTypes.string,
  handleCloseClick: propTypes.func.isRequired,
  successTx: propTypes.string,
  prettyJson: propTypes.string.isRequired,
};

export default multilanguage(ViewContractAbiComponent);
