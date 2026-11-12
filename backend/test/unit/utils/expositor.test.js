const { expect } = require('chai');
const { normalizarCampos, ehUrlHttp, TIPOS, REDES_SOCIAIS } = require('../../../api/utils/expositor');

function esperarBadRequest(fn, mensagem) {
  try {
    fn();
    throw new Error('deveria ter lançado badRequest');
  } catch (erro) {
    expect(erro.badRequest.message).to.equal(mensagem);
  }
}

describe('utils/expositor', function () {
  it('expõe os tipos e as redes sociais aceitas', function () {
    expect(TIPOS).to.deep.equal(['loja', 'artista']);
    expect(REDES_SOCIAIS).to.deep.equal(['instagram', 'youtube', 'tiktok', 'site']);
  });

  describe('ehUrlHttp', function () {
    it('aceita URLs http e https', function () {
      expect(ehUrlHttp('https://exemplo.com/logo.png')).to.be.true;
      expect(ehUrlHttp('http://exemplo.com')).to.be.true;
    });

    it('rejeita outros protocolos (ex.: javascript:) e textos que não são URL', function () {
      expect(ehUrlHttp('javascript:alert(1)')).to.be.false;
      expect(ehUrlHttp('data:image/png;base64,AAAA')).to.be.false;
      expect(ehUrlHttp('exemplo.com')).to.be.false;
    });
  });

  describe('normalizarCampos', function () {
    it('remove espaços das pontas e transforma textos opcionais vazios em null', function () {
      const resultado = normalizarCampos({
        nome: '  Loja da Amora  ',
        descricao: '   ',
        localizacaoEstande: ' Estande 12 ',
        contato: '',
        imagem: null
      });

      expect(resultado).to.deep.equal({
        nome: 'Loja da Amora',
        descricao: null,
        localizacaoEstande: 'Estande 12',
        contato: null,
        imagem: null
      });
    });

    it('não inclui campos que não foram enviados (atualização parcial)', function () {
      const resultado = normalizarCampos({ tipo: 'artista' });
      expect(resultado).to.deep.equal({ tipo: 'artista' });
    });

    it('não altera o objeto recebido', function () {
      const original = { nome: '  Loja  ' };
      normalizarCampos(original);
      expect(original.nome).to.equal('  Loja  ');
    });

    it('rejeita nome vazio ou só com espaços', function () {
      esperarBadRequest(() => normalizarCampos({ nome: '   ' }), 'Informe o nome do expositor.');
    });

    it('rejeita imagem que não seja URL http(s)', function () {
      esperarBadRequest(
        () => normalizarCampos({ imagem: 'javascript:alert(1)' }),
        'A imagem deve ser uma URL começando com http:// ou https://.'
      );
    });

    it('mantém imagem com URL válida', function () {
      const resultado = normalizarCampos({ imagem: ' https://cdn.exemplo.com/logo.png ' });
      expect(resultado.imagem).to.equal('https://cdn.exemplo.com/logo.png');
    });

    describe('redesSociais', function () {
      it('mantém links válidos e descarta os vazios', function () {
        const resultado = normalizarCampos({
          redesSociais: {
            instagram: ' https://instagram.com/loja ',
            youtube: '',
            tiktok: null,
            site: 'https://loja.com.br'
          }
        });

        expect(resultado.redesSociais).to.deep.equal({
          instagram: 'https://instagram.com/loja',
          site: 'https://loja.com.br'
        });
      });

      it('guarda null quando nenhum link sobra (objeto vazio = sem redes)', function () {
        expect(normalizarCampos({ redesSociais: {} }).redesSociais).to.equal(null);
        expect(normalizarCampos({ redesSociais: { site: '  ' } }).redesSociais).to.equal(null);
      });

      it('aceita null explícito (remover todas as redes)', function () {
        expect(normalizarCampos({ redesSociais: null }).redesSociais).to.equal(null);
      });

      it('rejeita quando não é um objeto', function () {
        esperarBadRequest(
          () => normalizarCampos({ redesSociais: ['https://instagram.com/loja'] }),
          'redesSociais deve ser um objeto, ex.: { "instagram": "https://..." }.'
        );
      });

      it('rejeita redes que não estão na lista aceita', function () {
        esperarBadRequest(
          () => normalizarCampos({ redesSociais: { orkut: 'https://orkut.com/loja' } }),
          'Rede social não suportada: orkut.'
        );
      });

      it('rejeita link que não é texto', function () {
        esperarBadRequest(
          () => normalizarCampos({ redesSociais: { site: 123 } }),
          'O link de site deve ser um texto.'
        );
      });

      it('rejeita link que não é URL http(s)', function () {
        esperarBadRequest(
          () => normalizarCampos({ redesSociais: { instagram: 'javascript:alert(1)' } }),
          'O link de instagram deve ser uma URL começando com http:// ou https://.'
        );
      });
    });
  });
});
