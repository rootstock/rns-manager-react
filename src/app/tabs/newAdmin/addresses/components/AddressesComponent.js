import React, { useEffect } from 'react';
import propTypes from 'prop-types';
import { multilanguage } from 'redux-multilanguage';
import { useDispatch } from 'react-redux';
import { YourAddressesContainer, AddNewAddressContainer } from '../containers';
import { getAllChainAddresses } from '../operations';

const AddressesComponent = ({ domain }) => {
  const dispatch = useDispatch();
  useEffect(() => dispatch(getAllChainAddresses(domain)), [dispatch]);

  return (
    <div className="yourAddress">
      if the user has public resolver show migrate to multi chain
      <br />
      if user has multi, nothing to be done
      <br />
      Other resolver, “you changed your resolver to the string resolver

      <YourAddressesContainer />
      <AddNewAddressContainer />
    </div>
  );
};

AddressesComponent.propTypes = {
  strings: propTypes.shape({
    your_addresses: propTypes.string.isRequired,
  }).isRequired,
  domain: propTypes.string.isRequired,
};

export default multilanguage(AddressesComponent);
