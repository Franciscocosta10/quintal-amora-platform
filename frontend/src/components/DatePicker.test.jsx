import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import DatePicker from './DatePicker';

function DatePickerControlado({ valorInicial = '', onChange }) {
  const [valor, setValor] = useState(valorInicial);

  return (
    <DatePicker
      id="data"
      name="data"
      value={valor}
      onChange={(event) => {
        setValor(event.target.value);
        onChange?.(event);
      }}
    />
  );
}

function focarDeVerdade(elemento) {
  act(() => elemento.focus());
}

describe('DatePicker', () => {
  it('abre o calendário ao focar o input', () => {
    render(<DatePickerControlado />);

    focarDeVerdade(screen.getByRole('combobox'));

    expect(screen.getByRole('dialog', { name: 'Selecionar data' })).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
  });

  it('exibe o valor em dd/mm/aaaa e abre no mês desse valor', () => {
    render(<DatePickerControlado valorInicial="2026-03-15" />);

    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('15/03/2026');

    fireEvent.click(input);
    expect(screen.getByText('Março 2026')).toBeInTheDocument();
  });

  it('dispara onChange em ISO, fecha e devolve o foco ao selecionar um dia', () => {
    const onChange = vi.fn();
    render(<DatePickerControlado valorInicial="2026-03-15" onChange={onChange} />);

    const input = screen.getByRole('combobox');
    focarDeVerdade(input);

    const dia = screen.getByRole('gridcell', { name: '20 de março de 2026' });
    focarDeVerdade(dia);
    fireEvent.click(dia);

    expect(onChange).toHaveBeenCalledWith({ target: { name: 'data', value: '2026-03-20' } });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it('fecha com Escape mesmo com o foco dentro do calendário e devolve o foco ao input', () => {
    render(<DatePickerControlado />);

    const input = screen.getByRole('combobox');
    focarDeVerdade(input);

    const proximoMes = screen.getByRole('button', { name: 'Próximo mês' });
    focarDeVerdade(proximoMes);
    fireEvent.keyDown(proximoMes, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it('ignora outras teclas e o Escape com o calendário fechado', () => {
    render(<DatePickerControlado />);

    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(input);
    fireEvent.keyDown(input, { key: 'a' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('fecha ao clicar fora, mas não ao clicar dentro', () => {
    render(<DatePickerControlado />);

    fireEvent.click(screen.getByRole('combobox'));

    fireEvent.mouseDown(screen.getByRole('dialog'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('navega entre os meses virando o ano nas duas direções', () => {
    render(<DatePickerControlado valorInicial="2026-01-10" />);

    fireEvent.click(screen.getByRole('combobox'));

    fireEvent.click(screen.getByRole('button', { name: 'Mês anterior' }));
    expect(screen.getByText('Dezembro 2025')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Mês anterior' }));
    expect(screen.getByText('Novembro 2025')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));
    fireEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));
    expect(screen.getByText('Janeiro 2026')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));
    expect(screen.getByText('Fevereiro 2026')).toBeInTheDocument();
  });

  it('marca o dia selecionado e o dia de hoje', () => {
    const hoje = new Date();
    const hojeISO = [
      hoje.getFullYear(),
      String(hoje.getMonth() + 1).padStart(2, '0'),
      String(hoje.getDate()).padStart(2, '0')
    ].join('-');

    render(<DatePickerControlado valorInicial={hojeISO} />);
    fireEvent.click(screen.getByRole('combobox'));

    const celulaDeHoje = screen.getByRole('gridcell', { selected: true });
    expect(celulaDeHoje).toHaveClass('is-selected', 'is-today');
    expect(celulaDeHoje).toHaveAttribute('aria-current', 'date');
  });
});
