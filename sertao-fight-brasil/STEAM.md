# Publicando na Steam — Sertão Fight Brasil

Guia de ponta a ponta para levar o jogo à Steam (e também ao itch.io / web). O jogo já vem com tudo do lado do código: app de desktop (Electron), ponte com a Steamworks, 58 conquistas, idioma automático (PT / EN / ES), save em arquivo para o Steam Cloud, arte de loja pronta e build web.

> **Estado honesto:** o jogo foi testado no navegador (Chromium) e o app de desktop foi **empacotado e executado no Linux** (Electron 33 + electron-builder, sob Xvfb): abre a janela, detecta o idioma do sistema, grava o save em arquivo, relê o progresso na abertura seguinte e fecha pelo menu "SAIR DO JOGO". **Não foi possível testar aqui:** as chamadas reais da Steamworks (conquistas, overlay, idioma da Steam — precisam do cliente Steam e de um AppID), os builds de Windows e macOS, o Steam Deck e o Steam Cloud. Faça o teste da seção 3 antes de enviar o build.
>
> **Atualização:** o app de desktop também compila para **Windows, macOS e Linux** no GitHub Actions (fluxo `desktop-build.yml`, sem assinatura de código). Compilar não é o mesmo que testar: o app de Windows e o de macOS ainda não foram abertos numa máquina real.

## 1. O que você precisa fora do código

| Item | Onde / como |
| --- | --- |
| Conta de parceiro Steamworks + taxa de US$ 100 por jogo (Steam Direct) | partner.steamgames.com |
| Entrevista fiscal, bancária e verificação de identidade | no painel do parceiro; leva alguns dias |
| **AppID** do jogo | criado ao pagar a taxa; é um número de 6–7 dígitos |
| Página da loja aprovada (mín. 2 semanas antes do lançamento; "Coming Soon" precisa estar no ar por 2 semanas) | texto em `store/STORE_PAGE.md`, imagens em `store/` |
| Classificação etária (questionário IARC no painel) | o jogo tem violência estilizada (golpes, sem sangue) |
| Trailer (recomendado) | grave a tela do jogo: Título ▸ Seleção ▸ luta ▸ História |

## 2. Build do app de desktop

Requer Node 18+ na máquina de build (cada sistema gera o seu: Windows no Windows, etc.).

```bash
cd sertao-fight-brasil/desktop
npm install                       # Electron, electron-builder e steamworks.js
STEAM_APP_ID=480 npm start        # roda o jogo em janela (480 = Spacewar, AppID de teste da Valve)
npm run dist:win                  # ou dist:mac / dist:linux → desktop/dist/
```

- `desktop/main.js` carrega `index.html`, abre a Steamworks (se o cliente Steam estiver aberto) e expõe a ponte `window.steam` ao jogo.
- Sem Steam aberta o jogo roda normalmente (conquistas ficam só no save local).
- **Troque o AppID** antes do build final: variável `STEAM_APP_ID` ou edite a constante em `desktop/main.js`. O AppID é passado direto ao `steamworks.js` (não precisa de `steam_appid.txt`); em desenvolvimento use 480 (Spacewar) ou um AppID da sua conta.
- F11 alterna tela cheia. `--fullscreen` abre direto em tela cheia.
- O `steamworks.js` traz binários nativos; ele já está em `asarUnpack` para funcionar empacotado.

## 3. Checklist de teste (faça com a Steam aberta)

1. `STEAM_APP_ID=<seu id> npm start` → o overlay da Steam (Shift+Tab) abre sobre o jogo.
2. Ganhe uma luta contra a CPU → aparece o aviso "CONQUISTA DESBLOQUEADA" e a conquista `ACH_FIRST_WIN` aparece no perfil Steam (precisa estar cadastrada no painel — seção 4).
3. Troque o idioma da Steam (Propriedades do jogo ▸ Idioma): o jogo abre no idioma certo; sem escolha manual salva.
4. Feche e reabra: o progresso persiste. O save fica em `userData/save.json` (seção 5).
5. Conecte um controle: o menu navega com direcional/A/B; luta com direcional + botões; botão de início pausa.
6. Opções ▸ CONTROLES (TECLAS): remapear teclas e restaurar o padrão.
7. Opções: Qualidade, Reduzir flashes e Velocidade do jogo.
8. SAIR DO JOGO no menu fecha o app.

