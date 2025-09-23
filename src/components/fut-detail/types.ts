export interface Fut {
  id: string;
  name: string;
  photoURL?: string;
  adminId: string;
  admins: Record<string, boolean>;
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

export type ActiveTab = 'fut' | 'members' | 'occurrences' | 'settings' | 'times' | 'data' | 'ranking' | 'info' | 'announcements';

export type RankingType = 'pontuacao' | 'artilharia' | 'assistencias' | 'vitorias';

export type RankingView = 'geral' | 'rodada' | 'fut';

export interface TeamStats {
  wins: number;
}

export interface PlayerStats {
  goals: number;
  assists: number;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  updatedAt: number;
}
