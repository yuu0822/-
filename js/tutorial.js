const tutorialPlayerDeck = ['火','水','木','炭','竹'].map(name => cards.find(c => c.name === name)).filter(Boolean);
const tutorialCpuDeck    = ['荒','外','本','焚','戸'].map(name => cards.find(c => c.name === name)).filter(Boolean);

let playerHand = [];
let cpuHand = [];
let playerDeckPile = [...tutorialPlayerDeck];
let cpuDeckPile    = [...tutorialCpuDeck];
let playerBattleCard = null;
let cpuBattleCard    = null;
let playerBench = [null, null, null];
let playerScore = 0;
let cpuScore = 0;
let dragInfo = null;
let turnPhase = "select";
let tutorialStep = 0;
let cardPlacedThisTurn = false;
let benchPlacedThisTurn = false;

const typeWins = { "△": "□", "○": "△", "□": "○" };

const steps = [
  { speaker: "guide", name: "ユゥ", img: "images/yuu.png", text: "ようこそ！これがバトル画面だよ。下の手札が見えるかな？", waitFor: null, showNext: true },
  { speaker: "guide", name: "ユゥ", img: "images/yuu.png", text: "上が相手（メリッサ）のエリア、下が自分のエリアだよ。真ん中のスロットが「バトル場」だ！", waitFor: null, showNext: true, highlight: "playerBattleSlot" },
  { speaker: "guide", name: "ユゥ", img: "images/yuu.png", text: "手札のカードをドラッグして、バトル場に置いてみよう！", waitFor: "cardPlaced", showNext: false, highlight: "playerBattleSlot" },
  { speaker: "enemy", name: "メリッサ", img: "images/melissa.png", text: "…私もカードを出したわ。「終了」ボタンを押してみなさい。", waitFor: "turnEnded", showNext: false, highlight: "turnEndBtn" },
  { speaker: "guide", name: "ユゥ", img: "images/yuu.png", text: "カードがめくれて勝敗が決まったね！○は□に勝ち、□は△に勝ち、△は○に勝つよ！", waitFor: null, showNext: true },
  { speaker: "enemy", name: "メリッサ", img: "images/melissa.png", text: "勝つと点数が入るわ。先に12点取った方が勝ちよ。右上のスコアを確認しなさい。", waitFor: null, showNext: true },
  { speaker: "guide", name: "ユゥ", img: "images/yuu.png", text: "次は「ベンチ」に試しにカードを置いてみよう！バトル場の上のスロットだよ。", waitFor: "benchPlaced", showNext: false, highlight: "playerBench0" },
  { speaker: "guide", name: "ユゥ", img: "images/yuu.png", text: "ベンチはカードを温存しておける場所だよ。バトル場に移動させることもできるんだ！", waitFor: null, showNext: true },
  { speaker: "enemy", name: "メリッサ", img: "images/melissa.png", text: "進化カードというのもあるわ。「火」がある場所に「炎」を重ねると進化するのよ。", waitFor: null, showNext: true },
  { speaker: "guide", name: "ユゥ", img: "images/yuu.png", text: "URカードを出すとスキルボタンが出てくるよ。スキルは強力な効果があるから積極的に使ってね！", waitFor: null, showNext: true },
  { speaker: "enemy", name: "メリッサ", img: "images/melissa.png", text: "…基本はこんなものよ。あとは実際に戦って覚えなさい。", waitFor: null, showNext: true },
  { speaker: "guide", name: "ユゥ", img: "images/yuu.png", text: "これで基本操作はバッチリ！実際のバトルに挑戦してみよう！", waitFor: null, showNext: true, isLast: true },
];

