import React from 'react';
import { render } from '@testing-library/react';
import TimeDiffIndicator from '../components/modules/TimeDiffIndicator';

test('indica verde quando gasto <= estimado', () => {
  const { getByTestId } = render(<TimeDiffIndicator estimado={60} gasto={50} />);
  expect(getByTestId('diff-indicator')).toHaveClass('bg-status-success');
});

test('indica amarelo quando dentro de 20%', () => {
  const { getByTestId } = render(<TimeDiffIndicator estimado={60} gasto={70} />);
  expect(getByTestId('diff-indicator')).toHaveClass('bg-status-warning');
});

test('indica vermelho quando acima de 20%', () => {
  const { getByTestId } = render(<TimeDiffIndicator estimado={60} gasto={80} />);
  expect(getByTestId('diff-indicator')).toHaveClass('bg-status-error');
});
