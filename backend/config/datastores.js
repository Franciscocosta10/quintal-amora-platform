/**
 * Banco de dados
 *
 * DATABASE_URL aponta para o PostgreSQL (Docker localmente, Azure em
 * produção). O PostgreSQL da Azure só aceita conexões criptografadas:
 * lá, DATABASE_SSL=true liga o SSL e valida o certificado do servidor.
 */

const usarSsl = process.env.DATABASE_SSL === 'true';

module.exports.datastores = {
  default: {
    adapter: 'sails-postgresql',
    url: process.env.DATABASE_URL,
    ...(usarSsl && { ssl: { rejectUnauthorized: true } })
  }
};
