'use strict';
// Gera art-kit/README.md (índice por plataforma) a partir do manifesto e dos arquivos reais.
const fs = require('fs'); const path = require('path');
const OUT = path.join(__dirname, '..', '..', 'art-kit');
const manifest = require('./manifest.js')();

const PURPOSE = [
  [/steam\/store\/header-capsule/, 'Header capsule — topo da página da loja e listas (Steamworks: Header Capsule)'],
  [/steam\/store\/small-capsule/, 'Small capsule — buscas e listas compactas (legível a 231×87)'],
  [/steam\/store\/main-capsule/, 'Main capsule — destaque na vitrine da loja'],
  [/steam\/store\/vertical-capsule/, 'Vertical capsule — ofertas e carrosséis'],
  [/steam\/store\/featured-key-art/, 'Arte de destaque da página da loja / imprensa (com logo)'],
  [/steam\/library\/library-capsule/, 'Library capsule — grade da biblioteca do jogador'],
  [/steam\/library\/library-hero/, 'Library hero — fundo da página do jogo na biblioteca (sem logo; lado esquerdo livre para o logo)'],
  [/steam\/library\/library-logo/, 'Library logo — logo com fundo transparente, sobreposto ao hero'],
  [/steam\/screenshots/, 'Screenshot de gameplay real (sem retoque e sem texto)'],
  [/google-play\/icon/, 'Ícone do app (512×512, quadrado cheio; o Play aplica a máscara)'],
  [/google-play\/feature/, 'Imagem de destaque da ficha do app'],
  [/google-play\/phone/, 'Screenshot de celular (captura real com controles de toque + manchete)'],
  [/google-play\/tablet/, 'Screenshot de tablet 7" e 10" (captura real em proporção 4:3 + manchete)'],
  [/app-store\/app-icon/, 'Ícone do app (1024×1024, sem alfa e sem cantos arredondados)'],
  [/app-store\/iphone-6.3/, 'Screenshot iPhone — Dynamic Island médio (tamanho obrigatório)'],
  [/app-store\/iphone-6.9/, 'Screenshot iPhone — Dynamic Island grande (opcional)'],
  [/app-store\/ipad/, 'Screenshot iPad 13" (obrigatório se houver versão para iPad)'],
  [/instagram\/perfil/, 'Foto de perfil'],
  [/instagram\/carrossel-os-20/, 'Carrossel "Os 20 lutadores" (capa + 5 lâminas com retratos oficiais)'],
  [/instagram\/carrossel-como/, 'Carrossel "Como funciona" (capa + 6 lâminas com capturas reais)'],
  [/instagram\/carrossel-cen/, 'Carrossel "Os cenários" (capa + 6 cenários do jogo)'],
  [/instagram\/lutador-do-dia/, 'Série "Lutador do dia" (carta com dados oficiais do lutador)'],
  [/instagram\/feed/, 'Post único de apresentação'],
  [/instagram\/reels/, 'Capa de Reel (miolo 3:4 seguro para a grade)'],
  [/instagram\/stories/, 'Story (deixe o topo e a base livres para adesivos)'],
  [/instagram\/destaques/, 'Capa de destaque do perfil']
];
const purpose = f => (PURPOSE.find(([re]) => re.test(f)) || [0, ''])[1];
const kb = f => { const p = path.join(OUT, f); return fs.existsSync(p) ? Math.round(fs.statSync(p).size / 1024) : 0; };
const SECTIONS = [['steam/', 'Steam (Steamworks)'], ['google-play/', 'Google Play Console'], ['app-store/', 'Apple App Store Connect'], ['instagram/', 'Instagram (PT-BR)']];

let md = `# Kit de arte de lançamento — Sertão Fight Brasil

Todas as imagens foram geradas **a partir do próprio jogo**: cenários pintados, lutadores, projéteis, logo e telas reais renderizados pelo motor do jogo (nada foi redesenhado ou gerado por IA). O que o kit acrescenta é só enquadramento, luz, vinheta, tipografia no estilo do logo e as manchetes.

- **Idioma:** Steam, Google Play e App Store em inglês; Instagram em português do Brasil.
- **Texto das manchetes:** só recursos confirmados no jogo (vinte lutadores, barra de Energia única, Peia, três finais, ranqueada e torneio local, missões e maestria, música sintetizada). Não há menção a multijogador online, nem selos "Baixe na App Store / Disponível no Google Play".
- **Capturas de celular e tablet:** feitas com o jogo rodando no navegador em modo de toque (PWA, horizontal), com os controles na tela. **Ainda não existe build nativo para Android ou iOS** — os arquivos de Google Play e App Store estão prontos para quando existirem; confirme que o app publicado se comporta como mostrado.
- **Regenerar tudo:** \`node tools/art/capture.js\` (capturas reais) → \`node tools/art/make_kit.js\` → \`node tools/art/verify.js\` → \`node tools/art/readme.js\`. Detalhes no cabeçalho de cada script.

## Especificações usadas
| Loja | Fonte |
| --- | --- |
| Steam | [Steamworks — Store Graphical Assets](https://partner.steamgames.com/doc/store/assets) (tamanhos de agosto/2024: header 920×430, small 462×174, main 1232×706, vertical 748×896; library 600×900, hero 3840×1240, logo 1280×720) |
| Google Play | [Google Play Console — Add preview assets](https://support.google.com/googleplay/android-developer/answer/9866151) (ícone 512×512 ≤ 1 MB; destaque 1024×500 sem alfa; até 8 screenshots por tipo, lados 320–3840 px, proporção máx. 2:1) |
| Apple | [App Store Connect — Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications) (iPhone Dynamic Island médio 2622×1206 obrigatório, grande 2868×1320 opcional, iPad 13" 2752×2064; PNG/JPEG sem alfa; 1–10 por tamanho) |
| Instagram | guias de terceiros: feed/carrossel 1080×1350 (4:5), Stories e Reels 1080×1920, perfil 320×320 — confira no Gerenciador de Anúncios se for impulsionar |

> As páginas da Steam e do Google Play não puderam ser abertas diretamente durante a produção (rede bloqueada); os valores vieram de resultados que citam essas páginas. A Steamworks e o Play Console validam os tamanhos no envio.

`;
for (const [pre, title] of SECTIONS) {
  const items = manifest.filter(s => s.file.startsWith(pre)); if (!items.length) continue;
  md += `## ${title}\n\n| Arquivo | Finalidade | Pixels | Formato | KB |\n| --- | --- | --- | --- | --- |\n`;
  for (const s of items) md += `| \`${s.file}\` | ${purpose(s.file)} | ${s.sizeFree ? '≤ ' : ''}${s.w}×${s.h} | ${s.fmt.toUpperCase()}${s.alpha ? ' (transparente)' : ''} | ${kb(s.file)} |\n`;
  md += '\n';
}
md += `## Checklist antes de enviar
- [ ] Steam: envie as cápsulas em *Store Page ▸ Graphical Assets* e os arquivos da pasta \`library/\` em *Library Assets*; ajuste a posição do logo sobre o hero.
- [ ] Google Play: confirme a classificação etária e que as capturas representam a versão publicada.
- [ ] App Store: o tamanho 2622×1206 é o obrigatório; o 2868×1320 é opcional; iPad só se o app rodar em iPadOS.
- [ ] Instagram: o miolo 3:4 da capa de Reel (1080×1440) é o que aparece na grade; legendas sugeridas em \`instagram/LEGENDAS.md\`.
`;
fs.writeFileSync(path.join(OUT, 'README.md'), md); console.log('art-kit/README.md', manifest.length, 'arquivos');
