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

- **História** — a Rinha do Fogo com Zeca Ventania: tutorial, seis rinhas, garrafadas, chefe em duas fases e dois finais.

## Dinâmica

- **Energia**: barra única disputada pelos dois. Com 70% libera a Peia; com 100% ela vira **Peia Braba** (+30% de dano).
- **Arreda**: esquiva com invencibilidade. Perfeita = câmera lenta, muita Energia e um **Contra-ataque** garantido no próximo golpe.
- **Agarrão** universal (H ou J+K) quebra defesa. **Escapar** de um combo de 3+ golpes custa 30% de Energia.
- **Fôlego**: K+L gasta 25% de Energia por um especial reforçado (dano, armadura, projétil duplo).
- **Mobilidade**: corrida, dash aéreo, super pulo, pulo na parede e rolamento ao levantar.
- **No Compasso**: acertar na batida da zabumba dobra a Energia. Bené Sanfona toca para alargar sua própria janela.
- **Versus** — dois jogadores no mesmo teclado.
- **Treino** — boneco configurável (parado, defende, pula, CPU).
- **Rinha Livre** — liberado ao terminar a História: a rinha inteira com qualquer lutador.

## Estrutura

```
sertao-fight-brasil/
  index.html
  css/style.css        interface (menus, diálogos, toque)
  js/util.js           utilitários, paleta, salvamento
  js/audio.js          síntese: zabumba, atabaque, pandeiro, agogô, efeitos, torcida
  js/input.js          teclado, toque, gamepad, dash
  js/fighters.js       os oito lutadores: stats, visual, frame data
  js/poses.js          rig esquelético e poses
  js/render.js         desenho xilogravura, projéteis, efeitos
  js/stages.js         oito cenários, torcida, fogueira
  js/fighter.js        máquina de estados do lutador
  js/ai.js             IA por intenção e personalidade
  js/game.js           partida: rodadas, Energia, colisões, chefe, tutorial, HUD
  js/story.js          cordéis, diálogos, garrafadas, finais
  js/ui.js             telas em DOM
  js/main.js           loop fixo a 60fps e fluxo de modos
```
