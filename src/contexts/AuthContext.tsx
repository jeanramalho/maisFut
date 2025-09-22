import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, database } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

interface UserData {
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  position?: string;
  positionQuadra?: string;
  positionCampo?: string;
  futs?: Record<string, boolean>;
  fcmToken?: string;
  stats?: {
    totalGoals: number;
    totalAssists: number;
    totalGames: number;
  };
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user data from Realtime Database
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        setUserData(snapshot.val());
      } else {
        setUserData(null);
      }
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
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