## 4. Conquistas (Steamworks ▸ Stats & Achievements)

São **58**. O jogo chama `ACH_<ID EM MAIÚSCULAS>`; cadastre exatamente estes **API Names**. Os textos nos três idiomas estão abaixo para colar nas traduções (a Steam mostra no idioma do jogador). Ícones (256×256, colorido e cinza): gere do `icons/icon-256.png` + glifo da conquista, ou encomende 58 ícones — a Steam exige uma imagem para cada.

| API Name | PT | EN | ES |
| --- | --- | --- | --- |
| `ACH_FIRST_WIN` | Primeira Peia | First Beating | Primera Paliza |
| `ACH_WINS_10` | Pegando o Jeito | Getting the Hang of It | Agarrando el Truco |
| `ACH_WINS_100` | Rei da Rinha | King of the Brawl | Rey de la Riña |
| `ACH_FLAWLESS` | Sem um Arranhão | Not a Scratch | Sin un Rasguño |
| `ACH_COMEBACK` | Arretado de Verdade | Truly Fierce | Arrecho de Verdad |
| `ACH_COMBO10` | Chuva de Golpes | Rain of Blows | Lluvia de Golpes |
| `ACH_STRING3` | String Completa | Full String | String Completa |
| `ACH_FOLLOW` | Sequência de Mestre | Master Follow-up | Secuencia de Maestro |
| `ACH_PERFECT5` | Dançarino | Dancer | Bailarín |
| `ACH_BEAT10` | No Compasso | On the Beat | Al Compás |
| `ACH_FINISHER` | Arremate Fatal | Fatal Finisher | Remate Fatal |
| `ACH_SUPERS3` | Peia em Dobro | Double Peia | Peia Doble |
| `ACH_COUNTER3` | Contra-Golpista | Counter Striker | Contragolpeador |
| `ACH_CORNER3` | Encurralador | Corner Crusher | Arrinconador |
| `ACH_LEGENDARY` | Lendário | Legendary | Legendario |
| `ACH_ROSTER` | Todos na Rinha | Everyone in the Brawl | Todos en la Riña |
| `ACH_STORY_DONE` | Guardião da Brasa | Guardian of the Ember | Guardián de la Brasa |
| `ACH_TRUE_ENDING` | A Brasa é de Todo Mundo | The Ember Belongs to Everyone | La Brasa es de Todos |
| `ACH_ALL_ENDINGS` | Três Caminhos | Three Paths | Tres Caminos |
| `ACH_STORY_S` | Nota S | Grade S | Nota S |
| `ACH_STORY_HARD` | Noite Difícil | Hard Night | Noche Difícil |
| `ACH_STORY_FAST` | Corrida de São João | São João Sprint | Carrera de San Juan |
| `ACH_BONDS6` | Todos os Laços | All the Bonds | Todos los Lazos |
| `ACH_FAMA7` | Fama Total | Total Fame | Fama Total |
| `ACH_LEGENDS_DONE` | A Noite Tem Guardião | The Night Has a Keeper | La Noche Tiene Guardián |
| `ACH_FREE_DONE` | Rinha Inteira | The Whole Brawl | Riña Entera |
| `ACH_SURV5` | Maratonista | Marathoner | Maratonista |
| `ACH_SURV10` | Fôlego de Boi | Ox Lungs | Aliento de Buey |
| `ACH_SURV20` | Lenda da Maratona | Marathon Legend | Leyenda de la Maratón |
| `ACH_DAILY1` | Desafio Aceito | Challenge Accepted | Desafío Aceptado |
| `ACH_DAILY3` | Três Dias Seguidos | Three Days in a Row | Tres Días Seguidos |
| `ACH_DAILY_STAR` | Estrela do Dia | Star of the Day | Estrella del Día |
| `ACH_MUT_WIN` | Rinha Maluca | Crazy Brawl | Riña Loca |
| `ACH_PALETTE` | Cara Nova | New Look | Cara Nueva |
| `ACH_JUKEBOX` | Ouvido Absoluto | Perfect Pitch | Oído Absoluto |
| `ACH_COMP_PLACE` | Medindo Forças | Sizing Each Other Up | Midiendo Fuerzas |
| `ACH_RANK_OURO` | Cabra de Ouro | Golden Goat | Cabra de Oro |
| `ACH_RANK_MESTRE` | Mestre da Rinha | Brawl Master | Maestro de la Riña |
| `ACH_RANK_LENDA` | Lenda da Brasa | Ember Legend | Leyenda de la Brasa |
| `ACH_RANK_STREAK5` | Invicto | Undefeated | Invicto |
| `ACH_TOURNEY_DONE` | Organizador | Organizer | Organizador |
| `ACH_TOURNEY_CHAMP` | Campeão da Praça | Town Square Champion | Campeón de la Plaza |
| `ACH_REPLAY_WATCH` | Cinema da Rinha | Brawl Cinema | Cine de la Riña |
| `ACH_REPLAY_SHARE` | Compartilha Essa | Share This One | Comparte Esta |
| `ACH_FRAMEDATA` | Rato de Planilha | Spreadsheet Rat | Rata de Planilla |
| `ACH_LV10` | Cabra da Peste | Tough Goat | Cabra de la Peste |
| `ACH_LV25` | Lenda do Sertão | Legend of the Backlands | Leyenda del Sertón |
| `ACH_MASTER5` | Mestre de Verdade | True Master | Maestro de Verdad |
| `ACH_MISSION1` | Dever de Casa | Homework Done | Tarea Cumplida |
| `ACH_MISSIONS3` | Dia Completo | Full Day | Día Completo |
| `ACH_WEEK1` | Doido da Semana | Madman of the Week | Loco de la Semana |
| `ACH_CLIP1` | Cineasta da Rinha | Brawl Filmmaker | Cineasta de la Riña |
| `ACH_CARD1` | Cartão Postal | Postcard | Postal |
| `ACH_CHALLENGE1` | Duvido! | I Dare You! | ¡Te Reto! |
| `ACH_CHAL_BEAT` | Superou o Placar | Beat the Score | Superó el Puntaje |
| `ACH_KING_FIRST` | Na Festa do Sítio | At the Farm Party | En la Fiesta del Sitio |
| `ACH_KING3` | Rei do Terreiro | King of the Yard | Rey del Terreiro |
| `ACH_KING5` | Imbatível na Festa | Unbeatable at the Party | Imbatible en la Fiesta |

