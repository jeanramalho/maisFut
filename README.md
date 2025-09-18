# +Fut - Aplicativo de Gerenciamento de Partidas de Futebol

## 📱 Sobre o Projeto

O **+Fut** é uma aplicação web mobile-first desenvolvida para criar e gerenciar partidas de futebol entre amigos. O app permite organizar futs mensais recorrentes e futs avulsos, com funcionalidades completas de convites, confirmação de presença, registro de estatísticas e votações.

### 🎯 Principais Funcionalidades

- ✅ **Autenticação segura** com Firebase Auth
- 🏆 **Criação de Futs** (mensais recorrentes ou avulsos)
- 👥 **Sistema de convites** por email/telefone
- 📊 **Confirmação de presença** com limite de vagas (thread-safe)
- ⚽ **Registro de gols e assistências** em tempo real
- 🗳️ **Votações** (Bola Cheia / Bola Murcha) apenas entre presentes
- 📈 **Rankings e estatísticas** por jogador
- 🔒 **Segurança rigorosa** - apenas usuários logados

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 14 (React) + TypeScript
- **Styling**: Tailwind CSS (mobile-first)
- **Backend**: Firebase (Authentication, Realtime Database, Storage, Cloud Functions)
- **Notificações**: Firebase Cloud Messaging (FCM)
- **Icons**: Lucide React

## 🎨 Design System

### Cores
- **Primária**: Preto 90% - `rgb(26,26,26)`
- **Secundária**: Verde Neon - `rgb(44,255,5)`
- **Variações**: Definidas no `tailwind.config.js`

### Layout
- Mobile-first responsive design
- Máxima largura de 480px para mobile
- Em telas maiores, centralizado com fundo preto

## 🚀 Instalação e Setup

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/mais-fut.git
cd mais-fut
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Firebase

#### 3.1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)

#### 3.2. Ative os seguintes serviços:
- Authentication (Email/Password)
- Realtime Database
- Storage
- Cloud Functions
- Cloud Messaging

#### 3.3. Configure as variáveis de ambiente
```bash
cp .env.local.example .env.local
```

Edite o `.env.local` com suas credenciais do Firebase:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://seu_projeto-default-rtdb.firebaseio.com/
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

### 4. Configure as Regras de Segurança

#### 4.1. Realtime Database Rules
Copie o conteúdo de `firebase-database-rules.json` para as regras do Realtime Database no Firebase Console.

#### 4.2. Storage Rules  
Copie o conteúdo de `firebase-storage-rules.txt` para as regras do Storage no Firebase Console.

### 5. Deploy das Cloud Functions

```bash
cd functions
npm install
firebase login
firebase deploy --only functions
```

#### 5.1. Configure as variáveis das Functions (para envio de email)
```bash
firebase functions:config:set email.user="seu-email@gmail.com"
firebase functions:config:set email.pass="sua-senha-de-app"
```

### 6. Execute o projeto
```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 📋 Estrutura do Projeto

```
src/
├── components/          # Componentes React reutilizáveis
│   ├── Header.tsx      # Cabeçalho com perfil do usuário
│   ├── FutCard.tsx     # Card de exibição de fut
│   ├── CreateFutModal.tsx  # Modal de criação de fut
│   ├── OccurrenceLive.tsx  # Tela de partida ao vivo
│   └── VotingPanel.tsx     # Painel de votação
├── contexts/           # Contextos React
│   └── AuthContext.tsx # Contexto de autenticação
├── lib/               # Utilitários e configurações
│   ├── firebase.ts    # Configuração do Firebase
│   └── presence.ts    # Utilitários de presença (thread-safe)
├── pages/             # Páginas Next.js
│   ├── _app.tsx       # App principal
│   ├── index.tsx      # Home page
│   ├── login.tsx      # Página de login/cadastro
│   └── fut/[id].tsx   # Página de detalhes do fut
└── styles/
    └── globals.css    # Estilos globais + Tailwind

functions/             # Cloud Functions
├── src/
│   ├── index.ts       # Functions principais
│   ├── email.ts       # Utilitários de email
│   └── notifications.ts # Utilitários de push notifications
└── package.json

test-concurrency.js    # Script de teste de concorrência
```

## 🔒 Segurança e Regras de Negócio

### Autenticação
- Todos os dados são protegidos por autenticação
- Usuários só acessam futs onde são membros ou administradores

### Confirmação de Presença
- **Thread-safe**: Usa `runTransaction` do Firebase para evitar overbooking
- Validação de vagas disponíveis em tempo real
- Prevenção de confirmações duplicadas

### Votação
- Apenas jogadores **presentes** na partida podem votar
- Um voto por categoria (Bola Cheia + Bola Murcha)
- Cálculo automático com critério de desempate por performance

### Performance Score
- Gol = 2 pontos
- Assistência = 1 ponto
- Usado como critério de desempate nas votações

## 🧪 Testes

### Teste de Concorrência
Execute o teste de concorrência para validar a confirmação de presença:

```bash
node test-concurrency.js
```

Este teste simula múltiplos usuários confirmando presença simultaneamente e verifica se o sistema mantém a integridade dos dados.

## 📱 Funcionalidades Implementadas

### ✅ MVP (Versão 1)
- [x] Sistema de autenticação completo
- [x] CRUD de futs com upload de fotos
- [x] Sistema de membros e convites básico
- [x] Confirmação de presença thread-safe
- [x] Registro de gols e assistências
- [x] Sistema de votação completo
- [x] Cálculo de estatísticas
- [x] Regras de segurança do Firebase
- [x] Cloud Functions básicas

### 🔄 Próximas Implementações
- [ ] Painel de notificações completo
- [ ] Sistema de convites por SMS
- [ ] Rankings globais
- [ ] Histórico detalhado de partidas
- [ ] Chat por fut
- [ ] Sistema de comentários nas partidas
- [ ] Export de estatísticas
- [ ] PWA (Progressive Web App)

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm run build
# Deploy automático via GitHub integration
```

### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Contato

- LinkedIn: https://www.linkedin.com/in/jean-ramalho/
- Email: jeanramalho.dev@gmail.com

---

**+Fut** - Desenvolvido por Jean Ramalho com ⚽ e 💚 para a comunidade do futebol amador!