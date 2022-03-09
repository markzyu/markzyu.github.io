import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { createStore } from 'redux';

import App from './App';
import rootReducer from '../reducers';

const exampleApp = () => render(
  <Provider store={createStore(rootReducer)}>
    <App />
  </Provider>
);

test('renders ok', () => {
  const { getByText } = exampleApp();
  const template = getByText("Throw an Error");
  expect(template).toBeVisible();
});