### Textos por idioma

**ACH_FIRST_WIN**
- PT: Primeira Peia — Vença sua primeira luta contra a CPU.
- EN: First Beating — Win your first fight against the CPU.
- ES: Primera Paliza — Gana tu primera pelea contra la CPU.

**ACH_WINS_10**
- PT: Pegando o Jeito — Vença 10 lutas.
- EN: Getting the Hang of It — Win 10 fights.
- ES: Agarrando el Truco — Gana 10 peleas.

**ACH_WINS_100**
- PT: Rei da Rinha — Vença 100 lutas.
- EN: King of the Brawl — Win 100 fights.
- ES: Rey de la Riña — Gana 100 peleas.

**ACH_FLAWLESS**
- PT: Sem um Arranhão — Vença uma luta sem sofrer nenhum dano.
- EN: Not a Scratch — Win a fight without taking any damage.
- ES: Sin un Rasguño — Gana una pelea sin recibir ningún daño.

**ACH_COMEBACK**
- PT: Arretado de Verdade — Vença com menos de 10% de vida.
- EN: Truly Fierce — Win with less than 10% health.
- ES: Arrecho de Verdad — Gana con menos del 10% de vida.

**ACH_COMBO10**
- PT: Chuva de Golpes — Acerte um combo de 10 golpes ou mais.
- EN: Rain of Blows — Land a combo of 10 hits or more.
- ES: Lluvia de Golpes — Acierta un combo de 10 golpes o más.

