# CAPOEIRA FIGHT BRASIL — A Roda Nunca Para

Jogo de luta 1v1 brasileiro, em xilogravura de cordel, feito do zero em HTML, CSS e JavaScript puro.
Sem dependências, sem assets externos: personagens, cenários, efeitos e música são todos procedurais.

**Quem tem Energia manda na roda.** A barra de poder é uma só, no meio da tela: o público.
Golpes variados, esquivas perfeitas e acertos no compasso do berimbau puxam a roda pro seu lado — e com 70% ela libera a sua Mandinga.

## Como executar

- Abra `capoeira-fight-brasil/index.html` direto no navegador (funciona via `file://`), ou
- Sirva a pasta com qualquer servidor estático: `python3 -m http.server 8000` e acesse `http://localhost:8000/capoeira-fight-brasil/`.

Funciona em desktop (teclado ou gamepad) e no celular (controles de toque, melhor na horizontal).

## Controles

| Ação | P1 | P2 |
| --- | --- | --- |
| Mover / pular / agachar | W A S D | Setas |
| Golpe leve | J | Num 1 ou , |
| Golpe forte | K | Num 2 ou . |
| Especial | L | Num 3 ou / |
| Ginga (esquiva) | Espaço | Num 0 ou Shift direito |
| Mandinga (super) | U | Num 5 ou ' |
| Provocar | O | Num 4 ou ; |
| Agarrão | H (ou J+K) | Num 6 ou ] |
| Dash | toque duplo ← / → | toque duplo ← / → |
| Pausa | ESC | ESC |

Variações: agachado + golpe (baixo), frente + forte (comando), golpes no ar, agachado + especial.

## Modos

- **História** — a Roda do Fogo com Zeca Ventania: tutorial, cinco rodas, patuás, chefe em duas fases e dois finais.

## Dinâmica

- **Energia**: barra única disputada pelos dois. Com 70% libera a Mandinga; com 100% ela vira **Mandinga Máxima** (+30% de dano).
- **Ginga**: esquiva com invencibilidade. Perfeita = câmera lenta, muita Energia e um **Contra-ataque** garantido no próximo golpe.
- **Agarrão** universal (H ou J+K) quebra defesa. **Escapar** de um combo de 3+ golpes custa 30% de Energia.
- **No Compasso**: acertar na batida do berimbau dobra a Energia. Bené Berimbau toca para alargar sua própria janela.
- **Versus** — dois jogadores no mesmo teclado.
- **Treino** — boneco configurável (parado, defende, pula, CPU).
- **Roda Livre** — liberado ao terminar a História: a roda inteira com qualquer lutador.

## Estrutura

```
capoeira-fight-brasil/
  index.html
  css/style.css        interface (menus, diálogos, toque)
  js/util.js           utilitários, paleta, salvamento
  js/audio.js          síntese: berimbau, atabaque, pandeiro, agogô, efeitos, torcida
  js/input.js          teclado, toque, gamepad, dash
  js/fighters.js       os sete lutadores: stats, visual, frame data
  js/poses.js          rig esquelético e poses
  js/render.js         desenho xilogravura, projéteis, efeitos
  js/stages.js         sete cenários, torcida, fogueira
  js/fighter.js        máquina de estados do lutador
  js/ai.js             IA por intenção e personalidade
  js/game.js           partida: rodadas, Energia, colisões, chefe, tutorial, HUD
  js/story.js          cordéis, diálogos, patuás, finais
  js/ui.js             telas em DOM
  js/main.js           loop fixo a 60fps e fluxo de modos
```
