'use strict';
// Ajustes nativos idempotentes (rodam depois de `cap add` e de `cap sync`): paisagem, tela cheia imersiva,
// sem permissão de internet, versão, assinatura de lançamento e Info.plist do iOS.
const fs = require('fs'); const path = require('path');
const ROOT = path.join(__dirname, '..'); const VERSION = require(path.join(ROOT, 'package.json')).version;
const [MA, MI, PA] = VERSION.split('.').map(Number); const CODE = MA * 10000 + MI * 100 + PA;    // 2.0.0 -> 20000
const rw = (f, fn) => { if (!fs.existsSync(f)) return false; const a = fs.readFileSync(f, 'utf8'), b = fn(a); if (b !== a) fs.writeFileSync(f, b); return true; };

// ---------------- Android ----------------
const AND = path.join(ROOT, 'android', 'app');
if (fs.existsSync(AND)) {
  rw(path.join(AND, 'src/main/AndroidManifest.xml'), s => {
    if (!s.includes('sensorLandscape')) s = s.replace('android:launchMode="singleTask"', 'android:launchMode="singleTask"\n            android:screenOrientation="sensorLandscape"');
    s = s.replace(/\n\s*<uses-permission android:name="android.permission.INTERNET" \/>/, '');                    // o jogo não usa rede
    if (!s.includes('screen.landscape')) s = s.replace('    <!-- Permissions -->', '    <uses-feature android:name="android.hardware.touchscreen" android:required="true" />\n    <uses-feature android:name="android.hardware.screen.landscape" android:required="true" />\n\n    <!-- Permissions: nenhuma. Sem rede, sem câmera, sem microfone, sem armazenamento externo. -->');
    return s;
  });
  // a depuração por USB/Wi-Fi precisa de INTERNET; só entra nas builds de debug
  const dbg = path.join(AND, 'src/debug/AndroidManifest.xml'); fs.mkdirSync(path.dirname(dbg), { recursive: true });
  fs.writeFileSync(dbg, '<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android">\n    <uses-permission android:name="android.permission.INTERNET" />\n</manifest>\n');
  fs.writeFileSync(path.join(AND, 'src/main/java/br/com/sertaofight/app/MainActivity.java'), `package br.com.sertaofight.app;

import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

// Jogo em tela cheia imersiva: sem barras do sistema (voltam com um deslize), ocupa a área do entalhe e mantém a tela acesa.
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (Build.VERSION.SDK_INT >= 28) {
            getWindow().getAttributes().layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }
        hideSystemBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    private void hideSystemBars() {
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        c.hide(WindowInsetsCompat.Type.systemBars());
    }
}
`);
  rw(path.join(AND, 'build.gradle'), s => {
    s = s.replace(/versionCode [^\n]+/, 'versionCode Integer.parseInt(System.getenv("SFB_VERSION_CODE") ?: "' + CODE + '")').replace(/versionName "[^"]*"/, 'versionName "' + VERSION + '"');
    if (!s.includes('signingConfigs')) {
      s = s.replace('    buildTypes {', `    // Assinatura de lançamento: vem de variáveis de ambiente (CI) ou de android/key.properties (máquina local). Nada disso vai para o git.
    def keyProps = new Properties()
    def keyFile = rootProject.file("key.properties")
    if (keyFile.exists()) { keyFile.withInputStream { keyProps.load(it) } }
    def ks = System.getenv("SFB_KEYSTORE") ?: keyProps.getProperty("storeFile")
    signingConfigs {
        release {
            if (ks) {
                storeFile file(ks)
                storePassword System.getenv("SFB_KEYSTORE_PASSWORD") ?: keyProps.getProperty("storePassword")
                keyAlias System.getenv("SFB_KEY_ALIAS") ?: keyProps.getProperty("keyAlias")
                keyPassword System.getenv("SFB_KEY_PASSWORD") ?: keyProps.getProperty("keyPassword")
            }
        }
    }
    buildTypes {`);
      s = s.replace('        release {\n            minifyEnabled false', '        release {\n            if (ks) { signingConfig signingConfigs.release }\n            minifyEnabled false');
    }
    return s;
  });
}

// ---------------- iOS ----------------
const IOS = path.join(ROOT, 'ios', 'App');
if (fs.existsSync(IOS)) {
  rw(path.join(IOS, 'App/Info.plist'), s => {
    const land = '\t<array>\n\t\t<string>UIInterfaceOrientationLandscapeLeft</string>\n\t\t<string>UIInterfaceOrientationLandscapeRight</string>\n\t</array>';
    s = s.replace(/<key>UISupportedInterfaceOrientations<\/key>\s*<array>[\s\S]*?<\/array>/, '<key>UISupportedInterfaceOrientations</key>\n' + land);
    s = s.replace(/<key>UISupportedInterfaceOrientations~ipad<\/key>\s*<array>[\s\S]*?<\/array>/, '<key>UISupportedInterfaceOrientations~ipad</key>\n' + land);
    s = s.replace('<string>armv7</string>', '<string>arm64</string>');
    s = s.replace('<key>UIViewControllerBasedStatusBarAppearance</key>\n\t<true/>', '<key>UIViewControllerBasedStatusBarAppearance</key>\n\t<false/>');
    if (!s.includes('UIStatusBarHidden')) s = s.replace('</dict>\n</plist>', '\t<key>UIStatusBarHidden</key>\n\t<true/>\n\t<key>UIRequiresFullScreen</key>\n\t<true/>\n\t<key>ITSAppUsesNonExemptEncryption</key>\n\t<false/>\n\t<key>LSApplicationCategoryType</key>\n\t<string>public.app-category.action-games</string>\n</dict>\n</plist>');
    return s;
  });
  rw(path.join(IOS, 'App.xcodeproj/project.pbxproj'), s => s.replace(/MARKETING_VERSION = [^;]+;/g, 'MARKETING_VERSION = ' + VERSION + ';'));
}
console.log('nativo ajustado • versão', VERSION, '• versionCode', CODE);
