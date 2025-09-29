/**
 * Componente principal da aplicação +Fut
 * 
 * Este arquivo configura o contexto de autenticação global e aplica
 * os estilos globais para toda a aplicação. É o ponto de entrada
 * principal do Next.js onde todos os componentes são renderizados.
 * 
 * @author Equipe +Fut
 * @version 1.0.0
 */

import { AuthProvider } from '@/contexts/AuthContext';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';

/**
 * Componente raiz da aplicação
 * 
 * Envolve toda a aplicação com o provedor de autenticação,
 * garantindo que o estado de login seja compartilhado entre
 * todos os componentes da aplicação.
 * 
 * @param Component - Componente da página atual
 * @param pageProps - Propriedades da página atual
 * @returns JSX.Element - Aplicação renderizada com contexto de autenticação
 */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}