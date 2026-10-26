import {
  Baby,
  Bird,
  BookOpen,
  Briefcase,
  Building2,
  Bus,
  Camera,
  Car,
  Church,
  Circle,
  Clapperboard,
  Code,
  Coffee,
  CreditCard,
  Cross,
  Dog,
  Droplets,
  Dumbbell,
  Film,
  Fuel,
  Gamepad2,
  Gift,
  Globe,
  GraduationCap,
  HandHeart,
  HandHelping,
  Heart,
  HeartPulse,
  House,
  Image,
  Landmark,
  Laptop,
  type LucideIcon,
  Music,
  Palette,
  PenTool,
  PiggyBank,
  Pill,
  Plane,
  Receipt,
  Shield,
  Shirt,
  ShoppingCart,
  Smartphone,
  Ticket,
  TrendingUp,
  Utensils,
  Wallet,
  Wifi,
  Wrench,
  Zap,
  Bitcoin,
} from 'lucide-react';

/**
 * Conjunto curado de ícones (§6.6) para categorias, investimentos,
 * contribuições e serviços. A chave é o que fica gravado no banco.
 */
export const ICONES = {
  circulo: { icone: Circle, rotulo: 'Genérico' },
  casa: { icone: House, rotulo: 'Casa' },
  faculdade: { icone: GraduationCap, rotulo: 'Estudos' },
  livro: { icone: BookOpen, rotulo: 'Livros' },
  academia: { icone: Dumbbell, rotulo: 'Academia' },
  saude: { icone: HeartPulse, rotulo: 'Saúde' },
  remedio: { icone: Pill, rotulo: 'Farmácia' },
  mercado: { icone: ShoppingCart, rotulo: 'Mercado' },
  restaurante: { icone: Utensils, rotulo: 'Restaurante' },
  cafe: { icone: Coffee, rotulo: 'Café' },
  combustivel: { icone: Fuel, rotulo: 'Combustível' },
  carro: { icone: Car, rotulo: 'Carro' },
  onibus: { icone: Bus, rotulo: 'Transporte' },
  viagem: { icone: Plane, rotulo: 'Viagem' },
  lazer: { icone: Ticket, rotulo: 'Lazer' },
  jogos: { icone: Gamepad2, rotulo: 'Jogos' },
  roupas: { icone: Shirt, rotulo: 'Roupas' },
  presente: { icone: Gift, rotulo: 'Presentes' },
  pet: { icone: Dog, rotulo: 'Pet' },
  bebe: { icone: Baby, rotulo: 'Filhos' },
  celular: { icone: Smartphone, rotulo: 'Celular' },
  internet: { icone: Wifi, rotulo: 'Internet' },
  energia: { icone: Zap, rotulo: 'Energia' },
  agua: { icone: Droplets, rotulo: 'Água' },
  conta: { icone: Receipt, rotulo: 'Contas' },
  cartao: { icone: CreditCard, rotulo: 'Cartão' },
  carteira: { icone: Wallet, rotulo: 'Carteira' },
  cofrinho: { icone: PiggyBank, rotulo: 'Poupança' },
  grafico: { icone: TrendingUp, rotulo: 'Ações' },
  banco: { icone: Landmark, rotulo: 'Renda fixa' },
  predio: { icone: Building2, rotulo: 'Imóveis' },
  cripto: { icone: Bitcoin, rotulo: 'Cripto' },
  escudo: { icone: Shield, rotulo: 'Reserva' },
  trabalho: { icone: Briefcase, rotulo: 'Trabalho' },
  notebook: { icone: Laptop, rotulo: 'Equipamento' },
  ferramenta: { icone: Wrench, rotulo: 'Ferramentas' },
  video: { icone: Clapperboard, rotulo: 'Vídeo' },
  filme: { icone: Film, rotulo: 'Filme' },
  imagem: { icone: Image, rotulo: 'Imagem' },
  camera: { icone: Camera, rotulo: 'Foto' },
  pincel: { icone: PenTool, rotulo: 'Design' },
  paleta: { icone: Palette, rotulo: 'Identidade' },
  codigo: { icone: Code, rotulo: 'Código' },
  site: { icone: Globe, rotulo: 'Site' },
  musica: { icone: Music, rotulo: 'Música' },
  igreja: { icone: Church, rotulo: 'Igreja' },
  coracao: { icone: Heart, rotulo: 'Coração' },
  maos: { icone: HandHeart, rotulo: 'Mãos' },
  ajuda: { icone: HandHelping, rotulo: 'Ajuda' },
  cruz: { icone: Cross, rotulo: 'Cruz' },
  pomba: { icone: Bird, rotulo: 'Pomba' },
} satisfies Record<string, { icone: LucideIcon; rotulo: string }>;

export type ChaveIcone = keyof typeof ICONES;

export const CHAVES_ICONES = Object.keys(ICONES) as ChaveIcone[];

/** Subconjunto temático para Contribuição (§7.6). */
export const ICONES_CONTRIBUICAO: ChaveIcone[] = [
  'igreja',
  'coracao',
  'maos',
  'ajuda',
  'cruz',
  'pomba',
  'presente',
];

export function isChaveIcone(valor: string): valor is ChaveIcone {
  return valor in ICONES;
}

export function iconePorChave(chave: string | null | undefined): LucideIcon {
  if (chave && isChaveIcone(chave)) return ICONES[chave].icone;
  return Circle;
}

/** Cores de identificação: as séries de gráfico (§6.2). Chave gravada no banco. */
export const CORES = {
  azul: { variavel: 'var(--series-1)', rotulo: 'Azul' },
  laranja: { variavel: 'var(--series-2)', rotulo: 'Laranja' },
  roxo: { variavel: 'var(--series-3)', rotulo: 'Roxo' },
  ciano: { variavel: 'var(--series-4)', rotulo: 'Ciano' },
  cinza: { variavel: 'var(--series-5)', rotulo: 'Cinza' },
} as const;

export type ChaveCor = keyof typeof CORES;

export const CHAVES_CORES = Object.keys(CORES) as ChaveCor[];

export function corPorChave(chave: string | null | undefined): string {
  if (chave && chave in CORES) return CORES[chave as ChaveCor].variavel;
  return CORES.cinza.variavel;
}
