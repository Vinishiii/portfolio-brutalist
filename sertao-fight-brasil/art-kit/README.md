# Kit de arte de lançamento — Sertão Fight Brasil

Todas as imagens foram geradas **a partir do próprio jogo**: cenários pintados, lutadores, projéteis, logo e telas reais renderizados pelo motor do jogo (nada foi redesenhado ou gerado por IA). O que o kit acrescenta é só enquadramento, luz, vinheta, tipografia no estilo do logo e as manchetes.

- **Idioma:** Steam, Google Play e App Store em inglês; Instagram em português do Brasil.
- **Texto das manchetes:** só recursos confirmados no jogo (vinte lutadores, barra de Energia única, Peia, três finais, ranqueada e torneio local, missões e maestria, música sintetizada). Não há menção a multijogador online, nem selos "Baixe na App Store / Disponível no Google Play".
- **Capturas de celular e tablet:** feitas com o jogo rodando no navegador em modo de toque (PWA, horizontal), com os controles na tela. **Ainda não existe build nativo para Android ou iOS** — os arquivos de Google Play e App Store estão prontos para quando existirem; confirme que o app publicado se comporta como mostrado.
- **Regenerar tudo:** `node tools/art/capture.js` (capturas reais) → `node tools/art/make_kit.js` → `node tools/art/verify.js` → `node tools/art/readme.js`. Detalhes no cabeçalho de cada script.

