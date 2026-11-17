const { expect } = require('chai');
const sinon = require('sinon');
const avisoAutomatico = require('../../../api/utils/avisoAutomatico');

describe('utils/avisoAutomatico', function () {

  describe('formatarDataHora', function () {
    it('escreve no horário de Joinville, independente do fuso do servidor', function () {
      const timestamp = new Date('2026-11-21T18:30:00Z').getTime(); // 15:30 em Brasília
      expect(avisoAutomatico.formatarDataHora(timestamp)).to.equal('21/11 às 15:30');
    });
  });

  describe('mudouHorario', function () {
    const antigo = { dataHoraInicio: 1000, dataHoraFim: 2000 };

    it('detecta mudança no início', function () {
      expect(avisoAutomatico.mudouHorario(antigo, { dataHoraInicio: 1500 })).to.equal(true);
    });

    it('detecta mudança no término', function () {
      expect(avisoAutomatico.mudouHorario(antigo, { dataHoraFim: 2500 })).to.equal(true);
    });

    it('ignora horários reenviados com o mesmo valor', function () {
      expect(avisoAutomatico.mudouHorario(antigo, { dataHoraInicio: 1000, dataHoraFim: 2000, titulo: 'X' }))
        .to.equal(false);
    });

    it('ignora edições que não mexem no horário', function () {
      expect(avisoAutomatico.mudouHorario(antigo, { titulo: 'Novo título' })).to.equal(false);
    });
  });

  describe('avisarMudancaDeHorario', function () {
    beforeEach(function () {
      global.Notificacao = { create: sinon.stub().resolves() };
    });

    afterEach(function () {
      delete global.Notificacao;
    });

    it('cria a notificação com o vínculo da atividade', async function () {
      await avisoAutomatico.avisarMudancaDeHorario({
        tipo: 'alteracao_programacao',
        nome: 'Show de K-pop',
        inicio: new Date('2026-11-21T16:00:00-03:00').getTime(),
        autor: 1,
        vinculo: { atividade: 5, evento: 3 }
      });

      expect(global.Notificacao.create.firstCall.args[0]).to.deep.equal({
        titulo: 'Mudança de horário: Show de K-pop',
        mensagem: 'Show de K-pop agora começa em 21/11 às 16:00.',
        tipo: 'alteracao_programacao',
        autor: 1,
        atividade: 5,
        evento: 3
      });
    });
  });
});
