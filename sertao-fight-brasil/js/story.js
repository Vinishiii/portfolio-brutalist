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

M.SPEAKERS = {
  zeca: { name: 'Zeca Ventania', color: '#f2c230' },
  cinzas: { name: 'Mestre Cinzas', color: '#8d8a84' },
  bia: { name: 'Bia Sombrinha', color: '#c7267a' },
  mare: { name: 'Maré Bacuri', color: '#2aa9b8' },
  tiao: { name: 'Tião Sertão', color: '#c8371d' },
  juvenal: { name: 'Juvenal Boitatá', color: '#e8712b' },
  bene: { name: 'Bené Sanfona', color: '#c47a4a' },
  vinicius: { name: 'Vinícius Andrey', color: '#2aa9b8' },
  lourdes: { name: 'Dona Lourdes (na zabumba)', color: '#1f7a4d' }
};

Object.assign(M.STORY.endings, M.STORY.endingsExtra);
