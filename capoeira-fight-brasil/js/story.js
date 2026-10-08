'use strict';
// ============================================================
// HISTÓRIA — cordéis, diálogos, patuás e finais
// ============================================================
M.PATUAS = [
  { id: 'vento', name: 'Patuá do Vento', icon: '✦', desc: 'Caminhada e dash 25% mais rápidos. Pra quem não gosta de esperar.', apply: m => { m.speed *= 1.25; } },
  { id: 'ferro', name: 'Patuá de Ferro', icon: '▲', desc: '+15% de vida máxima. Couro grosso de quem apanhou muito.', apply: m => { m.hp *= 1.15; } },
  { id: 'brasa', name: 'Patuá da Brasa', icon: '●', desc: '+12% de dano em todos os golpes. Pega fogo, cabaré.', apply: m => { m.dmg *= 1.12; } },
  { id: 'compasso', name: 'Patuá do Compasso', icon: '♪', desc: 'Janela do NO COMPASSO dobrada, e golpes no ritmo dão +15% de dano.', apply: m => { m.beat *= 2; m.beatDmg = 1.15; } },
  { id: 'esquiva', name: 'Patuá da Esquiva', icon: '◆', desc: 'A Ginga recarrega 40% mais rápido. Mandinga é não estar onde o golpe chega.', apply: m => { m.dodgeCd *= 0.6; } },
  { id: 'folia', name: 'Patuá da Folia', icon: '★', desc: 'Ganho de Energia +30%. A roda gosta de você mais rápido.', apply: m => { m.axe *= 1.3; } },
  { id: 'couro', name: 'Patuá de Couro', icon: '✚', desc: 'Defesa não sofre dano (chip) e você recupera 5% de vida entre as rodas.', apply: m => { m.chip = 0; m.regen = 0.05; } }
];

