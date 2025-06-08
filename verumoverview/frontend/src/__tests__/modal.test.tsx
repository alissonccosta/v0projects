import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../components/modules/Modal';

it('fecha ao pressionar Escape', async () => {
  const onClose = jest.fn();
  render(
    <Modal isOpen={true} title="Teste" onClose={onClose}>
      <div>Conteúdo</div>
    </Modal>
  );
  await userEvent.keyboard('{Escape}');
  expect(onClose).toHaveBeenCalled();
});
