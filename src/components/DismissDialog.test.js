import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import DismissDialog from './DismissDialog';

const mockOnDismiss = jest.fn();
const exampleRender = (show, child) => render(
  <DismissDialog onDismiss={mockOnDismiss} title="test-title" show={show}>
    {child}
  </DismissDialog>
);

test('Shows dialog when asked to', () => {
  const { getByText } = exampleRender(true, 'test-abc');
  const txt = getByText(/test-abc/);
  expect(txt).toBeVisible();
});

test('Hides dialog when asked to', () => {
  const { queryByText } = exampleRender(false, 'test-abc');
  const txt = queryByText(/test-abc/);
  expect(txt).not.toBeVisible();
});

test('Sets title', () => {
  const { getByText } = exampleRender(true, 'test-abc');
  const txt = getByText(/test-title/);
  expect(txt).toBeInTheDocument();
});

test('Provides "Dismiss" button', () => {
  mockOnDismiss.mockClear();
  const { getByText } = exampleRender(true, 'test-abc');
  const btn = getByText("Dismiss");
  expect(btn).toBeInTheDocument();
  fireEvent.click(btn, {button: 1});
  expect(mockOnDismiss.mock.calls.length).toBe(1);
});
