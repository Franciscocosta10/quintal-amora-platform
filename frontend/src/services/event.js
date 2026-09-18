import { api } from './scheduleApi';

// Dados do evento atual, usados no banner da Home.
// > Os nomes dos campos retornados dependem de como o model Evento foi
// > definido por vocês — ver nota em Home.jsx.
export function buscarEventoAtual() {
  return api.get('/event/actual-find');
}
