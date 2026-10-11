'use strict';
// Traduções dos recursos extras: modificadores, regras, Maratona, Desafio do Dia, estatísticas, jukebox, cores.
M.i18n.add([
  // ---------- menu ----------
  ['MARATONA', 'MARATHON', 'MARATÓN'],
  ['DESAFIO DO DIA', 'DAILY CHALLENGE', 'DESAFÍO DEL DÍA'],
  ['EXTRAS', 'EXTRAS', 'EXTRAS'],
  ['volte de onde parou na Rinha do Fogo', 'pick up where you left off in the Fire Brawl', 'sigue donde lo dejaste en la Riña del Fuego'],
  ['continue a noite das assombrações', 'continue the night of the haunts', 'continúa la noche de las apariciones'],
  ['ondas sem fim, cada uma mais brava; a vida passa de luta em luta', 'endless waves, each one tougher; your health carries from fight to fight', 'oleadas sin fin, cada una más brava; tu vida pasa de pelea en pelea'],
  ['um duelo novo todo dia, com regras malucas e um objetivo bônus', 'a new duel every day, with crazy rules and a bonus goal', 'un duelo nuevo cada día, con reglas locas y un objetivo extra'],
  ['veja o que você já conquistou', 'see what you have already earned', 'mira lo que ya conseguiste'],
  ['estatísticas e jukebox', 'statistics and jukebox', 'estadísticas y jukebox'],
  ['controles, golpes e a regra da Energia', 'controls, moves and the Energy rule', 'controles, golpes y la regla de la Energía'],
  ['idioma, vídeo, áudio, teclas e acessibilidade', 'language, video, audio, keys and accessibility', 'idioma, vídeo, audio, teclas y accesibilidad'],
  ['quem fez a rinha', 'who made the brawl', 'quién hizo la riña'],
  ['fechar o jogo', 'close the game', 'cerrar el juego'],
  ['ESTATÍSTICAS', 'STATISTICS', 'ESTADÍSTICAS'],
  ['seu histórico de rinha', 'your brawling record', 'tu historial de riñas'],
  ['JUKEBOX', 'JUKEBOX', 'JUKEBOX'],
  ['as músicas de cada cenário', 'the music of every stage', 'la música de cada escenario'],

  // ---------- seleção: cor, regras, maratona ----------
  ['COR', 'COLOR', 'COLOR'],
  ['Original', 'Original', 'Original'], ['Folia', 'Carnival', 'Fiesta'], ['Noite', 'Night', 'Noche'],
  ['REGRAS', 'RULES', 'REGLAS'],
  ['L muda a cor', 'L changes color', 'L cambia el color'],
  ['MARATONA', 'MARATHON', 'MARATÓN'],
  ['A MARATONA', 'THE MARATHON', 'LA MARATÓN'],
  ['Adversários sem fim, cada onda mais brava. Sua vida passa de uma luta para a outra (com um respiro entre elas) e a cada três ondas você ganha uma garrafada. Quanto você aguenta?',
    'Endless opponents, each wave tougher. Your health carries over from one fight to the next (with a breather in between) and every three waves you get a potion. How long can you last?',
    'Rivales sin fin, cada oleada más brava. Tu vida pasa de una pelea a la otra (con un respiro entre ellas) y cada tres oleadas ganas un brebaje. ¿Cuánto aguantas?'],

  // ---------- regras da rinha ----------
  ['REGRAS DA RINHA', 'BRAWL RULES', 'REGLAS DE LA RIÑA'],
  ['RODADAS PARA VENCER', 'ROUNDS TO WIN', 'RONDAS PARA GANAR'],
  ['TEMPO DA RODADA', 'ROUND TIMER', 'TIEMPO DE RONDA'],
  ['SEM LIMITE', 'NO LIMIT', 'SIN LÍMITE'],
  ['MODIFICADORES', 'MODIFIERS', 'MODIFICADORES'],
  ['LIMPAR TUDO', 'RESET ALL', 'RESTABLECER TODO'],
  ['Quantas rodadas é preciso vencer para ganhar a luta.', 'How many rounds you must win to take the fight.', 'Cuántas rondas hay que ganar para llevarte la pelea.'],
  ['Tempo de cada rodada. Acabou o tempo, vence quem tem mais vida.', 'Time per round. When it runs out, whoever has more health wins.', 'Tiempo de cada ronda. Si se acaba, gana quien tenga más vida.'],
  ['Volta ao normal: 2 rodadas, 99 segundos e nenhum modificador.', 'Back to normal: 2 rounds, 99 seconds and no modifiers.', 'Vuelve a lo normal: 2 rondas, 99 segundos y ningún modificador.'],
  ['As regras ficam salvas para as próximas lutas.', 'Your rules are saved for the next fights.', 'Las reglas se guardan para las próximas peleas.'],
  ['Dano Dobrado', 'Double Damage', 'Daño Doble'],
  ['Todo golpe machuca o dobro. Rinha curta e brava.', 'Every hit hurts twice as much. Short, fierce brawls.', 'Cada golpe duele el doble. Riñas cortas y bravas.'],
  ['Vida Curta', 'Short Health', 'Vida Corta'],
  ['Metade da vida pra todo mundo.', 'Half health for everyone.', 'La mitad de vida para todos.'],
  ['Metade da vida pra todo mundo', 'Half health for everyone', 'La mitad de vida para todos'],
  ['Turbo', 'Turbo', 'Turbo'],
  ['Todo mundo anda e corre 30% mais rápido.', 'Everyone walks and runs 30% faster.', 'Todos caminan y corren un 30% más rápido.'],
  ['Gravidade da Lua', 'Moon Gravity', 'Gravedad de la Luna'],
  ['Pulos altos e longos; os combos no ar duram mais.', 'High, long jumps; air combos last longer.', 'Saltos altos y largos; los combos en el aire duran más.'],
  ['Torcida Eufórica', 'Rowdy Crowd', 'Público Eufórico'],
  ['A Energia enche duas vezes mais rápido: Peia pra todo lado.', 'Energy fills twice as fast: Peia everywhere.', 'La Energía se llena el doble de rápido: Peia por todos lados.'],
  ['Sangue Quente', 'Hot Blood', 'Sangre Caliente'],
  ['Cada golpe que acerta devolve 25% do dano em vida.', 'Every hit that lands gives back 25% of its damage as health.', 'Cada golpe que acierta devuelve el 25% del daño en vida.'],

  // ---------- maratona ----------
  ['PONTOS', 'POINTS', 'PUNTOS'],
  ['VIDA', 'HEALTH', 'VIDA'],
  ['CHEFE', 'BOSS', 'JEFE'],
  ['PRÓXIMA ONDA', 'NEXT WAVE', 'SIGUIENTE OLEADA'],
  ['PARAR POR AQUI', 'STOP HERE', 'PARAR AQUÍ'],
  ['Um respiro de 30% de vida entre as ondas. Cada três ondas, uma garrafada.', 'A 30% health breather between waves. Every three waves, a potion.', 'Un respiro de 30% de vida entre oleadas. Cada tres oleadas, un brebaje.'],
  ['CAIU NA MARATONA', 'DOWN IN THE MARATHON', 'CAÍSTE EN LA MARATÓN'],
  ['FIM DA MARATONA', 'MARATHON OVER', 'FIN DE LA MARATÓN'],
  ['NOVO RECORDE DE ONDAS', 'NEW WAVE RECORD', 'NUEVO RÉCORD DE OLEADAS'],
  ['NOVO RECORDE DE PONTOS', 'NEW POINTS RECORD', 'NUEVO RÉCORD DE PUNTOS'],
  ['Maratonas jogadas', 'Marathons played', 'Maratones jugadas'],
  ['DE NOVO', 'AGAIN', 'OTRA VEZ'],
  ['TROCAR LUTADOR', 'CHANGE FIGHTER', 'CAMBIAR LUCHADOR'],

  // ---------- desafio do dia ----------
  ['VOCÊ', 'YOU', 'TÚ'],
  ['OBJETIVO BÔNUS', 'BONUS GOAL', 'OBJETIVO EXTRA'],
  ['Vença sem sofrer nenhum dano.', 'Win without taking any damage.', 'Gana sin recibir ningún daño.'],
  ['Acerte um combo de 6 golpes ou mais.', 'Land a combo of 6 hits or more.', 'Conecta un combo de 6 golpes o más.'],
  ['Vença em menos de 45 segundos.', 'Win in under 45 seconds.', 'Gana en menos de 45 segundos.'],
  ['Faça 3 esquivas perfeitas.', 'Pull off 3 perfect dodges.', 'Haz 3 esquivas perfectas.'],
  ['Nocauteie com o arremate da Peia.', 'Knock out with the Peia finisher.', 'Noquea con el remate de la Peia.'],
  ['Sequência', 'Streak', 'Racha'],
  ['Melhor sequência', 'Best streak', 'Mejor racha'],
  ['Sequência:', 'Streak:', 'Racha:'],
  ['Hoje', 'Today', 'Hoy'],
  ['Hoje ainda não', 'Not yet today', 'Hoy todavía no'],
  ['dia', 'day', 'día'], ['dias', 'days', 'días'],
  ['JOGAR DE NOVO', 'PLAY AGAIN', 'JUGAR OTRA VEZ'],
  ['NÃO FOI DESSA VEZ', 'NOT THIS TIME', 'ESTA VEZ NO'],
  ['O desafio é o mesmo o dia todo. Treine e volte!', 'The challenge stays the same all day. Practice and come back!', 'El desafío es el mismo todo el día. ¡Entrena y vuelve!'],

  // ---------- estatísticas ----------
  ['GERAL', 'OVERALL', 'GENERAL'],
  ['Tempo jogado', 'Time played', 'Tiempo jugado'],
  ['Lutas', 'Fights', 'Peleas'],
  ['Vitórias', 'Wins', 'Victorias'],
  ['Derrotas', 'Losses', 'Derrotas'],
  ['Aproveitamento', 'Win rate', 'Rendimiento'],
  ['MODOS', 'MODES', 'MODOS'],
  ['Melhor história', 'Best story', 'Mejor historia'],
  ['Maratona', 'Marathon', 'Maratón'],
  ['Desafio do Dia', 'Daily Challenge', 'Desafío del Día'],
  ['Conquistas', 'Achievements', 'Logros'],
  ['COMBATE', 'COMBAT', 'COMBATE'],
  ['Golpes certeiros', 'Hits landed', 'Golpes certeros'],
  ['Dano causado', 'Damage dealt', 'Daño causado'],
  ['Maior combo', 'Best combo', 'Mejor combo'],
  ['Peias', 'Peias', 'Peias'],
  ['Arremates', 'Finishers', 'Remates'],
  ['Contra-golpes', 'Counters', 'Contragolpes'],
  ['Defesas', 'Blocks', 'Defensas'],
  ['LUTADORES', 'FIGHTERS', 'LUCHADORES'],
  ['FAVORITO:', 'FAVORITE:', 'FAVORITO:'],
  ['vitórias / lutas por lutador (só os que você controlou)', 'wins / fights per fighter (only the ones you controlled)', 'victorias / peleas por luchador (solo los que controlaste)'],

  // ---------- jukebox ----------
  ['TOCANDO', 'NOW PLAYING', 'SONANDO'],
  ['CALMA', 'CALM', 'CALMA'], ['ANIMADA', 'LIVELY', 'ANIMADA'], ['NO ÁPICE', 'AT THE PEAK', 'EN LO ALTO'],
  ['Menu principal', 'Main menu', 'Menú principal'],
  ['Final da História', 'Story ending', 'Final de la Historia'],
  ['Chefe: Mestre Cinzas', 'Boss: Master Cinzas', 'Jefe: Maestro Cinzas'],
  ['Chefe: fase final', 'Boss: final phase', 'Jefe: fase final'],

  // ---------- conquistas ----------
  ['Maratonista', 'Marathoner', 'Maratonista'], ['Chegue à onda 5 da Maratona.', 'Reach wave 5 of the Marathon.', 'Llega a la oleada 5 de la Maratón.'],
  ['Fôlego de Boi', 'Ox Lungs', 'Aliento de Buey'], ['Chegue à onda 10 da Maratona.', 'Reach wave 10 of the Marathon.', 'Llega a la oleada 10 de la Maratón.'],
  ['Lenda da Maratona', 'Marathon Legend', 'Leyenda de la Maratón'], ['Chegue à onda 20 da Maratona.', 'Reach wave 20 of the Marathon.', 'Llega a la oleada 20 de la Maratón.'],
  ['Desafio Aceito', 'Challenge Accepted', 'Desafío Aceptado'], ['Vença um Desafio do Dia.', 'Win a Daily Challenge.', 'Gana un Desafío del Día.'],
  ['Três Dias Seguidos', 'Three Days in a Row', 'Tres Días Seguidos'], ['Vença o Desafio do Dia em três dias seguidos.', 'Win the Daily Challenge three days in a row.', 'Gana el Desafío del Día tres días seguidos.'],
  ['Estrela do Dia', 'Star of the Day', 'Estrella del Día'], ['Cumpra o objetivo bônus de um Desafio do Dia.', 'Complete the bonus goal of a Daily Challenge.', 'Cumple el objetivo extra de un Desafío del Día.'],
  ['Rinha Maluca', 'Crazy Brawl', 'Riña Loca'], ['Vença a CPU com dois modificadores ligados.', 'Beat the CPU with two modifiers on.', 'Vence a la CPU con dos modificadores activados.'],
  ['Cara Nova', 'New Look', 'Cara Nueva'], ['Vença uma luta com uma cor alternativa.', 'Win a fight with an alternate color.', 'Gana una pelea con un color alternativo.'],
  ['Ouvido Absoluto', 'Perfect Pitch', 'Oído Absoluto'], ['Ouça todas as faixas do Jukebox.', 'Listen to every Jukebox track.', 'Escucha todas las pistas del Jukebox.']
]);

