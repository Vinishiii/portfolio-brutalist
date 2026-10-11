# Sertão Fight Brasil — camada competitiva (e-sport)

Este documento descreve o que o jogo oferece hoje para quem quer jogar sério, organizar campeonatos e transmitir, **e o que ainda falta** para ser um e-sport completo com partidas online.

## O que já funciona (offline / mesmo aparelho)

| Recurso | Onde | Resumo |
| --- | --- | --- |
| **Ranqueada** | Menu ▸ COMPETITIVO ▸ JOGAR RANQUEADA | Melhor de 3 rodadas, 99 s, sem modificadores. A CPU é sorteada e ajustada ao seu nível (interpolando os perfis Novato → Brabo → Lendário e a vida/dano). Pontos de rinha (PR) por Elo (K=64 nas 5 colocações, 38 depois), bônus de sequência e de luta sem dano, 7 níveis (Bronze → Lenda da Brasa) com 3 divisões, desistir conta derrota. |
| **Perfil e histórico** | COMPETITIVO | Tag (até 12 caracteres), vitórias, derrotas, sequência, melhor PR, últimas 40 partidas e **tabela de confrontos** lutador × lutador. |
| **Torneio local** | COMPETITIVO ▸ TORNEIO LOCAL | 3 a 16 jogadores, **eliminação simples ou dupla** (chave dos perdedores, grande final com reset), séries **melhor de 1/3/5**, byes automáticos, **banimento de cenário** no jogo 1 e escolha do perdedor depois, **vencedor mantém o lutador**, CPUs que jogam entre si de verdade em segundo plano, retomada depois de fechar o jogo, campeão, classificação e **exportação dos resultados** (copiar/baixar .txt). |
| **Replays** | COMPETITIVO ▸ REPLAYS | Toda luta de Versus, Ranqueada, Desafio do Dia e Torneio é gravada. Assista em 0,25× a 8×, pause, favorite e **compartilhe por código de texto** (importar/exportar, `SFB1:...`, em torno de 2–4 KB por luta). |
| **Dados de quadros** | COMPETITIVO ▸ DADOS DE QUADROS | Tabela de todos os golpes de cada lutador: início, ativo, recuperação, total, dano, **vantagem no acerto e na defesa**, cancelamentos e propriedades. No Treino, o jogo mede e mostra a vantagem real do último golpe. |
| **Modo transmissão** | Opções ▸ MODO TRANSMISSÃO | Placar grande com tags, **histórico de entradas dos dois jogadores** no rodapé, sem avisos de conquista nem botões de toque. **F9** esconde/mostra todo o painel (para clipes e capturas). |
| **Treino** | Menu ▸ TREINO | Histórico de entradas com duração em quadros, leitura do último combo e vantagem em quadros. |

### Regras padrão de torneio
Duas rodadas vencidas por jogo, 99 segundos, **sem modificadores**, seis cenários de leitura limpa (Açude, Ladeira, Beira do Chico, Serra do Vento, Rinha do Bené, Lagoa da Caatinga). Quem joga: esquerda usa WASD + J K L; direita usa setas + Num1 Num2 Num3 (ou controles).

## Como o replay é possível (determinismo)

O replay só funciona porque a simulação é determinística. Isso foi uma mudança de arquitetura:

1. **Semente por luta.** Cada `Match` tem `seed`; tudo que a simulação sorteia (partículas, desvios, escolhas) vem de um gerador `mulberry32` (`M.rng32`) trocado em `Math.random` só durante `update()`. A **IA tem a sua própria semente** (para um replay não depender de a IA ser executada).
2. **Compasso em quadros.** O "No Compasso" (golpe na batida) usava o relógio do navegador. Agora a simulação conta o compasso em quadros e se ressincroniza com a música a cada 5 s; os pontos de sincronia vão dentro do replay.
3. **Entradas gravadas por quadro**, dos dois lados (inclusive da CPU), em uma máscara de 24 bits com compressão por repetição.
4. **Verificado por teste:** luta CPU×CPU, humano×CPU com modificadores, chefe e espelho com paleta foram gravadas, exportadas, importadas e reproduzidas, e o estado (posição, vida, Energia, rodada) bateu a cada 30 quadros, mais o vencedor e o placar. Reproduzir com som desligado e com `Math.random` consumido "de fora" também bateu.
5. **Limite:** um replay só reproduz na **mesma versão do jogo**. Mudar golpes, quadros ou a ordem de sorteios na simulação invalida replays antigos (o código guarda a versão).

## O que NÃO existe ainda (e é honesto dizer)

- **Partidas online.** Não há servidor, *matchmaking*, salas, ranking global nem anti-trapaça. Para jogar online com qualidade seria preciso netcode com **rollback** (o que a simulação determinística e as máscaras de entrada já preparam) e um serviço de salas.
- **Ranqueada contra humanos.** A ranqueada atual é contra a CPU, com a força ajustada ao nível do jogador. É progressão, não ladder de comunidade.
- **Equilíbrio validado por jogadores.** Há dados de quadros e simulações em massa, mas nenhum balanceamento feito com campeonato real.
- **Chaves públicas / integração com start.gg ou Challonge.** O torneio exporta texto; não conversa com plataformas.

## Plano para o online (se for o objetivo)

1. **Rollback netcode** sobre a simulação existente: guardar/restaurar o estado do `Match` (hoje espalhado por `Fighter`, `projectiles`, `fx`...) e reexecutar `update()` com entradas corrigidas. O RNG semeado e as máscaras de entrada já existem.
2. **Transporte:** WebRTC (peer-to-peer) com um servidor de sinalização pequeno, ou Steam Networking (via `steamworks.js`) no app de desktop.
3. **Salas e ranking:** serviço simples (lobby + resultado assinado) ou integração com Steam Lobbies/Leaderboards.
4. **Teste:** simulação de latência/perda de pacotes em CI e *desync detection* por hash de estado a cada N quadros (a mesma verificação usada nos replays).

## Para organizadores

- Use **MODO TRANSMISSÃO** + **F9** nas transmissões; o placar já mostra tags e série.
- No torneio, a tag aparece na HUD e nos replays. Os resultados saem em texto para colar em redes sociais.
- Guarde os **códigos de replay** das finais; eles são pequenos e funcionam em qualquer cópia da mesma versão do jogo.
