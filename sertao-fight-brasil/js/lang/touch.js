'use strict';
// Traduções dos controles de toque: alavanca, botões, tela de ajuste, como jogar no celular e o treino com toque. [português, inglês, espanhol]
M.i18n.add([
  // ---------- botões na tela ----------
  ['EX', 'EX', 'EX'], ['DASH', 'DASH', 'DASH'],
  // ---------- tela de ajuste ----------
  ['PAINEL DE TOQUE', 'TOUCH PANEL', 'PANEL TÁCTIL'],
  ['ALAVANCA', 'JOYSTICK', 'PALANCA'], ['FIXA', 'FIXED', 'FIJA'], ['FLUTUANTE', 'FLOATING', 'FLOTANTE'],
  ['TAMANHO', 'SIZE', 'TAMAÑO'], ['PEQUENO', 'SMALL', 'PEQUEÑO'], ['MÉDIO', 'MEDIUM', 'MEDIANO'], ['GRANDE', 'LARGE', 'GRANDE'],
  ['LADO DA ALAVANCA', 'JOYSTICK SIDE', 'LADO DE LA PALANCA'], ['ESQUERDO', 'LEFT', 'IZQUIERDO'], ['DIREITO', 'RIGHT', 'DERECHO'],
  ['Alavanca de 8 direções: cima pula, baixo agacha. Dash: toque duplo para o lado ou botão DASH. EX: FORTE + ESPECIAL juntos. Toque na alavanca e nos botões para testar.',
    '8-way joystick: up jumps, down crouches. Dash: double-tap sideways or the DASH button. EX: HEAVY + SPECIAL together. Touch the joystick and the buttons to try them.',
    'Palanca de 8 direcciones: arriba salta, abajo agacha. Dash: doble toque lateral o el botón DASH. EX: FUERTE + ESPECIAL juntos. Toca la palanca y los botones para probarlos.'],
  // ---------- pausa ----------
  ['Toque: alavanca + LEVE • FORTE • ESP. • EX • AGARRA • ARREDA • PEIA • DASH • PROVOCA', 'Touch: joystick + LIGHT • HEAVY • SPEC. • EX • GRAB • DODGE • PEIA • DASH • TAUNT', 'Táctil: palanca + LIGERO • FUERTE • ESP. • EX • AGARRA • ESQUIVA • PEIA • DASH • PROVOCA'],
  // ---------- como jogar (celular) ----------
  ['CONTROLES DE TOQUE', 'TOUCH CONTROLS', 'CONTROLES TÁCTILES'],
  ['VER CONTROLES DO TECLADO', 'SHOW KEYBOARD CONTROLS', 'VER CONTROLES DE TECLADO'], ['VER CONTROLES DE TOQUE', 'SHOW TOUCH CONTROLS', 'VER CONTROLES TÁCTILES'],
  ['alavanca: ◀ ▶ anda • ▲ pula • ▼ agacha (as diagonais valem)', 'joystick: ◀ ▶ walks • ▲ jumps • ▼ crouches (diagonals count)', 'palanca: ◀ ▶ camina • ▲ salta • ▼ agacha (valen las diagonales)'],
  ['LEVE', 'LIGHT', 'LIGERO'], ['FORTE', 'HEAVY', 'FUERTE'], ['ESP.', 'SPEC.', 'ESP.'],
  ['ARREDA (com a alavanca pra frente, atravessa o rival)', 'DODGE (with the joystick forward, it passes through the rival)', 'ESQUIVA (con la palanca hacia delante, atraviesa al rival)'],
  ['AGARRA (ou LEVE + FORTE juntos)', 'GRAB (or LIGHT + HEAVY together)', 'AGARRA (o LIGERO + FUERTE juntos)'],
  ['botão DASH, ou toque duplo na alavanca ◀ ▶', 'DASH button, or double-tap the joystick ◀ ▶', 'botón DASH, o doble toque en la palanca ◀ ▶'],
  ['DASH e logo FORTE', 'DASH and then HEAVY right away', 'DASH y enseguida FUERTE'],
  ['alavanca pra frente + ESP. • pra trás + FORTE (exclusivos de cada lutador)', 'joystick forward + SPEC. • back + HEAVY (unique to each fighter)', 'palanca hacia delante + ESP. • hacia atrás + FUERTE (exclusivos de cada luchador)'],
  ['DASH e segurar a alavanca pra frente', 'DASH and hold the joystick forward', 'DASH y mantener la palanca hacia delante'],
  ['DASH no ar (1 por pulo)', 'DASH in the air (1 per jump)', 'DASH en el aire (1 por salto)'],
  ['alavanca ▼ e logo ▲', 'joystick ▼ then ▲ right away', 'palanca ▼ y enseguida ▲'],
  ['▲ encostado na borda', '▲ against the edge', '▲ pegado al borde'],
  ['◀ ou ▶ no chão', '◀ or ▶ on the ground', '◀ o ▶ en el suelo'],
  ['botão EX (gasta 25% de Energia)', 'EX button (spends 25% Energy)', 'botón EX (gasta 25% de Energía)'],
  ['Rasteira / anti-aéreo', 'Sweep / anti-air', 'Barrida / antiaéreo'], ['alavanca ▼ + FORTE / ▼ + ESP.', 'joystick ▼ + HEAVY / ▼ + SPEC.', 'palanca ▼ + FUERTE / ▼ + ESP.'],
  ['botão II (ou o botão voltar do Android)', 'II button (or the Android back button)', 'botón II (o el botón atrás de Android)'],
  ['Ajuste tamanho, lado e tipo da alavanca em OPÇÕES › CONTROLES DE TOQUE.', 'Adjust the joystick size, side and type in OPTIONS › TOUCH CONTROLS.', 'Ajusta el tamaño, el lado y el tipo de la palanca en OPCIONES › CONTROLES TÁCTILES.'],
  // ---------- treino com toque ----------
  ['SPARRING: o Mestre luta de verdade. Use a alavanca ◀ ▶ para andar e chegue perto dele.', 'SPARRING: the Master really fights. Use the joystick ◀ ▶ to walk and get close to him.', 'SPARRING: el Maestro pelea de verdad. Usa la palanca ◀ ▶ para caminar y acércate a él.'],
  ['Alavanca ▲ = pular. Pule duas vezes. (Alavanca na diagonal ↗ pula por cima dele.)', 'Joystick ▲ = jump. Jump twice. (Joystick diagonal ↗ jumps over him.)', 'Palanca ▲ = saltar. Salta dos veces. (Palanca en diagonal ↗ salta por encima de él.)'],
  ['LEVE = golpe leve. Acerte o Mestre 3 vezes. Dica: LEVE, LEVE, LEVE vira uma string de três golpes!', 'LIGHT = light attack. Hit the Master 3 times. Tip: LIGHT, LIGHT, LIGHT becomes a three-hit string!', 'LIGERO = golpe ligero. Acierta al Maestro 3 veces. Pista: ¡LIGERO, LIGERO, LIGERO se vuelve una cadena de tres golpes!'],
  ['FORTE = golpe forte. Alavanca ▼ + FORTE é a RASTEIRA, que derruba. Acerte uma.', 'HEAVY = heavy attack. Joystick ▼ + HEAVY is the SWEEP, which knocks down. Land one.', 'FUERTE = golpe fuerte. Palanca ▼ + FUERTE es la BARRIDA, que derriba. Acierta una.'],
  ['ESP. = especial. Alavanca ▼ + ESP. é o ANTI-AÉREO. Acerte 2 especiais.', 'SPEC. = special. Joystick ▼ + SPEC. is the ANTI-AIR. Land 2 specials.', 'ESP. = especial. Palanca ▼ + ESP. es el ANTIAÉREO. Acierta 2 especiales.'],
  ['AGARRA (ou LEVE + FORTE juntos) = AGARRÃO. Quebra a defesa de quem só bloqueia. Agarre o Mestre.', 'GRAB (or LIGHT + HEAVY together) = THROW. It breaks the guard of anyone who only blocks. Grab the Master.', 'AGARRA (o LIGERO + FUERTE juntos) = AGARRE. Rompe la defensa de quien solo bloquea. Agarra al Maestro.'],
  ['ARREDA = esquiva. Esquive NO MOMENTO do golpe: ESQUIVA PERFEITA.', 'DODGE = sidestep. Dodge AT THE MOMENT of the blow: PERFECT DODGE.', 'ESQUIVA = esquiva. Esquiva EN EL MOMENTO del golpe: ESQUIVA PERFECTA.'],
  ['PEIA! Solte sua técnica máxima.', 'PEIA! Unleash your ultimate technique.', '¡PEIA! Suelta tu técnica máxima.']
]);
// "TREINO — BONECO: <modo>  (ESC pra mudar)" no teclado e "(pause pra mudar)" no toque
(function () {
  const L = { 'PARADO': ['STANDING', 'QUIETO'], 'DEFENDE': ['BLOCKING', 'DEFIENDE'], 'PULA': ['JUMPING', 'SALTA'], 'LUTA (CPU)': ['FIGHTING (CPU)', 'PELEA (CPU)'] };
  const f = (i, t) => (m, tail) => (i ? 'ENTRENAMIENTO — MUÑECO: ' : 'TRAINING — DUMMY: ') + (L[m] ? L[m][i] : m) + '  (' + (tail === 'ESC' ? (i ? 'ESC para cambiar' : 'ESC to change') : (i ? 'pausa para cambiar' : 'pause to change')) + ')';
  M.i18n.pat(/^TREINO — BONECO: (.+)  \((ESC|pause) pra mudar\)$/, f(0), f(1), true);
})();
