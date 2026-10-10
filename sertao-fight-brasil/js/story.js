'use strict';
// ============================================================
// HISTÓRIA — cordéis, diálogos, garrafadas e finais
// ============================================================
M.PATUAS = [
  { id: 'vento', name: 'Garrafada do Vento', icon: '✦', desc: 'Caminhada e dash 25% mais rápidos. Pra quem não gosta de esperar.', apply: m => { m.speed *= 1.25; } },
  { id: 'ferro', name: 'Garrafada de Ferro', icon: '▲', desc: '+15% de vida máxima. Couro grosso de quem apanhou muito.', apply: m => { m.hp *= 1.15; } },
  { id: 'brasa', name: 'Garrafada da Brasa', icon: '●', desc: '+12% de dano em todos os golpes. Pega fogo, cabaré.', apply: m => { m.dmg *= 1.12; } },
  { id: 'compasso', name: 'Garrafada do Compasso', icon: '♪', desc: 'Janela do NO COMPASSO dobrada, e golpes no ritmo dão +15% de dano.', apply: m => { m.beat *= 2; m.beatDmg = 1.15; } },
  { id: 'esquiva', name: 'Garrafada da Esquiva', icon: '◆', desc: 'A Arreda recarrega 40% mais rápido. Peia boa é a que não te pega.', apply: m => { m.dodgeCd *= 0.6; } },
  { id: 'folia', name: 'Garrafada da Folia', icon: '★', desc: 'Ganho de Energia +30%. A rinha gosta de você mais rápido.', apply: m => { m.axe *= 1.3; } },
  { id: 'couro', name: 'Garrafada de Couro', icon: '✚', desc: 'Defesa não sofre dano (chip) e você recupera 5% de vida entre as rinhas.', apply: m => { m.chip = 0; m.regen = 0.05; } }
];

