import React from 'react';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import multilanguage from '../../../multilanguageReducer';
import searchReducer from '../../search/reducer';
import searchOperation from '../../search/operations';

import SearchBoxContainer from './SearchBoxContainer';

const rootReducer = () => combineReducers({
  search: searchReducer,
  multilanguage,
});

const middleware = [thunk];
const configureStore = (prelodedState) => {
  const store = createStore(
    rootReducer(),
    prelodedState,
    applyMiddleware(...middleware),
  );
  return store;
};

describe('searchBoxContainer', () => {
  it('gets correct environment varialbe', () => {
    expect(process.env.REACT_APP_ENVIRONMENT).toEqual('test');
  });

  it('has default state', () => {
    const store = configureStore();
    expect(store.getState().search.domain).toBeFalsy();
    expect(store.getState().requestingOwner).toBeFalsy();
  });

  it('handles handleClick function and sets domain in reducer', () => {
    const store = configureStore();
    const component = mount(
      <Provider store={store}>
        <SearchBoxContainer />
      </Provider>,
    );

    component.find('input').simulate('change', { target: { value: 'foobar' } });
    expect(component.find('input').props().value).toBe('foobar');

    component.find('button').simulate('click');
    expect(store.getState().search.domain).toEqual('foobar');
  });

  it('searches for the domain via handleClick opperations', () => {
    const store = configureStore();
    return store.dispatch(searchOperation('jesse'))
      .then(() => {
        const searchState = store.getState().search;

        expect(searchState.domain).toEqual('jesse');
        expect(searchState.requestingOwner).toBeFalsy();
        expect(searchState.owner).toBe('0x3Dd03d7d6c3137f1Eb7582Ba5957b8A2e26f304A');
        expect(searchState.owned).toBeTruthy();
      });
  });
});
