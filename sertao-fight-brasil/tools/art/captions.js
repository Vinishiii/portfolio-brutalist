'use strict';
// Gera art-kit/instagram/LEGENDAS.md: legendas em PT-BR prontas, com dados oficiais de cada lutador lidos do jogo.
const pw = require('playwright'); const fs = require('fs'); const path = require('path');
const OUT = path.join(__dirname, '..', '..', 'art-kit', 'instagram', 'LEGENDAS.md');
const URL = process.env.GAME_URL || 'http://localhost:8766/index.html';
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const ORDER = ['zeca', 'bia', 'mare', 'tiao', 'bene', 'juvenal', 'vinicius', 'fulozinha', 'mula', 'papafigo', 'cuia', 'saci', 'curupira', 'iara', 'boto', 'lobisomem', 'mapinguari', 'cuca', 'pisadeira', 'cinzas'];
(async () => {
  const browser = await pw.chromium.launch(fs.existsSync(CHROME) ? { executablePath: CHROME, args: ['--no-sandbox'] } : {});
  const page = await browser.newPage(); await page.goto(URL + '?lang=pt', { waitUntil: 'load' }); await page.waitForTimeout(1500);
  const F = await page.evaluate(ids => ids.map(id => { const d = M.FIGHTERS[id]; return { id, name: d.name, alias: d.alias, origin: d.origin, style: d.style, quote: d.quote, bio: d.bio, sup: d.superName }; }), ORDER);
  await browser.close();
  const tags = '#SertãoFightBrasil #JogoBrasileiro #JogoDeLuta #FightingGame #Cordel #FolcloreBrasileiro #IndieGame #GameDev';
  let md = `# Legendas sugeridas — Instagram (PT-BR)

Textos prontos para colar. Só falam do que o jogo realmente tem. Ajuste links/@ e a data conforme o seu plano de publicação.

## Post de apresentação (\`feed/post-apresentacao\`)
A RINHA NUNCA PARA 🔥
Sertão Fight Brasil é um jogo de luta brasileiro, desenhado como capa de cordel e animado como pintura. São vinte lutadores — do sertão ao folclore do Brasil inteiro —, uma barra de Energia só no meio da tela (a torcida!) e música sintetizada ao vivo em zabumba, triângulo e sanfona.
${tags}

## Carrossel "Os 20 lutadores"
Vinte lutadores, vinte estilos 🥊 Do sertão ao folclore de todo o Brasil: Zeca Ventania, Bia Sombrinha, Maré Bacuri, Tião Sertão, Bené Sanfona, Juvenal Boitatá, Vinícius Andrey, Comadre Fulozinha, Mula-sem-Cabeça, Seu Papa-Figo, Cabeça de Cuia, Saci-Pererê, Curupira, Iara, Boto Cor-de-Rosa, Lobisomem, Mapinguari, Cuca, Pisadeira e Mestre Cinzas. Qual é o seu?
${tags}

## Carrossel "Como se luta"
Uma barra só, e a torcida decide 📣 Acerte golpes variados, esquive na hora certa e bata no compasso da zabumba para puxar a Energia para o seu lado. Com 70% de Energia, solte a Peia — o especial do seu lutador. Tem modo História com três finais, ranqueada, torneio local para até 16 jogadores e muita coisa para desbloquear jogando (sem caixa de sorte).
${tags}

## Carrossel "Os cenários"
Seis noites, seis arenas: Ladeira do Forró, Beira do Velho Chico, Serra do Vento, Rinha do Bené, Galpão Tech da Vila e Beco da Matriz. Qual é o seu palco favorito?
${tags}

## Stories (\`stories/\`)
- **Quem você escolhe?** — fixe uma caixinha de enquete/perguntas; "São 20 lutadores. Qual é o seu?"
- **Modo História** — "Uma noite em Vila Brasa. Três finais — um deles é secreto."
- **Solte a Peia** — "O especial de cada lutador."
- **Rinha da Semana** — "Três lutas seguidas com regras malucas."

## Lutador do dia (\`lutador-do-dia/\`)
`;
  F.forEach((f, i) => { md += `\n### ${String(i + 1).padStart(2, '0')} — ${f.name}\n**${f.name}** — ${f.alias}\n📍 ${f.origin}\n🥊 Estilo: ${f.style}\n🔥 Peia: ${f.sup}\n\n“${f.quote}”\n\n${f.bio}\n\nLutador ${i + 1} de 20. Qual é o seu favorito? ${tags}\n`; });
  fs.writeFileSync(OUT, md); console.log('ok', OUT);
})();