// ===== タッチドラッグ対応 =====
(function() {
  // 長押しメニュー無効化
  document.addEventListener('contextmenu', e => e.preventDefault());

  // タッチデバイスでのみ有効化
  if (!('ontouchstart' in window)) return;

  let draggingEl = null;
  let clone = null;
  let offsetX = 0, offsetY = 0;

  document.addEventListener('touchstart', function(e) {
    const target = e.target.closest('[draggable="true"]');
    if (!target) return;
    e.preventDefault();
    const touch = e.touches[0];
    draggingEl = target;
    offsetX = touch.clientX - target.getBoundingClientRect().left;
    offsetY = touch.clientY - target.getBoundingClientRect().top;

    // クローン作成
    clone = target.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.width = target.offsetWidth + 'px';
    clone.style.opacity = '0.8';
    clone.style.pointerEvents = 'none';
    clone.style.zIndex = '9999';
    clone.style.left = (touch.clientX - offsetX) + 'px';
    clone.style.top  = (touch.clientY - offsetY) + 'px';
    document.body.appendChild(clone);

    target.classList.add('dragging');

    // dragstart発火
    const evt = new DragEvent('dragstart', { bubbles: true, cancelable: true });
    target.dispatchEvent(evt);
  }, { passive: false });

  document.addEventListener('touchmove', function(e) {
    if (!draggingEl) return;
    e.preventDefault();
    const touch = e.touches[0];

    // クローン移動
    if (clone) {
      clone.style.left = (touch.clientX - offsetX) + 'px';
      clone.style.top  = (touch.clientY - offsetY) + 'px';
    }

    // 下にある要素にdragoverを発火
    clone.style.display = 'none';
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    clone.style.display = '';
    if (el) {
      const over = new DragEvent('dragover', { bubbles: true, cancelable: true, clientX: touch.clientX, clientY: touch.clientY });
      el.dispatchEvent(over);
    }
  }, { passive: false });

  document.addEventListener('touchend', function(e) {
    if (!draggingEl) return;
    const touch = e.changedTouches[0];

    // クローン除去
    if (clone) { clone.remove(); clone = null; }
    draggingEl.classList.remove('dragging');

    // dropを発火
    clone && clone.remove();
    const fakeClone = document.createElement('div');
    fakeClone.style.cssText = 'position:fixed;width:1px;height:1px;pointer-events:none;';
    document.body.appendChild(fakeClone);
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    fakeClone.remove();
    if (el) {
      const drop = new DragEvent('drop', { bubbles: true, cancelable: true, clientX: touch.clientX, clientY: touch.clientY });
      el.dispatchEvent(drop);
    }

    // dragend
    const end = new DragEvent('dragend', { bubbles: true });
    draggingEl.dispatchEvent(end);
    draggingEl = null;
  }, { passive: false });
})();

// ===== チュートリアル表示 =====
function showStep(i) {
  if (i >= steps.length) { showEnd(); return; }
  const s = steps[i];
  const charEl = document.getElementById("tutorialCharacter");
  charEl.style.opacity = "0";
  setTimeout(() => {
    charEl.src = s.img;
    charEl.style.background = s.speaker === "guide" ? "#8b0000" : "#8b7340";
    charEl.style.opacity = "1";
  }, 150);
  document.getElementById("tutorialNameTag").textContent = s.name;
  document.getElementById("tutorialNameTag").className = s.speaker;
  document.getElementById("tutorialText").textContent = s.text;
  const btn = document.getElementById("tutorialNextBtn");
  if (s.showNext || s.isLast) {
    btn.style.display = "block";
    btn.textContent = s.isLast ? "バトルへ！" : "次へ →";
  } else {
    btn.style.display = "none";
  }
  clearHighlights();
  if (s.highlight) {
    const el = document.getElementById(s.highlight);
    if (el) el.classList.add("highlight");
  }
}

function clearHighlights() {
  document.querySelectorAll(".highlight").forEach(el => el.classList.remove("highlight"));
}

function nextStep() {
  tutorialStep++;
  if (tutorialStep >= steps.length) { showEnd(); return; }
  showStep(tutorialStep);
}

