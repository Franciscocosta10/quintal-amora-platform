import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PoliticaPrivacidade from './PoliticaPrivacidade';
import SignupPage from './SignupPage';

vi.mock('../../hooks/useAuth', () => ({ useAuth: () => ({ cadastrar: vi.fn() }) }));

describe('PoliticaPrivacidade (LGPD)', () => {
  it('informa os dados coletados, a finalidade, o compartilhamento e os direitos do titular', () => {
    render(
      <MemoryRouter>
        <PoliticaPrivacidade />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Política de Privacidade' })).toBeInTheDocument();
    for (const secao of ['Quais dados coletamos', 'Para que usamos', 'Com quem compartilhamos', 'Seus direitos']) {
      expect(screen.getByRole('heading', { name: new RegExp(secao) })).toBeInTheDocument();
    }
    expect(screen.getByText(/Lei nº 13.709\/2018/)).toBeInTheDocument();
  });

  it('oferece um contato por e-mail para pedir acesso, correção ou exclusão', () => {
    render(
      <MemoryRouter>
        <PoliticaPrivacidade />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'quintaldaamora.suporte@gmail.com' })).toHaveAttribute('href', 'mailto:quintaldaamora.suporte@gmail.com');
  });

  it('o cadastro leva até a política de privacidade', () => {
    render(
      <MemoryRouter initialEntries={['/cadastro']}>
        <Routes>
          <Route path="/cadastro" element={<SignupPage />} />
          <Route path="/privacidade" element={<PoliticaPrivacidade />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Ao criar sua conta/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Política de Privacidade' })).toHaveAttribute('href', '/privacidade');
  });
});