(function () {
  const I = M.i18n;
  I.pat(/^ONDA (\d+)$/, 'WAVE $1', 'OLEADA $1');
  I.pat(/^ONDA (\d+) VENCIDA$/, 'WAVE $1 CLEARED', 'OLEADA $1 SUPERADA');
  I.pat(/^(\d+) ONDAS?$/, (n) => n + (n === '1' ? ' WAVE' : ' WAVES'), (n) => n + (n === '1' ? ' OLEADA' : ' OLEADAS'));
  I.pat(/^\+(\d+) PONTOS$/, '+$1 POINTS', '+$1 PUNTOS');
  I.pat(/^Total (\d+)$/, 'Total $1', 'Total $1');
  I.pat(/^Recorde de onda (\d+)$/, 'Wave record $1', 'Récord de oleadas $1');
  I.pat(/^Recordes: onda (\d+)$/, 'Records: wave $1', 'Récords: oleada $1');
  I.pat(/^(\d+) pontos$/, '$1 points', '$1 puntos');
  I.pat(/^Maior combo (\d+)$/, 'Best combo $1', 'Mejor combo $1');
  I.pat(/^Vida (\S+)$/, 'Health $1', 'Vida $1');
  I.pat(/^(\d+)\/(\d+) faixas ouvidas$/, '$1/$2 tracks heard', '$1/$2 pistas escuchadas');
})();