M.STORY = {
  intro: [
    'Em Vila Brasa, cidade\nque a seca não quis engolir,\ntoda noite de São João\na festa insiste em seguir:\nacende-se a Brasa na praça\npra ninguém poder dormir.',
    'Mas a Brasa só se alimenta\nda energia de quem bate palma,\ne quem quiser ser guardião\ntem que entrar na rinha com calma,\nganhar o povo no xaxado\ne nunca perder a alma.',
    'Zeca Ventania, menino\nque o Mestre Cinzas criou,\nhoje entra pela primeira vez\nna rinha que o fogo guardou.\nToca a sanfona. É agora.\nA rinha nunca parou.'
  ],
  fights: [
    {
      opp: 'cinzas', stage: 'porto', tutorial: true, title: 'TREINO NO AÇUDE',
      pre: [
        { who: 'cinzas', text: 'Antes da rinha, o treino. Me mostra o que aprendeu, menino.' },
        { who: 'zeca', text: 'Mestre, o povo já tá chegando na praça...' },
        { who: 'cinzas', text: 'O povo espera. O fogo também. Vem.' }
      ],
      post: [
        { who: 'cinzas', text: 'Já dá pro gasto. Vai. E lembra: a rinha escuta quem escuta a rinha.' },
        { who: 'zeca', text: 'O senhor não vem comigo?' },
        { who: 'cinzas', text: '...Eu chego lá. Sempre chego.' }
      ]
    },
    {
      opp: 'bia', retry: 'De novo, menino? A ladeira não cansa. Eu também não.', stage: 'ladeira', title: 'PRIMEIRA RINHA — A LADEIRA',
      pre: [
        { who: 'lourdes', text: 'Primeira rinha da noite! Bia Sombrinha, a dona da ladeira, contra o menino do Mestre Cinzas!' },
        { who: 'bia', text: 'Peia na minha ladeira? Aqui o passo é forró, meu bem. Pisa certo ou cai.' },
        { who: 'zeca', text: 'Então abre a sombrinha, que vai chover peia.' }
      ],
      post: [
        { who: 'bia', text: 'Tu dança bonito, menino. A ladeira é tua por hoje.' },
        { who: 'bia', text: 'Mas cuidado com o Velho Chico. A Maré não perdoa quem tem pressa.' }
      ],
      patua: true
    },
    {
      opp: 'mare', retry: 'Voltou pra afundar outra vez? O rio tem paciência. Vamos ver se você tem.', stage: 'rio', title: 'SEGUNDA RINHA — O VELHO CHICO',
      pre: [
        { who: 'mare', text: 'Você veio de longe pra afundar aqui, moço? O rio não tem pressa. Eu também não.' },
        { who: 'zeca', text: 'Água não me assusta. Eu nasci na beira do açude.' },
        { who: 'mare', text: 'Então vem pegar a onda.' }
      ],
      post: [
        { who: 'mare', text: 'Você atravessou. Poucos atravessam.' },
        { who: 'mare', text: 'Seu Mestre... ele sabe que você tá aqui? Ele não parecia querer que ninguém chegasse na praça hoje.' },
        { who: 'zeca', text: '...Como assim?' }
      ],
      patua: true
    },
    {
      opp: 'tiao', retry: 'Levantou, cabra? Boi bom é o que levanta. Vem.', stage: 'sertao', title: 'TERCEIRA RINHA — O SERTÃO',
      pre: [
        { who: 'tiao', text: 'Lá no sertão a gente não arreda, não. A gente agarra e não larga.' },
        { who: 'zeca', text: 'Então corre atrás, vaqueiro.' },
        { who: 'tiao', text: 'Defende se quiser, moleque. Laço não respeita guarda.' }
      ],
      post: [
        { who: 'tiao', text: 'Arretado. Tu derrubou um boi hoje.' },
        { who: 'tiao', text: 'Vou te dizer uma coisa: teu Mestre apostou contra tu. Eu vi, com esses olhos. Ele não quer ninguém chegando na Brasa.' },
        { who: 'zeca', text: 'Mentira.' },
        { who: 'tiao', text: 'Pergunta pro Bené, lá na rinha dele. Ele conhece o Cinzas desde moleque.' }
      ],
      patua: true
    },
    {
      opp: 'bene', retry: 'Errou o compasso da última vez. Escuta a zabumba agora, menino.', stage: 'terreiro', title: 'QUARTA RINHA — O FORRÓ DO BENÉ',
      pre: [
        { who: 'bene', text: 'Foi teu Mestre que me ensinou a tocar. E fui eu que ensinei ele a escutar. Hoje ele não escuta mais ninguém.' },
        { who: 'zeca', text: 'Então me ensina o que ele esqueceu.' },
        { who: 'bene', text: 'Escuta a zabumba. Bate junto com ela. O resto, a rinha faz.' }
      ],
      post: [
        { who: 'bene', text: 'Tá no compasso, menino. Agora vai lá na lagoa da caatinga.' },
        { who: 'bene', text: 'O Boitatá guarda a chama há mais tempo que todo mundo. Ele sabe o que o Cinzas quer fazer com a Brasa — e por quê.' }
      ],
      patua: true
    },
    {
      opp: 'juvenal', retry: 'O fogo te queimou e você voltou. Isso já é mais que o Mestre fez.', stage: 'pantanal', title: 'QUINTA RINHA — A LAGOA',
      pre: [
        { who: 'juvenal', text: 'Eu sou o fogo que o Mestre quer apagar. Se ele vencer a rinha hoje, a Brasa morre. E a cidade dorme pra sempre.' },
        { who: 'zeca', text: '...O Mestre nunca faria isso.' },
        { who: 'juvenal', text: 'Então me vence, e pergunta a ele.' }
      ],
      post: [
        { who: 'juvenal', text: 'Vai, menino. A Brasa tá quase no fim.' },
        { who: 'juvenal', text: 'Só sobrou você entre ela e ele. Escuta a rinha. Ela vai te dizer o que fazer.' }
      ],
      patua: true
    },
    {
      opp: 'vinicius', retry: 'Rodou de novo? Beleza, eu já atualizei o log. Mostra o patch.', stage: 'galpao', title: 'SEXTA RINHA — O GALPÃO',
      pre: [
        { who: 'vinicius', text: 'Zeca! Eu mapeei a rinha inteira hoje: cada golpe, cada passo. Teu padrão tá todo aqui no meu log.' },
        { who: 'zeca', text: 'Então apaga o log, que eu vou mudar de padrão.' },
        { who: 'vinicius', text: 'Isso eu quero ver. Bora começar a rinha.' }
      ],
      post: [
        { who: 'vinicius', text: 'Sem padrão, sem bug. Tu tá pronto, menino.' },
        { who: 'vinicius', text: 'O Mestre tá esperando na praça. Vai lá — e deixa a Brasa compilar.' }
      ],
      patua: true
    },
    {
      opp: 'cinzas', retry: 'Levanta, Zeca. Rosa também levantava. Até o dia em que não levantou mais.', stage: 'cinzas', boss: true, title: 'RINHA DO FOGO — A PRAÇA DAS CINZAS',
      pre: [
        { who: 'cinzas', text: 'Você chegou mais longe do que eu queria, Zeca.' },
        { who: 'zeca', text: 'Por quê, Mestre? A Brasa é da cidade.' },
        { who: 'cinzas', text: 'A Brasa levou a minha Rosa numa rinha igual a essa. Trinta anos atrás. Toda festa cobra um preço.' },
        { who: 'cinzas', text: 'Hoje eu encerro a conta.' },
        { who: 'zeca', text: 'Então a conta vai ser comigo.' }
      ],
      post: [
        { who: 'cinzas', text: '...A rinha escuta quem escuta a rinha. Eu parei de escutar faz tempo.' },
        { who: 'cinzas', text: 'A Brasa é sua agora, menino. O que você vai fazer com ela?' }
      ]
    }
  ],
  interludes: {
    3: { title: 'MEMÓRIA — A NOITE DE ROSA', pages: [
      'Trinta anos faz que a Brasa\nsubiu mais alto que devia.\nRosa dançava na praça\ne o Mestre, de longe, sorria.\nQuando o fogo pegou na seda,\nsó restou cinza e agonia.',
      'Desde então ele guarda a chama\ncomo quem guarda um castigo:\nacende todo São João\ne dorme com o inimigo.\nZeca não sabe de nada.\nTião contou. Eu te digo.' ] },
    5: { title: 'O QUE O BOITATÁ VIU', pages: [
      'O Boitatá viu o Mestre\nna beira da lagoa chorar:\n"Se a Brasa cobra uma vida,\neu pago com a de quem for lá.\nMas se o menino aguentar,\nquem sabe eu volte a escutar."',
      'Juvenal guardou o segredo\nno brilho que leva no olho:\no Mestre não quer matar a festa —\nquer que alguém pague o escolho.\nE o único que pode pagar\né quem ele criou no colo.' ] },
    6: { title: 'A ÚLTIMA SANFONA', pages: [
      'Na praça, Bené tocou\num baião que ninguém conhecia.\nDona Lourdes na zabumba,\no povo inteiro em vigia.\nA Brasa, baixa, tremia —\ne o Mestre, enfim, aparecia.' ] }
  },
  epilogues: [
    'ZECA VENTANIA virou guardião da Brasa — e professor de peia dos meninos do açude.',
    'BIA SOMBRINHA abriu uma escola de forró na ladeira. A sombrinha ainda corta.',
    'MARÉ BACURI voltou pro Velho Chico. Dizem que o rio ficou mais calmo.',
    'TIÃO SERTÃO derrubou um boi de novo no São João seguinte. Com um abraço.',
    'BENÉ SANFONA gravou o baião da rinha. Toca em toda feira de Caruaru.',
    'JUVENAL BOITATÁ apagou, enfim, o fogo que carregava. Ficou só a luz.',
    'VINÍCIUS ANDREY colocou a rinha num site. Você está nele.',
    'MESTRE CINZAS voltou a bater palma. Baixinho. Mas voltou.'
  ],
  choice: {
    title: 'A BRASA É SUA',
    text: 'A praça está em silêncio. O povo olha pra você. A Brasa, pequena, treme no centro da rinha. O Mestre espera.',
    options: [
      { id: 'acender', label: 'Manter a Brasa acesa', desc: 'A festa continua. Hoje, amanhã, sempre. A rinha nunca para.' },
      { id: 'descansar', label: 'Deixar a Brasa dormir uma noite', desc: 'Pela Rosa. Pelo Mestre. Uma noite de silêncio — e amanhã o povo decide.' },
      { id: 'dividir', label: 'Dividir a Brasa com a cidade', desc: 'Cada casa leva um tição. Nem guardião, nem silêncio: todo mundo cuida.', secret: true }
    ]
  },
  endings: {
    acender: {
      title: 'FINAL: A RINHA NUNCA PARA',
      cordel: [
        'A Brasa subiu na praça\ne o povo gritou seu nome.\nO Mestre, lá do seu canto,\nbateu palma — quem diria, homem.\nToda festa cobra um preço;\nmas quem não dança, se consome.',
        'Zeca Ventania, guardião,\nacende a cidade todo ano.\nE o Mestre, de chapéu de palha,\nvolta pra rinha sem engano:\n"Rosa dançava, menino.\nEu é que vivi enganado."'
      ]
    },
    descansar: {
      title: 'FINAL: UMA NOITE DE SILÊNCIO',
      cordel: [
        'Naquela noite, a cidade\ndormiu pela primeira vez.\nSem fogo, sem sanfona,\nsó o vento no cata-vento.\nO Mestre chorou baixinho\ne Zeca não disse por quê.',
        'E de manhã, sem guardião,\no povo acendeu outra vez:\ncada um trouxe um graveto,\ncada um trouxe um talvez.\nA Brasa não é de ninguém.\nÉ de quem bate palma. É de vocês.'
      ]
    }
  },
  endingsExtra: {
    dividir: {
      title: 'FINAL VERDADEIRO: A BRASA É DE TODO MUNDO',
      cordel: [
        'Zeca partiu a Brasa em mil\ne deu um tição pra cada mão.\nVila Brasa inteira acesa,\nsem dono, sem escuridão.\nO Mestre pegou o dele\ne disse: "Agora é São João."',
        'Rosa não voltou, é claro,\nmas a praça não dormiu.\nCada janela uma fogueira,\ncada fogueira um sorriso.\nE a rinha? Continua —\nporque ninguém mais precisa.'
      ]
    }
  },
  credits: 'SERTÃO FIGHT BRASIL — A Rinha Nunca Para\nUm jogo de luta brasileiro em xilogravura.\n\nPersonagens, mundo, música e código: criados do zero.\nTudo procedural — nenhum asset externo.\n\nObrigado por jogar. Agora vai lá e ensina alguém a arredar.'
};


