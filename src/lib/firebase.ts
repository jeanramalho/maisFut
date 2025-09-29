/**
 * Configuração do Firebase para a aplicação +Fut
 * 
 * Este arquivo configura todos os serviços do Firebase utilizados
 * na aplicação, incluindo Authentication, Realtime Database, Storage
 * e Messaging. As configurações são carregadas de variáveis de
 * ambiente para manter a segurança em produção.
 * 
 * @author Equipe +Fut
 * @version 1.0.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';

/**
 * Configuração do Firebase carregada de variáveis de ambiente
 * 
 * Todas as chaves são carregadas de variáveis de ambiente para
 * manter a segurança e permitir diferentes configurações para
 * desenvolvimento e produção.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicialização da aplicação Firebase
const app = initializeApp(firebaseConfig);

// Inicialização dos serviços Firebase
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

/**
 * Inicializa o serviço de messaging apenas no navegador
 * 
 * O Firebase Messaging só funciona no lado do cliente,
 * então verificamos se estamos no navegador antes de inicializar.
 * 
 * @returns Messaging | null - Instância do messaging ou null se não estiver no navegador
 */
export const getFirebaseMessaging = () => {
  if (typeof window !== 'undefined') {
    return getMessaging(app);
  }
  return null;
};

/**
 * Conecta aos emuladores do Firebase em desenvolvimento
 * 
 * Em ambiente de desenvolvimento, podemos usar os emuladores
 * locais do Firebase para testes sem afetar os dados de produção.
 * Descomente as linhas abaixo se estiver usando emuladores.
 */
if (process.env.NODE_ENV === 'development') {
  // Descomente estas linhas se estiver usando emuladores do Firebase
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectDatabaseEmulator(database, 'localhost', 9000);
  // connectStorageEmulator(storage, 'localhost', 9199);
}

export default app;