**ACH_STRING3**
- PT: String Completa — Acerte o terceiro golpe de uma string.
- EN: Full String — Land the third blow of a string.
- ES: String Completa — Acierta el tercer golpe de una string.

**ACH_FOLLOW**
- PT: Sequência de Mestre — Acerte o segundo golpe de um especial.
- EN: Master Follow-up — Land the second blow of a special.
- ES: Secuencia de Maestro — Acierta el segundo golpe de un especial.

**ACH_PERFECT5**
- PT: Dançarino — Faça 5 esquivas perfeitas numa luta.
- EN: Dancer — Land 5 perfect dodges in a fight.
- ES: Bailarín — Haz 5 esquivas perfectas en una pelea.

**ACH_BEAT10**
- PT: No Compasso — Acerte 10 golpes NO COMPASSO numa luta.
- EN: On the Beat — Land 10 hits ON BEAT in a fight.
- ES: Al Compás — Acierta 10 golpes AL COMPÁS en una pelea.

**ACH_FINISHER**
- PT: Arremate Fatal — Nocauteie com o arremate da Peia.
- EN: Fatal Finisher — Knock out with the Peia finisher.
- ES: Remate Fatal — Noquea con el remate de la Peia.

**ACH_SUPERS3**
- PT: Peia em Dobro — Use a Peia 3 vezes numa luta.
- EN: Double Peia — Use the Peia 3 times in a fight.
- ES: Peia Doble — Usa la Peia 3 veces en una pelea.

**ACH_COUNTER3**
- PT: Contra-Golpista — Faça 3 contra-golpes numa luta.
- EN: Counter Striker — Land 3 counter hits in a fight.
- ES: Contragolpeador — Haz 3 contragolpes en una pelea.

**ACH_CORNER3**
- PT: Encurralador — Encurrale o oponente 3 vezes numa luta.
- EN: Corner Crusher — Corner the opponent 3 times in a fight.
- ES: Arrinconador — Arrincona al rival 3 veces en una pelea.

**ACH_LEGENDARY**
- PT: Lendário — Vença uma luta contra a CPU no nível Lendário.
- EN: Legendary — Win a fight against the CPU on Legendary.
- ES: Legendario — Gana una pelea contra la CPU en nivel Legendario.

**ACH_ROSTER**
- PT: Todos na Rinha — Vença com todos os 20 lutadores.
- EN: Everyone in the Brawl — Win with all 20 fighters.
- ES: Todos en la Riña — Gana con los 20 luchadores.

**ACH_STORY_DONE**
- PT: Guardião da Brasa — Termine a História.
- EN: Guardian of the Ember — Finish the Story.
- ES: Guardián de la Brasa — Termina la Historia.

**ACH_TRUE_ENDING**
- PT: A Brasa é de Todo Mundo — Veja o final verdadeiro.
- EN: The Ember Belongs to Everyone — See the true ending.
- ES: La Brasa es de Todos — Mira el final verdadero.

**ACH_ALL_ENDINGS**
- PT: Três Caminhos — Veja os três finais da História.
- EN: Three Paths — See all three endings of the Story.
- ES: Tres Caminos — Mira los tres finales de la Historia.

**ACH_STORY_S**
- PT: Nota S — Termine a História com nota geral S.
- EN: Grade S — Finish the Story with an overall S grade.
- ES: Nota S — Termina la Historia con nota general S.

**ACH_STORY_HARD**
- PT: Noite Difícil — Termine a História no nível Lendário.
- EN: Hard Night — Finish the Story on Legendary.
- ES: Noche Difícil — Termina la Historia en nivel Legendario.

