import { describe, it, expect } from 'vitest';
import { deInputDataHora, formatarHorario, formatarPeriodo, paraInputDataHora } from './dataEvento';

const SABADO_10H = new Date('2026-11-21T10:00:00-03:00').getTime();
const SABADO_20H = new Date('2026-11-21T20:00:00-03:00').getTime();
const DOMINGO_19H = new Date('2026-11-22T19:00:00-03:00').getTime();

describe('dataEvento', () => {
  it('mostra a data por extenso quando o evento dura um dia', () => {
    expect(formatarPeriodo(SABADO_10H, SABADO_20H)).toBe('21 de novembro de 2026');
  });

  it('mostra o intervalo quando o evento dura mais de um dia', () => {
    expect(formatarPeriodo(SABADO_10H, DOMINGO_19H)).toBe('21/11 a 22/11');
  });

  it('mostra o horário de abertura e fechamento', () => {
    expect(formatarHorario(SABADO_10H, DOMINGO_19H)).toBe('10:00 às 19:00');
  });

  it('converte para o input datetime-local e volta sem perder o horário', () => {
    expect(paraInputDataHora(SABADO_10H)).toBe('2026-11-21T10:00');
    expect(deInputDataHora('2026-11-21T10:00')).toBe(SABADO_10H);
    expect(paraInputDataHora(null)).toBe('');
  });
});