// ============================================================
// MELHORIAS DA HISTÓRIA — lições (laços), bênçãos, desafios, notas
// ============================================================
M.LICOES = [
  { id: 'l_passo', name: 'Passo de Forró', icon: '♫', desc: 'Lição da Bia: +12% de velocidade e Arreda 15% mais rápida.', apply: m => { m.speed *= 1.12; m.dodgeCd *= 0.85; } },
  { id: 'l_sombra', name: 'Sombrinha da Sorte', icon: '☂', desc: 'Presente da Bia: janela do NO COMPASSO 50% maior.', apply: m => { m.beat *= 1.5; } },
  { id: 'l_rio', name: 'Paciência do Rio', icon: '≈', desc: 'Lição da Maré: +5% de vida e 4% de vida de volta entre as rodadas.', apply: m => { m.hp *= 1.05; m.regen = Math.max(m.regen || 0, 0.04); } },
  { id: 'l_remo', name: 'Remada Firme', icon: '╫', desc: 'Presente da Maré: +6% de dano e defesa dói menos.', apply: m => { m.dmg *= 1.06; m.chip *= 0.5; } },
  { id: 'l_couro', name: 'Couro de Vaqueiro', icon: '▣', desc: 'Lição do Tião: +8% de vida e a defesa dói bem menos.', apply: m => { m.hp *= 1.08; m.chip *= 0.6; } },
  { id: 'l_aboio', name: 'Aboio', icon: '◉', desc: 'Presente do Tião: ganho de Energia +15%.', apply: m => { m.axe *= 1.15; } },
  { id: 'l_ouvido', name: 'Ouvido de Sanfoneiro', icon: '♪', desc: 'Lição do Bené: NO COMPASSO com janela 60% maior e +8% de dano na batida.', apply: m => { m.beat *= 1.6; m.beatDmg = Math.max(m.beatDmg || 1, 1.08); } },
  { id: 'l_fole', name: 'Fole no Peito', icon: '◈', desc: 'Presente do Bené: Energia +15% e +5% de velocidade.', apply: m => { m.axe *= 1.15; m.speed *= 1.05; } },
  { id: 'l_brasa', name: 'Brasa no Peito', icon: '●', desc: 'Lição do Juvenal: +8% de dano em todos os golpes.', apply: m => { m.dmg *= 1.08; } },
  { id: 'l_cinza', name: 'Cinza Fria', icon: '◌', desc: 'Presente do Juvenal: Arreda 20% mais rápida e 3% de vida entre rodadas.', apply: m => { m.dodgeCd *= 0.8; m.regen = Math.max(m.regen || 0, 0.03); } },
  { id: 'l_patch', name: 'Patch de Reflexo', icon: '⌁', desc: 'Lição do Vinícius: +8% de velocidade e Arreda 10% mais rápida.', apply: m => { m.speed *= 1.08; m.dodgeCd *= 0.9; } },
  { id: 'l_backup', name: 'Backup', icon: '▤', desc: 'Presente do Vinícius: +10% de vida máxima.', apply: m => { m.hp *= 1.1; } }
];
// bênçãos da fogueira: valem só para a próxima rinha
M.BENCAOS = [
  { id: 'b_mocoto', name: 'Caldo de Mocotó', icon: '♨', desc: '+30% de vida na próxima rinha.', apply: m => { m.hp *= 1.3; } },
  { id: 'b_treino', name: 'Treino de Sombra', icon: '✶', desc: '+15% de dano e +8% de velocidade na próxima rinha.', apply: m => { m.dmg *= 1.15; m.speed *= 1.08; } },
  { id: 'b_cordel', name: 'Cordel da Dona Lourdes', icon: '♬', desc: 'Começa a próxima rinha com 30% de Energia a seu favor.', apply: () => { }, startAxe: 0.3 }
];
M.modById = id => M.PATUAS.find(p => p.id === id) || M.LICOES.find(p => p.id === id) || M.BENCAOS.find(p => p.id === id);