**ACH_STORY_FAST**
- PT: Corrida de São João — Termine a História em menos de 20 minutos.
- EN: São João Sprint — Finish the Story in under 20 minutes.
- ES: Carrera de San Juan — Termina la Historia en menos de 20 minutos.

**ACH_BONDS6**
- PT: Todos os Laços — Faça laço com os seis adversários.
- EN: All the Bonds — Form a bond with all six opponents.
- ES: Todos los Lazos — Haz lazo con los seis rivales.

**ACH_FAMA7**
- PT: Fama Total — Cumpra os sete desafios da História.
- EN: Total Fame — Complete all seven Story challenges.
- ES: Fama Total — Cumple los siete desafíos de la Historia.

**ACH_LEGENDS_DONE**
- PT: A Noite Tem Guardião — Termine as Lendas da Noite.
- EN: The Night Has a Keeper — Finish the Legends of the Night.
- ES: La Noche Tiene Guardián — Termina las Leyendas de la Noche.

**ACH_FREE_DONE**
- PT: Rinha Inteira — Vença a Rinha Livre completa.
- EN: The Whole Brawl — Win the complete Free Brawl.
- ES: Riña Entera — Gana la Riña Libre completa.

**ACH_SURV5**
- PT: Maratonista — Chegue à onda 5 da Maratona.
- EN: Marathoner — Reach wave 5 of the Marathon.
- ES: Maratonista — Llega a la oleada 5 de la Maratón.

**ACH_SURV10**
- PT: Fôlego de Boi — Chegue à onda 10 da Maratona.
- EN: Ox Lungs — Reach wave 10 of the Marathon.
- ES: Aliento de Buey — Llega a la oleada 10 de la Maratón.

**ACH_SURV20**
- PT: Lenda da Maratona — Chegue à onda 20 da Maratona.
- EN: Marathon Legend — Reach wave 20 of the Marathon.
- ES: Leyenda de la Maratón — Llega a la oleada 20 de la Maratón.

**ACH_DAILY1**
- PT: Desafio Aceito — Vença um Desafio do Dia.
- EN: Challenge Accepted — Win a Daily Challenge.
- ES: Desafío Aceptado — Gana un Desafío del Día.

**ACH_DAILY3**
- PT: Três Dias Seguidos — Vença o Desafio do Dia em três dias seguidos.
- EN: Three Days in a Row — Win the Daily Challenge three days in a row.
- ES: Tres Días Seguidos — Gana el Desafío del Día tres días seguidos.

**ACH_DAILY_STAR**
- PT: Estrela do Dia — Cumpra o objetivo bônus de um Desafio do Dia.
- EN: Star of the Day — Complete the bonus goal of a Daily Challenge.
- ES: Estrella del Día — Cumple el objetivo extra de un Desafío del Día.

**ACH_MUT_WIN**
- PT: Rinha Maluca — Vença a CPU com dois modificadores ligados.
- EN: Crazy Brawl — Beat the CPU with two modifiers on.
- ES: Riña Loca — Vence a la CPU con dos modificadores activados.

**ACH_PALETTE**
- PT: Cara Nova — Vença uma luta com uma cor alternativa.
- EN: New Look — Win a fight with an alternate color.
- ES: Cara Nueva — Gana una pelea con un color alternativo.

**ACH_JUKEBOX**
- PT: Ouvido Absoluto — Ouça todas as faixas do Jukebox.
- EN: Perfect Pitch — Listen to every Jukebox track.
- ES: Oído Absoluto — Escucha todas las pistas del Jukebox.

**ACH_COMP_PLACE**
- PT: Medindo Forças — Termine as cinco partidas de colocação da Ranqueada.
- EN: Sizing Each Other Up — Finish the five placement matches of Ranked.
- ES: Midiendo Fuerzas — Termina las cinco partidas de colocación de la Clasificatoria.

