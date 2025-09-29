/**
 * Contexto de Autenticação da aplicação +Fut
 * 
 * Este contexto gerencia todo o estado de autenticação da aplicação,
 * incluindo login, cadastro, logout e dados do usuário. Utiliza
 * Firebase Authentication para gerenciar sessões e Firebase Realtime
 * Database para armazenar dados do perfil do usuário.
 * 
 * @author Equipe +Fut
 * @version 1.0.0
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, get, set, onValue } from 'firebase/database';
import { auth, database } from '@/lib/firebase';

/**
 * Interface que define o tipo do contexto de autenticação
 * 
 * Contém todas as propriedades e métodos disponíveis para
 * gerenciar autenticação em toda a aplicação.
 */
interface AuthContextType {
  /** Usuário autenticado do Firebase Auth */
  user: User | null;
  /** Dados completos do usuário armazenados no banco de dados */
  userData: UserData | null;
  /** Função para realizar login com email e senha */
  login: (email: string, password: string) => Promise<void>;
  /** Função para criar nova conta com email, senha e dados pessoais */
  signup: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  /** Função para realizar logout da aplicação */
  logout: () => Promise<void>;
  /** Estado de carregamento da autenticação */
  loading: boolean;
}

/**
 * Interface que define a estrutura dos dados do usuário
 * 
 * Contém todas as informações pessoais e estatísticas do jogador
 * armazenadas no Firebase Realtime Database.
 */
interface UserData {
  /** Nome completo do usuário */
  name: string;
  /** Email do usuário */
  email: string;
  /** Telefone do usuário (opcional) */
  phone?: string;
  /** URL da foto de perfil do usuário */
  photoURL?: string;
  /** Posição preferida do jogador */
  position?: string;
  /** Posição preferida em quadra */
  positionQuadra?: string;
  /** Posição preferida em campo */
  positionCampo?: string;
  /** Lista de futs que o usuário participa */
  futs?: Record<string, boolean>;
  /** Token FCM para notificações push */
  fcmToken?: string;
  /** Total de gols marcados pelo jogador */
  totalGoals?: number;
  /** Total de assistências do jogador */
  totalAssists?: number;
  /** Total de jogos participados */
  totalGames?: number;
  /** Estatísticas consolidadas do jogador */
  stats?: {
    totalGoals: number;
    totalAssists: number;
    totalGames: number;
  };
}

// Criação do contexto de autenticação
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

/**
 * Hook personalizado para acessar o contexto de autenticação
 * 
 * @returns AuthContextType - Contexto de autenticação com todas as funções e dados
 */
export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Provedor do contexto de autenticação
 * 
 * Este componente gerencia todo o estado de autenticação da aplicação,
 * incluindo monitoramento de mudanças de estado do usuário e
 * sincronização com o banco de dados em tempo real.
 * 
 * @param children - Componentes filhos que terão acesso ao contexto
 * @returns JSX.Element - Provedor de contexto renderizado
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Monitora mudanças no estado de autenticação do Firebase
   * 
   * Este effect configura listeners em tempo real para:
   * - Mudanças no estado de autenticação do usuário
   * - Atualizações dos dados do usuário no banco de dados
   * 
   * Garante que a aplicação sempre tenha os dados mais atualizados
   * do usuário logado.
   */
  useEffect(() => {
    let unsubscribeUser: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Monitora mudanças nos dados do usuário em tempo real
        const userRef = ref(database, `users/${user.uid}`);
        unsubscribeUser = onValue(userRef, (snapshot) => {
          setUserData(snapshot.val());
        });
        
        setUser(user);
        setLoading(false);
      } else {
        // Limpa listeners e dados quando usuário faz logout
        if (unsubscribeUser) {
          unsubscribeUser();
        }
        setUserData(null);
        setUser(user);
        setLoading(false);
      }
    });

    // Cleanup dos listeners ao desmontar o componente
    return () => {
      unsubscribe();
      if (unsubscribeUser) {
        unsubscribeUser();
      }
    };
  }, []);

  /**
   * Realiza login do usuário com email e senha
   * 
   * Utiliza Firebase Authentication para autenticar o usuário
   * e trata erros específicos retornando mensagens amigáveis.
   * 
   * @param email - Email do usuário
   * @param password - Senha do usuário
   * @throws Error - Erro com mensagem amigável em caso de falha
   */
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      // Tratamento de erros específicos do Firebase Auth com mensagens amigáveis
      let errorMessage = 'Erro ao fazer login';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Email ou senha incorretos';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Email ou senha incorretos';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Conta desabilitada';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erro de conexão. Verifique sua internet';
          break;
        default:
          errorMessage = 'Email ou senha incorretos';
      }
      
      throw new Error(errorMessage);
    }
  };

  const signup = async (email: string, password: string, name: string, phone?: string) => {
    // Check for existing email and phone
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    const users = snapshot.val() || {};
    
    const existingUser = Object.values(users).find((user: any) => 
      user.email === email || (phone && user.phone === phone)
    );
    
    if (existingUser) {
      const existingUserData = existingUser as UserData;
      if (existingUserData.email === email && existingUserData.phone === phone) {
        throw new Error('Já existe um usuário com este email e telefone. Deseja recuperar sua senha?');
      } else if (existingUserData.email === email) {
        throw new Error('Já existe um usuário com este email. Deseja recuperar sua senha?');
      } else if (phone && existingUserData.phone === phone) {
        throw new Error('Já existe um usuário com este telefone. Deseja recuperar sua senha?');
      }
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user profile in Realtime Database
    const userRef = ref(database, `users/${user.uid}`);
    const newUserData: UserData = {
      name,
      email,
      phone,
      futs: {},
    };
    
    await set(userRef, newUserData);
    setUserData(newUserData);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    userData,
    login,
    signup,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}