M.CHALLENGES = {
  fast: { text: 'Vença em menos de 80 segundos', check: r => r.frames < 80 * 60 },
  perfect2: { text: 'Faça 2 esquivas perfeitas', check: r => r.stats.p1.perfect >= 2 },
  perfect3: { text: 'Faça 3 esquivas perfeitas', check: r => r.stats.p1.perfect >= 3 },
  hp35: { text: 'Perca menos de 35% de vida', check: r => r.stats.p2.dmg < 0.35 * r.winner.maxHp },
  hp25: { text: 'Perca menos de 25% de vida', check: r => r.stats.p2.dmg < 0.25 * r.winner.maxHp },
  beat4: { text: 'Acerte 4 golpes NO COMPASSO', check: r => (r.stats.p1.beats || 0) >= 4 },
  super: { text: 'Vença usando a Peia', check: r => r.stats.p1.supers >= 1 }
};
// Nota S/A/B/C por rinha
M.gradeFight = (r, challengeDone, retries) => {
  const taken = r.stats.p2.dmg / r.winner.maxHp, t = r.frames / 60; let pts = 0;
  pts += taken < 0.15 ? 3 : taken < 0.4 ? 2 : taken < 0.8 ? 1 : 0;
  pts += t < 60 ? 2 : t < 90 ? 1 : 0;
  pts += r.stats.p1.perfect >= 2 ? 1 : 0;
  pts += (r.stats.p1.beats || 0) >= 3 ? 1 : 0;
  pts += challengeDone ? 2 : 0;
  pts -= retries;
  return pts >= 7 ? 'S' : pts >= 5 ? 'A' : pts >= 3 ? 'B' : 'C';
};
M.GRADE_VAL = { S: 4, A: 3, B: 2, C: 1 };
M.overallGrade = grades => { const v = Object.values(grades); if (!v.length) return 'C'; const a = v.reduce((s, g) => s + M.GRADE_VAL[g], 0) / v.length; return a >= 3.5 ? 'S' : a >= 2.6 ? 'A' : a >= 1.7 ? 'B' : 'C'; };

