import React from 'react';
import { Provider } from 'react-redux';
import { fireEvent, render } from '@testing-library/react';
import { createStore } from 'redux';

import App from './App';
import rootReducer from '../reducers';
import { MemoryRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';

const exampleApp = () => render(
  <Provider store={createStore(rootReducer)}>
    <MemoryRouter>
      <App />
    </MemoryRouter>
  </Provider>
);

const fakeLoad = () => {
  act(() => {
    window.dispatchEvent(new CustomEvent('load'));
  });
};

test('renders nothing when not loaded', () => {
  const app = exampleApp();
  expect(app.container).not.toHaveTextContent("About me");
});

test('renders ok when loaded', () => {
  const app = exampleApp();
  fakeLoad();
  expect(app.container).toHaveTextContent("About me");
});

const click = (app, txt) => {
  const btn = app.getByText(txt);
  expect(btn).toBeVisible();
  fireEvent.click(btn);
};

test('title and url change upon opening dialog', () => {
  const app = exampleApp();
  fakeLoad();

  const document = app.container.ownerDocument;
  expect(document.title).toBe("Mark Yu's homepage");
  expect(document.location.href).toBe("http://localhost/");

  click(app, "About me");
  expect(document.title).toBe("About Me");
  expect(document.location.href).toBe("http://localhost/about-me");
});

test('title and url change upon switching dialogs', () => {
  const app = exampleApp();
  fakeLoad();

  const document = app.container.ownerDocument;
  expect(document.title).toBe("Mark Yu's homepage");
  expect(document.location.href).toBe("http://localhost/");

  click(app, "About me");
  expect(document.title).toBe("About Me");
  expect(document.location.href).toBe("http://localhost/about-me");
  click(app, "Exhibit: A");
  expect(document.title).toBe("Exhibit A");
  expect(document.location.href).toBe("http://localhost/exhibit-a");
  click(app, "About me");
  expect(document.title).toBe("About Me");
  expect(document.location.href).toBe("http://localhost/about-me");
});

const closeDialog = (app, txt) => {
  const title = app.getByText(txt);
  const btn = title.parentElement.getElementsByTagName('button')[0];
  expect(title).toBeVisible();
  expect(btn).toBeVisible();
  fireEvent.click(btn);
}

test('title and url change upon closing dialog', () => {
  const app = exampleApp();
  fakeLoad();

  const document = app.container.ownerDocument;
  expect(document.title).toBe("Mark Yu's homepage");
  expect(document.location.href).toBe("http://localhost/");

  click(app, "About me");
  expect(document.title).toBe("About Me");
  expect(document.location.href).toBe("http://localhost/about-me");
  click(app, "Exhibit: A");
  expect(document.title).toBe("Exhibit A");
  expect(document.location.href).toBe("http://localhost/exhibit-a");

  closeDialog(app, "Exhibit A");
  expect(document.location.href).toBe("http://localhost/about-me");
  expect(document.title).toBe("About Me");
  closeDialog(app, "About Me");
  expect(document.location.href).toBe("http://localhost/");
  expect(document.title).toBe("Mark Yu's homepage");
});