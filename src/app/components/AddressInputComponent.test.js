import React from 'react';
import { shallow } from 'enzyme';

import AddressInputComponent from './AddressInputComponent';

describe('AddressInputComponent', () => {
  const initProps = {
    allowDelete: true,
    label: 'Label',
    value: 'Value',
    handleErrorClose: jest.fn(),
    handleSuccessClose: jest.fn(),
    handleSubmit: jest.fn(),
    handleDelete: jest.fn(),
    validation: false,
    strings: {
      cancel: 'cancel string',
      delete: 'delete string',
      delete_confirm_text: 'delete confirm text',
      edit: 'edit text',
      edit_placeholder: 'placeholder text',
      edit_propmt: 'edit prompt text',
      error_title: 'error title text',
      error_message: 'error message text',
      submit: 'submit text',
      success_title: 'success title text',
      success_message: 'success message text',
      value_prefix: 'value prefix',
      waiting: 'waiting text string',
      suggestion: 'suggestion',
    },
  };

  const checksumInitialProps = {
    ...initProps,
    validation: true,
    strings: {
      ...initProps.strings,
      value_prefix: '',
    },
  };

  it('renders without crashing', () => {
    const component = shallow(<AddressInputComponent {...initProps} />);
    expect(component).toBeDefined();
  });

  it('shows confirmation window when delete is clicked', () => {
    const component = shallow(<AddressInputComponent {...initProps} />);
    component.find('button.delete').simulate('click', { currentTarget: { className: 'delete' } });
    expect(component.find('div.delete').length).toBe(1);
  });

  it('delete is not shown when allowDelete is false', () => {
    const localProps = {
      ...initProps,
      allowDelete: false,
    };
    const component = shallow(<AddressInputComponent {...localProps} />);
    expect(component.find('button.delete').length).toBe(0);
  });

  it('start, edit, and delete allow custom text ', () => {
    const localProps = {
      ...initProps,
      strings: {
        cancel: 'custom cancel string',
        delete: 'custom delete string',
        delete_confirm_text: 'custom delete confirm text',
        edit: 'custom edit text',
        edit_placeholder: 'custom placeholder text',
        edit_propmt: 'custom edit prompt text',
        submit: 'custom submit text',
        value_prefix: 'custom value prefix',
      },
    };
    const component = shallow(<AddressInputComponent {...localProps} />);
    expect(component.find('div.value').text()).toEqual('custom value prefix: Value');

    // edit screen
    component.find('button.edit').simulate('click', { currentTarget: { className: 'edit' } });
    expect(component.find('div.editLabel').text()).toEqual('custom edit prompt text');

    // delete screen
    component.find('button.delete').simulate('click', { currentTarget: { className: 'delete' } });
    expect(component.find('div.delete').find('p').first().text())
      .toEqual('custom delete confirm text');
  });

  it('dispalys an icon correctly', () => {
    const localProps = {
      ...initProps,
      label: 'rsk',
      labelIcon: '/assets/icons/icon_rsk.svg',
    };
    const component = shallow(<AddressInputComponent {...localProps} />);
    const image = component.find('div.label').find('img');
    expect(image.props().src).toEqual('/assets/icons/icon_rsk.svg');
    expect(image.props().alt).toEqual('rsk');
  });

  it('displays correct checksum for ethereum', () => {
    const ethereumChecksum = '0xEe3D5f22Ea0FF393AeEf5Cf88a81E7d44979633B';

    const localProps = {
      ...checksumInitialProps,
      value: '0xee3d5f22ea0ff393aeef5cf88a81e7d44979633b',
    };

    const component = shallow(<AddressInputComponent {...localProps} />);
    expect(component.find('div.value').text()).toBe(ethereumChecksum);
  });

  it('displays correct checksum for RSK testnet', () => {
    const rskTestnetChecksum = '0xEE3D5f22Ea0Ff393aeeF5cf88a81E7D44979633B';

    const localProps = {
      ...checksumInitialProps,
      value: '0xee3d5f22ea0ff393aeef5cf88a81e7d44979633b',
      validationChainId: '31',
    };

    const component = shallow(<AddressInputComponent {...localProps} />);
    expect(component.find('div.value').text()).toBe(rskTestnetChecksum);
  });

  it('displays correct checksum for RSK mainnet', () => {
    const rskMainnetChecksum = '0x5215d879F378c902E6CC0CB9ace0240Ac7a863E7';

    const localProps = {
      ...checksumInitialProps,
      value: '0x5215d879f378c902e6cc0cb9ace0240ac7a863e7',
      validationChainId: '30',
    };

    const component = shallow(<AddressInputComponent {...localProps} />);
    expect(component.find('div.value').text()).toBe(rskMainnetChecksum);
  });

  it('renders when validation but no value', () => {
    const localProps = {
      ...checksumInitialProps,
      value: '',
      validationChainId: '30',
    };

    const component = shallow(<AddressInputComponent {...localProps} />);
    expect(component.find('div.value').text()).toBe('');
  });

  it('does not show suggested row when there are no suggestions', () => {
    const localProps = {
      ...checksumInitialProps,
      value: '',
    };

    const component = shallow(<AddressInputComponent {...localProps} />);
    component.find('button.edit').simulate('click', { currentTarget: { className: 'edit' } });

    expect(component.find('ul.suggestions').length).toBe(0);
  });

  it('displays suggested items', () => {
    const localProps = {
      ...checksumInitialProps,
      value: '',
      validationChainId: '30',
      suggestions: [
        {
          name: 'suggested item',
          value: '0x123456789',
        },
        {
          name: 'suggested item 2',
          value: '0x987654321',
        },
      ],
    };

    const component = shallow(<AddressInputComponent {...localProps} />);
    component.find('button.edit').simulate('click', { currentTarget: { className: 'edit' } });

    const ul = component.find('ul.suggestions');
    expect(ul.children().length).toBe(3);
    expect(ul.find('li.title').text()).toBe('suggestion:');
    expect(ul.find('li').at(1).text()).toBe('suggested item');
    expect(ul.find('li').at(2).text()).toBe('suggested item 2');
  });

  it('does not display suggested items when item is the value', () => {
    const localProps = {
      ...checksumInitialProps,
      value: '0x123456789',
      suggestions: [
        {
          name: 'suggested item',
          value: '0x123456789',
        },
        {
          name: 'suggested item 2',
          value: '0x987654321',
        },
      ],
    };

    const component = shallow(<AddressInputComponent {...localProps} />);
    component.find('button.edit').simulate('click', { currentTarget: { className: 'edit' } });

    const ul = component.find('ul.suggestions');
    expect(ul.children().length).toBe(2);
    expect(ul.find('li.title').text()).toBe('suggestion:');
    expect(ul.find('li').at(1).text()).toBe('suggested item 2');
  });

  it('hids and shows the settings menu', () => {
    const localProps = {
      ...initProps,
      settingsMenu: <div>settings</div>,
    };
    const component = shallow(<AddressInputComponent {...localProps} />);
    component.find('button.settings').simulate('click', { currentTarget: { className: 'settings' } });
    expect(component.find('.settingsMenu')).toBeDefined();
  });
});
