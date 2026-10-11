'use strict';
// Traduções do modo Competitivo: ranqueada, torneio local, replays, dados de quadros e modo transmissão.
M.i18n.add([
  // ---------- menu e central ----------
  ['COMPETITIVO', 'COMPETITIVE', 'COMPETITIVO'],
  ['ranqueada, torneio local, replays e dados de quadros', 'ranked, local tournament, replays and frame data', 'clasificatoria, torneo local, repeticiones y datos de cuadros'],
  ['COLOCAÇÃO', 'PLACEMENT', 'COLOCACIÓN'],
  ['TAG', 'TAG', 'TAG'], ['JOGADOR', 'PLAYER', 'JUGADOR'],
  ['Melhor PR', 'Best PR', 'Mejor PR'],
  ['JOGAR RANQUEADA', 'PLAY RANKED', 'JUGAR CLASIFICATORIA'],
  ['TORNEIO LOCAL', 'LOCAL TOURNAMENT', 'TORNEO LOCAL'],
  ['REPLAYS', 'REPLAYS', 'REPETICIONES'],
  ['DADOS DE QUADROS', 'FRAME DATA', 'DATOS DE CUADROS'],
  ['HISTÓRICO', 'HISTORY', 'HISTORIAL'],
  ['CONFRONTOS', 'MATCHUPS', 'ENFRENTAMIENTOS'],
  ['BRONZE', 'BRONZE', 'BRONCE'], ['PRATA', 'SILVER', 'PLATA'], ['OURO', 'GOLD', 'ORO'], ['PLATINA', 'PLATINUM', 'PLATINO'],
  ['DIAMANTE', 'DIAMOND', 'DIAMANTE'], ['MESTRE', 'MASTER', 'MAESTRO'], ['LENDA DA BRASA', 'EMBER LEGEND', 'LEYENDA DE LA BRASA'],
  ['Nenhuma partida ranqueada ainda. Entre na rinha!', 'No ranked matches yet. Jump into the brawl!', 'Todavía no hay partidas clasificatorias. ¡Entra a la riña!'],
  ['Vitórias–derrotas na ranqueada: seu lutador (linhas) contra o adversário (colunas).', 'Wins–losses in ranked: your fighter (rows) against the opponent (columns).', 'Victorias–derrotas en clasificatoria: tu luchador (filas) contra el rival (columnas).'],

  // ---------- ranqueada ----------
  ['RANQUEADA', 'RANKED', 'CLASIFICATORIA'],
  ['PARTIDA RANQUEADA', 'RANKED MATCH', 'PARTIDA CLASIFICATORIA'],
  ['Melhor de 3 rodadas, 99 segundos, sem modificadores. A CPU é sorteada e ajustada ao seu nível: vença para subir de divisão, perca e a pontuação cai.',
    'Best of 3 rounds, 99 seconds, no modifiers. The CPU opponent is drawn at random and tuned to your level: win to climb divisions, lose and your points drop.',
    'Al mejor de 3 rondas, 99 segundos, sin modificadores. La CPU se sortea y se ajusta a tu nivel: gana para subir de división, pierde y bajan tus puntos.'],
  ['VITÓRIA RANQUEADA', 'RANKED VICTORY', 'VICTORIA CLASIFICATORIA'],
  ['DERROTA', 'DEFEAT', 'DERROTA'], ['DESISTÊNCIA', 'FORFEIT', 'ABANDONO'],
  ['✦ SUBIU DE NÍVEL!', '✦ RANKED UP!', '✦ ¡SUBISTE DE NIVEL!'],
  ['✦ SUBIU DE DIVISÃO!', '✦ DIVISION UP!', '✦ ¡SUBISTE DE DIVISIÓN!'],
  ['Você caiu de divisão. Volta com tudo!', 'You dropped a division. Come back stronger!', 'Bajaste de división. ¡Vuelve con todo!'],
  [': a CPU está medindo o seu nível.', ': the CPU is sizing up your level.', ': la CPU está midiendo tu nivel.'],
  ['Colocação', 'Placement', 'Colocación'],
  ['Placar', 'Score', 'Marcador'],
  ['OUTRA PARTIDA', 'ANOTHER MATCH', 'OTRA PARTIDA'],
  ['VER REPLAY', 'WATCH REPLAY', 'VER REPETICIÓN'],
  ['CENTRAL COMPETITIVA', 'COMPETITIVE HUB', 'CENTRAL COMPETITIVA'],
  ['Medindo Forças', 'Sizing Each Other Up', 'Midiendo Fuerzas'], ['Termine as cinco partidas de colocação da Ranqueada.', 'Finish the five placement matches of Ranked.', 'Termina las cinco partidas de colocación de la Clasificatoria.'],
  ['Cabra de Ouro', 'Golden Goat', 'Cabra de Oro'], ['Chegue ao nível Ouro na Ranqueada.', 'Reach the Gold tier in Ranked.', 'Llega al nivel Oro en la Clasificatoria.'],
  ['Mestre da Rinha', 'Brawl Master', 'Maestro de la Riña'], ['Chegue ao nível Mestre na Ranqueada.', 'Reach the Master tier in Ranked.', 'Llega al nivel Maestro en la Clasificatoria.'],
  ['Lenda da Brasa', 'Ember Legend', 'Leyenda de la Brasa'], ['Chegue ao nível Lenda da Brasa na Ranqueada.', 'Reach the Ember Legend tier in Ranked.', 'Llega al nivel Leyenda de la Brasa en la Clasificatoria.'],
  ['Invicto', 'Undefeated', 'Invicto'], ['Vença cinco partidas ranqueadas seguidas.', 'Win five ranked matches in a row.', 'Gana cinco partidas clasificatorias seguidas.'],
  ['Organizador', 'Organizer', 'Organizador'], ['Complete um Torneio Local.', 'Complete a Local Tournament.', 'Completa un Torneo Local.'],
  ['Campeão da Praça', 'Town Square Champion', 'Campeón de la Plaza'], ['Seja campeão de um Torneio Local.', 'Win a Local Tournament.', 'Sé campeón de un Torneo Local.'],
  ['Cinema da Rinha', 'Brawl Cinema', 'Cine de la Riña'], ['Assista a um replay.', 'Watch a replay.', 'Mira una repetición.'],
  ['Compartilha Essa', 'Share This One', 'Comparte Esta'], ['Gere o código de um replay para compartilhar.', 'Generate a replay code to share.', 'Genera el código de una repetición para compartir.'],
  ['Rato de Planilha', 'Spreadsheet Rat', 'Rata de Planilla'], ['Abra os Dados de Quadros.', 'Open the Frame Data.', 'Abre los Datos de Cuadros.'],

  // ---------- replays ----------
  ['Nenhum replay guardado. As lutas de Versus, da Ranqueada, do Desafio do Dia e do Torneio são gravadas sozinhas.', 'No replays saved yet. Versus, Ranked, Daily Challenge and Tournament fights are recorded automatically.', 'No hay repeticiones guardadas. Las peleas de Versus, Clasificatoria, Desafío del Día y Torneo se graban solas.'],
  ['IMPORTAR CÓDIGO', 'IMPORT CODE', 'IMPORTAR CÓDIGO'],
  ['TORNEIO', 'TOURNAMENT', 'TORNEO'], ['VERSUS', 'VERSUS', 'VERSUS'],
  ['REPLAY', 'REPLAY', 'REPETICIÓN'],
  ['ASSISTIR', 'WATCH', 'VER'], ['FAVORITAR', 'FAVORITE', 'FAVORITO'], ['TIRAR DOS FAVORITOS', 'UNFAVORITE', 'QUITAR DE FAVORITOS'], ['COPIAR CÓDIGO', 'COPY CODE', 'COPIAR CÓDIGO'], ['APAGAR', 'DELETE', 'BORRAR'],
  ['CÓDIGO DO REPLAY', 'REPLAY CODE', 'CÓDIGO DE LA REPETICIÓN'],
  ['Copie e mande para quem quiser: o código contém a luta inteira', 'Copy it and send it to anyone: the code holds the whole fight', 'Cópialo y mándalo a quien quieras: el código contiene la pelea completa'],
  ['COPIAR', 'COPY', 'COPIAR'], ['COPIADO!', 'COPIED!', '¡COPIADO!'],
  ['IMPORTAR REPLAY', 'IMPORT REPLAY', 'IMPORTAR REPETICIÓN'],
  ['Cole aqui o código que você recebeu (começa com SFB).', 'Paste the code you received here (it starts with SFB).', 'Pega aquí el código que recibiste (empieza con SFB).'],
  ['IMPORTAR E ASSISTIR', 'IMPORT AND WATCH', 'IMPORTAR Y VER'],
  ['Código inválido ou de outra versão do jogo.', 'Invalid code, or from another version of the game.', 'Código inválido o de otra versión del juego.'],
  ['← → velocidade • J pausa • ESC menu', '← → speed • J pause • ESC menu', '← → velocidad • J pausa • ESC menú'],

  // ---------- dados de quadros ----------
  ['Vida', 'Health', 'Vida'], ['Velocidade', 'Speed', 'Velocidad'], ['Dash', 'Dash', 'Dash'], ['Pulos', 'Jumps', 'Saltos'], ['Peso', 'Weight', 'Peso'],
  ['CMD', 'CMD', 'CMD'], ['GOLPE', 'MOVE', 'GOLPE'], ['TIPO', 'TYPE', 'TIPO'], ['INÍCIO', 'STARTUP', 'INICIO'], ['ATIVO', 'ACTIVE', 'ACTIVO'], ['RECUP.', 'RECOV.', 'RECUP.'], ['TOTAL', 'TOTAL', 'TOTAL'],
  ['DANO', 'DAMAGE', 'DAÑO'], ['ACERTO', 'ON HIT', 'AL GOLPEAR'], ['DEFESA', 'ON BLOCK', 'AL DEFENDER'], ['NOTAS', 'NOTES', 'NOTAS'],
  ['ALTO', 'HIGH', 'ALTO'], ['MÉDIO', 'MID', 'MEDIO'], ['BAIXO', 'LOW', 'BAJO'],
  ['LANÇA', 'LAUNCH', 'LANZA'],
  ['PEIA', 'PEIA', 'PEIA'], ['NO AR', 'AIR', 'AÉREO'], ['AGARRÃO', 'THROW', 'AGARRE'], ['ARMADURA', 'ARMOR', 'ARMADURA'], ['INVULNERÁVEL', 'INVULNERABLE', 'INVULNERABLE'], ['PROJÉTIL', 'PROJECTILE', 'PROYECTIL'],
  ['MULTIGOLPE', 'MULTI-HIT', 'MULTIGOLPE'], ['TELEPORTE', 'TELEPORT', 'TELETRANSPORTE'], ['CONTRA-GOLPE', 'COUNTER', 'CONTRAGOLPE'], ['REFLETE', 'REFLECTS', 'REFLEJA'], ['PLANA', 'GLIDES', 'PLANEA'],
  ['ROUBA VIDA', 'STEALS HEALTH', 'ROBA VIDA'], ['PUXA', 'PULLS', 'JALA'], ['QUEIMA', 'BURNS', 'QUEMA'], ['ARMADILHA', 'TRAP', 'TRAMPA'], ['CURA', 'HEALS', 'CURA'], ['DRENA ENERGIA', 'DRAINS ENERGY', 'DRENA ENERGÍA'],
  ['ESCURECE', 'DARKENS', 'OSCURECE'], ['REFORÇO', 'BUFF', 'REFUERZO'], ['TONTURA', 'DIZZY', 'MAREO'],
  ['Vantagem = quadros que você age antes do rival (positivo) ou depois (negativo). KD = derruba. ▸ = golpes para cancelar. Contato no primeiro quadro ativo.', 'Advantage = frames you act before your rival (positive) or after (negative). KD = knockdown. ▸ = moves it can cancel into. Contact on the first active frame.', 'Ventaja = cuadros que actúas antes que el rival (positivo) o después (negativo). KD = derriba. ▸ = golpes a los que cancela. Contacto en el primer cuadro activo.'],
  ['Rato de Planilha', 'Spreadsheet Rat', 'Rata de Planilla'],

  // ---------- torneio ----------
  ['NOVO TORNEIO', 'NEW TOURNAMENT', 'NUEVO TORNEO'], ['CONTINUAR TORNEIO', 'RESUME TOURNAMENT', 'CONTINUAR TORNEO'], ['VER RESULTADO FINAL', 'SEE FINAL RESULTS', 'VER RESULTADO FINAL'],
  ['REGRAS DO TORNEIO', 'TOURNAMENT RULES', 'REGLAS DEL TORNEO'],
  ['Chaves de eliminação simples ou dupla para 3 a 16 jogadores no mesmo aparelho, com séries melhor de 1, 3 ou 5, banimento de cenário e o vencedor mantendo o lutador. CPUs podem completar a chave.',
    'Single or double elimination brackets for 3 to 16 players on the same device, with best-of-1, 3 or 5 sets, stage bans and winner-keeps-fighter. CPUs can fill the bracket.',
    'Llaves de eliminación simple o doble para 3 a 16 jugadores en el mismo equipo, con series al mejor de 1, 3 o 5, baneo de escenario y el ganador conserva su luchador. Las CPU pueden completar la llave.'],
  ['Série', 'Set', 'Serie'],
  ['melhor de 1, 3 ou 5 jogos. Cada jogo é uma luta de 2 rodadas vencidas, 99 segundos, sem modificadores.', 'best of 1, 3 or 5 games. Each game is a fight to 2 rounds, 99 seconds, no modifiers.', 'al mejor de 1, 3 o 5 juegos. Cada juego es una pelea a 2 rondas ganadas, 99 segundos, sin modificadores.'],
  ['Cenários', 'Stages', 'Escenarios'],
  ['seis cenários de leitura limpa. No jogo 1, os dois jogadores banem um cenário por vez (o de melhor semente começa) até sobrar um. Nos jogos seguintes, quem perdeu escolhe o cenário.', 'six clean, readable stages. In game 1, both players take turns banning a stage (the better seed goes first) until one is left. In later games, the loser picks the stage.', 'seis escenarios de lectura limpia. En el juego 1, los dos jugadores banean un escenario por turno (empieza el de mejor semilla) hasta que quede uno. En los siguientes, quien perdió elige el escenario.'],
  ['Lutadores', 'Fighters', 'Luchadores'],
  ['no jogo 1, cada um escolhe o seu. Depois, quem venceu mantém o lutador e quem perdeu pode trocar (opção ligada por padrão).', 'in game 1, each player picks theirs. After that, the winner keeps their fighter and the loser may switch (on by default).', 'en el juego 1, cada uno elige el suyo. Después, quien ganó conserva el luchador y quien perdió puede cambiar (activado por defecto).'],
  ['Chaves', 'Brackets', 'Llaves'],
  ['eliminação simples, ou dupla com chave dos perdedores e grande final com reset. As CPUs da chave jogam entre si sozinhas.', 'single elimination, or double with a losers bracket and a grand final with reset. CPUs in the bracket play each other on their own.', 'eliminación simple, o doble con llave de perdedores y gran final con reinicio. Las CPU de la llave juegan entre ellas solas.'],
  ['Vagas sobrando', 'Empty slots', 'Lugares libres'],
  ['se faltar gente para fechar a chave, as melhores sementes avançam direto (bye).', 'if the bracket is not full, the top seeds advance automatically (bye).', 'si falta gente para cerrar la llave, las mejores semillas avanzan directo (bye).'],
  ['Replays', 'Replays', 'Repeticiones'],
  ['cada jogo é gravado, e fica na lista de Replays para revisar ou compartilhar.', 'every game is recorded and kept in the Replays list to review or share.', 'cada juego se graba y queda en la lista de Repeticiones para revisar o compartir.'],
  ['Controles', 'Controls', 'Controles'],
  ['o jogador da esquerda usa WASD + J K L; o da direita, setas + Num1 Num2 Num3 (ou controles). Quando um humano enfrenta uma CPU, ele joga com o teclado da esquerda.', 'the left player uses WASD + J K L; the right one, arrows + Num1 Num2 Num3 (or gamepads). When a human faces a CPU, they play on the left keys.', 'el jugador de la izquierda usa WASD + J K L; el de la derecha, flechas + Num1 Num2 Num3 (o mandos). Cuando un humano enfrenta a una CPU, juega con el teclado de la izquierda.'],
  ['NOME', 'NAME', 'NOMBRE'], ['FORMATO', 'FORMAT', 'FORMATO'],
  ['ELIMINAÇÃO DUPLA', 'DOUBLE ELIMINATION', 'ELIMINACIÓN DOBLE'], ['ELIMINAÇÃO SIMPLES', 'SINGLE ELIMINATION', 'ELIMINACIÓN SIMPLE'],
  ['SÉRIE', 'SET', 'SERIE'], ['MELHOR DE', 'BEST OF', 'AL MEJOR DE'],
  ['VENCEDOR MANTÉM O LUTADOR', 'WINNER KEEPS FIGHTER', 'EL GANADOR CONSERVA EL LUCHADOR'],
  ['CHAVES', 'BRACKET', 'LLAVES'], ['SORTEADAS', 'RANDOM', 'SORTEADAS'], ['NA ORDEM DA LISTA', 'IN LIST ORDER', 'EN ORDEN DE LA LISTA'],
  ['JOGADORES', 'PLAYERS', 'JUGADORES'],
  ['HUMANO', 'HUMAN', 'HUMANO'], ['CPU NOVATO', 'CPU ROOKIE', 'CPU NOVATO'], ['CPU BRABO', 'CPU TOUGH', 'CPU BRAVO'], ['CPU LENDÁRIO', 'CPU LEGENDARY', 'CPU LEGENDARIO'],
  ['INICIAR TORNEIO', 'START TOURNAMENT', 'INICIAR TORNEO'], ['TORNEIO DA RINHA', 'BRAWL TOURNAMENT', 'TORNEO DE LA RIÑA'],
  ['CHAVE', 'BRACKET', 'LLAVE'], ['CHAVE DOS VENCEDORES', 'WINNERS BRACKET', 'LLAVE DE GANADORES'], ['CHAVE DOS PERDEDORES', 'LOSERS BRACKET', 'LLAVE DE PERDEDORES'],
  ['GRANDE FINAL', 'GRAND FINAL', 'GRAN FINAL'], ['GRANDE FINAL (RESET)', 'GRAND FINAL (RESET)', 'GRAN FINAL (REINICIO)'],
  ['FINAL', 'FINAL', 'FINAL'], ['SEMIFINAL', 'SEMIFINAL', 'SEMIFINAL'], ['QUARTAS', 'QUARTERFINALS', 'CUARTOS'],
  ['FINAL DOS VENCEDORES', 'WINNERS FINAL', 'FINAL DE GANADORES'], ['SEMI DOS VENCEDORES', 'WINNERS SEMIFINAL', 'SEMI DE GANADORES'],
  ['FINAL DOS PERDEDORES', 'LOSERS FINAL', 'FINAL DE PERDEDORES'], ['SEMI DOS PERDEDORES', 'LOSERS SEMIFINAL', 'SEMI DE PERDEDORES'],
  ['PRÓXIMA', 'NEXT', 'SIGUIENTE'], ['EM ANDAMENTO', 'IN PROGRESS', 'EN CURSO'],
  ['CONTINUAR SÉRIE', 'RESUME SET', 'CONTINUAR SERIE'], ['JOGAR PRÓXIMA PARTIDA', 'PLAY NEXT MATCH', 'JUGAR SIGUIENTE PARTIDA'],
  ['COPIAR RESULTADOS', 'COPY RESULTS', 'COPIAR RESULTADOS'], ['SAIR (FICA SALVO)', 'EXIT (SAVED)', 'SALIR (QUEDA GUARDADO)'],
  ['Jogo interrompido: ele será refeito quando você continuar a série.', 'Game interrupted: it will be replayed when you resume the set.', 'Juego interrumpido: se repetirá cuando continúes la serie.'],
  ['COMEÇAR', 'START', 'EMPEZAR'], ['VOLTAR ÀS CHAVES', 'BACK TO BRACKET', 'VOLVER A LAS LLAVES'],
  ['primeiro a vencer', 'first to win', 'primero en ganar'], ['jogos', 'games', 'juegos'], ['JOGO', 'GAME', 'JUEGO'],
  ['A CPU escolhe sozinha.', 'The CPU picks on its own.', 'La CPU elige sola.'],
  ['Esquerda: WASD + J K L • Direita: setas + Num1 Num2 Num3.', 'Left: WASD + J K L • Right: arrows + Num1 Num2 Num3.', 'Izquierda: WASD + J K L • Derecha: flechas + Num1 Num2 Num3.'],
  ['A CPU escolhe o lutador dela sozinha.', 'The CPU picks its own fighter.', 'La CPU elige su luchador sola.'],
  ['ESCOLHE', 'PICKS', 'ELIGE'], ['CONFIRMAR', 'CONFIRM', 'CONFIRMAR'],
  ['BANIMENTO DE CENÁRIO', 'STAGE BAN', 'BANEO DE ESCENARIO'], ['ESCOLHA DO CENÁRIO', 'STAGE PICK', 'ELECCIÓN DE ESCENARIO'],
  ['bane um cenário', 'bans a stage', 'banea un escenario'], ['restantes', 'left', 'restantes'], ['escolhe o cenário do próximo jogo', 'picks the next game\'s stage', 'elige el escenario del próximo juego'],
  ['vence o jogo', 'wins the game', 'gana el juego'], ['Placar de rodadas', 'Round score', 'Marcador de rondas'],
  ['PRÓXIMO JOGO', 'NEXT GAME', 'SIGUIENTE JUEGO'], ['VER CHAVES', 'VIEW BRACKET', 'VER LLAVES'], ['VER AS CHAVES', 'VIEW THE BRACKET', 'VER LAS LLAVES'], ['VER O CAMPEÃO', 'SEE THE CHAMPION', 'VER AL CAMPEÓN'],
  ['vence a série', 'wins the set', 'gana la serie'],
  ['SIMULANDO', 'SIMULATING', 'SIMULANDO'], ['As CPUs estão brigando de verdade, só que mais rápido.', 'The CPUs are really fighting, just faster.', 'Las CPU pelean de verdad, solo que más rápido.'],
  ['CAMPEÃO', 'CHAMPION', 'CAMPEÓN'], ['BAIXAR .TXT', 'DOWNLOAD .TXT', 'DESCARGAR .TXT'], ['PARTIDAS', 'MATCHES', 'PARTIDAS'],

  // ---------- transmissão ----------
  ['MODO TRANSMISSÃO', 'BROADCAST MODE', 'MODO TRANSMISIÓN'],
  ['Esconder o painel (vídeos e prints)', 'Hide the HUD (videos and screenshots)', 'Ocultar el panel (videos y capturas)']
]);

