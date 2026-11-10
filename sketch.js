let stopSpriteSheet; // 儲存角色1的停止動作精靈圖。
let walkSpriteSheet; // 儲存角色1的行走動作精靈圖。
let magicSpriteSheet; // 儲存角色1的施法動作精靈圖。
let magicEffectSpriteSheet; // 儲存施法後發射的特效精靈圖。
let characterX; // 儲存角色1目前的水平中心位置。
let facingDirection = 1; // 記錄角色最近面向的方向，1為右方、-1為左方。
let isCasting = false; // 記錄角色是否正在播放施法動畫。
let spaceHeld = false; // 記錄空白鍵是否仍被按住，避免長按重複施法。
let magicStartTime = 0; // 記錄目前施法動畫的開始時間。
let magicDirection = 1; // 記錄本次施法時角色面向的方向。
let magicEffects = []; // 儲存目前仍在畫面中移動的特效。
const stopFrameCount = 10; // 設定停止精靈圖中的動畫格數。
const walkFrameCount = 9; // 設定行走精靈圖中的動畫格數。
const magicFrameCount = 4; // 設定施法精靈圖中的動畫格數。
const magicEffectFrameCount = 5; // 設定特效精靈圖中的動畫格數。
const frameDuration = 100; // 設定每張動畫格顯示的毫秒數。
const baseMoveSpeed = 4; // 設定畫布基準尺寸下每影格的移動距離。
const baseEffectSpeed = 8; // 設定畫布基準尺寸下特效每影格的移動距離。

function preload() { // 在畫布啟動前載入角色圖片。
  stopSpriteSheet = loadImage('1/stop/stop.png'); // 載入角色1的停止動作精靈圖。
  walkSpriteSheet = loadImage('1/walk/walk.png'); // 載入角色1的行走動作精靈圖。
  magicSpriteSheet = loadImage('1/magic/magic.png'); // 載入角色1的施法動作精靈圖。
  magicEffectSpriteSheet = loadImage('1/magic_effect/magic_effect.png'); // 載入施法後的特效精靈圖。
} // 結束圖片預載入函式。

function setup() { // 設定全螢幕畫布與圖片顯示方式。
  createCanvas(windowWidth, windowHeight); // 建立符合目前視窗尺寸的畫布。
  imageMode(CENTER); // 讓角色座標代表圖片中心點。
  characterX = width * 2 / 3; // 將角色初始位置放在畫布寬度的三分之二處。
} // 結束畫布初始化函式。

