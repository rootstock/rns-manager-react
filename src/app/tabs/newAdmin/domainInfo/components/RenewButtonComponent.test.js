import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import mockStore from '../../../../../../tests/config/mockStore';
import en from '../../../../../languages/en.json';

import RenewButtonComponent from './RenewButtonComponent';

const store = mockStore({
  expires_on: en.expires_on,
  renew: en.renew,
  domain_expired: en.domain_expired,
});

const handleClick = jest.fn();

const initProps = {
  domain: 'jesse.rsk',
  expires: 100,
  handleClick,
  checkingExpirationTime: false,
  isRenewOpen: false,
  isFifsMigrated: true,
};

describe('RenewButtonComponent', () => {
  it('renders without crashing', () => {
    const component = mount(
      <Provider store={store}>
        <RenewButtonComponent {...initProps} />
      </Provider>,
    );
    expect(component).toBeTruthy();
  });

  it('expect renew section to be open', () => {
    const localProps = {
      ...initProps,
      isRenewOpen: true,
    };
    const component = mount(
      <Provider store={store}>
        <RenewButtonComponent {...localProps} />
      </Provider>,
    );
    expect(component.find('button').hasClass('active')).toBeTruthy();
  });

  it.skip('expect nothing when expires is 0', () => { // test is outdated
    const localProps = {
      ...initProps,
      expires: 0,
    };
    const component = mount(
      <Provider store={store}>
        <RenewButtonComponent {...localProps} />
      </Provider>,
    );
    expect(component.find('button').prop('disabled')).toBeTruthy();
  });
});
