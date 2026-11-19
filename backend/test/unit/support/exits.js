/**
 * Monta o objeto `exits` que o Sails passa para actions no formato
 * `fn(inputs, exits)`. Cada saída é um stub que devolve
 * `{ saida, dados }`, para o teste conferir por onde a action saiu.
 */
const sinon = require('sinon');

module.exports = function criarExits(...nomes) {
  const exits = {};
  ['success', ...nomes].forEach((saida) => {
    exits[saida] = sinon.stub().callsFake((dados) => ({ saida, dados }));
  });
  return exits;
};
