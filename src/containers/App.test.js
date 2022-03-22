import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { createStore } from 'redux';

import App from './App';
import rootReducer from '../reducers';
import { MemoryRouter } from 'react-router-dom';

const exampleApp = () => render(
  <Provider store={createStore(rootReducer)}>
    <MemoryRouter>
      <App />
    </MemoryRouter>
  </Provider>
);

test('renders nothing when not loaded', () => {
  const app = exampleApp();
  expect(app.container).not.toHaveTextContent("Credits");
});

test('renders ok when loaded', done => {
  const app = exampleApp();
  setTimeout(() => {
    expect(app.container).toHaveTextContent("Credits");
    done();
  }, 1000);
});
