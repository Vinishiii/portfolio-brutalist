# SERTÃO FIGHT BRASIL — A Rinha Nunca Para

Jogo de luta 1v1 brasileiro, em xilogravura de cordel, feito do zero em HTML, CSS e JavaScript puro.
Sem dependências, sem assets externos: personagens, cenários, efeitos e música são todos procedurais.

**Quem tem Energia manda na rinha.** A barra de poder é uma só, no meio da tela: o público.
Golpes variados, esquivas perfeitas e acertos no compasso da zabumba puxam a rinha pro seu lado — e com 70% ela libera a sua Peia.

## Como executar

- Abra `sertao-fight-brasil/index.html` direto no navegador (funciona via `file://`), ou
- Sirva a pasta com qualquer servidor estático: `python3 -m http.server 8000` e acesse `http://localhost:8000/sertao-fight-brasil/`.

Funciona em desktop (teclado ou gamepad) e no celular (controles de toque, melhor na horizontal).

## Controles

| Ação | P1 | P2 |
| --- | --- | --- |
| Mover / pular / agachar | W A S D | Setas |
| Golpe leve | J | Num 1 ou , |
| Golpe forte | K | Num 2 ou . |
| Especial | L | Num 3 ou / |
| Arreda (esquiva) | Espaço | Num 0 ou Shift direito |
| Peia (super) | U | Num 5 ou ' |
| Provocar | O | Num 4 ou ; |
| Agarrão | H (ou J+K) | Num 6 ou ] |
| Dash | toque duplo ← / → | toque duplo ← / → |
| Golpe corrido | Dash + K | Dash + forte |
| Correr | Dash + segurar frente | idem |
| Dash aéreo | toque duplo no ar | idem |
| Super pulo | baixo, depois cima | idem |
| Pulo na parede | cima na borda | idem |
| Rolar ao levantar | ← ou → no chão | idem |
| Fôlego (EX) | K + L | Num 2 + Num 3 |
| Pausa | ESC | ESC |

As teclas são **remapeáveis** em Opções ▸ CONTROLES (TECLAS). Com controle (padrão Xbox), os menus navegam pelo direcional e a luta usa A/B/X/Y e gatilhos; Start pausa.

Variações: agachado + golpe (baixo), frente + forte (comando), dash + forte (golpe corrido), golpes no ar, agachado + especial. Lançadores aceitam pulo-cancel para combos aéreos.

## Modos

- **História** — a Rinha do Fogo com Zeca Ventania: tutorial, seis rinhas, chefe em duas fases e três finais. Cada rinha tem:
  - **Mapa da noite** e tela de confronto (VS) com o **desafio** opcional da luta (cumprir dá +1 Fama e três garrafadas à escolha).
  - **Nota S/A/B/C** por tempo, vida perdida, esquivas perfeitas, golpes no compasso e tentativas; nota geral no final e melhor nota salva.
  - **Laços**: depois de cada rinha dos seis adversários, escolha entre ouvir a lição do rival (faz um laço) ou levar o presente (lição mais direta). Cada escolha dá uma lição permanente diferente. Com 4+ laços a Vila aparece na praça e o final secreto abre direto.
  - **Fogueira** (depois do Tião e do Juvenal): uma bênção para a próxima luta — mocotó (+vida), treino de sombra (+dano/velocidade) ou cordel (Energia inicial).
- **Lendas da Noite** — segundo arco, liberado ao terminar a História: quatro rinhas contra o folclore do Nordeste (Fulozinha, Cabeça de Cuia, Mula-sem-Cabeça e Papa-Figo), com cordéis, diálogos, garrafadas e um final próprio.

## Dinâmica