**ACH_RANK_OURO**
- PT: Cabra de Ouro — Chegue ao nível Ouro na Ranqueada.
- EN: Golden Goat — Reach the Gold tier in Ranked.
- ES: Cabra de Oro — Llega al nivel Oro en la Clasificatoria.

**ACH_RANK_MESTRE**
- PT: Mestre da Rinha — Chegue ao nível Mestre na Ranqueada.
- EN: Brawl Master — Reach the Master tier in Ranked.
- ES: Maestro de la Riña — Llega al nivel Maestro en la Clasificatoria.

**ACH_RANK_LENDA**
- PT: Lenda da Brasa — Chegue ao nível Lenda da Brasa na Ranqueada.
- EN: Ember Legend — Reach the Ember Legend tier in Ranked.
- ES: Leyenda de la Brasa — Llega al nivel Leyenda de la Brasa en la Clasificatoria.

**ACH_RANK_STREAK5**
- PT: Invicto — Vença cinco partidas ranqueadas seguidas.
- EN: Undefeated — Win five ranked matches in a row.
- ES: Invicto — Gana cinco partidas clasificatorias seguidas.

**ACH_TOURNEY_DONE**
- PT: Organizador — Complete um Torneio Local.
- EN: Organizer — Complete a Local Tournament.
- ES: Organizador — Completa un Torneo Local.

**ACH_TOURNEY_CHAMP**
- PT: Campeão da Praça — Seja campeão de um Torneio Local.
- EN: Town Square Champion — Win a Local Tournament.
- ES: Campeón de la Plaza — Sé campeón de un Torneo Local.

**ACH_REPLAY_WATCH**
- PT: Cinema da Rinha — Assista a um replay.
- EN: Brawl Cinema — Watch a replay.
- ES: Cine de la Riña — Mira una repetición.

**ACH_REPLAY_SHARE**
- PT: Compartilha Essa — Gere o código de um replay para compartilhar.
- EN: Share This One — Generate a replay code to share.
- ES: Comparte Esta — Genera el código de una repetición para compartir.

**ACH_FRAMEDATA**
- PT: Rato de Planilha — Abra os Dados de Quadros.
- EN: Spreadsheet Rat — Open the Frame Data.
- ES: Rata de Planilla — Abre los Datos de Cuadros.

**ACH_LV10**
- PT: Cabra da Peste — Chegue ao nível 10.
- EN: Tough Goat — Reach level 10.
- ES: Cabra de la Peste — Llega al nivel 10.

**ACH_LV25**
- PT: Lenda do Sertão — Chegue ao nível 25.
- EN: Legend of the Backlands — Reach level 25.
- ES: Leyenda del Sertón — Llega al nivel 25.

**ACH_MASTER5**
- PT: Mestre de Verdade — Chegue à maestria 5 com um lutador.
- EN: True Master — Reach mastery 5 with a fighter.
- ES: Maestro de Verdad — Llega a la maestría 5 con un luchador.

**ACH_MISSION1**
- PT: Dever de Casa — Cumpra uma missão do dia.
- EN: Homework Done — Complete a daily mission.
- ES: Tarea Cumplida — Cumple una misión del día.

**ACH_MISSIONS3**
- PT: Dia Completo — Cumpra as três missões do dia.
- EN: Full Day — Complete all three daily missions.
- ES: Día Completo — Cumple las tres misiones del día.

**ACH_WEEK1**
- PT: Doido da Semana — Termine a Rinha da Semana.
- EN: Madman of the Week — Finish the Weekly Brawl.
- ES: Loco de la Semana — Termina la Riña de la Semana.

**ACH_CLIP1**
- PT: Cineasta da Rinha — Salve ou compartilhe um clipe de luta.
- EN: Brawl Filmmaker — Save or share a fight clip.
- ES: Cineasta de la Riña — Guarda o comparte un clip de pelea.

**ACH_CARD1**
- PT: Cartão Postal — Gere um cartão de resultado.
- EN: Postcard — Generate a result card.
- ES: Postal — Genera una tarjeta de resultado.

