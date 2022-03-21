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

test('renders nothing when not loaded', () => {
  const app = exampleApp();
  expect(app.container).not.toHaveTextContent("About me");
});

test('renders ok when loaded', done => {
  const app = exampleApp();
  setTimeout(() => {
    expect(app.container).toHaveTextContent("About me");
    done();
  }, 1000);
});