- **Energia**: barra única disputada pelos dois. Com 70% libera a Peia; com 100% ela vira **Peia Braba** (+30% de dano).
- **Arreda**: esquiva com invencibilidade. Perfeita = câmera lenta, muita Energia e um **Contra-ataque** garantido no próximo golpe.
- **Agarrão** universal (H ou J+K) quebra defesa. **Escapar** de um combo de 3+ golpes custa 30% de Energia.
- **Fôlego**: K+L gasta 25% de Energia por um especial reforçado (dano, armadura, projétil duplo).
- **Strings**: leve ▸ leve ▸ leve vira um combo de três golpes próprio de cada lutador (o terceiro derruba e cancela em especial). Golpes cancelam também na defesa.
- **Sequência do especial**: apertar especial de novo logo após o primeiro golpe dá um segundo golpe exclusivo (Rodopio ▸ Chute de arremate, Aboio ▸ Boiada...).
- **Cancelar na Peia, arremate e canto**: qualquer golpe que conectar pode cancelar na Peia; o último golpe da Peia é um arremate em câmera lenta; no canto, golpes fortes encurralam (+10% de dano). Golpes fortes fazem o corpo quicar no chão; peso do corpo e hitstop proporcionais ao golpe.
- **Mobilidade**: corrida, dash aéreo, super pulo, pulo na parede e rolamento ao levantar.
- **No Compasso**: acertar na batida da zabumba dobra a Energia. Bené Sanfona toca para alargar sua própria janela.
- **Versus CPU** — você contra a máquina, escolhendo o adversário e a dificuldade.
- **Versus 2 jogadores** — dois no mesmo teclado.
- **Treino** — boneco configurável (parado, defende, pula, CPU), **histórico de entradas** (setas e botões com a duração em quadros) e leitura do último combo (golpes, dano e recorde).
- **Rinha Livre** — liberado ao terminar a História: sete adversários sorteados e o Mestre Cinzas, com qualquer lutador.

## Os vinte lutadores

Zeca Ventania, Bia Sombrinha, Maré Bacuri, Tião Sertão, Bené Sanfona, Juvenal Boitatá, Vinícius Andrey e Mestre Cinzas (liberado ao fim da História) — mais doze lendas do folclore brasileiro, jogáveis desde o começo. As quatro primeiras:

| Lenda | Estilo | O que a torna diferente |
| --- | --- | --- |
| **Comadre Fulozinha** (PI) | Assobio da mata | Pequena e ágil, pulo duplo. Assobio veloz, armadilha de cipó que prende, fumaça do cachimbo que deixa o rival tonto, chute de pés virados que recua atacando. Peia: *Mata Fechada* (redemoinho de folhas). |
| **Mula-sem-Cabeça** (CE) | Galope de fogo | Cabeça de chama azul, físico pesado e dash rápido. Coice duplo, Ombrada com armadura, Empinada anti-aéreo, Atropelo em várias batidas, ferradura em chamas no chão. Peia: *Madrugada de Sexta* (escurece a rinha). |
| **Seu Papa-Figo** (PE) | Saco & navalha | Alto, magro, golpes longos que **roubam vida** (navalhada, estocada, agarrão). Saco arremessado, cantiga de ninar que dá sono, contra-golpe vampírico *Capa Negra*. Peia: *Ceia Maldita*. |
| **Cabeça de Cuia** (PI) | Anzol & tarrafa | Cabeça de cabaça, zoneador. **Fisgada** puxa o oponente pelo anzol, cuiada d'água em arco, poça do Parnaíba, chuva de peixes, mergulho no rio com invencibilidade. Peia: *Maldição do Parnaíba* (redemoinho que suga). |

Cada lenda tem seu cenário: Mata Branca Encantada, Estrada da Meia-Noite, Beco da Matriz e Delta do Parnaíba.

### Mais oito lendas do folclore brasileiro