**ACH_CHALLENGE1**
- PT: Duvido! — Envie um desafio para um amigo.
- EN: I Dare You! — Send a challenge to a friend.
- ES: ¡Te Reto! — Envía un desafío a un amigo.

**ACH_CHAL_BEAT**
- PT: Superou o Placar — Supere o placar de um desafio recebido.
- EN: Beat the Score — Beat the score of a challenge you received.
- ES: Superó el Puntaje — Supera el puntaje de un desafío recibido.

**ACH_KING_FIRST**
- PT: Na Festa do Sítio — Jogue uma partida do Quem Ganha Fica.
- EN: At the Farm Party — Play a Winner Stays match.
- ES: En la Fiesta del Sitio — Juega una partida de El Ganador Se Queda.

**ACH_KING3**
- PT: Rei do Terreiro — Vença 3 vezes seguidas no Quem Ganha Fica.
- EN: King of the Yard — Win 3 in a row in Winner Stays.
- ES: Rey del Terreiro — Gana 3 veces seguidas en El Ganador Se Queda.

**ACH_KING5**
- PT: Imbatível na Festa — Vença 5 vezes seguidas no Quem Ganha Fica.
- EN: Unbeatable at the Party — Win 5 in a row in Winner Stays.
- ES: Imbatible en la Fiesta — Gana 5 veces seguidas en El Ganador Se Queda.

## 5. Steam Cloud (Auto-Cloud)

