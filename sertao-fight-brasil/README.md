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
- **Mobilidade**: corrida, dash aéreo, super pulo, pulo na parede e rolamento ao levantar.
- **No Compasso**: acertar na batida da zabumba dobra a Energia. Bené Sanfona toca para alargar sua própria janela.
- **Versus CPU** — você contra a máquina, escolhendo o adversário e a dificuldade.
- **Versus 2 jogadores** — dois no mesmo teclado.
- **Treino** — boneco configurável (parado, defende, pula, CPU).
- **Rinha Livre** — liberado ao terminar a História: sete adversários sorteados e o Mestre Cinzas, com qualquer lutador.

## Os doze lutadores

Zeca Ventania, Bia Sombrinha, Maré Bacuri, Tião Sertão, Bené Sanfona, Juvenal Boitatá, Vinícius Andrey e Mestre Cinzas (liberado ao fim da História) — mais quatro lendas do folclore nordestino, jogáveis desde o começo:

| Lenda | Estilo | O que a torna diferente |
| --- | --- | --- |
| **Comadre Fulozinha** (PI) | Assobio da mata | Pequena e ágil, pulo duplo. Assobio veloz, armadilha de cipó que prende, fumaça do cachimbo que deixa o rival tonto, chute de pés virados que recua atacando. Peia: *Mata Fechada* (redemoinho de folhas). |
| **Mula-sem-Cabeça** (CE) | Galope de fogo | Cabeça de chama azul, físico pesado e dash rápido. Coice duplo, Ombrada com armadura, Empinada anti-aéreo, Atropelo em várias batidas, ferradura em chamas no chão. Peia: *Madrugada de Sexta* (escurece a rinha). |
| **Seu Papa-Figo** (PE) | Saco & navalha | Alto, magro, golpes longos que **roubam vida** (navalhada, estocada, agarrão). Saco arremessado, cantiga de ninar que dá sono, contra-golpe vampírico *Capa Negra*. Peia: *Ceia Maldita*. |
| **Cabeça de Cuia** (PI) | Anzol & tarrafa | Cabeça de cabaça, zoneador. **Fisgada** puxa o oponente pelo anzol, cuiada d'água em arco, poça do Parnaíba, chuva de peixes, mergulho no rio com invencibilidade. Peia: *Maldição do Parnaíba* (redemoinho que suga). |

Cada lenda tem seu cenário: Mata Branca Encantada, Estrada da Meia-Noite, Beco da Matriz e Delta do Parnaíba.

## Estrutura

```
sertao-fight-brasil/
  index.html
  css/style.css        interface (menus, diálogos, toque)
  js/util.js           utilitários, paleta, salvamento
  js/audio.js          síntese: zabumba, atabaque, pandeiro, agogô, efeitos, torcida
  js/input.js          teclado, toque, gamepad, dash
  js/fighters.js       os doze lutadores: stats, visual, frame data
  js/poses.js          rig esquelético e poses
  js/render.js         desenho xilogravura, projéteis, efeitos
  js/stages.js         doze cenários, torcida, fogueira
  js/fighter.js        máquina de estados do lutador
  js/ai.js             IA por intenção e personalidade
  js/game.js           partida: rodadas, Energia, colisões, chefe, tutorial, HUD
  js/story.js          cordéis, diálogos, garrafadas, finais
  js/ui.js             telas em DOM
  js/main.js           loop fixo a 60fps e fluxo de modos
```

## Camada visual "Pintura" (opcional)

`js/paint.js` é uma camada de apresentação aditiva, ligada por padrão e desligável em Opções (Estilo visual: Pintura / Xilogravura; Pós-processamento). Ela só lê o estado da partida e desenha: nenhuma regra, física, hitbox ou IA é alterada.

- Fundos repintados com pinceladas sensíveis a bordas, perspectiva atmosférica e textura de pincel.
- Iluminação por cenário: luz principal quente da fogueira, luz de preenchimento fria, rim light e sombreamento cel em três tons nos lutadores; contorno seletivo (silhueta grossa, traços internos finos e tingidos).
- Névoa volumétrica em camadas, raios de luz, sombras suaves.
- VFX desenhados à mão (respingos frame a frame, linhas tremidas, fumaça), smear frames nos golpes rápidos, impact frames em golpes fortes e nocautes.
- Câmera dinâmica (enquadramento entre os lutadores, parallax do fundo, letterbox nas cenas).
- Pós-processamento em WebGL/GLSL: grade de cor com split tone, bloom, tinta nas bordas, névoa de profundidade, vinheta, grão e micro-pinceladas. Sem WebGL, o jogo cai para o canvas 2D sem pós.