function checkWaitFor() {
  const s = steps[tutorialStep];
  if (!s) return;
  if (s.waitFor === "cardPlaced" && cardPlacedThisTurn) { tutorialStep++; showStep(tutorialStep); }
  else if (s.waitFor === "turnEnded" && turnPhase === "revealed") { tutorialStep++; showStep(tutorialStep); }
  else if (s.waitFor === "benchPlaced" && benchPlacedThisTurn) { tutorialStep++; showStep(tutorialStep); }
}

function showEnd() {
  document.getElementById("tutorialOverlay").style.display = "none";
  document.getElementById("endScreen").style.display = "flex";
}

function drawCard(hand, pile) { if (pile.length > 0) hand.push(pile.shift()); }

function renderPlayerHand() {
  const handEl = document.getElementById("playerHand");
  handEl.innerHTML = "";
  playerHand.forEach((card, i) => {
    const img = document.createElement("img");
    img.src = "images/genshokugensho_cards/" + card.image;
    const playable = turnPhase === "select" && playerBattleCard === null;
    img.className = playable ? "card playable" : "card not-playable";
    img.draggable = playable;
    if (playable) {
      img.addEventListener("dragstart", () => { dragInfo = { from: "hand", index: i, card }; setTimeout(() => img.classList.add("dragging"), 0); });
      img.addEventListener("dragend", () => { img.classList.remove("dragging"); dragInfo = null; });
    }
    handEl.appendChild(img);
  });
}

function renderEnemyHand() {
  const handEl = document.getElementById("enemyHand");
  handEl.innerHTML = "";
  cpuHand.forEach(() => {
    const img = document.createElement("img");
    img.src = "images/yamafuda_cpu.png";
    img.className = "card-back";
    handEl.appendChild(img);
  });
}

function renderPlayerBench() {
  for (let i = 0; i < 3; i++) {
    const slot = document.getElementById("playerBench" + i);
    slot.innerHTML = "";
    if (playerBench[i]) {
      const img = document.createElement("img");
      img.src = "images/genshokugensho_cards/" + playerBench[i].image;
      slot.appendChild(img);
    } else { slot.textContent = "ベンチ"; }
  }
}

function renderPlayerBattleSlot() {
  const slot = document.getElementById("playerBattleSlot");
  slot.innerHTML = "";
  if (playerBattleCard) {
    const img = document.createElement("img");
    img.src = "images/genshokugensho_cards/" + playerBattleCard.image;
    slot.appendChild(img);
  } else { slot.textContent = "あなた"; }
}

function updateScore() {
  document.getElementById("playerScore").textContent = playerScore;
  document.getElementById("cpuScore").textContent = cpuScore;
}

function updateDeckCounts() {
  document.getElementById("playerDeckCount").textContent = playerDeckPile.length;
  document.getElementById("enemyDeckCount").textContent = cpuDeckPile.length;
}

function setupDropZones() {
  const battleSlot = document.getElementById("playerBattleSlot");
  battleSlot.addEventListener("dragover", (e) => {
    if (dragInfo && playerBattleCard === null && turnPhase === "select") { e.preventDefault(); battleSlot.classList.add("drag-over"); }
  });
  battleSlot.addEventListener("dragleave", () => battleSlot.classList.remove("drag-over"));
  battleSlot.addEventListener("drop", (e) => {
    e.preventDefault(); battleSlot.classList.remove("drag-over");
    if (!dragInfo || playerBattleCard !== null || turnPhase !== "select") return;
    playerBattleCard = dragInfo.card;
    playerHand.splice(dragInfo.index, 1);
    renderPlayerBattleSlot(); renderPlayerHand();
    document.getElementById("turnEndBtn").disabled = false;
    cardPlacedThisTurn = true;
    placeCpuCard(); checkWaitFor(); dragInfo = null;
  });
  for (let i = 0; i < 3; i++) {
    const benchSlot = document.getElementById("playerBench" + i);
    const idx = i;
    benchSlot.addEventListener("dragover", (e) => {
      if (dragInfo && playerBench[idx] === null && turnPhase === "select") { e.preventDefault(); benchSlot.classList.add("drag-over"); }
    });
    benchSlot.addEventListener("dragleave", () => benchSlot.classList.remove("drag-over"));
    benchSlot.addEventListener("drop", (e) => {
      e.preventDefault(); benchSlot.classList.remove("drag-over");
      if (!dragInfo || playerBench[idx] !== null || turnPhase !== "select") return;
      playerBench[idx] = dragInfo.card;
      playerHand.splice(dragInfo.index, 1);
      renderPlayerHand(); renderPlayerBench();
      benchPlacedThisTurn = true; checkWaitFor(); dragInfo = null;
    });
  }
}