O save é um único arquivo JSON, gravado pelo app em `userData/save.json` (Windows: `%APPDATA%\SertaoFightBrasil\`, Linux: `~/.config/SertaoFightBrasil/`, macOS: `~/Library/Application Support/SertaoFightBrasil/`; a pasta é fixada em ASCII em `desktop/main.js` porque o Electron no Linux ignora nomes com acento).

No painel: *Application ▸ Steam Cloud* → habilite, e em **Steam Auto-Cloud** adicione uma regra:

| Campo | Valor |
| --- | --- |
| Root | `WinAppDataRoaming` (Windows) · `LinuxXdgConfigHome` (Linux) · `MacAppSupport` (macOS) |
| Subdirectory | `SertaoFightBrasil` |
| Pattern | `save.json` |

Cota sugerida: 1 MB, 1 arquivo.

## 6. Depots e envio do build

1. *Steamworks ▸ SteamPipe ▸ Depots*: um depot por sistema (Windows, Linux, macOS) ou só Windows + Linux.
2. Baixe o SDK da Steamworks, use o `steamcmd` com um script `app_build_<AppID>.vdf` apontando `ContentRoot` para `desktop/dist/<sistema>-unpacked`.
3. Em *Installation ▸ General*: executável de lançamento (`SertaoFightBrasil.exe` no Windows, `sertao-fight-brasil` no Linux, `SertaoFightBrasil.app` no macOS), sistema operacional correspondente.
4. Suba para um branch `default`/`beta`, teste instalando pelo cliente, e só então promova.

## 7. Steam Deck e controle

- O jogo detecta gamepad padrão (layout Xbox): menus navegáveis, luta completa, pausa no Start. Funciona sem o Steam Input; para "Verified", configure um *Steam Input Template* com os botões de ação (Golpe leve / forte / especial / Arreda / Peia) e ofereça o glifo da loja.
- Resolução nativa 960×540 (16:9) escalada para qualquer janela — nítido em 1280×800 (Deck) e 4K.
- Textos têm fonte embutida e legível; o botão **Reduzir flashes** e a **Velocidade do jogo** estão em Opções.
- Auto-qualidade: se a taxa de quadros cair, o jogo desliga o pós-processamento e depois a camada de pintura sozinho (Opções ▸ Qualidade para fixar).
- Para marcar "Playable/Verified", abra o jogo no Deck e confirme: sem teclado necessário para menus, textos ≥ 9 pt equivalente, nome do jogador não pedido.

## 8. Idiomas

PT-BR (base), inglês e espanhol, **100% da interface, diálogos, cordéis, nomes de golpes, tutorial e conquistas**. O idioma inicial vem do idioma da Steam (`brazilian`, `english`, `spanish`, `latam`) ou do navegador; troca manual na tela inicial. Nomes próprios de personagens permanecem. Para marcar os idiomas na loja: Português – Brasil, Inglês, Espanhol – América Latina (e Espanha) — **interface e legendas** (não há dublagem; as vozes são sintetizadas).

Para adicionar outro idioma: escreva as linhas no formato `[pt, en, es, xx]` em `js/lang/` e registre a língua em `LANGS` e nos mapas `D`/`UP` de `js/i18n.js` (hoje `add()` aceita só en/es — estenda-o); o auditor de lacunas é `M.i18n.misses` (abra o jogo com `index.html?lang=xx`, jogue e digite `[...M.i18n.misses]` no console: as frases ainda não traduzidas aparecem ali).

## 9. Versão web / itch.io

```bash
python3 tools/build_web.py        # gera sw.js (cache offline) e dist/sertao-fight-brasil-web.zip
```

O zip serve direto no itch.io (tipo HTML, "this file will be played in the browser") ou em qualquer hospedagem estática. O jogo também é instalável (PWA) e roda offline depois da primeira visita.

## 10. Arte de loja

**Use a pasta `art-kit/steam/`**, que tem os tamanhos atuais da Steamworks (header 920×430, small 462×174, main 1232×706, vertical 748×896, library capsule 600×900, hero 3840×1240, logo transparente) e 10 screenshots reais de 1920×1080. Ela é gerada do próprio jogo por `tools/art/` (veja `art-kit/README.md`). A pasta `store/` guarda a arte antiga, em tamanhos que a Steam não aceita mais.

| Arquivo | Uso na Steam |
| --- | --- |
| `art-kit/steam/store/header-capsule_920x430.png` | Header capsule |
| `art-kit/steam/store/main-capsule_1232x706.png` | Main capsule |
| `art-kit/steam/store/small-capsule_462x174.png` | Small capsule |
| `art-kit/steam/store/vertical-capsule_748x896.png` | Vertical capsule |
| `art-kit/steam/store/featured-key-art_1920x1080.png` | Arte de destaque / imprensa |
| `art-kit/steam/library/library-capsule_600x900.png` | Library capsule |
| `art-kit/steam/library/library-hero_3840x1240.png` | Library hero (sem logo; lado esquerdo livre para o logo) |
| `art-kit/steam/library/library-logo_1280x720.png` | Library logo (PNG transparente) |
| `art-kit/steam/screenshots/*.png` (10) | Screenshots da loja |

> A Steam proíbe selos de prêmio, "% OFF" e textos que não sejam o logo na arte principal; as capsules do kit só têm o logo. A Steamworks valida os tamanhos no envio.

## 11. Antes de apertar "Publicar"

- [ ] AppID real configurado (`STEAM_APP_ID` ou a constante em `desktop/main.js`).
- [ ] 58 conquistas cadastradas com os API Names acima + ícones.
- [ ] Auto-Cloud configurado e testado em duas máquinas.
- [ ] Textos e capturas da loja revisados nos 3 idiomas (`store/STORE_PAGE.md`).
- [ ] Classificação etária preenchida.
- [ ] Build testado em máquina limpa (sem Node) e sem a Steam aberta (deve rodar mesmo assim).
- [ ] Jogue a História inteira e a Rinha Livre uma vez no build final.
- [ ] Licenças: fontes Alfa Slab One (OFL) e Special Elite (Apache 2.0) estão em `fonts/`; Electron (MIT); `steamworks.js` (MIT) — inclua os avisos de licença no instalador se exigido.
- [ ] Definir licença/termos do jogo (`desktop/package.json` está como `UNLICENSED`) e política de privacidade (o jogo **não coleta nenhum dado**, não usa rede).