(function () {
  const I = M.i18n, tr = M.tr;
  I.pat(/^JOGO (\d+)$/, 'GAME $1', 'JUEGO $1', true);
  I.pat(/^RODADA (\d+)$/, 'ROUND $1', 'RONDA $1', true);
  I.pat(/^VENCEDORES R(\d+)$/, 'WINNERS R$1', 'GANADORES R$1', true);
  I.pat(/^PERDEDORES R(\d+)$/, 'LOSERS R$1', 'PERDEDORES R$1', true);
  I.pat(/^VANTAGEM (NO ACERTO|NA DEFESA) ([+-]?\d+) • (.+)$/, (k, v, n) => 'ADVANTAGE ' + (k === 'NO ACERTO' ? 'ON HIT' : 'ON BLOCK') + ' ' + v + ' • ' + tr(n), (k, v, n) => 'VENTAJA ' + (k === 'NO ACERTO' ? 'AL GOLPEAR' : 'AL DEFENDER') + ' ' + v + ' • ' + tr(n), true);
  I.pat(/^▶ REPLAY\s+(\S+)$/, '▶ REPLAY $1', '▶ REPETICIÓN $1', true);
  I.pat(/^II PAUSADO\s+(\S+)$/, 'II PAUSED $1', 'II PAUSADO $1', true);
  I.pat(/^COMBO (\d+) • DANO (\d+) • RECORDE (\d+) \/ (\d+)$/, 'COMBO $1 • DAMAGE $2 • BEST $3 / $4', 'COMBO $1 • DAÑO $2 • RÉCORD $3 / $4', true);
})();
