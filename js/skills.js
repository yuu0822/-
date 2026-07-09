// ===== skills.js =====
// URカードのスキルロジック

// 墓場
let playerGraveyard = [];
let cpuGraveyard = [];

// スキル使用済み管理
let usedSkills = {};

// 光スキル（相手手札開示）フラグ
let revealEnemyHand = false;

// 焱スキル（引き分け+2pt）フラグ
let honouSkillActive = false;

// ===== スキルパネル描画 =====
function renderSkillPanel() {
  const panel = document.getElementById("skillPanel");
  if (!panel) return;
  panel.innerHTML = "";

  const skillCards = [];

  // バトル場のカード
  if (playerBattleCard && playerBattleCard.skill) {
    skillCards.push(playerBattleCard);
  }
  // ベンチのカード（光・陰のみ）
  playerBench.forEach(c => {
    if (c && (c.skill === "reveal_hand" || c.skill === "revive")) {
      skillCards.push(c);
    }
  });

  skillCards.forEach(card => {
    const skill = card.skill;
    // 焱は自動発動なのでボタン不要
    if (skill === "draw_fire") return;

    const btn = document.createElement("button");
    btn.className = "skill-btn" + (usedSkills[card.name] ? " used" : "");
    btn.disabled = !!usedSkills[card.name] || turnPhase !== "select";

    if (skill === "draw_water")    btn.textContent = `${card.name}：さんずいドロー`;
    else if (skill === "draw_triangle") btn.textContent = `${card.name}：△ドロー`;
    else if (skill === "reveal_hand")   btn.textContent = `${card.name}：手札開示`;
    else if (skill === "revive")        btn.textContent = `${card.name}：蘇生`;

    btn.onclick = () => activateSkill(card);
    panel.appendChild(btn);
  });
}

// ===== スキル発動 =====
function activateSkill(card) {
  const skill = card.skill;
  if (!skill || usedSkills[card.name]) return;

  if (skill === "draw_water") {
    const idx = playerDeckPile.findIndex(c => c.bushu === "さんずい");
    if (idx >= 0) {
      playerHand.push(playerDeckPile.splice(idx, 1)[0]);
      showResultText("さんずいドロー！", "#88ccff");
      updateDeckCounts();
      renderPlayerHand();
    } else {
      showResultText("山札にさんずいカードなし", "#aaa");
    }

  } else if (skill === "draw_triangle") {
    const idx = playerDeckPile.findIndex(c => c.type === "△");
    if (idx >= 0) {
      playerHand.push(playerDeckPile.splice(idx, 1)[0]);
      showResultText("△属性ドロー！", "#88ff88");
      updateDeckCounts();
      renderPlayerHand();
    } else {
      showResultText("山札に△属性カードなし", "#aaa");
    }

  } else if (skill === "reveal_hand") {
    revealEnemyHand = true;
    usedSkills[card.name] = true;
    renderEnemyHand();
    renderSkillPanel();
    showResultText("相手の手札を開示！", "#ffdd55");

  } else if (skill === "revive") {
    if (playerGraveyard.length === 0) {
      showResultText("墓場にカードがない", "#aaa");
      return;
    }
    usedSkills[card.name] = true;
    renderSkillPanel();
    openReviveScreen();
  }
}

// ===== 焱スキルチェック（バトル場に出したとき呼ぶ）=====
function checkHonouSkill(card) {
  if (card && card.skill === "draw_fire") {
    honouSkillActive = true;
    showResultText("焱スキル発動！引き分けで+2pt", "#ff8800");
  } else {
    honouSkillActive = false;
  }
}

// ===== 蘇生画面 =====
function openReviveScreen() {
  const screen = document.getElementById("reviveScreen");
  const grid = document.getElementById("reviveGrid");
  grid.innerHTML = "";
  playerGraveyard.forEach((card, i) => {
    const img = document.createElement("img");
    img.src = "images/genshokugensho_cards/" + card.image;
    img.className = "revive-card";
    img.onclick = () => {
      playerHand.push(card);
      playerGraveyard.splice(i, 1);
      closeRevive();
      renderPlayerHand();
      showResultText(`${card.name}を蘇生！`, "#ff88ff");
    };
    grid.appendChild(img);
  });
  screen.style.display = "flex";
}

function closeRevive() {
  document.getElementById("reviveScreen").style.display = "none";
}

// ===== ターン終了時リセット =====
function resetSkillsOnNextTurn() {
  honouSkillActive = false;
  revealEnemyHand = false;
  const panel = document.getElementById("skillPanel");
  if (panel) panel.innerHTML = "";
}