| Lenda | Estilo | O que a torna diferente |
| --- | --- | --- |
| **Saci-Pererê** | Peraltice de uma perna só | Pequeno e ágil, pulo duplo. Redemoinhos (projétil de dois golpes), *Sumiço* que o leva para as costas do rival, e *Esconder o chapéu*, que rouba Energia. Peia: *Redemoinho Gigante*. |
| **Curupira** | Fogo e rastro | Cabelo de fogo e pés virados. Bola de fogo que queima, *Pegadas ao contrário* (armadilha que deixa o rival perdido), cabeçada flamejante e sumiço na mata. Peia: *Incêndio da Mata*. |
| **Iara** | Canto e correnteza | Zoneadora: o *Canto* encanta (deixa o rival lento), *Espelho d'água* reflete projéteis, *Abraço do rio* rouba vida e *Beijo d'água* cura. Peia: *Canto da Sereia* (puxa para o redemoinho). |
| **Boto Cor-de-Rosa** | Dança e encanto | Galã de terno branco: *Coração* deixa o rival apaixonado (lento), abraço com armadura, valsa, e *Conquista* que enche a Energia. Peia: *Festa do Boto*. |
| **Lobisomem** | Garra e lua cheia | Berserker veloz: *Talho triplo*, bote com armadura, mordida que rouba vida, postura de revide e *Fome da lua* (ganha Energia). Peia: *Noite de Lua Cheia*. |
| **Mapinguari** | Peso e urro | Gigante lento e pesadíssimo, com um olho só e uma boca na barriga: *Urro*, nuvem de *Fedor*, atropelo, e a *Barriga faminta* que engole e se cura. Peia: *Fúria da Mata*. |
| **Cuca** | Poção e feitiço | Bruxa-jacaré: *Poção* que envenena, *Caldeirão* que queima, *Vira sapo!* (deixa o rival quase parado) e voo de vassoura. Peia: *Caldeirão do Sítio*. |
| **Pisadeira** | Pesadelo e aperto | Alta e magra, unhas enormes (alcance longo): *Pesadelo* (lento + rouba Energia), *Sufoco* (agarrão que drena) e pisão com armadura. Peia: *Noite Sem Fim*. |

## Progresso e compartilhamento

- **XP, nível (1–60) e maestria (1–10) por lutador.** Toda luta rende XP (vitória, dano, combos, estilo, contra-golpes, esquivas, dificuldade). Missões do dia (as mesmas o dia todo), metas de cada lutador, e **recompensas ganhas, nunca compradas nem sorteadas**: títulos, molduras do retrato e as cores alternativas de cada lutador (maestria 2 e 4). Tela **PROGRESSO** no menu.
- **Rinha da Semana:** três lutas seguidas contra a CPU com as regras malucas da semana (muda toda segunda), placar e até 3 estrelas. XP em dobro e meia.
- **Quem Ganha Fica:** modo de festa para 2 a 8 pessoas no mesmo teclado; quem vence continua no trono, quem perde vai para o fim da fila.
- **Clipe automático:** o jogo grava os últimos segundos do nocaute, da Peia ou de um combo grande (vídeo com som e a marca do jogo) e oferece **CLIPE** na tela de resultado. Pode ser desligado em Opções.
- **Desafio por link:** **DESAFIAR UM AMIGO** gera um link com a luta (lutadores, cenário, regras e semente) e o seu placar; quem abre o link joga a mesma luta e tenta superar. Sem servidor: o desafio vai dentro do endereço.
- **Cartão de resultado:** imagem vertical 1080×1350 pronta para story/WhatsApp.
- **Mais suco:** contador de combo que cresce por níveis com nota de **estilo** (C a SS), reação da torcida, *Na raça!* quando a virada é no fio, e balões de fala dos lutadores (provocação, combo e vitória).

### Vinícius Andrey — visual realista e código no ar

Vinícius (`js/vinicius.js`) é o lutador desenhado "como gente": rosto com anatomia (crânio e mandíbula, nariz de perfil, olhos com íris e pálpebras, sobrancelhas grossas, orelha, barba cheia com textura e bigode, óculos de acetato) que muda de expressão (neutro, feliz, bravo, gritando, de dor); **jaqueta de couro preta** aberta sobre camiseta branca com estampa `</>` (gola alta, lapela, zíper, bolso, barra canelada, ombreira e punhos com zíper), jeans escuro com costura e tênis branco. Tem três cores: original (jaqueta preta), jaqueta marrom e jaqueta vinho.

Os **especiais soltam códigos verdes e roxos flutuando** (dígitos, binário, hexadecimal e símbolos, que sobem, balançam e piscam): *Bug* deixa rastro de bits, *Firewall* vira uma parede de código, *Download* e *Push/Deploy* deixam esteira de números, *Hotfix* cura numa nuvem de dígitos, *Rollback* some e reaparece em anel de código, e *Deploy em Produção* (a Peia) chove código na tela inteira. É só visual: a simulação (e os replays) não mudam.

## Competitivo

Menu ▸ **COMPETITIVO**: **ranqueada** contra uma CPU que se ajusta ao seu nível (PR, 7 níveis, divisões, colocação), **torneio local** (3–16 jogadores, eliminação simples ou dupla, séries MD1/3/5, banimento de cenário, vencedor mantém o lutador, CPUs simuladas), **replays** (gravação automática, velocidade, código para compartilhar), **dados de quadros** de todos os golpes e **modo transmissão** (placar, tags, entradas dos jogadores, F9 esconde o painel). Detalhes, limites e plano para o online em **[COMPETITIVO.md](COMPETITIVO.md)**. O jogo **não tem partidas online**.

