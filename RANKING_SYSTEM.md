# Sistema de Rankings - +Fut

## Visão Geral

O sistema de rankings foi completamente reformulado para atender aos requisitos solicitados. Agora os rankings são salvos automaticamente no banco de dados quando uma partida é finalizada, com suporte a rankings por rodada e anual.

## Estrutura do Banco de Dados

### Rankings por Rodada
```
futs/
  {futId}/
    rankings/
      {YYYY-MM-DD}/
        fut-1/
          date: "2025-09-30"
          futNumber: 1
          rankings:
            pontuacao: [...]
            artilharia: [...]
            assistencias: [...]
          createdAt: timestamp
        fut-2/
          date: "2025-09-30"
          futNumber: 2
          rankings: {...}
```

### Rankings Anuais
```
futs/
  {futId}/
    rankings-anual/
      {year}/
        year: 2025
        rankings:
          pontuacao: [...]
          artilharia: [...]
          assistencias: [...]
        lastUpdated: timestamp
```

## Funcionalidades Implementadas

### 1. Salvamento Automático de Rankings
- **Trigger**: Quando uma partida é finalizada (`status` muda para `closed`)
- **Cloud Function**: `onOccurrenceClose` atualizada para gerar e salvar rankings
- **Cálculo**: Pontuação baseada em votos (20 pts/voto) + gols (10 pts) + assistências (5 pts)

### 2. Filtros de Ranking
- **Período**: Rodada (último fut) ou Anual (soma de todos os futs do ano)
- **Tipo**: Pontuação, Artilharia, Assistências
- **Padrão**: Abre com Rodada + Pontuação

### 3. Visualização por Calendário (Admins)
- Calendário interativo mostrando datas com rankings
- Datas com rankings aparecem em negrito
- Seleção de data específica para ver ranking daquele dia

### 4. Compartilhamento de Rankings (Admins)
- Formatação automática do ranking para compartilhamento
- Suporte a Web Share API (quando disponível)
- Fallback para cópia para área de transferência
- Formato: "Ranking {Período} - {Tipo}\n1º Jogador A - X pts\n2º Jogador B - Y pts..."

### 5. Interface Unificada
- Mesma interface para jogadores e admins
- Admins têm acesso adicional a calendário e compartilhamento
- Medalhas para os 3 primeiros colocados (🥇🥈🥉)

## Componentes Criados

### RankingFilters.tsx
- Filtros de período (Rodada/Anual)
- Filtros de tipo (Pontuação/Artilharia/Assistências)

### RankingList.tsx
- Lista de rankings com medalhas
- Estados de loading e vazio
- Limite de 10 jogadores

### RankingCalendar.tsx
- Calendário interativo para admins
- Navegação por mês
- Destaque de datas com rankings

### RankingShare.tsx
- Modal de compartilhamento
- Formatação automática do texto
- Suporte a Web Share API

### useRankings.ts
- Hook para gerenciar dados de ranking
- Carregamento automático baseado em filtros
- Suporte a seleção de datas específicas

## Cloud Functions Atualizadas

### generateAndSaveRankings()
- Gera rankings para todos os tipos
- Salva no formato correto no banco
- Atualiza rankings anuais automaticamente

### generateRankingByType()
- Calcula ranking por tipo específico
- Filtra apenas membros válidos
- Ordena por pontuação

### updateAnnualRankings()
- Atualiza rankings anuais
- Soma estatísticas de todos os futs do ano
- Mantém histórico completo

### mergeRankings()
- Combina rankings existentes com novos
- Soma estatísticas corretamente
- Reordena após merge

## Fluxo de Funcionamento

1. **Partida Finalizada**: Admin finaliza a partida
2. **Cloud Function**: `onOccurrenceClose` é disparada
3. **Cálculo**: Rankings são calculados baseados em votos + estatísticas
4. **Salvamento**: Rankings são salvos em `/futs/{futId}/rankings/{date}/fut-{number}`
5. **Atualização Anual**: Rankings anuais são atualizados automaticamente
6. **Visualização**: Usuários podem ver rankings através da aba Ranking

## Compatibilidade

- ✅ Mantém compatibilidade com sistema existente
- ✅ Não quebra funcionalidades atuais
- ✅ Usa mesma estrutura de dados existente
- ✅ Segue padrões de design da aplicação

## Próximos Passos

1. Testar funcionalidades em ambiente de desenvolvimento
2. Deploy das Cloud Functions atualizadas
3. Teste completo do fluxo de rankings
4. Validação com dados reais
