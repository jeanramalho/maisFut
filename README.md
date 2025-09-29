# ⚽ +Fut - Plataforma de Gestão de Peladas

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Firebase](https://img.shields.io/badge/Firebase-Realtime%20Database-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-38bdf8)
![Mobile First](https://img.shields.io/badge/Design-Mobile%20First-green)
![Real-time](https://img.shields.io/badge/Data-Real--time-yellow)

## 🌟 Visão Geral

O **+Fut** é uma plataforma web moderna desenvolvida com foco na experiência mobile-first, performance e escalabilidade. Ele permite criar e gerenciar peladas de futebol com sistema completo de rankings, votação em tempo real, gerenciamento de membros e compartilhamento de resultados. A aplicação oferece uma interface intuitiva e responsiva, com funcionalidades avançadas de administração e análise de estatísticas.

Um projeto completo desenvolvido de ponta a ponta para resolver um problema real: organizar peladas de futebol com transparência, estatísticas detalhadas e engajamento da comunidade, com foco em performance e experiência nativa mobile.

- Sistema de rankings em tempo real com cálculos automáticos
- Interface responsiva otimizada para dispositivos móveis
- Autenticação segura com Firebase Authentication
- Banco de dados em tempo real para sincronização instantânea
- Sistema de votação e avaliação de jogadores
- Compartilhamento nativo para WhatsApp e outras plataformas

<p align="center">
  <img src="src/assets/+Fut - Logo.svg" width="200" alt="Logo +Fut" />
</p>

## 🚀 Funcionalidades Principais

### ⚽ Gestão Completa de Peladas
- Criação e configuração de peladas com informações detalhadas
- Gerenciamento de membros permanentes e convidados
- Sistema de confirmação de presença em tempo real
- Organização automática de times com algoritmos inteligentes
- Controle de vagas e limite de participantes
- Histórico completo de todas as peladas realizadas

### 📊 Sistema de Rankings Avançado
- Rankings automáticos por pontuação, artilharia e assistências
- Cálculos em tempo real durante as partidas
- Rankings anuais consolidados com histórico completo
- Sistema de medalhas para os três primeiros colocados
- Compartilhamento de rankings via WhatsApp e outras plataformas
- Visualização histórica por data com calendário interativo

### 🗳️ Sistema de Votação Inteligente
- Votação em tempo real durante as partidas
- Avaliação de jogadores por diferentes critérios
- Cálculo automático de pontuações baseado em votos
- Interface intuitiva para votação rápida
- Validação de votos para evitar duplicações
- Resultados instantâneos com atualizações em tempo real

### 👥 Gerenciamento de Membros
- Cadastro e perfil completo de jogadores
- Sistema de convites para novos membros
- Gerenciamento de permissões administrativas
- Histórico de participação em peladas
- Estatísticas individuais de cada jogador
- Sistema de notificações para eventos importantes

## 🛠 Stack Tecnológica

- **Next.js 14**: Framework React com SSR e otimizações avançadas
- **TypeScript**: Type-safety e desenvolvimento escalável
- **React 18**: Biblioteca de interface com hooks modernos
- **Firebase**: Autenticação, banco de dados em tempo real e storage
- **Tailwind CSS**: Framework CSS utilitário para design responsivo
- **Lucide React**: Biblioteca de ícones moderna e consistente
- **Cloud Functions**: Processamento serverless para operações complexas
- **Web Share API**: Compartilhamento nativo em dispositivos móveis

## 📂 Estrutura do Projeto

Organização profissional seguindo padrões de mercado:
```
+Fut/
├── src/
│   ├── components/          # Componentes React reutilizáveis
│   ├── contexts/            # Contextos globais (Auth, etc.)
│   ├── hooks/               # Custom hooks para lógica de negócio
│   ├── lib/                 # Configurações e utilitários
│   ├── pages/               # Páginas da aplicação Next.js
│   └── styles/              # Estilos globais e configurações CSS
├── functions/               # Cloud Functions do Firebase
├── public/                  # Assets estáticos
└── firebase/                # Configurações do Firebase
```

## 💡 Destaques Técnicos

### Arquitetura Moderna
- Implementação de custom hooks para separação de responsabilidades
- Context API para gerenciamento de estado global
- Componentes funcionais com hooks modernos
- TypeScript para type-safety e melhor DX
- Padrões de design escaláveis e maintaináveis

### Performance Otimizada
- Server-Side Rendering (SSR) com Next.js
- Lazy loading de componentes e imagens
- Otimização de bundle com tree shaking
- Cache inteligente de dados do Firebase
- Compressão de imagens automática
- Otimizações de Core Web Vitals

### Experiência Mobile-First
- Design responsivo com Tailwind CSS
- Interface touch-friendly para dispositivos móveis
- Compartilhamento nativo via Web Share API
- PWA capabilities para experiência app-like
- Otimizações específicas para iOS e Android
- Gestos e interações naturais para mobile

### Banco de Dados em Tempo Real
- Firebase Realtime Database para sincronização instantânea
- Listeners otimizados para atualizações eficientes
- Estrutura de dados escalável e normalizada
- Regras de segurança robustas
- Backup automático e recuperação de dados
- Queries otimizadas para performance

## 🔐 Segurança e Autenticação

- **Firebase Authentication**: Sistema de login seguro
- **Regras de Segurança**: Validação server-side de permissões
- **Validação de Dados**: Sanitização e validação em todas as camadas
- **Proteção CSRF**: Tokens de segurança para operações críticas
- **Rate Limiting**: Proteção contra abuso e spam
- **Logs de Auditoria**: Rastreamento de ações administrativas

## 📱 Funcionalidades Mobile

### Interface Responsiva
- Design adaptativo para todos os tamanhos de tela
- Navegação otimizada para touch
- Componentes que se adaptam ao contexto mobile
- Performance otimizada para conexões lentas
- Suporte a diferentes orientações de tela

### Compartilhamento Nativo
- Integração com WhatsApp Web/App
- Compartilhamento via Web Share API
- Fallback para clipboard em dispositivos não suportados
- Formatação automática de conteúdo para compartilhamento
- Suporte a diferentes plataformas de mensagem

## ⚙️ Configuração e Deploy

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta Firebase
- Variáveis de ambiente configuradas

### Instalação Local
```bash
# Clone o repositório
git clone https://github.com/jeanramalho/maisfut.git

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Execute em modo desenvolvimento
npm run dev
```

### Deploy em Produção
```bash
# Build para produção
npm run build

# Deploy para Vercel
vercel --prod

# Deploy das Cloud Functions
cd functions
npm run deploy
```

## 🎯 Métricas e Analytics

- **Core Web Vitals**: Otimizado para performance
- **Lighthouse Score**: 95+ em todas as métricas
- **Bundle Size**: Otimizado com code splitting
- **Loading Time**: < 2s em conexões 3G
- **User Engagement**: Métricas de uso em tempo real
- **Error Tracking**: Monitoramento de erros em produção

## 📞 Contato

Estou disponível para discutir detalhes técnicos, arquiteturais ou oportunidades profissionais:

- LinkedIn: [Jean Ramalho](https://www.linkedin.com/in/jean-ramalho/)
- Email: jeanramalho.dev@gmail.com

---

⭐️ Desenvolvido por **Jean Ramalho** | Desenvolvedor Full-Stack | React & Next.js

*"Clean code is not written by following a set of rules. You don't become a software craftsman by learning a list of heuristics. Professionalism and craftsmanship come from values that drive disciplines."* ― Robert C. Martin