function placeCpuCard() {
  if (cpuHand.length === 0) return;
  const index = Math.floor(Math.random() * cpuHand.length);
  cpuBattleCard = cpuHand[index];
  cpuHand.splice(index, 1);
  renderEnemyHand();
  const slot = document.getElementById("enemyBattleSlot");
  slot.innerHTML = "";
  const img = document.createElement("img");
  img.src = "images/yamafuda_cpu.png";
  slot.appendChild(img);
}

function onTurnEnd() {
  if (!playerBattleCard || !cpuBattleCard) return;
  turnPhase = "revealed";
  document.getElementById("turnEndBtn").disabled = true;
  const playerSlot = document.getElementById("playerBattleSlot");
  playerSlot.innerHTML = "";
  const pImg = document.createElement("img");
  pImg.src = "images/genshokugensho_cards/" + playerBattleCard.image;
  playerSlot.appendChild(pImg);
  const enemySlot = document.getElementById("enemyBattleSlot");
  enemySlot.innerHTML = "";
  const cImg = document.createElement("img");
  cImg.src = "images/genshokugensho_cards/" + cpuBattleCard.image;
  enemySlot.appendChild(cImg);
  checkWaitFor();
  setTimeout(() => judgeResult(), 800);
}

function judgeResult() {
  const pType = playerBattleCard.type;
  const cType = cpuBattleCard.type;
  let result = pType === cType ? "draw" : typeWins[pType] === cType ? "win" : "lose";
  if (result === "win") { playerScore++; showResultText("勝利！", "#ffdd55"); }
  else if (result === "lose") { cpuScore++; showResultText("敗北", "#88ccff"); }
  else { showResultText("引き分け", "#fff"); }
  updateScore();
  setTimeout(() => nextTurn(), 1500);
}

function showResultText(text, color) {
  const zone = document.querySelector(".battle-zone");
  const popup = document.createElement("div");
  popup.className = "result-popup";
  popup.textContent = text;
  popup.style.color = color;
  popup.style.position = "absolute";
  popup.style.fontSize = "28px";
  popup.style.fontWeight = "bold";
  popup.style.textShadow = "2px 2px 6px #000";
  popup.style.zIndex = "30";
  zone.appendChild(popup);
  setTimeout(() => popup.classList.add("show"), 50);
  setTimeout(() => { popup.classList.remove("show"); setTimeout(() => popup.remove(), 300); }, 1200);
}

function nextTurn() {
  document.getElementById("playerBattleSlot").innerHTML = "あなた";
  document.getElementById("enemyBattleSlot").innerHTML = "相手";
  playerBattleCard = null; cpuBattleCard = null;
  turnPhase = "select"; cardPlacedThisTurn = false;
  drawCard(playerHand, playerDeckPile); drawCard(cpuHand, cpuDeckPile);
  updateDeckCounts(); renderPlayerHand(); renderEnemyHand();
  document.getElementById("turnEndBtn").disabled = true;
}

function init() {
  for (let i = 0; i < 3; i++) { drawCard(playerHand, playerDeckPile); drawCard(cpuHand, cpuDeckPile); }
  renderPlayerHand(); renderEnemyHand(); renderPlayerBench();
  updateScore(); updateDeckCounts(); setupDropZones(); showStep(0);
}

init();