## Especificações usadas
| Loja | Fonte |
| --- | --- |
| Steam | [Steamworks — Store Graphical Assets](https://partner.steamgames.com/doc/store/assets) (tamanhos de agosto/2024: header 920×430, small 462×174, main 1232×706, vertical 748×896; library 600×900, hero 3840×1240, logo 1280×720) |
| Google Play | [Google Play Console — Add preview assets](https://support.google.com/googleplay/android-developer/answer/9866151) (ícone 512×512 ≤ 1 MB; destaque 1024×500 sem alfa; até 8 screenshots por tipo, lados 320–3840 px, proporção máx. 2:1) |
| Apple | [App Store Connect — Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications) (iPhone Dynamic Island médio 2622×1206 obrigatório, grande 2868×1320 opcional, iPad 13" 2752×2064; PNG/JPEG sem alfa; 1–10 por tamanho) |
| Instagram | guias de terceiros: feed/carrossel 1080×1350 (4:5), Stories e Reels 1080×1920, perfil 320×320 — confira no Gerenciador de Anúncios se for impulsionar |

> As páginas da Steam e do Google Play não puderam ser abertas diretamente durante a produção (rede bloqueada); os valores vieram de resultados que citam essas páginas. A Steamworks e o Play Console validam os tamanhos no envio.

## Steam (Steamworks)

| Arquivo | Finalidade | Pixels | Formato | KB |
| --- | --- | --- | --- | --- |
| `steam/store/featured-key-art_1920x1080.png` | Arte de destaque da página da loja / imprensa (com logo) | 1920×1080 | PNG | 2216 |
| `steam/store/main-capsule_1232x706.png` | Main capsule — destaque na vitrine da loja | 1232×706 | PNG | 1025 |
| `steam/store/header-capsule_920x430.png` | Header capsule — topo da página da loja e listas (Steamworks: Header Capsule) | 920×430 | PNG | 532 |
| `steam/store/small-capsule_462x174.png` | Small capsule — buscas e listas compactas (legível a 231×87) | 462×174 | PNG | 116 |
| `steam/store/vertical-capsule_748x896.png` | Vertical capsule — ofertas e carrosséis | 748×896 | PNG | 756 |
| `steam/library/library-capsule_600x900.png` | Library capsule — grade da biblioteca do jogador | 600×900 | PNG | 629 |
| `steam/library/library-hero_3840x1240.png` | Library hero — fundo da página do jogo na biblioteca (sem logo; lado esquerdo livre para o logo) | 3840×1240 | PNG | 4546 |
| `steam/library/library-logo_1280x720.png` | Library logo — logo com fundo transparente, sobreposto ao hero | ≤ 1280×720 | PNG (transparente) | 624 |
| `steam/screenshots/01-fight-ladeira-combo_1920x1080.png` | Screenshot de gameplay real (sem retoque e sem texto) | 1920×1080 | PNG | 2144 |
| `steam/screenshots/02-fight-galpao-code_1920x1080.png` | Screenshot de gameplay real (sem retoque e sem texto) | 1920×1080 | PNG | 2186 |
| `steam/screenshots/03-select_1920x1080.png` | Screenshot de gameplay real (sem retoque e sem texto) | 1920×1080 | PNG | 1360 |
| `steam/screenshots/04-fight-sertao-wolf_1920x1080.png` | Screenshot de gameplay real (sem retoque e sem texto) | 1920×1080 | PNG | 2007 |
| `steam/screenshots/05-map_1920x1080.png` | Screenshot de gameplay real (sem retoque e sem texto) | 1920×1080 | PNG | 1163 |
| `steam/screenshots/06-fight-terreiro_1920x1080.png` | Screenshot de gameplay real (sem retoque e sem texto) | 1920×1080 | PNG | 2149 |
| `steam/screenshots/07-bracket_1920x1080.png` | Screenshot de gameplay real (sem retoque e sem texto) | 1920×1080 | PNG | 1039 |
| `steam/screenshots/08-fight-parnaiba_1920x1080.png` | Screenshot de gameplay real (sem retoque e sem texto) | 1920×1080 | PNG | 2065 |
| `steam/screenshots/09-progress_1920x1080.png` | Screenshot de gameplay real (sem retoque e sem texto) | 1920×1080 | PNG | 1093 |
| `steam/screenshots/10-fight-porto_1920x1080.png` | Screenshot de gameplay real (sem retoque e sem texto) | 1920×1080 | PNG | 2099 |

## Google Play Console

| Arquivo | Finalidade | Pixels | Formato | KB |
| --- | --- | --- | --- | --- |
| `google-play/icon_512x512.png` | Ícone do app (512×512, quadrado cheio; o Play aplica a máscara) | 512×512 | PNG | 87 |
| `google-play/feature-graphic_1024x500.png` | Imagem de destaque da ficha do app | 1024×500 | PNG | 663 |
| `google-play/phone/01-select_1920x1080.jpg` | Screenshot de celular (captura real com controles de toque + manchete) | 1920×1080 | JPG | 569 |
| `google-play/phone/02-fight-ladeira-combo_1920x1080.jpg` | Screenshot de celular (captura real com controles de toque + manchete) | 1920×1080 | JPG | 571 |
| `google-play/phone/03-fight-galpao-code_1920x1080.jpg` | Screenshot de celular (captura real com controles de toque + manchete) | 1920×1080 | JPG | 551 |
| `google-play/phone/04-fight-sertao-wolf_1920x1080.jpg` | Screenshot de celular (captura real com controles de toque + manchete) | 1920×1080 | JPG | 578 |
| `google-play/phone/05-map_1920x1080.jpg` | Screenshot de celular (captura real com controles de toque + manchete) | 1920×1080 | JPG | 400 |
| `google-play/phone/06-vscard_1920x1080.jpg` | Screenshot de celular (captura real com controles de toque + manchete) | 1920×1080 | JPG | 395 |
| `google-play/phone/07-fight-terreiro_1920x1080.jpg` | Screenshot de celular (captura real com controles de toque + manchete) | 1920×1080 | JPG | 577 |
| `google-play/phone/08-fight-parnaiba_1920x1080.jpg` | Screenshot de celular (captura real com controles de toque + manchete) | 1920×1080 | JPG | 524 |
| `google-play/tablet-7-and-10in/01-select_2560x1600.jpg` | Screenshot de tablet 7" e 10" (captura real em proporção 4:3 + manchete) | 2560×1600 | JPG | 902 |
| `google-play/tablet-7-and-10in/02-fight-ladeira-combo_2560x1600.jpg` | Screenshot de tablet 7" e 10" (captura real em proporção 4:3 + manchete) | 2560×1600 | JPG | 880 |
| `google-play/tablet-7-and-10in/03-fight-galpao-code_2560x1600.jpg` | Screenshot de tablet 7" e 10" (captura real em proporção 4:3 + manchete) | 2560×1600 | JPG | 810 |
| `google-play/tablet-7-and-10in/04-fight-sertao-wolf_2560x1600.jpg` | Screenshot de tablet 7" e 10" (captura real em proporção 4:3 + manchete) | 2560×1600 | JPG | 921 |
| `google-play/tablet-7-and-10in/05-map_2560x1600.jpg` | Screenshot de tablet 7" e 10" (captura real em proporção 4:3 + manchete) | 2560×1600 | JPG | 674 |
| `google-play/tablet-7-and-10in/06-competitive_2560x1600.jpg` | Screenshot de tablet 7" e 10" (captura real em proporção 4:3 + manchete) | 2560×1600 | JPG | 723 |

## Apple App Store Connect

| Arquivo | Finalidade | Pixels | Formato | KB |
| --- | --- | --- | --- | --- |
| `app-store/app-icon_1024x1024.png` | Ícone do app (1024×1024, sem alfa e sem cantos arredondados) | 1024×1024 | PNG | 259 |
| `app-store/iphone-6.3in_2622x1206/01-select_2622x1206.jpg` | Screenshot iPhone — Dynamic Island médio (tamanho obrigatório) | 2622×1206 | JPG | 758 |
| `app-store/iphone-6.3in_2622x1206/02-fight-ladeira-combo_2622x1206.jpg` | Screenshot iPhone — Dynamic Island médio (tamanho obrigatório) | 2622×1206 | JPG | 779 |
| `app-store/iphone-6.3in_2622x1206/03-fight-galpao-code_2622x1206.jpg` | Screenshot iPhone — Dynamic Island médio (tamanho obrigatório) | 2622×1206 | JPG | 725 |
| `app-store/iphone-6.3in_2622x1206/04-fight-sertao-wolf_2622x1206.jpg` | Screenshot iPhone — Dynamic Island médio (tamanho obrigatório) | 2622×1206 | JPG | 780 |
| `app-store/iphone-6.3in_2622x1206/05-map_2622x1206.jpg` | Screenshot iPhone — Dynamic Island médio (tamanho obrigatório) | 2622×1206 | JPG | 557 |
| `app-store/iphone-6.3in_2622x1206/06-vscard_2622x1206.jpg` | Screenshot iPhone — Dynamic Island médio (tamanho obrigatório) | 2622×1206 | JPG | 541 |
| `app-store/iphone-6.3in_2622x1206/07-fight-terreiro_2622x1206.jpg` | Screenshot iPhone — Dynamic Island médio (tamanho obrigatório) | 2622×1206 | JPG | 787 |
| `app-store/iphone-6.3in_2622x1206/08-fight-parnaiba_2622x1206.jpg` | Screenshot iPhone — Dynamic Island médio (tamanho obrigatório) | 2622×1206 | JPG | 702 |
| `app-store/iphone-6.9in_2868x1320/01-select_2868x1320.jpg` | Screenshot iPhone — Dynamic Island grande (opcional) | 2868×1320 | JPG | 871 |
| `app-store/iphone-6.9in_2868x1320/02-fight-ladeira-combo_2868x1320.jpg` | Screenshot iPhone — Dynamic Island grande (opcional) | 2868×1320 | JPG | 896 |
| `app-store/iphone-6.9in_2868x1320/03-fight-galpao-code_2868x1320.jpg` | Screenshot iPhone — Dynamic Island grande (opcional) | 2868×1320 | JPG | 822 |
| `app-store/iphone-6.9in_2868x1320/04-fight-sertao-wolf_2868x1320.jpg` | Screenshot iPhone — Dynamic Island grande (opcional) | 2868×1320 | JPG | 905 |
| `app-store/iphone-6.9in_2868x1320/05-map_2868x1320.jpg` | Screenshot iPhone — Dynamic Island grande (opcional) | 2868×1320 | JPG | 642 |
| `app-store/iphone-6.9in_2868x1320/06-vscard_2868x1320.jpg` | Screenshot iPhone — Dynamic Island grande (opcional) | 2868×1320 | JPG | 612 |
| `app-store/iphone-6.9in_2868x1320/07-fight-terreiro_2868x1320.jpg` | Screenshot iPhone — Dynamic Island grande (opcional) | 2868×1320 | JPG | 888 |
| `app-store/iphone-6.9in_2868x1320/08-fight-parnaiba_2868x1320.jpg` | Screenshot iPhone — Dynamic Island grande (opcional) | 2868×1320 | JPG | 808 |
| `app-store/ipad-13in_2752x2064/01-select_2752x2064.jpg` | Screenshot iPad 13" (obrigatório se houver versão para iPad) | 2752×2064 | JPG | 1169 |
| `app-store/ipad-13in_2752x2064/02-fight-ladeira-combo_2752x2064.jpg` | Screenshot iPad 13" (obrigatório se houver versão para iPad) | 2752×2064 | JPG | 1144 |
| `app-store/ipad-13in_2752x2064/03-fight-galpao-code_2752x2064.jpg` | Screenshot iPad 13" (obrigatório se houver versão para iPad) | 2752×2064 | JPG | 1051 |
| `app-store/ipad-13in_2752x2064/04-fight-sertao-wolf_2752x2064.jpg` | Screenshot iPad 13" (obrigatório se houver versão para iPad) | 2752×2064 | JPG | 1196 |
| `app-store/ipad-13in_2752x2064/05-map_2752x2064.jpg` | Screenshot iPad 13" (obrigatório se houver versão para iPad) | 2752×2064 | JPG | 863 |
| `app-store/ipad-13in_2752x2064/06-vscard_2752x2064.jpg` | Screenshot iPad 13" (obrigatório se houver versão para iPad) | 2752×2064 | JPG | 854 |
| `app-store/ipad-13in_2752x2064/07-competitive_2752x2064.jpg` | Screenshot iPad 13" (obrigatório se houver versão para iPad) | 2752×2064 | JPG | 944 |
| `app-store/ipad-13in_2752x2064/08-progress_2752x2064.jpg` | Screenshot iPad 13" (obrigatório se houver versão para iPad) | 2752×2064 | JPG | 1007 |

## Instagram (PT-BR)

| Arquivo | Finalidade | Pixels | Formato | KB |
| --- | --- | --- | --- | --- |
| `instagram/perfil/avatar_1080x1080.png` | Foto de perfil | 1080×1080 | PNG | 278 |
| `instagram/perfil/avatar_320x320.png` | Foto de perfil | 320×320 | PNG | 44 |
| `instagram/carrossel-os-20-lutadores/01-capa_1080x1350.jpg` | Carrossel "Os 20 lutadores" (capa + 5 lâminas com retratos oficiais) | 1080×1350 | JPG | 469 |
| `instagram/carrossel-os-20-lutadores/02-lutadores_1080x1350.jpg` | Carrossel "Os 20 lutadores" (capa + 5 lâminas com retratos oficiais) | 1080×1350 | JPG | 369 |
| `instagram/carrossel-os-20-lutadores/03-lutadores_1080x1350.jpg` | Carrossel "Os 20 lutadores" (capa + 5 lâminas com retratos oficiais) | 1080×1350 | JPG | 380 |
| `instagram/carrossel-os-20-lutadores/04-lutadores_1080x1350.jpg` | Carrossel "Os 20 lutadores" (capa + 5 lâminas com retratos oficiais) | 1080×1350 | JPG | 332 |
| `instagram/carrossel-os-20-lutadores/05-lutadores_1080x1350.jpg` | Carrossel "Os 20 lutadores" (capa + 5 lâminas com retratos oficiais) | 1080×1350 | JPG | 357 |
| `instagram/carrossel-os-20-lutadores/06-lutadores_1080x1350.jpg` | Carrossel "Os 20 lutadores" (capa + 5 lâminas com retratos oficiais) | 1080×1350 | JPG | 352 |
| `instagram/carrossel-como-funciona/01-capa_1080x1350.jpg` | Carrossel "Como funciona" (capa + 6 lâminas com capturas reais) | 1080×1350 | JPG | 445 |
| `instagram/carrossel-como-funciona/02-fight-ladeira-combo_1080x1350.jpg` | Carrossel "Como funciona" (capa + 6 lâminas com capturas reais) | 1080×1350 | JPG | 471 |
| `instagram/carrossel-como-funciona/03-fight-galpao-code_1080x1350.jpg` | Carrossel "Como funciona" (capa + 6 lâminas com capturas reais) | 1080×1350 | JPG | 383 |
| `instagram/carrossel-como-funciona/04-fight-sertao-wolf_1080x1350.jpg` | Carrossel "Como funciona" (capa + 6 lâminas com capturas reais) | 1080×1350 | JPG | 423 |
| `instagram/carrossel-como-funciona/05-map_1080x1350.jpg` | Carrossel "Como funciona" (capa + 6 lâminas com capturas reais) | 1080×1350 | JPG | 353 |
| `instagram/carrossel-como-funciona/06-bracket_1080x1350.jpg` | Carrossel "Como funciona" (capa + 6 lâminas com capturas reais) | 1080×1350 | JPG | 355 |
| `instagram/carrossel-como-funciona/07-progress_1080x1350.jpg` | Carrossel "Como funciona" (capa + 6 lâminas com capturas reais) | 1080×1350 | JPG | 394 |
| `instagram/carrossel-cenarios/01-capa_1080x1350.jpg` | Carrossel "Os cenários" (capa + 6 cenários do jogo) | 1080×1350 | JPG | 427 |
| `instagram/carrossel-cenarios/02-ladeira_1080x1350.jpg` | Carrossel "Os cenários" (capa + 6 cenários do jogo) | 1080×1350 | JPG | 365 |
| `instagram/carrossel-cenarios/03-rio_1080x1350.jpg` | Carrossel "Os cenários" (capa + 6 cenários do jogo) | 1080×1350 | JPG | 351 |
| `instagram/carrossel-cenarios/04-sertao_1080x1350.jpg` | Carrossel "Os cenários" (capa + 6 cenários do jogo) | 1080×1350 | JPG | 340 |
| `instagram/carrossel-cenarios/05-terreiro_1080x1350.jpg` | Carrossel "Os cenários" (capa + 6 cenários do jogo) | 1080×1350 | JPG | 373 |
| `instagram/carrossel-cenarios/06-galpao_1080x1350.jpg` | Carrossel "Os cenários" (capa + 6 cenários do jogo) | 1080×1350 | JPG | 327 |
| `instagram/carrossel-cenarios/07-beco_1080x1350.jpg` | Carrossel "Os cenários" (capa + 6 cenários do jogo) | 1080×1350 | JPG | 290 |
| `instagram/lutador-do-dia/01-zeca_1080x1350.jpg` | Série "Lutador do dia" (carta com dados oficiais do lutador) | 1080×1350 | JPG | 383 |
| `instagram/lutador-do-dia/02-bia_1080x1350.jpg` | Série "Lutador do dia" (carta com dados oficiais do lutador) | 1080×1350 | JPG | 367 |
| `instagram/lutador-do-dia/03-mare_1080x1350.jpg` | Série "Lutador do dia" (carta com dados oficiais do lutador) | 1080×1350 | JPG | 364 |
| `instagram/lutador-do-dia/04-tiao_1080x1350.jpg` | Série "Lutador do dia" (carta com dados oficiais do lutador) | 1080×1350 | JPG | 357 |
| `instagram/lutador-do-dia/05-bene_1080x1350.jpg` | Série "Lutador do dia" (carta com dados oficiais do lutador) | 1080×1350 | JPG | 394 |
| `instagram/lutador-do-dia/06-juvenal_1080x1350.jpg` | Série "Lutador do dia" (carta com dados oficiais do lutador) | 1080×1350 | JPG | 372 |
| `instagram/lutador-do-dia/07-vinicius_1080x1350.jpg` | Série "Lutador do dia" (carta com dados oficiais do lutador) | 1080×1350 | JPG | 355 |
| `instagram/lutador-do-dia/08-fulozinha_1080x1350.jpg` | Série "Lutador do dia" (carta com dados oficiais do lutador) | 1080×1350 | JPG | 332 |
| `instagram/lutador-do-dia/09-mula_1080x1350.jpg` | Série "Lutador do dia" (carta com dados oficiais do lutador) | 1080×1350 | JPG | 336 |
| `instagram/lutador-do-dia/10-papafigo_1080x1350.jpg` | Série "Lutador do dia" (carta com dados oficiais do lutador) | 1080×1350 | JPG | 342 |
| `instagram/lutador-do-dia/11-cuia_1080x1350.jpg` | Série "Lutador do dia" (carta com dados oficiais do lutador) | 1080×1350 | JPG | 348 |
| `instagram/lutador-do-dia/12-saci_1080x1350.jpg` | Série "Lutador do dia" (carta com dados oficiais do lutador) | 1080×1350 | JPG | 342 |
| `instagram/lutador-do-dia/13-curupira_1080x1350.jpg` | Série "Lutador do dia" (carta com dados oficiais do lutador) | 1080×1350 | JPG | 338 |
| `instagram/lutador-do-dia/14-iara_1080x1350.jpg` | Série "Lutador do dia" (carta com dados oficiais do lutador) | 1080×1350 | JPG | 331 |
| `instagram/lutador-do-dia/15-boto_1080x1350.jpg` | Série "Lutador do dia" (carta com dados oficiais do lutador) | 1080×1350 | JPG | 384 |
| `instagram/lutador-do-dia/16-lobisomem_1080x1350.jpg` | Série "Lutador do dia" (carta com dados oficiais do lutador) | 1080×1350 | JPG | 365 |
| `instagram/lutador-do-dia/17-mapinguari_1080x1350.jpg` | Série "Lutador do dia" (carta com dados oficiais do lutador) | 1080×1350 | JPG | 337 |
| `instagram/lutador-do-dia/18-cuca_1080x1350.jpg` | Série "Lutador do dia" (carta com dados oficiais do lutador) | 1080×1350 | JPG | 336 |
| `instagram/lutador-do-dia/19-pisadeira_1080x1350.jpg` | Série "Lutador do dia" (carta com dados oficiais do lutador) | 1080×1350 | JPG | 375 |
| `instagram/lutador-do-dia/20-cinzas_1080x1350.jpg` | Série "Lutador do dia" (carta com dados oficiais do lutador) | 1080×1350 | JPG | 348 |
| `instagram/feed/post-apresentacao_1080x1350.jpg` | Post único de apresentação | 1080×1350 | JPG | 481 |
| `instagram/reels/capa-reel_1080x1920.jpg` | Capa de Reel (miolo 3:4 seguro para a grade) | 1080×1920 | JPG | 569 |
| `instagram/stories/01-select_1080x1920.jpg` | Story (deixe o topo e a base livres para adesivos) | 1080×1920 | JPG | 511 |
| `instagram/stories/02-map_1080x1920.jpg` | Story (deixe o topo e a base livres para adesivos) | 1080×1920 | JPG | 406 |
| `instagram/stories/03-fight-galpao-code_1080x1920.jpg` | Story (deixe o topo e a base livres para adesivos) | 1080×1920 | JPG | 445 |
| `instagram/stories/04-week_1080x1920.jpg` | Story (deixe o topo e a base livres para adesivos) | 1080×1920 | JPG | 447 |
| `instagram/destaques/01-lutadores_1080x1920.jpg` | Capa de destaque do perfil | 1080×1920 | JPG | 265 |
| `instagram/destaques/02-cenarios_1080x1920.jpg` | Capa de destaque do perfil | 1080×1920 | JPG | 275 |
| `instagram/destaques/03-historia_1080x1920.jpg` | Capa de destaque do perfil | 1080×1920 | JPG | 222 |
| `instagram/destaques/04-modos_1080x1920.jpg` | Capa de destaque do perfil | 1080×1920 | JPG | 229 |
| `instagram/destaques/05-folclore_1080x1920.jpg` | Capa de destaque do perfil | 1080×1920 | JPG | 211 |

## Checklist antes de enviar
- [ ] Steam: envie as cápsulas em *Store Page ▸ Graphical Assets* e os arquivos da pasta `library/` em *Library Assets*; ajuste a posição do logo sobre o hero.
- [ ] Google Play: confirme a classificação etária e que as capturas representam a versão publicada.
- [ ] App Store: o tamanho 2622×1206 é o obrigatório; o 2868×1320 é opcional; iPad só se o app rodar em iPadOS.
- [ ] Instagram: o miolo 3:4 da capa de Reel (1080×1440) é o que aparece na grade; legendas sugeridas em `instagram/LEGENDAS.md`.
