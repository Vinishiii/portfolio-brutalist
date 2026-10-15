# Sertão Fight Brasil — versão mobile (Android e iOS)

O app de celular é o jogo web empacotado com **Capacitor**: o mesmo jogo roda dentro de um WebView nativo, com controles de toque, salvamento no sistema, pausa ao ir para segundo plano, botão voltar do Android, vibração e a folha de compartilhamento do sistema. Não usa internet nem pede permissões.

## Estado atual

| Item | Situação |
| --- | --- |
| Projetos nativos Android (Gradle) e iOS (Xcode, Swift Package Manager) | Gerados e no repositório |
| Ícone, ícone adaptativo e splash nos tamanhos de cada sistema | Gerados da arte do jogo |
| Ponte nativa do jogo (`js/native.js`) | Testada contra um simulador do Capacitor no navegador: salvamento duplo e restauração, pausa em segundo plano, botão voltar, vibração, compartilhar. O jogo no navegador e no Steam não muda |
| Controles de toque (`js/touch.js`): alavanca de fliperama de 8 direções + botões LEVE, FORTE, ESP., EX, ARREDA, AGARRA, PEIA, DASH, PROVOCA | Testados com toques simultâneos reais (Chromium em modo celular, vários dedos): cada golpe de cada um dos 20 lutadores sai pelo toque (normais, agachado, para a frente/trás, no ar, corrido, agarrão, EX, Peia), além de pulo, super pulo, dash, esquiva e pausa. **Sensação e tamanho dos botões nos dedos de verdade ainda dependem do seu teste**: ajuste em Opções ▸ Controles de toque |
| Compilação do iOS (simulador e aparelho, sem assinatura) | Conferida no GitHub Actions |
| Compilação do Android (APK de teste) | Conferida no GitHub Actions |
| **Teste em aparelho real** | **Ainda não feito.** Desempenho do WebGL, áudio no iOS, gravação de clipes, vibração, entalhe e botão voltar precisam ser vistos num celular de verdade |
| Contas de desenvolvedor, chaves de assinatura, ficha da loja, URL da política de privacidade, questionários de classificação | **São seus** (passo a passo abaixo) |

O identificador do app é `br.com.sertaofight.app`, o mesmo do app de desktop. **Confirme antes do primeiro envio:** depois de publicado ele não pode mudar (`mobile/capacitor.config.json`, `scripts/patch-native.js` e os projetos `android/` e `ios/` usam o valor).

## Estrutura
```
mobile/
  capacitor.config.json   nome, identificador, esquema do WebView
  scripts/sync-web.js     copia o jogo (index.html, css, js, fonts, icons) para mobile/www
  scripts/patch-native.js ajustes nativos idempotentes: paisagem, tela cheia, sem internet, versão, assinatura
  scripts/make-assets.js  regera ícone e splash a partir da arte do jogo
  assets/                 fontes de ícone e splash
  android/  ios/          projetos nativos (versionados)
  store/STORE_LISTING_MOBILE.md   textos da ficha (PT, EN, ES) e respostas dos questionários
  privacy/index.html      política de privacidade em PT, EN e ES (precisa ser publicada em uma URL)
../../.github/workflows/mobile-android.yml, mobile-ios.yml   builds na nuvem
```

## Gerar um APK de teste
- **Pelo GitHub:** Actions ▸ *Mobile Android* ▸ artefato `sertao-fight-brasil-android-debug`. Baixe, ative "instalar apps desconhecidos" no celular e abra o `.apk`, ou use `adb install`.
- **Na sua máquina:** Node 22, JDK 21 e o Android SDK 36 (Android Studio). Depois `cd mobile && npm ci && npm run android:debug`.

## Publicar no Google Play
1. Crie a conta no Play Console (taxa única; confira o valor atual).
2. Crie o app com o identificador acima. Contas pessoais novas costumam precisar de um teste fechado com um número mínimo de testadores antes da produção: confira a regra vigente no Play Console.
3. Gere a **chave de upload** e guarde o arquivo e as senhas em lugar seguro (se perder, a recuperação passa pelo suporte da Google):
   ```
   keytool -genkeypair -v -keystore upload.jks -alias sfb -keyalg RSA -keysize 2048 -validity 10000
   ```
4. No GitHub, em *Settings ▸ Secrets and variables ▸ Actions*, cadastre: `ANDROID_KEYSTORE_BASE64` (`base64 -w0 upload.jks`), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.
5. *Actions ▸ Mobile Android ▸ Run workflow*, marcando **release**. Baixe o `.aab` do artefato `sertao-fight-brasil-android-release-aab`.
6. No Play Console: envie o `.aab` em *Teste interno*, preencha a ficha com `store/STORE_LISTING_MOBILE.md`, as artes de `art-kit/google-play/`, a URL da política de privacidade, *Segurança dos dados* e a classificação de conteúdo.

## Publicar na App Store
1. Apple Developer Program (anuidade; confira o valor atual).
2. Em *Certificates, Identifiers & Profiles*, registre o identificador `br.com.sertaofight.app`; crie um **certificado de distribuição** (exporte como `.p12`) e um **perfil de provisionamento App Store**. Em *App Store Connect ▸ Usuários e acesso ▸ Chaves*, crie uma **chave de API** (`.p8`).
3. Cadastre os segredos no GitHub: `IOS_CERT_P12_BASE64`, `IOS_CERT_PASSWORD`, `IOS_PROFILE_BASE64`, `IOS_PROFILE_NAME`, `IOS_TEAM_ID`, `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8_BASE64`.
4. *Actions ▸ Mobile iOS ▸ Run workflow*, marcando **release**. **Esse trecho (assinar, exportar e enviar ao TestFlight) é um modelo que não foi executado**, porque depende da sua conta Apple; revise na primeira vez. A compilação sem assinatura roda sempre e já foi conferida.
5. Alternativa com um Mac: `cd mobile && npm ci && npm run ios:open`, depois *Product ▸ Archive* no Xcode.
6. No App Store Connect: ficha com `store/STORE_LISTING_MOBILE.md`, capturas de `art-kit/app-store/` (iPhone 2622×1206 é o obrigatório; iPad 2752×2064 só se o app rodar no iPad, e ele roda: o projeto é universal), política de privacidade e classificação etária.
7. A revisão da Apple pode questionar apps que são "só um site embrulhado" (diretriz 4.2). Este roda totalmente offline, com controles de toque próprios, vibração, salvamento no sistema e compartilhamento nativo. A decisão é da Apple.

## Quando o jogo mudar
```
cd mobile && npm ci && npm run sync        # copia o jogo, atualiza os plugins e reaplica os ajustes nativos
```
A versão do app vem de `mobile/package.json` (`version`); o `versionCode` do Android é `20000 + número da execução` no GitHub (sempre crescente, como a Play exige) e o `CURRENT_PROJECT_VERSION` do iOS é o número da execução.

## Links de desafio
Os links de desafio apontam para a versão web do jogo. Defina o endereço público dela ao empacotar:
```
SFB_WEB_URL=https://seu-endereco/ npm run sync:web
```
Sem isso o app mostra um endereço de exemplo. Abrir o link dentro do app (links universais) não está implementado.

## Limitações conhecidas
- Conquistas são locais (sem Game Center nem Google Play Games).
- Sem login e sem nuvem: trocar de aparelho não leva o progresso.
- A gravação automática de clipes depende do WebView; a opção só aparece quando o aparelho suporta.
- Desempenho medido só em renderização por software no computador. Em celulares fracos, use *Qualidade gráfica ▸ Baixa* nas opções.
