import type { Centavos } from '@/lib/money';

export interface ServicoPredefinido {
  chave: string;
  nome: string;
  icone: string;
  cor: string;
  valorSugeridoCentavos: Centavos;
  periodicidadeSugerida: 'mensal' | 'anual';
  trabalhoSugerido: boolean;
}

export const CATALOGO_SERVICOS: ServicoPredefinido[] = [
  {
    chave: 'netflix',
    nome: 'Netflix',
    icone: 'film',
    cor: '#E50914',
    valorSugeridoCentavos: 5590,
    periodicidadeSugerida: 'mensal',
    trabalhoSugerido: false,
  },
  {
    chave: 'spotify',
    nome: 'Spotify',
    icone: 'headphones',
    cor: '#1DB954',
    valorSugeridoCentavos: 2190,
    periodicidadeSugerida: 'mensal',
    trabalhoSugerido: false,
  },
  {
    chave: 'chatgpt',
    nome: 'ChatGPT Plus',
    icone: 'bot',
    cor: '#10A37F',
    valorSugeridoCentavos: 11000,
    periodicidadeSugerida: 'mensal',
    trabalhoSugerido: true,
  },
  {
    chave: 'claude',
    nome: 'Claude Pro',
    icone: 'cpu',
    cor: '#D97706',
    valorSugeridoCentavos: 11000,
    periodicidadeSugerida: 'mensal',
    trabalhoSugerido: true,
  },
  {
    chave: 'cursor',
    nome: 'Cursor IDE',
    icone: 'code',
    cor: '#3B82F6',
    valorSugeridoCentavos: 11000,
    periodicidadeSugerida: 'mensal',
    trabalhoSugerido: true,
  },
  {
    chave: 'github',
    nome: 'GitHub Copilot / Team',
    icone: 'terminal',
    cor: '#24292F',
    valorSugeridoCentavos: 5500,
    periodicidadeSugerida: 'mensal',
    trabalhoSugerido: true,
  },
  {
    chave: 'adobe',
    nome: 'Adobe Creative Cloud',
    icone: 'palette',
    cor: '#FF0000',
    valorSugeridoCentavos: 17500,
    periodicidadeSugerida: 'mensal',
    trabalhoSugerido: true,
  },
  {
    chave: 'icloud',
    nome: 'Apple iCloud+',
    icone: 'cloud',
    cor: '#007AFF',
    valorSugeridoCentavos: 1490,
    periodicidadeSugerida: 'mensal',
    trabalhoSugerido: false,
  },
  {
    chave: 'prime',
    nome: 'Amazon Prime',
    icone: 'package',
    cor: '#00A8E1',
    valorSugeridoCentavos: 1990,
    periodicidadeSugerida: 'mensal',
    trabalhoSugerido: false,
  },
  {
    chave: 'youtube',
    nome: 'YouTube Premium',
    icone: 'play',
    cor: '#FF0000',
    valorSugeridoCentavos: 2490,
    periodicidadeSugerida: 'mensal',
    trabalhoSugerido: false,
  },
];