function draw() { // 每一影格繪製背景與角色動畫。
  background(135, 206, 235); // 使用天空藍清除並填滿畫布背景。
  const movingRight = keyIsDown(RIGHT_ARROW); // 偵測目前是否按住鍵盤右鍵。
  const movingLeft = keyIsDown(LEFT_ARROW); // 偵測目前是否按住鍵盤左鍵。
  const isWalking = movingRight || movingLeft; // 按住任一方向鍵時切換為行走動作。
  const characterScale = min(width / 640, height / 480, 2.5); // 依畫布寬高比例縮放並限制最大倍率。
  const movementSpeed = baseMoveSpeed * characterScale; // 依角色縮放比例調整每影格移動距離。
  if (movingRight !== movingLeft) { // 只有單一方向鍵按下時才移動角色。
    characterX += movingRight ? movementSpeed : -movementSpeed; // 依按下的方向鍵更新水平位置。
    facingDirection = movingRight ? 1 : -1; // 記住角色最近移動方向作為面向。
  } // 結束角色位置更新判斷。
  const magicFrameWidth = magicSpriteSheet.width / magicFrameCount; // 計算施法精靈圖單格寬度。
  if (isCasting) { // 施法期間以施法角色尺寸限制水平位置。
    characterX = constrain(characterX, magicFrameWidth * characterScale / 2, width - magicFrameWidth * characterScale / 2); // 避免施法圖片超出畫布左右邊界。
    if (millis() - magicStartTime >= magicFrameCount * frameDuration) { // 確認四格施法動畫已完整播放。
      isCasting = false; // 結束本次施法動畫。
      magicEffects.push({ x: characterX + magicDirection * magicFrameWidth * characterScale / 2, y: height - magicSpriteSheet.height * characterScale / 2, direction: magicDirection, startTime: millis() }); // 動畫結束後依施法方向建立特效並記錄起始時間。
    } // 結束施法完成判斷。
  } // 結束施法狀態處理。
  const activeSpriteSheet = isCasting ? magicSpriteSheet : isWalking ? walkSpriteSheet : stopSpriteSheet; // 依施法、移動或停止狀態選擇角色圖片。
  const activeFrameCount = isCasting ? magicFrameCount : isWalking ? walkFrameCount : stopFrameCount; // 依目前角色動作選擇動畫格數。
  const frameWidth = activeSpriteSheet.width / activeFrameCount; // 依目前精靈圖寬度計算單格寬度。
  const frameIndex = isCasting ? floor((millis() - magicStartTime) / frameDuration) : floor(millis() / frameDuration) % activeFrameCount; // 施法動畫播放一次，其餘動作循環播放。
  const characterWidth = frameWidth * characterScale; // 計算縮放後單格角色的顯示寬度。
  const characterHeight = activeSpriteSheet.height * characterScale; // 計算縮放後角色的顯示高度。
  characterX = constrain(characterX, characterWidth / 2, width - characterWidth / 2); // 限制角色不超出畫布左右邊界。
  const characterY = height - characterHeight / 2; // 將縮放後角色圖片底部對齊畫布底端。
  push(); // 儲存目前畫布的座標與縮放狀態。
  translate(characterX, characterY); // 將繪圖原點移到角色中心位置。
  scale(isCasting ? magicDirection : facingDirection, 1); // 施法時沿用施法方向，其餘動作依最近面向翻轉圖片。
  image(activeSpriteSheet, 0, 0, characterWidth, characterHeight, frameIndex * frameWidth, 0, frameWidth, activeSpriteSheet.height); // 裁切並繪製縮放後的目前動畫格。
  pop(); // 還原畫布狀態以免影響後續繪圖。
  for (let effectIndex = magicEffects.length - 1; effectIndex >= 0; effectIndex -= 1) { // 由後往前更新所有移動中的特效。
    const activeEffect = magicEffects[effectIndex]; // 取得目前正在更新的特效資料。
    const effectFrameWidth = magicEffectSpriteSheet.width / magicEffectFrameCount; // 計算特效精靈圖單格寬度。
    const effectWidth = effectFrameWidth * characterScale; // 計算縮放後特效單格顯示寬度。
    const effectHeight = magicEffectSpriteSheet.height * characterScale; // 計算縮放後特效顯示高度。
    activeEffect.x += activeEffect.direction * baseEffectSpeed * characterScale; // 依發射方向推進特效位置。
    if (activeEffect.x > width + effectWidth / 2 || activeEffect.x < -effectWidth / 2) { // 特效完全離開畫布時將其移除。
      magicEffects.splice(effectIndex, 1); // 刪除已飛出畫布的特效資料。
      continue; // 略過已移除特效的繪製程序。
    } // 結束特效離開畫布判斷。
    const effectFrameIndex = floor((millis() - activeEffect.startTime) / frameDuration) % magicEffectFrameCount; // 從特效產生時開始循環播放五張動畫格。
    push(); // 儲存目前畫布的座標與縮放狀態。
    translate(activeEffect.x, activeEffect.y); // 將繪圖原點移到特效目前位置。
    scale(activeEffect.direction, 1); // 依飛行方向翻轉特效圖片。
    image(magicEffectSpriteSheet, 0, 0, effectWidth, effectHeight, effectFrameIndex * effectFrameWidth, 0, effectFrameWidth, magicEffectSpriteSheet.height); // 裁切並繪製目前的特效動畫格。
    pop(); // 還原畫布狀態以便繪製其他特效。
  } // 結束所有特效的更新與繪製。
} // 結束每影格繪圖函式。

function keyPressed() { // 偵測空白鍵並開始播放一次施法動畫。
  if (keyCode === 32 && !spaceHeld) { // 僅在空白鍵剛按下時執行一次。
    spaceHeld = true; // 記錄空白鍵已按住以忽略自動重複事件。
    if (!isCasting) { // 角色未施法時才啟動新的施法動畫。
      isCasting = true; // 切換角色至施法狀態。
      magicStartTime = millis(); // 記錄施法動畫的起始時間。
      magicDirection = facingDirection; // 鎖定本次施法所面向的方向。
    } // 結束施法啟動判斷。
    return false; // 避免空白鍵觸發瀏覽器的預設操作。
  } // 結束空白鍵按下處理。
} // 結束鍵盤按下事件函式。

function keyReleased() { // 偵測空白鍵放開以允許下一次施法。
  if (keyCode === 32) { // 確認放開的是空白鍵。
    spaceHeld = false; // 重設按鍵狀態以允許再次施法。
    return false; // 避免空白鍵觸發瀏覽器的預設操作。
  } // 結束空白鍵放開處理。
} // 結束鍵盤放開事件函式。

function windowResized() { // 視窗尺寸改變時同步調整畫布。
  resizeCanvas(windowWidth, windowHeight); // 讓畫布重新填滿視窗。
} // 結束視窗尺寸更新函式。
