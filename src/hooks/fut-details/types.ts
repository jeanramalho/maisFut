export interface Fut {
  id: string;
  name: string;
  photoURL?: string;
  adminId: string; // Original admin (creator)
  admins: Record<string, boolean>; // All admins including original
  type: 'mensal' | 'avulso';
  recurrence?: {
    kind: 'weekly' | 'monthly';
    day: number;
  };
  maxVagas: number;
  playersPerTeam?: number;
  privacy: 'public' | 'invite';
  members: Record<string, boolean>;
  location?: string;
  description?: string;
  time?: string;
  value?: string;
  pixKey?: string;
  futType?: 'quadra' | 'campo';
  createdAt: number;
}

export interface UserData {
  name: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  position?: string;
  isGuest?: boolean;
  guestType?: string;
}

export type TabType = 'fut' | 'times' | 'data' | 'info' | 'members' | 'ranking' | 'configuracoes' | 'avisos' | 'voting';

export type RankingType = 'pontuacao' | 'artilharia' | 'assistencias' | 'vitorias';

export type RankingView = 'geral' | 'rodada' | 'fut';