(function () {
  const F = M.STORY.fights;
  const ch = (i, k) => { F[i].challenge = k; };
  ch(1, 'fast'); ch(2, 'perfect2'); ch(3, 'hp35'); ch(4, 'beat4'); ch(5, 'super'); ch(6, 'hp25'); ch(7, 'perfect3');
  const bond = (i, o) => { F[i].bond = o; };
  bond(1, {
    prompt: 'Antes de você ir, menino... a ladeira ensina uma coisa pra quem dança bonito. Quer ouvir?',
    options: [
      { id: 'ouvir', bond: true, lesson: 'l_passo', label: 'Ficar e aprender o passo com a Bia', reply: [{ who: 'bia', text: 'O segredo é não pisar no chão: é deixar o chão te empurrar. Vai, tenta.' }, { who: 'zeca', text: '...Parece que o corpo lembrou sozinho.' }] },
      { id: 'seguir', lesson: 'l_sombra', label: 'Agradecer e pegar a sombrinha emprestada', reply: [{ who: 'bia', text: 'Devolve depois, hein? Ela dá sorte no compasso.' }, { who: 'zeca', text: 'Prometo. Obrigado, Bia.' }] }
    ]
  });
  bond(2, {
    prompt: 'O rio me ensinou a esperar. Quer aprender, ou prefere levar o remo e correr?',
    options: [
      { id: 'ouvir', bond: true, lesson: 'l_rio', label: 'Sentar na beira e escutar o rio com a Maré', reply: [{ who: 'mare', text: 'Respira. A corrente não luta contra a pedra: dá a volta. Você também vai dar.' }, { who: 'zeca', text: 'Nunca tinha ficado tão calmo antes de uma rinha.' }] },
      { id: 'seguir', lesson: 'l_remo', label: 'Aceitar o remo e seguir viagem', reply: [{ who: 'mare', text: 'Segura firme. Remo pesado só atrapalha quem tem pressa.' }, { who: 'zeca', text: 'Eu não tenho. Só não posso perder tempo.' }] }
    ]
  });
  bond(3, {
    prompt: 'Cabra, eu aboio pra boi voltar pra casa. Quer aprender, ou quer meu gibão de couro?',
    options: [
      { id: 'ouvir', bond: true, lesson: 'l_aboio', label: 'Aprender o aboio com o Tião', reply: [{ who: 'tiao', text: 'Solta do peito, não da garganta! Assim... isso, o chão até estremeceu.' }, { who: 'zeca', text: 'Parece que a rinha respondeu.' }] },
      { id: 'seguir', lesson: 'l_couro', label: 'Vestir o gibão de couro e partir', reply: [{ who: 'tiao', text: 'Cheira a boi, mas segura bala de pedra. Vai com Deus, cabra.' }, { who: 'zeca', text: 'Cheiro de boi é cheiro de coragem.' }] }
    ]
  });
  bond(4, {
    prompt: 'Menino, o baião tem um segredo. Escuta primeiro, ou leva o fole emprestado?',
    options: [
      { id: 'ouvir', bond: true, lesson: 'l_ouvido', label: 'Escutar o baião com o Bené', reply: [{ who: 'bene', text: 'Fecha o olho. Ouve a zabumba entrar... agora! Sente? Isso é o compasso.' }, { who: 'zeca', text: 'Cada golpe tem uma hora. Agora eu escuto.' }] },
      { id: 'seguir', lesson: 'l_fole', label: 'Levar o fole emprestado', reply: [{ who: 'bene', text: 'Ele respira por você. Leva, mas devolve na festa.' }, { who: 'zeca', text: 'Combinado.' }] }
    ]
  });
  bond(5, {
    prompt: 'A chama tem duas faces: aquece e queima. Quer entender as duas, ou levar só a brasa?',
    options: [
      { id: 'ouvir', bond: true, lesson: 'l_cinza', label: 'Sentar com o Juvenal e entender a chama', reply: [{ who: 'juvenal', text: 'O fogo não é raiva. É atenção. Quem arde sem pressa nunca se queima.' }, { who: 'zeca', text: '...Obrigado, Juvenal. Eu precisava ouvir isso.' }] },
      { id: 'seguir', lesson: 'l_brasa', label: 'Levar a brasa no peito e seguir', reply: [{ who: 'juvenal', text: 'Leve. Ela é sua enquanto você não esquecer de onde veio.' }, { who: 'zeca', text: 'Não vou esquecer.' }] }
    ]
  });
  bond(6, {
    prompt: 'Tenho dois presentes: um patch de reflexo ou um backup. Ou... quer que eu te explique como o Mestre pensa?',
    options: [
      { id: 'ouvir', bond: true, lesson: 'l_patch', label: 'Ouvir o Vinícius analisar o Mestre', reply: [{ who: 'vinicius', text: 'Ele nunca ataca de graça. Todo golpe dele é resposta. Faz ele errar a pergunta.' }, { who: 'zeca', text: 'Entendi. E o patch?' }, { who: 'vinicius', text: 'Já instalado. De nada.' }] },
      { id: 'seguir', lesson: 'l_backup', label: 'Pegar o backup e ir logo', reply: [{ who: 'vinicius', text: 'Salvei teu estado. Se der erro, restaura. Boa sorte.' }, { who: 'zeca', text: 'Valeu, Vinícius.' }] }
    ]
  });
  // acampamentos: depois das lutas 3 e 5
  M.STORY.camps = { 3: { title: 'A FOGUEIRA DA MADRUGADA', text: 'A rinha deu um respiro. Dona Lourdes acende uma fogueira pequena e a Vila se junta em volta. Escolha como passar a pausa — vale só para a próxima rinha.' }, 5: { title: 'A ÚLTIMA FOGUEIRA', text: 'Falta só a praça. O povo se espalha pelo terreiro, em silêncio. Uma última pausa antes do Mestre.' } };
  // laços na reta final
  F[7].preBond = [
    { who: 'bia', text: 'Você não tá sozinho, menino. A ladeira inteira veio pra ver.', needBonds: 4 },
    { who: 'mare', text: 'O rio também. E o rio nunca erra o caminho.', needBonds: 4 },
    { who: 'bene', text: 'Escuta a zabumba. É a Vila inteira batendo palma.', needBonds: 4 },
    { who: 'cinzas', text: '...Eles vieram. Todos. Por você.', needBonds: 4 }
  ];
  M.STORY.bondEpilogues = {
    bia: 'BIA SOMBRINHA ensinou o passo da ladeira a Zeca — e ele dança melhor que ela, só que não admite.',
    mare: 'MARÉ BACURI passa as tardes com Zeca na beira do rio. Ele aprendeu a esperar.',
    tiao: 'TIÃO SERTÃO ensinou o aboio. Hoje a praça toda aboia no São João.',
    bene: 'BENÉ SANFONA tocou o baião do compasso até o fim da noite. Zeca batia o pé sem perceber.',
    juvenal: 'JUVENAL BOITATÁ e Zeca acendem juntos a primeira brasa de cada São João.',
    vinicius: 'VINÍCIUS ANDREY documentou o estilo do Zeca num README. Tem 12 mil estrelas.'
  };
  M.STORY.bondsEndingText = 'Todos os laços feitos ao longo da noite estavam lá na praça. A Vila inteira veio ver o desfecho — e a Brasa, pela primeira vez, brilhou de verdade.';
})();