## Modos extras

- **Maratona**: ondas sem fim, vida que passa de luta em luta, garrafada a cada três ondas, chefe a cada dez.
- **Desafio do Dia**: um duelo novo por dia (mesmo para todo mundo), com modificadores e objetivo bônus, sequência de dias.
- **Regras da rinha**: rodadas, tempo e 6 modificadores (dano dobrado, vida curta, turbo, gravidade da Lua, torcida eufórica, sangue quente) no Versus.
- **Cores alternativas** para todos os lutadores (tecla L na seleção), **estatísticas** completas e **jukebox** com as músicas de cada cenário.

## Idiomas

**Português (Brasil), English e Español** — interface, diálogos, cordéis, nomes de golpes, tutorial e conquistas. O idioma inicial segue o do sistema/Steam; troque na tela inicial ou em Opções. O português é a fonte de verdade: `js/i18n.js` traduz na hora de exibir usando os pacotes de `js/lang/` (linhas `[pt, en, es]`). `index.html?lang=en` força um idioma na sessão; `M.i18n.misses` no console lista textos ainda sem tradução.

## Conquistas e opções

- **58 conquistas** (primeira vitória, combos, esquivas perfeitas, finais, nota S, nível Lendário...), com aviso na tela e integração com a Steam (`ACH_<ID>`, ver `STEAM.md`).
- Opções: volume, música/efeitos, tremor de tela, idioma, **velocidade do jogo**, **reduzir flashes**, **qualidade** (auto / alta / baixa), estilo visual (Pintura / Xilogravura), controles de toque e remapeamento de teclas.
- **Qualidade automática**: se os quadros caem, o jogo desliga primeiro o pós-processamento e depois a camada de pintura.
- Fontes embutidas (funciona offline), salvamento automático (arquivo no desktop, `localStorage` no navegador).

## Publicação

- **Web / itch.io**: `python3 tools/build_web.py` gera `sw.js` (cache offline, jogo instalável como PWA) e `dist/sertao-fight-brasil-web.zip`.
- **Desktop / Steam**: `desktop/` é um app Electron com ponte para a Steamworks (conquistas, idioma e Steam Cloud). Passo a passo, AppID, depots, Auto-Cloud e checklist em **[STEAM.md](STEAM.md)**.
- **Página da loja** (PT/EN/ES) em `store/STORE_PAGE.md` e a arte de lançamento atual em [`art-kit/`](art-kit/README.md) (Steam nos tamanhos de 2024, Google Play, App Store e Instagram, gerada do próprio jogo por `tools/art/`). A pasta `store/` guarda a arte antiga, em tamanhos que a Steam não aceita mais.


### Versão mobile (Android e iOS)
A pasta [`mobile/`](mobile/README.md) empacota o mesmo jogo com Capacitor para Android e iOS (controles de toque, vibração, pausa em segundo plano, compartilhar nativo, sem permissões). Os builds rodam no GitHub Actions (`.github/workflows/mobile-android.yml` e `mobile-ios.yml`). O README de lá traz o estado verificado, o que ainda depende de você (contas, chaves, política de privacidade) e o passo a passo para Google Play e App Store.

## Som e música

Tudo sintetizado na hora com Web Audio (nenhum arquivo de áudio):

- **Instrumentos**: zabumba (pele grave e baqueta fina com notas fantasma), triângulo (parciais inarmônicos), ganzá, sanfona (palhetas desafinadas em coro, fole e tremolo), pífano (sopro, vibrato tardio), violão e baixo (corda dedilhada por Karplus-Strong).
- **Trilha**: 4 compassos com progressão harmônica por cenário (mixolídio, jônio, dórico, menor), tonalidade, andamento e solista próprios (sanfona, pífano ou sintetizador); camadas entram conforme a Energia; versões lenta (menu), lírica (final), pesada (chefe) e acelerada (chefe fase 2). A torcida bate palma no 2 e no 4.
- **Efeitos em camadas**: cada impacto soma grave, corpo e estalo, com variação de tom a cada golpe; reverb procedural, eco de praça, compressor e panorâmica pela posição do lutador.
- **Vozes**: grunhidos, gritos de esforço, gritos de dor e nocaute por síntese de formantes, com timbre próprio por lutador; a torcida também grita e aplaude.

