// ===== 字変 共通サウンド管理（iOS対応版） =====
// 全ページで <script src="js/audio.js"></script> を読み込むだけで
// BGM再生・音量設定（設定画面での変更含む）が自動的に反映されます。
//
// iOSのSafariは <audio>.volume をJSから変更できない制限があるため、
// Web Audio API の GainNode で音量調整を行います。

(function () {
  const bgmEl = document.getElementById('bgm');
  if (!bgmEl) return;

  let gainNode = null;
  let audioCtx = null;
  let useGain = false;

  function getSavedVolume() {
    const savedVol = localStorage.getItem('vol_bgm');
    return (savedVol !== null ? savedVol : 80) / 100;
  }

  // Web Audio API のセットアップ（GainNode経由の音量制御。iOS含む全ブラウザで動作）
  function setupGain() {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaElementSource(bgmEl);
      gainNode = audioCtx.createGain();
      source.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      useGain = true;
    } catch (e) {
      // Web Audio APIが使えない環境ではaudio.volumeにフォールバック
      useGain = false;
    }
  }
  setupGain();

  function applyBgmVolume() {
    const vol = getSavedVolume();
    if (useGain && gainNode) {
      gainNode.gain.value = vol;
    } else {
      bgmEl.volume = vol;
    }
  }
  applyBgmVolume();

  // ブラウザの自動再生ブロック対策：最初のタップ/クリックで再生開始
  const tryPlayBgm = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    bgmEl.play().catch(() => {});
    document.removeEventListener('click', tryPlayBgm);
    document.removeEventListener('touchstart', tryPlayBgm);
  };
  document.addEventListener('click', tryPlayBgm, { once: true });
  document.addEventListener('touchstart', tryPlayBgm, { once: true });

  // 他のタブ/ページで音量が変更された場合にも追従（storageイベント）
  window.addEventListener('storage', (e) => {
    if (e.key === 'vol_bgm') applyBgmVolume();
  });

  // ページがbfcacheから復元された時にも音量を再適用
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) applyBgmVolume();
  });

  // グローバルに公開（他スクリプトから直接呼びたい場合用）
  window.__applyBgmVolume = applyBgmVolume;
})();

// ===== 効果音（SE）再生用ヘルパー =====
// 使い方: playSE('images/se/card_place.mp3') のように呼び出す
function playSE(src) {
  const savedVol = localStorage.getItem('vol_se');
  const vol = (savedVol !== null ? savedVol : 80) / 100;
  if (vol <= 0) return; // 音量0なら再生自体スキップ
  const se = new Audio(src);
  se.volume = vol; // 効果音は短い単発再生なのでaudio.volumeで十分（iOSでも初期値としては反映される）
  se.play().catch(() => {});
}

// ===== 音量保存共通関数（setting.html から呼び出し） =====
function saveVolume(type, val) {
  localStorage.setItem('vol_' + type, val);
  if (type === 'bgm' && window.__applyBgmVolume) {
    window.__applyBgmVolume();
  }
}