M.SPEAKERS = {
  zeca: { name: 'Zeca Ventania', color: '#f2c230' },
  cinzas: { name: 'Mestre Cinzas', color: '#8d8a84' },
  bia: { name: 'Bia Sombrinha', color: '#c7267a' },
  mare: { name: 'Maré Bacuri', color: '#2aa9b8' },
  tiao: { name: 'Tião Sertão', color: '#c8371d' },
  juvenal: { name: 'Juvenal Boitatá', color: '#e8712b' },
  bene: { name: 'Bené Sanfona', color: '#c47a4a' },
  vinicius: { name: 'Vinícius Andrey', color: '#2aa9b8' },
  fulozinha: { name: 'Comadre Fulozinha', color: '#6fb35a' },
  mula: { name: 'Mula-sem-Cabeça', color: '#4aa3ff' },
  papafigo: { name: 'Seu Papa-Figo', color: '#c8371d' },
  cuia: { name: 'Cabeça de Cuia', color: '#c9993a' },
  lourdes: { name: 'Dona Lourdes (na zabumba)', color: '#1f7a4d' },
  narrador: { name: '✦', color: '#f2b70c' }
};

Object.assign(M.STORY.endings, M.STORY.endingsExtra);

// ============================================================
// LENDAS DA NOITE — segundo arco: o folclore do Nordeste acorda
// ============================================================
M.LEGENDS = {
  intro: [
    'Passou o São João, apagou-se\na festa da Vila Brasa,\nmas a Brasa de Zeca Ventania\nainda deita luz na casa.\nE lá no fundo da noite\numa assombração se abraça.',
    'Dizem que toda fogueira\nchama quem mora no escuro:\na Fulozinha na mata,\no Cuia lá no rio duro,\na Mula na estrada, o Papa-Figo\nno beco, de olho no muro.',
    'Quatro lendas do Nordeste\nquerem ver o novo guardião.\nNão é rinha de palco aceso:\né rinha de assombração.\nCuidado, Zeca Ventania.\nA noite não dá perdão.'
  ],
  fights: [
    {
      opp: 'fulozinha', stage: 'mata', title: 'PRIMEIRA LENDA — A MATA BRANCA', retry: 'Voltou? Então deixa o fumo na raiz e tenta de novo.',
      pre: [
        { who: 'fulozinha', text: 'Ouvi o assobio da Brasa lá do fundo da mata. Quem é que acende fogo sem pedir licença?' },
        { who: 'zeca', text: 'Eu só guardo a festa da cidade, dona. Nunca quis mexer na mata.' },
        { who: 'fulozinha', text: 'Pois a lenha que acende tua festa nasceu aqui. Deixa o fumo e vence a rinha — ou volta pra casa pelos pés errados.' }
      ],
      post: [
        { who: 'fulozinha', text: 'Sabe assoviar, menino. Raro. A mata te dá licença.' },
        { who: 'fulozinha', text: 'Mas cuidado com o Cabeça de Cuia lá no Parnaíba. Ele perdeu o que a gente não devolve.' }
      ],
      patua: true
    },
    {
      opp: 'cuia', stage: 'parnaiba', title: 'SEGUNDA LENDA — O DELTA', retry: 'O rio devolve tudo. Até quem cai. Tenta outra vez.',
      pre: [
        { who: 'cuia', text: 'A fumaça da tua Brasa espantou meu cardume, rapaz. Há três luas que o rio não me devolve nada.' },
        { who: 'zeca', text: 'Mestre Cinzas nunca teve essa intenção. Eu respondo pela Brasa.' },
        { who: 'cuia', text: 'Então responde com a rinha. A cuia ri de quem foge.' }
      ],
      post: [
        { who: 'cuia', text: 'Hoje o rio me deu uma boa pesca. A Brasa não é de ninguém — e isso é bom.' },
        { who: 'cuia', text: 'Segue pela estrada. A Mula já sentiu cheiro de fogo e ela não perdoa quem cheira a fumaça.' }
      ],
      patua: true
    },
    {
      opp: 'mula', stage: 'estrada', title: 'TERCEIRA LENDA — A ESTRADA', retry: 'Quinta pra sexta, menino. Sempre. Levanta.',
      pre: [
        { who: 'mula', text: 'Ouviu a ferradura? É a última coisa que a maioria escuta.' },
        { who: 'zeca', text: 'Dona Zefa... a chama no teu pescoço — ela responde à Brasa, não é?' },
        { who: 'mula', text: 'Responde. Eu corro porque dói parar. Se tu me vencer, quem sabe a noite me deixa sentar um pouco.' }
      ],
      post: [
        { who: 'mula', text: 'Pela primeira vez em muito tempo, eu parei. A estrada é tua, guardião.' },
        { who: 'mula', text: 'O Papa-Figo está no beco da matriz. Ele já sugou a festa inteira de longe. Se ele te pegar, não foge: dança.' }
      ],
      patua: true
    },
    {
      opp: 'papafigo', stage: 'beco', title: 'ÚLTIMA LENDA — O BECO DA MATRIZ', boss: false, retry: 'Quietinho... a ceia ainda não terminou.',
      pre: [
        { who: 'papafigo', text: 'A Brasa tem vida demais pra um menino só. Dá pra uma ceia, sabe?' },
        { who: 'zeca', text: 'O senhor suga a vida do povo. Eu guardo a vida do povo.' },
        { who: 'papafigo', text: 'Fique quietinho. Vai doer só um pouquinho.' }
      ],
      post: [
        { who: 'papafigo', text: '...Faz tanto tempo que alguém não me vence de pé. O saco ficou vazio.' },
        { who: 'fulozinha', text: 'A mata te perdoa, Figo. Mas não esquece o fumo.' },
        { who: 'cuia', text: 'O rio também. Volta pro beco, velho.' },
        { who: 'mula', text: 'Quinta pra sexta, a gente vigia. Você guarda a festa; a gente guarda a noite.' }
      ]
    }
  ],
  interludes: {
    1: { title: 'O RIO LEMBROU', pages: [
      'O Cuia olhou o Parnaíba\ne o rio, enfim, devolveu\no brilho de um peixe antigo\nque o pescador esqueceu.\nA cuia riu de manhã\no riso que não era seu.' ] },
    2: { title: 'A ÚLTIMA FERRADURA', pages: [
      'Dona Zefa sentou na pedra\ne a chama no pescoço dormiu.\nO vento, de tão cansado,\nno mato se desfez e sumiu.\nSó o som de uma ferradura\nno silêncio ainda ouviu.' ] }
  },
  epilogues: [
    'FULOZINHA aceitou fumo novo do povo da Vila — e ensinou os meninos a assoviar para a mata.',
    'CABEÇA DE CUIA voltou a pescar no Parnaíba. Dizem que a cuia agora ri de verdade.',
    'MULA-SEM-CABEÇA parou numa noite de quinta. Só uma. A chama dela ainda aquece a estrada.',
    'SEU PAPA-FIGO ficou no beco, guardando o saco vazio. Agora conta histórias pra criança dormir.'
  ],
  ending: {
    title: 'FINAL: A NOITE TEM GUARDIÃO',
    unlock: '✦ FULOZINHA • MULA-SEM-CABEÇA • PAPA-FIGO • CABEÇA DE CUIA registrados na Rinha<br>✦ LENDAS DA NOITE concluído',
    cordel: [
      'Zeca voltou pra praça\ne a Brasa mal se mexeu.\nAtrás dele quatro sombras,\ncada qual com seu fogueu.\nA noite tinha guardiões\ne a Vila Brasa dormiu.',
      'A Fulozinha na mata,\no Cuia no rio vigia,\na Mula na estrada, o Figo\nno beco, sem covardia.\nQuem tem medo de assombração\nnunca viu o que ela cria.'
    ]
  }
};
Object.assign(M.STORY.endings, { lendas: M.LEGENDS.ending });