## Estrutura

```
sertao-fight-brasil/
  index.html
  css/style.css        interface (menus, diálogos, toque)
  js/util.js           utilitários, paleta, salvamento, versão
  js/audio.js          síntese: zabumba, atabaque, pandeiro, agogô, efeitos, torcida
  js/input.js          teclado, toque, gamepad, dash
  js/fighters.js       os lutadores originais: stats, visual, frame data
  js/folk2.js          as oito lendas novas: golpes, sequências e atributos
  js/folk2draw.js      desenho das lendas novas: cabeças, roupas, projéteis e armadilhas
  js/meta.js           XP, níveis, maestria, missões, recompensas e Rinha da Semana
  js/viral.js          clipe automático, desafio por link e cartão de resultado
  js/ui5.js            resultado com XP, Progresso, Maestria, desafio e Semana
  js/party.js          modo Quem Ganha Fica
  js/lines.js          balões de fala dos lutadores
  js/poses.js          rig esquelético e poses
  js/render.js         desenho xilogravura, projéteis, efeitos
  js/vinicius.js       rosto realista, jaqueta de couro e códigos verdes/roxos do Vinícius
  js/stages.js         doze cenários, torcida, fogueira
  js/fighter.js        máquina de estados do lutador
  js/ai.js             IA por intenção e personalidade
  js/game.js           partida: rodadas, Energia, colisões, chefe, tutorial, HUD
  js/story.js          cordéis, diálogos, garrafadas, finais
  js/ui.js             telas em DOM
  js/ui2.js            regras, Maratona, Desafio do Dia, estatísticas, jukebox
  js/ui3.js            competitivo: central, ranqueada, replays, dados de quadros
  js/ui4.js            torneio local: montagem, chaves, séries, campeão
  js/modes.js          modificadores, regras, cores alternativas, estatísticas, Maratona, Desafio do Dia
  js/comp.js           perfil competitivo e ranqueada (PR, níveis, histórico)
  js/tourney.js        motor de chaves do torneio
  js/replay.js         gravação e reprodução de lutas (determinístico)
  js/framedata.js      dados de quadros e vantagem no treino
  js/i18n.js           tradução PT/EN/ES (dicionário, padrões, DOM)
  js/lang/*.js         pacotes de tradução [pt, en, es]
  js/achievements.js   conquistas e ponte com a plataforma (Steam)
  js/paint.js          camada de pintura e pós-processamento (opcional)
  js/logo.js           logo do jogo em canvas (título, menu e arte de loja)
  js/main.js           loop fixo a 60fps e fluxo de modos
  fonts/               Alfa Slab One e Special Elite (embutidas)
  desktop/             app Electron + Steamworks
  tools/               build web (PWA) e gerador de arte de loja
  store/               arte e textos da página da loja
```

## Camada visual "Pintura" (opcional)

`js/paint.js` é uma camada de apresentação aditiva, ligada por padrão e desligável em Opções (Estilo visual: Pintura / Xilogravura; Pós-processamento). Ela só lê o estado da partida e desenha: nenhuma regra, física, hitbox ou IA é alterada.

- Fundos repintados com pinceladas sensíveis a bordas, perspectiva atmosférica e textura de pincel.
- Iluminação por cenário: luz principal quente da fogueira, luz de preenchimento fria, rim light e sombreamento cel em três tons nos lutadores; contorno seletivo (silhueta grossa, traços internos finos e tingidos).
- Névoa volumétrica em camadas, raios de luz, sombras suaves.
- VFX desenhados à mão (respingos frame a frame, linhas tremidas, fumaça), smear frames nos golpes rápidos, impact frames em golpes fortes e nocautes.
- Câmera dinâmica (enquadramento entre os lutadores, parallax do fundo, letterbox nas cenas).
- Pós-processamento em WebGL/GLSL: grade de cor com split tone, bloom, tinta nas bordas, névoa de profundidade, vinheta, grão e micro-pinceladas. Sem WebGL, o jogo cai para o canvas 2D sem pós.
