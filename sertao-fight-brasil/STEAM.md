# Publicando na Steam — Sertão Fight Brasil

Guia de ponta a ponta para levar o jogo à Steam (e também ao itch.io / web). O jogo já vem com tudo do lado do código: app de desktop (Electron), ponte com a Steamworks, 26 conquistas, idioma automático (PT / EN / ES), save em arquivo para o Steam Cloud, arte de loja pronta e build web.

> **Estado honesto:** o jogo foi testado no navegador (Chromium) e o app de desktop foi **empacotado e executado no Linux** (Electron 33 + electron-builder, sob Xvfb): abre a janela, detecta o idioma do sistema, grava o save em arquivo, relê o progresso na abertura seguinte e fecha pelo menu "SAIR DO JOGO". **Não foi possível testar aqui:** as chamadas reais da Steamworks (conquistas, overlay, idioma da Steam — precisam do cliente Steam e de um AppID), os builds de Windows e macOS, o Steam Deck e o Steam Cloud. Faça o teste da seção 3 antes de enviar o build.

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

São **26**. O jogo chama `ACH_<ID EM MAIÚSCULAS>`; cadastre exatamente estes **API Names**. Os textos nos três idiomas estão abaixo para colar nas traduções (a Steam mostra no idioma do jogador). Ícones (256×256, colorido e cinza): gere do `icons/icon-256.png` + glifo da conquista, ou encomende 26 ícones — a Steam exige uma imagem para cada.

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
| `ACH_STORY_DONE` | Guardião da Brasa | Keeper of the Ember | Guardián de la Brasa |
| `ACH_TRUE_ENDING` | A Brasa é de Todo Mundo | The Ember Belongs to Everyone | La Brasa es de Todos |
| `ACH_ALL_ENDINGS` | Três Caminhos | Three Paths | Tres Caminos |
| `ACH_STORY_S` | Nota S | Grade S | Nota S |
| `ACH_STORY_HARD` | Noite Difícil | Hard Night | Noche Difícil |
| `ACH_STORY_FAST` | Corrida de São João | São João Sprint | Carrera de San Juan |
| `ACH_BONDS6` | Todos os Laços | All the Bonds | Todos los Lazos |
| `ACH_FAMA7` | Fama Total | Total Fame | Fama Total |
| `ACH_LEGENDS_DONE` | A Noite Tem Guardião | The Night Has a Keeper | La Noche Tiene Guardián |
| `ACH_FREE_DONE` | Rinha Inteira | The Whole Brawl | Riña Entera |

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
- PT: Todos na Rinha — Vença com todos os 12 lutadores.
- EN: Everyone in the Brawl — Win with all 12 fighters.
- ES: Todos en la Riña — Gana con los 12 luchadores.

**ACH_STORY_DONE**
- PT: Guardião da Brasa — Termine a História.
- EN: Keeper of the Ember — Finish the Story.
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

Tudo em `store/`, gerado do próprio jogo por `tools/make_assets.js` (Playwright + Chromium; regenere depois de qualquer mudança visual: `GAME_URL=http://localhost:8766/index.html NODE_PATH=$(npm root -g) node tools/make_assets.js`).

| Arquivo | Uso na Steam |
| --- | --- |
| `steam-header-460x215.png` | Header capsule |
| `steam-capsule-616x353.png` | Main capsule |
| `steam-capsule-small-231x87.png` | Small capsule |
| `steam-capsule-vertical-374x448.png` | Vertical capsule |
| `steam-library-capsule-600x900.png` | Library capsule |
| `steam-library-hero-3840x1240.png` | Library hero |
| `steam-library-logo-1280x720.png` | Library logo |
| `screenshot-*.png` (8) | Capturas da loja, já em 1920×1080 |
| `key-art-1920x1080.png`, `itch-cover-630x500.png` | Divulgação / itch.io |

> Revise as capsules: a Steam proíbe selos de prêmio, "% OFF" e textos que não sejam o logo na arte principal. Se o título estiver pequeno nas capsules, aumente-o em `tools/make_assets.js`.

## 11. Antes de apertar "Publicar"

- [ ] AppID real configurado (`STEAM_APP_ID` ou a constante em `desktop/main.js`).
- [ ] 26 conquistas cadastradas com os API Names acima + ícones.
- [ ] Auto-Cloud configurado e testado em duas máquinas.
- [ ] Textos e capturas da loja revisados nos 3 idiomas (`store/STORE_PAGE.md`).
- [ ] Classificação etária preenchida.
- [ ] Build testado em máquina limpa (sem Node) e sem a Steam aberta (deve rodar mesmo assim).
- [ ] Jogue a História inteira e a Rinha Livre uma vez no build final.
- [ ] Licenças: fontes Alfa Slab One (OFL) e Special Elite (Apache 2.0) estão em `fonts/`; Electron (MIT); `steamworks.js` (MIT) — inclua os avisos de licença no instalador se exigido.
- [ ] Definir licença/termos do jogo (`desktop/package.json` está como `UNLICENSED`) e política de privacidade (o jogo **não coleta nenhum dado**, não usa rede).
