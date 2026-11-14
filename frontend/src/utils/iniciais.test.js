import { describe, it, expect } from 'vitest';
import { iniciais } from './iniciais';

describe('iniciais', () => {
  it('usa a primeira letra do primeiro e do último nome', () => {
    expect(iniciais('Francisco Marcelo Caetano Costa')).toBe('FC');
    expect(iniciais('  ana  ')).toBe('A');
  });

  it('devolve "?" sem nome', () => {
    expect(iniciais('   ')).toBe('?');
    expect(iniciais()).toBe('?');
  });
});