M.STORY = {
  intro: [
    'Em Porto Brabo, cidade\nque o mar não quis engolir,\ntoda Quarta de Cinzas\na festa insiste em seguir:\nacende-se a Brasa na praça\npra ninguém poder dormir.',
    'Mas a Brasa só se alimenta\nda energia de quem bate palma,\ne quem quiser ser guardião\ntem que entrar na roda com calma,\nganhar o povo no gingado\ne nunca perder a alma.',
    'Zeca Ventania, menino\nque o Mestre Cinzas criou,\nhoje entra pela primeira vez\nna roda que o fogo guardou.\nBate o berimbau. É agora.\nA roda nunca parou.'
  ],
  fights: [
    {
      opp: 'cinzas', stage: 'porto', tutorial: true, title: 'TREINO NO CAIS',
      pre: [
        { who: 'cinzas', text: 'Antes da roda, o treino. Me mostra o que aprendeu, menino.' },
        { who: 'zeca', text: 'Mestre, o povo já tá chegando na praça...' },
        { who: 'cinzas', text: 'O povo espera. O fogo também. Vem.' }
      ],
      post: [
        { who: 'cinzas', text: 'Já dá pro gasto. Vai. E lembra: a roda escuta quem escuta a roda.' },
        { who: 'zeca', text: 'O senhor não vem comigo?' },
        { who: 'cinzas', text: '...Eu chego lá. Sempre chego.' }
      ]
    },
    {
      opp: 'bia', stage: 'ladeira', title: 'PRIMEIRA RODA — A LADEIRA',
      pre: [
        { who: 'lourdes', text: 'Primeira roda da noite! Bia Sombrinha, a dona da ladeira, contra o menino do Mestre Cinzas!' },
        { who: 'bia', text: 'Capoeira na minha ladeira? Aqui o passo é frevo, meu bem. Pisa certo ou cai.' },
        { who: 'zeca', text: 'Então abre a sombrinha, que vai chover ginga.' }
      ],
      post: [
        { who: 'bia', text: 'Tu dança bonito, menino. A ladeira é tua por hoje.' },
        { who: 'bia', text: 'Mas cuidado com o rio. A Maré não perdoa quem tem pressa.' }
      ],
      patua: true
    },
    {
      opp: 'mare', stage: 'rio', title: 'SEGUNDA RODA — O RIO',
      pre: [
        { who: 'mare', text: 'Você veio de longe pra afundar aqui, moço? O rio não tem pressa. Eu também não.' },
        { who: 'zeca', text: 'Água não me assusta. Eu nasci no cais.' },
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
      opp: 'tiao', stage: 'sertao', title: 'TERCEIRA RODA — O SERTÃO',
      pre: [
        { who: 'tiao', text: 'Lá no sertão a gente não ginga, não. A gente agarra e não larga.' },
        { who: 'zeca', text: 'Então corre atrás, vaqueiro.' },
        { who: 'tiao', text: 'Defende se quiser, moleque. Laço não respeita guarda.' }
      ],
      post: [
        { who: 'tiao', text: 'Arretado. Tu derrubou um boi hoje.' },
        { who: 'tiao', text: 'Vou te dizer uma coisa: teu Mestre apostou contra tu. Eu vi, com esses olhos. Ele não quer ninguém chegando na Brasa.' },
        { who: 'zeca', text: 'Mentira.' },
        { who: 'tiao', text: 'Pergunta pro Bené, lá no terreiro. Ele conhece o Cinzas desde moleque.' }
      ],
      patua: true
    },
    {
      opp: 'bene', stage: 'terreiro', title: 'QUARTA RODA — O TERREIRO',
      pre: [
        { who: 'bene', text: 'Foi teu Mestre que me ensinou a tocar. E fui eu que ensinei ele a escutar. Hoje ele não escuta mais ninguém.' },
        { who: 'zeca', text: 'Então me ensina o que ele esqueceu.' },
        { who: 'bene', text: 'Escuta o berimbau. Bate junto com ele. O resto, a roda faz.' }
      ],
      post: [
        { who: 'bene', text: 'Tá no compasso, menino. Agora vai lá no Pantanal.' },
        { who: 'bene', text: 'O Boitatá guarda a chama há mais tempo que todo mundo. Ele sabe o que o Cinzas quer fazer com a Brasa — e por quê.' }
      ],
      patua: true
    },
    {
      opp: 'juvenal', stage: 'pantanal', title: 'QUINTA RODA — O PANTANAL',
      pre: [
        { who: 'juvenal', text: 'Eu sou o fogo que o Mestre quer apagar. Se ele vencer a roda hoje, a Brasa morre. E a cidade dorme pra sempre.' },
        { who: 'zeca', text: '...O Mestre nunca faria isso.' },
        { who: 'juvenal', text: 'Então me vence, e pergunta a ele.' }
      ],
      post: [
        { who: 'juvenal', text: 'Vai, menino. A Brasa tá quase no fim.' },
        { who: 'juvenal', text: 'Só sobrou você entre ela e ele. Escuta a roda. Ela vai te dizer o que fazer.' }
      ],
      patua: true
    },
    {
      opp: 'cinzas', stage: 'cinzas', boss: true, title: 'RODA DO FOGO — A PRAÇA DAS CINZAS',
      pre: [
        { who: 'cinzas', text: 'Você chegou mais longe do que eu queria, Zeca.' },
        { who: 'zeca', text: 'Por quê, Mestre? A Brasa é da cidade.' },
        { who: 'cinzas', text: 'A Brasa levou a minha Rosa numa roda igual a essa. Trinta anos atrás. Toda festa cobra um preço.' },
        { who: 'cinzas', text: 'Hoje eu encerro a conta.' },
        { who: 'zeca', text: 'Então a conta vai ser comigo.' }
      ],
      post: [
        { who: 'cinzas', text: '...A roda escuta quem escuta a roda. Eu parei de escutar faz tempo.' },
        { who: 'cinzas', text: 'A Brasa é sua agora, menino. O que você vai fazer com ela?' }
      ]
    }
  ],
  choice: {
    title: 'A BRASA É SUA',
    text: 'A praça está em silêncio. O povo olha pra você. A Brasa, pequena, treme no centro da roda. O Mestre espera.',
    options: [
      { id: 'acender', label: 'Manter a Brasa acesa', desc: 'A festa continua. Hoje, amanhã, sempre. A roda nunca para.' },
      { id: 'descansar', label: 'Deixar a Brasa dormir uma noite', desc: 'Pela Rosa. Pelo Mestre. Uma noite de silêncio — e amanhã o povo decide.' }
    ]
  },
  endings: {
    acender: {
      title: 'FINAL: A RODA NUNCA PARA',
      cordel: [
        'A Brasa subiu na praça\ne o povo gritou seu nome.\nO Mestre, lá do seu canto,\nbateu palma — quem diria, homem.\nToda festa cobra um preço;\nmas quem não dança, se consome.',
        'Zeca Ventania, guardião,\nacende a cidade todo ano.\nE o Mestre, de chapéu de palha,\nvolta pra roda sem engano:\n"Rosa dançava, menino.\nEu é que vivi enganado."'
      ]
    },
    descansar: {
      title: 'FINAL: UMA NOITE DE SILÊNCIO',
      cordel: [
        'Naquela noite, a cidade\ndormiu pela primeira vez.\nSem fogo, sem berimbau,\nsó o mar e a sua maré.\nO Mestre chorou baixinho\ne Zeca não disse por quê.',
        'E de manhã, sem guardião,\no povo acendeu outra vez:\ncada um trouxe um graveto,\ncada um trouxe um talvez.\nA Brasa não é de ninguém.\nÉ de quem bate palma. É de vocês.'
      ]
    }
  },
  credits: 'CAPOEIRA FIGHT BRASIL — A Roda Nunca Para\nUm jogo de luta brasileiro em xilogravura.\n\nPersonagens, mundo, música e código: criados do zero.\nTudo procedural — nenhum asset externo.\n\nObrigado por jogar. Agora vai lá e ensina alguém a gingar.'
};

M.SPEAKERS = {
  zeca: { name: 'Zeca Ventania', color: '#f2c230' },
  cinzas: { name: 'Mestre Cinzas', color: '#8d8a84' },
  bia: { name: 'Bia Sombrinha', color: '#c7267a' },
  mare: { name: 'Maré Bacuri', color: '#2aa9b8' },
  tiao: { name: 'Tião Sertão', color: '#c8371d' },
  juvenal: { name: 'Juvenal Boitatá', color: '#e8712b' },
  bene: { name: 'Bené Berimbau', color: '#c47a4a' },
  lourdes: { name: 'Dona Lourdes (no pandeiro)', color: '#1f7a4d' }
};
