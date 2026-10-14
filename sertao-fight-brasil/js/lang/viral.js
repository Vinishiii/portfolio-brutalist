'use strict';
// Traduções da camada de progresso e compartilhamento: XP, missões, maestria, Rinha da Semana, desafio por link,
// clipes, cartão de resultado e Quem Ganha Fica. [português, inglês, espanhol]
M.i18n.add([
  // ---------- menu ----------
  ['QUEM GANHA FICA', 'WINNER STAYS', 'EL GANADOR SE QUEDA'],
  ['festa: quem vence continua no trono, quem perde volta pro fim da fila', 'party mode: the winner keeps the throne, the loser goes to the back of the line', 'modo fiesta: quien gana sigue en el trono, quien pierde va al final de la fila'],
  ['RINHA DA SEMANA', 'WEEKLY BRAWL', 'RIÑA DE LA SEMANA'],
  ['três lutas com as regras malucas da semana, com placar e estrelas', 'three fights under the week’s crazy rules, with a score and stars', 'tres peleas con las reglas locas de la semana, con puntaje y estrellas'],
  ['PROGRESSO', 'PROGRESS', 'PROGRESO'],
  ['seu nível, missões do dia, títulos, molduras e a maestria de cada lutador', 'your level, daily missions, titles, frames and each fighter’s mastery', 'tu nivel, misiones del día, títulos, marcos y la maestría de cada luchador'],
  ['BALÕES DE FALA', 'SPEECH BUBBLES', 'GLOBOS DE DIÁLOGO'], ['GRAVAR CLIPES', 'RECORD CLIPS', 'GRABAR CLIPS'],
  // ---------- resultado: XP ----------
  ['NÍVEL', 'LEVEL', 'NIVEL'], ['Nível', 'Level', 'Nivel'], ['nível', 'level', 'nivel'], ['XP', 'XP', 'XP'],
  ['Lutou', 'Fought', 'Peleó'], ['Vitória', 'Victory', 'Victoria'], ['Dano causado', 'Damage dealt', 'Daño causado'], ['Combos', 'Combos', 'Combos'], ['Estilo', 'Style', 'Estilo'],
  ['Sem tomar dano', 'Flawless', 'Sin recibir daño'], ['Multiplicador', 'Multiplier', 'Multiplicador'], ['Primeira vitória do dia', 'First win of the day', 'Primera victoria del día'],
  ['Maestria', 'Mastery', 'Maestría'], ['maestria', 'mastery', 'maestría'], ['máxima', 'max', 'máxima'], ['Missão', 'Mission', 'Misión'], ['Meta de', 'Goal of', 'Meta de'], ['Recompensa', 'Reward', 'Recompensa'], ['RECOMPENSA', 'REWARD', 'RECOMPENSA'],
  ['título', 'title', 'título'], ['moldura', 'frame', 'marco'], ['cor', 'color', 'color'],
  ['Título', 'Title', 'Título'], ['TÍTULO', 'TITLE', 'TÍTULO'], ['MOLDURA', 'FRAME', 'MARCO'],
  // ---------- compartilhar ----------
  ['CLIPE', 'CLIP', 'CLIP'], ['CARTÃO', 'CARD', 'TARJETA'], ['DESAFIAR UM AMIGO', 'CHALLENGE A FRIEND', 'RETAR A UN AMIGO'],
  ['O clipe ainda está fechando. Tente de novo em instantes.', 'The clip is still wrapping up. Try again in a moment.', 'El clip aún se está cerrando. Prueba de nuevo en un momento.'],
  ['Clipe pronto!', 'Clip ready!', '¡Clip listo!'], ['Cartão pronto!', 'Card ready!', '¡Tarjeta lista!'], ['Cartão salvo!', 'Card saved!', '¡Tarjeta guardada!'],
  ['Não consegui gerar o cartão.', 'I couldn’t generate the card.', 'No pude generar la tarjeta.'],
  ['Olha meu resultado no Sertão Fight Brasil!', 'Check out my result in Sertão Fight Brasil!', '¡Mira mi resultado en Sertão Fight Brasil!'],
  ['Duvido você superar meu placar no Sertão Fight Brasil!', 'I dare you to beat my score in Sertão Fight Brasil!', '¡Te reto a superar mi puntaje en Sertão Fight Brasil!'],
  ['pontos', 'points', 'puntos'], ['Desafio enviado!', 'Challenge sent!', '¡Desafío enviado!'], ['Link copiado! Cole no zap.', 'Link copied! Paste it in your chat.', '¡Enlace copiado! Pégalo en tu chat.'], ['Não deu pra copiar o link.', 'Couldn’t copy the link.', 'No se pudo copiar el enlace.'],
  ['Terminei a Rinha da Semana!', 'I finished the Weekly Brawl!', '¡Terminé la Riña de la Semana!'],
  // ---------- progresso ----------
  ['Nível máximo!', 'Max level!', '¡Nivel máximo!'], ['para o nível', 'to level', 'para el nivel'], ['Próxima recompensa', 'Next reward', 'Próxima recompensa'], ['Seu histórico antigo virou', 'Your old history became', 'Tu historial anterior se convirtió en'],
  ['MISSÕES DO DIA', 'DAILY MISSIONS', 'MISIONES DEL DÍA'], ['Melhor', 'Best', 'Mejor'], ['ainda não jogada', 'not played yet', 'aún sin jugar'], ['JOGAR', 'PLAY', 'JUGAR'],
  ['MAESTRIA POR LUTADOR', 'MASTERY BY FIGHTER', 'MAESTRÍA POR LUCHADOR'], ['CONQUISTAS', 'ACHIEVEMENTS', 'LOGROS'], ['MAESTRIA', 'MASTERY', 'MAESTRÍA'], ['Mestre', 'Master', 'Maestro'],
  ['Vença {n} lutas', 'Win {n} fights', 'Gana {n} peleas'], ['Faça {n} esquivas perfeitas', 'Land {n} perfect dodges', 'Haz {n} esquivas perfectas'], ['Acerte um combo de {n} golpes', 'Land a {n}-hit combo', 'Conecta un combo de {n} golpes'],
  ['Use a Peia {n} vezes', 'Use the Peia {n} times', 'Usa la Peia {n} veces'], ['Acerte {n} golpes no compasso', 'Land {n} hits on the beat', 'Conecta {n} golpes al compás'], ['Vença uma luta sem sofrer dano', 'Win a fight without taking damage', 'Gana una pelea sin recibir daño'],
  ['Faça {n} contra-golpes', 'Land {n} counter-hits', 'Haz {n} contragolpes'], ['Vença com {n} lutadores diferentes', 'Win with {n} different fighters', 'Gana con {n} luchadores diferentes'], ['Nocauteie com o arremate da Peia', 'Knock out with the Peia finisher', 'Noquea con el remate de la Peia'],
  ['Defenda {n} golpes', 'Block {n} hits', 'Defiende {n} golpes'], ['Jogue {n} lutas', 'Play {n} fights', 'Juega {n} peleas'], ['Cause {n} de dano', 'Deal {n} damage', 'Causa {n} de daño'],
  ['Vença 10 lutas', 'Win 10 fights', 'Gana 10 peleas'], ['Use a Peia 10 vezes', 'Use the Peia 10 times', 'Usa la Peia 10 veces'], ['Vença 3 lutas sem sofrer dano', 'Win 3 fights without taking damage', 'Gana 3 peleas sin recibir daño'],
  ['Acerte um combo de 8 golpes', 'Land an 8-hit combo', 'Conecta un combo de 8 golpes'], ['Vença no nível Lendário', 'Win on Legendary difficulty', 'Gana en dificultad Legendaria'],
  ['com', 'with', 'con'],
  ['Cor bloqueada: maestria', 'Locked color: mastery', 'Color bloqueado: maestría'],
  // ---------- títulos e molduras ----------
  ['Novato da Rinha', 'Brawl Rookie', 'Novato de la Riña'], ['Cabra Marcado', 'Marked Goat', 'Cabra Marcado'], ['Arretado', 'Awesome', 'Genial'], ['Cabra da Peste', 'Tough Goat', 'Cabra de la Peste'],
  ['Rei da Quebrada', 'King of the Block', 'Rey del Barrio'], ['Lenda do Sertão', 'Legend of the Backlands', 'Leyenda del Sertón'], ['Guardião da Brasa', 'Guardian of the Ember', 'Guardián de la Brasa'],
  ['Doido da Semana', 'Madman of the Week', 'Loco de la Semana'], ['Sempre Presente', 'Always There', 'Siempre Presente'],
  ['Termine a Rinha da Semana.', 'Finish the Weekly Brawl.', 'Termina la Riña de la Semana.'], ['Sequência de 7 dias no Desafio do Dia.', 'A 7-day streak in the Daily Challenge.', 'Racha de 7 días en el Desafío del Día.'],
  ['Papel', 'Paper', 'Papel'], ['Bronze', 'Bronze', 'Bronce'], ['Prata', 'Silver', 'Plata'], ['Ouro', 'Gold', 'Oro'], ['Brasa', 'Ember', 'Brasa'], ['Código', 'Code', 'Código'], ['Lenda', 'Legend', 'Leyenda'], ['Diamante', 'Diamond', 'Diamante'],
  // ---------- desafio por link ----------
  ['DESAFIO RECEBIDO', 'CHALLENGE RECEIVED', 'DESAFÍO RECIBIDO'], ['te desafiou!', 'challenged you!', '¡te retó!'], ['UM AMIGO', 'A FRIEND', 'UN AMIGO'], ['seu amigo', 'your friend', 'tu amigo'],
  ['Venceu com', 'Won with', 'Ganó con'], ['Tentou com', 'Tried with', 'Intentó con'], ['contra', 'against', 'contra'], ['VOCÊ', 'YOU', 'TÚ'],
  ['Placar a bater', 'Score to beat', 'Puntaje a superar'], ['Combo', 'Combo', 'Combo'], ['Tempo', 'Time', 'Tiempo'],
  ['ACEITAR O DESAFIO', 'ACCEPT THE CHALLENGE', 'ACEPTAR EL DESAFÍO'], ['VER A LUTA DELE(A)', 'WATCH THEIR FIGHT', 'VER SU PELEA'], ['AGORA NÃO', 'NOT NOW', 'AHORA NO'],
  ['O replay do desafio não abriu.', 'The challenge replay didn’t open.', 'La repetición del desafío no se abrió.'],
  ['DESAFIO SUPERADO!', 'CHALLENGE BEATEN!', '¡DESAFÍO SUPERADO!'], ['EMPATE DE PLACAR', 'SCORE TIE', 'EMPATE DE PUNTAJE'], ['VENCEU, MAS NÃO SUPEROU', 'WON, BUT DIDN’T BEAT IT', 'GANÓ, PERO NO LO SUPERÓ'], ['NÃO FOI DESSA VEZ', 'NOT THIS TIME', 'ESTA VEZ NO'],
  ['Seu placar', 'Your score', 'Tu puntaje'], ['TENTAR DE NOVO', 'TRY AGAIN', 'INTENTAR DE NUEVO'], ['DESAFIAR DE VOLTA', 'CHALLENGE BACK', 'RETAR DE VUELTA'], ['MENU', 'MENU', 'MENÚ'],
  // ---------- semana ----------
  ['Semana da Lua Cheia', 'Full Moon Week', 'Semana de la Luna Llena'], ['Pulos longos e Peia pra todo lado.', 'Long jumps and Peia everywhere.', 'Saltos largos y Peia por todos lados.'],
  ['Semana do Peso', 'Heavyweight Week', 'Semana del Peso'], ['Um golpe decide. Vida curta, dano dobrado.', 'One hit decides it. Short life, double damage.', 'Un golpe decide. Vida corta, daño doble.'],
  ['Semana Turbinada', 'Turbocharged Week', 'Semana Turbo'], ['Tudo rápido, e a Energia enche voando.', 'Everything fast, and Energy fills in a flash.', 'Todo rápido, y la Energía se llena volando.'],
  ['Semana do Vampiro', 'Vampire Week', 'Semana del Vampiro'], ['Quem acerta se cura, e o dano é dobrado.', 'Hit to heal, and damage is doubled.', 'Quien acierta se cura, y el daño es doble.'],
  ['Semana da Pluma', 'Feather Week', 'Semana de la Pluma'], ['Rápido e leve, quase voando.', 'Fast and light, almost flying.', 'Rápido y ligero, casi volando.'],
  ['Semana do Frenesi', 'Frenzy Week', 'Semana del Frenesí'], ['Depressa, forte e frágil. Pisque e perdeu.', 'Fast, strong and fragile. Blink and you lose.', 'Rápido, fuerte y frágil. Parpadeas y pierdes.'],
  ['Semana da Festa', 'Party Week', 'Semana de la Fiesta'], ['Torcida em êxtase e golpes que curam.', 'Ecstatic crowd and healing hits.', 'Hinchada en éxtasis y golpes que curan.'],
  ['Semana do Gigante', 'Giant Week', 'Semana del Gigante'], ['Dano dobrado, cura e pouca gravidade.', 'Double damage, healing and low gravity.', 'Daño doble, cura y poca gravedad.'],
  ['dia restante', 'day left', 'día restante'], ['dias restantes', 'days left', 'días restantes'], ['Estrelas', 'Stars', 'Estrellas'], ['Semanas concluídas', 'Weeks completed', 'Semanas completadas'], ['Semanas anteriores', 'Previous weeks', 'Semanas anteriores'],
  ['Três lutas seguidas com as regras da semana. Perdeu uma, acabou. Vale XP em dobro e meia.', 'Three fights in a row under the week’s rules. Lose one and it’s over. Worth 1.5× XP.', 'Tres peleas seguidas con las reglas de la semana. Si pierdes una, se acaba. Vale 1,5× de XP.'],
  ['ESCOLHER LUTADOR', 'PICK A FIGHTER', 'ELEGIR LUCHADOR'], ['PLACAR', 'SCORE', 'PUNTAJE'], ['LUTA', 'FIGHT', 'PELEA'], ['VENCIDA', 'WON', 'GANADA'], ['PONTOS', 'POINTS', 'PUNTOS'], ['Placar', 'Score', 'Puntaje'], ['Próximo', 'Next', 'Siguiente'], ['PRÓXIMA LUTA', 'NEXT FIGHT', 'SIGUIENTE PELEA'],
  ['SEMANA COMPLETA!', 'WEEK COMPLETE!', '¡SEMANA COMPLETA!'], ['FIM DA LINHA', 'END OF THE LINE', 'FIN DE LA LÍNEA'], ['NOVO RECORDE DA SEMANA', 'NEW WEEKLY RECORD', 'NUEVO RÉCORD DE LA SEMANA'], ['Título liberado', 'Title unlocked', 'Título desbloqueado'], ['de bônus da semana', 'weekly bonus', 'de bono semanal'],
  ['JOGAR DE NOVO', 'PLAY AGAIN', 'JUGAR DE NUEVO'], ['ESTRELAS', 'STARS', 'ESTRELLAS'], ['LUTAS', 'FIGHTS', 'PELEAS'], ['SEMANA', 'WEEK', 'SEMANA'],
  ['Três lutas seguidas contra a CPU, com as regras malucas da semana. Adversários e cenários já estão sorteados. Perdeu uma, acabou.', 'Three fights in a row against the CPU under the week’s crazy rules. Opponents and stages are already drawn. Lose one and it’s over.', 'Tres peleas seguidas contra la CPU con las reglas locas de la semana. Rivales y escenarios ya están sorteados. Si pierdes una, se acaba.'],
  // ---------- quem ganha fica ----------
  ['Quem vence continua no trono; quem perde volta pro fim da fila. Todo mundo no mesmo teclado ou controle.', 'The winner keeps the throne; the loser goes to the back of the line. Everyone on the same keyboard or controller.', 'Quien gana sigue en el trono; quien pierde va al final de la fila. Todos en el mismo teclado o mando.'],
  ['JOGADORES', 'PLAYERS', 'JUGADORES'], ['REI MANTÉM O LUTADOR', 'KING KEEPS THE FIGHTER', 'EL REY CONSERVA EL LUCHADOR'], ['LIGADO', 'ON', 'ACTIVADO'], ['DESLIGADO', 'OFF', 'DESACTIVADO'], ['COMEÇAR', 'START', 'EMPEZAR'], ['VOLTAR', 'BACK', 'VOLVER'],
  ['NO TRONO', 'ON THE THRONE', 'EN EL TRONO'], ['vitória seguida', 'win in a row', 'victoria seguida'], ['vitórias seguidas', 'wins in a row', 'victorias seguidas'], ['DESAFIANTE', 'CHALLENGER', 'RETADOR'], ['Na fila', 'In line', 'En la fila'], ['melhor sequência', 'best streak', 'mejor racha'],
  ['ESCOLHER LUTADORES E LUTAR', 'PICK FIGHTERS AND BRAWL', 'ELEGIR LUCHADORES Y PELEAR'], ['ENCERRAR', 'END', 'TERMINAR'], ['FICA NO TRONO', 'STAYS ON THE THRONE', 'SE QUEDA EN EL TRONO'], ['vai pro fim da fila', 'goes to the back of the line', 'va al final de la fila'],
  ['Próximo desafiante', 'Next challenger', 'Siguiente retador'], ['Lutas', 'Fights', 'Peleas'], ['REVANCHE', 'REMATCH', 'REVANCHA'], ['FIM DA FESTA', 'END OF THE PARTY', 'FIN DE LA FIESTA'], ['NOVA FESTA', 'NEW PARTY', 'NUEVA FIESTA'],
  // ---------- conquistas ----------
  ['CONQUISTA DESBLOQUEADA', 'ACHIEVEMENT UNLOCKED', 'LOGRO DESBLOQUEADO'],
  ['Chegue ao nível 10.', 'Reach level 10.', 'Llega al nivel 10.'], ['Lenda do Sertão', 'Legend of the Backlands', 'Leyenda del Sertón'], ['Chegue ao nível 25.', 'Reach level 25.', 'Llega al nivel 25.'],
  ['Mestre de Verdade', 'True Master', 'Maestro de Verdad'], ['Chegue à maestria 5 com um lutador.', 'Reach mastery 5 with a fighter.', 'Llega a la maestría 5 con un luchador.'],
  ['Dever de Casa', 'Homework Done', 'Tarea Cumplida'], ['Cumpra uma missão do dia.', 'Complete a daily mission.', 'Cumple una misión del día.'], ['Dia Completo', 'Full Day', 'Día Completo'], ['Cumpra as três missões do dia.', 'Complete all three daily missions.', 'Cumple las tres misiones del día.'],
  ['Termine a Rinha da Semana.', 'Finish the Weekly Brawl.', 'Termina la Riña de la Semana.'],
  ['Cineasta da Rinha', 'Brawl Filmmaker', 'Cineasta de la Riña'], ['Salve ou compartilhe um clipe de luta.', 'Save or share a fight clip.', 'Guarda o comparte un clip de pelea.'],
  ['Cartão Postal', 'Postcard', 'Postal'], ['Gere um cartão de resultado.', 'Generate a result card.', 'Genera una tarjeta de resultado.'],
  ['Duvido!', 'I Dare You!', '¡Te Reto!'], ['Envie um desafio para um amigo.', 'Send a challenge to a friend.', 'Envía un desafío a un amigo.'],
  ['Superou o Placar', 'Beat the Score', 'Superó el Puntaje'], ['Supere o placar de um desafio recebido.', 'Beat the score of a challenge you received.', 'Supera el puntaje de un desafío recibido.'],
  ['Na Festa do Sítio', 'At the Farm Party', 'En la Fiesta del Sitio'], ['Jogue uma partida do Quem Ganha Fica.', 'Play a Winner Stays match.', 'Juega una partida de El Ganador Se Queda.'],
  ['Rei do Terreiro', 'King of the Yard', 'Rey del Terreiro'], ['Vença 3 vezes seguidas no Quem Ganha Fica.', 'Win 3 in a row in Winner Stays.', 'Gana 3 veces seguidas en El Ganador Se Queda.'],
  ['Imbatível na Festa', 'Unbeatable at the Party', 'Imbatible en la Fiesta'], ['Vença 5 vezes seguidas no Quem Ganha Fica.', 'Win 5 in a row in Winner Stays.', 'Gana 5 veces seguidas en El Ganador Se Queda.'],
  // ---------- combos e golpes finais ----------
  ['ESTILO', 'STYLE', 'ESTILO'], ['ESPETÁCULO!', 'SPECTACULAR!', '¡ESPECTÁCULO!'], ['LENDÁRIO!', 'LEGENDARY!', '¡LEGENDARIO!'], ['NA RAÇA!', 'GRIT!', '¡CON GARRA!']
]);
M.i18n.pat(/^Cor bloqueada: maestria (\d+) com (.+)$/, 'Locked color: mastery $1 with $2', 'Color bloqueado: maestría $1 con $2', true);
M.i18n.pat(/^Maestria (.+) (\d+)$/, 'Mastery $1 $2', 'Maestría $1 $2');
M.i18n.pat(/^NÍVEL (\d+)$/, 'LEVEL $1', 'NIVEL $1', true);
M.i18n.pat(/^(Original|Folia|Noite) \(cor de (.+)\)$/, (a, b) => ({ Original: 'Original', Folia: 'Carnival', Noite: 'Night' }[a]) + ' (' + b + '’s color)', (a, b) => ({ Original: 'Original', Folia: 'Fiesta', Noite: 'Noche' }[a]) + ' (color de ' + b + ')');
M.i18n.pat(/^Gravado na versão (\S+) \(a atual é (\S+)\): se o equilíbrio mudou, a repetição pode divergir\.$/, 'Recorded on version $1 (current is $2): if the balance changed, the replay may diverge.', 'Grabado en la versión $1 (la actual es $2): si cambió el equilibrio, la repetición puede divergir.', true);
M.i18n.add([['Toque em voltar de novo para sair', 'Press back again to exit', 'Toca atrás otra vez para salir'], ['VIBRAÇÃO', 'VIBRATION', 'VIBRACIÓN']]);
M.i18n.pat(/^Mestre (.+)$/, 'Master $1', 'Maestro $1');
M.i18n.pat(/^Maestria (\d+) com (.+)\.$/, 'Mastery $1 with $2.', 'Maestría $1 con $2.', true);
M.i18n.pat(/^RINHA DA SEMANA (\d+)\/(\d+)$/, 'WEEKLY BRAWL $1/$2', 'RIÑA DE LA SEMANA $1/$2', true);
