// ===== 字変 共通サウンド管理 =====
// 全ページで <audio id="bgm" ...> と <script src="js/audio.js"> を読み込む。
// BGMはページをまたいで同じ位置から継続します。
// index.html など「最初は鳴らさない」ページは <body data-bgm-autostart="false"> を指定。

(function () {
  const bgmEl = document.getElementById('bgm');
  if (!bgmEl) return;

  let audioCtx = null;
  let gainNode = null;

  // このページでBGMを新規に自動開始してよいか
  const autostart = document.body.getAttribute('data-bgm-autostart') !== 'false';

  function getVol() {
    const savedVol = localStorage.getItem('vol_bgm');
    return (savedVol !== null ? Number(savedVol) : 80) / 100;
  }

  // Web Audio API のグラフ構築（iOSでも音量制御できる確実な方法）
  function setupAudioGraph() {
    if (audioCtx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
      gainNode = audioCtx.createGain();
      const source = audioCtx.createMediaElementSource(bgmEl);
      source.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      gainNode.gain.value = getVol();
    } catch (e) {
      gainNode = null;
      bgmEl.volume = getVol();
    }
  }

  function applyBgmVolume() {
    const vol = getVol();
    if (gainNode) gainNode.gain.value = vol;
    else bgmEl.volume = vol;
    bgmEl.muted = (vol <= 0); // iOSでも確実にミュート
  }
  applyBgmVolume();

  // ===== ページまたぎの再生継続 =====
  const shouldPlay = localStorage.getItem('bgm_should_play') === 'true';
  if (shouldPlay) {
    const pos = parseFloat(localStorage.getItem('bgm_position')) || 0;
    try { bgmEl.currentTime = pos; } catch (e) {}
  }

  // 自動再生ブロック対策：最初のタップ/クリックで再生
  const tryPlayBgm = () => {
    setupAudioGraph();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    applyBgmVolume();
    if (shouldPlay) {
      // 他ページから継続再生
      bgmEl.play().catch(() => {});
    } else if (autostart) {
      // このページで新規開始
      localStorage.setItem('bgm_should_play', 'true');
      bgmEl.play().catch(() => {});
    }
    document.removeEventListener('click', tryPlayBgm);
    document.removeEventListener('touchstart', tryPlayBgm);
  };
  document.addEventListener('click', tryPlayBgm, { once: true });
  document.addEventListener('touchstart', tryPlayBgm, { once: true });

  // 再生位置を定期的に保存（ページ移動時に直前の位置を残すため）
  setInterval(() => {
    if (!bgmEl.paused) {
      localStorage.setItem('bgm_position', bgmEl.currentTime);
      localStorage.setItem('bgm_should_play', 'true');
    }
  }, 1000);

  // ページ移動時に状態を保存
  const saveState = () => {
    localStorage.setItem('bgm_position', bgmEl.currentTime);
    localStorage.setItem('bgm_should_play', bgmEl.paused ? 'false' : 'true');
  };
  window.addEventListener('pagehide', saveState);
  window.addEventListener('beforeunload', saveState);

  // 他タブで音量が変更された場合に追従
  window.addEventListener('storage', (e) => {
    if (e.key === 'vol_bgm') applyBgmVolume();
  });

  // ページ復元時に音量再適用
  window.addEventListener('pageshow', (e) => {
    applyBgmVolume();
    if (e.persisted) {
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      bgmEl.play().catch(() => {});
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') applyBgmVolume();
  });

  window._applyBgmVolume = applyBgmVolume;
})();

// ===== 効果音（SE）再生用ヘルパー =====
function playSE(src) {
  const savedVol = localStorage.getItem('vol_se');
  const vol = (savedVol !== null ? Number(savedVol) : 80) / 100;
  if (vol <= 0) return;
  const se = new Audio(src);
  se.volume = vol;
  se.muted = false;
  se.play().catch(() => {});
}

// ===== 音量保存共通関数（setting.html から呼び出し） =====
function saveVolume(type, val) {
  localStorage.setItem('vol_' + type, val);
  if (type === 'bgm') {
    const bgmEl = document.getElementById('bgm');
    if (bgmEl) {
      bgmEl.volume = Number(val) / 100;
      bgmEl.muted = (Number(val) <= 0);
      if (window._applyBgmVolume) window._applyBgmVolume();
    }
  }
}