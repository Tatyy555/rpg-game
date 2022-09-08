"use strict";

const   INTERVAL = 33;                  // フレーム呼び出し間隔。
const   SCROLL = 4;                     // 移動速度。
const   FONT  = "10px sans-serif";      // 使用するフォント。
const   FONTSTYLE = "#ffffff";          // 使用するフォントの色。
const   WIDTH =128;                     // 仮想画面の幅。
const   HEIGHT = 120;                   // 仮想画面の高さ。
const   MAP_WIDTH = 32;                 // マップの幅。
const   MAP_HEIGHT = 32;                // マップの高さ。
const   SCR_WIDTH = 8;                  // 画面タイルサイズの半分の幅。
const   SCR_HEIGHT =8;                  // 画面タイルサイズの半分の高さ。
const   SMOOTH = 0;                     // 補完処理。
const   TILECOLUMN = 4;                 // タイルの列数。
const   TILEROW =4;                     // タイルの行数。
const   TILESIZE = 8;                   // マップ画面のタイルサイズ。
const   CHARAWIDTH = 8;                 // プレイヤーの幅。
const   CHARAHEIGHT = 9;                // プライヤーの高さ。
const   WINDSTYLE ="rgba(0,0,0,0.75)"   // デバッグウィンドウの色。
const   START_X = 15;                   // 開始位置のX座標。
const   START_Y = 17;                   // 開始位置のY座標。
const   START_HP = 20;                  // 開始HP。

const   gKey = new Uint8Array(0x100);   // キー入力バッファ。

let     gFrame = 0;         // 内部カウンタ。
let     gImgMap;            // マップ画像。
let     gImgMonster;        // モンスター画像。
let     gImgPlayer;         // プレイヤー画像。
let     gImgBoss;           // ボス画像。
let     gWidth;             // 実画面の幅。
let     gHeight;            // 実画面の高さ。
let     gMoveX = 0;         // X軸の移動量。
let     gMoveY = 0;         // Y軸の移動量。
let     gAngle = 0;         // プレイヤーの向き。
let     gMessage1 = null;   // 表示メッセージ1。
let     gMessage2 = null;   // 表示メッセージ2。
let     gPlayerX = START_X * TILESIZE +TILESIZE/2;    // プレイヤーのX座標。
let     gPlayerY = START_Y * TILESIZE +TILESIZE/2;    // プレイヤーのY座標。
let     gItem=0;            // アイテム(鍵)
let     gEx = 0;            // プレイヤーの経験値。
let     gHP = START_HP;     // プレイヤーのHP。
let     gMHP = START_HP;    // プレイヤーの最大HP。
let     gLv =1;             // プレイヤーのレベル。
let     gPhase = 0;         // 戦闘フェーズ。
let     gCursor = 0;        // カーソル位置。
let     gEnemyType;         // 敵種別。
let     gEnemyHP;           // 敵のHP。
let     gOrder;             // プレイヤーか敵か行動順。

const   gFileBoss = "img/boss.png";         // ボス画像の場所。
const   gFileMap = "img/map.png";           // マップ画像場所。
const   gFilePlayer ="img/player.png";      // プレイヤー画像場所。
const   gFileMonster ="img/monster.png";    // モンスター画像場所。

const   gEncounter = [0, 0, 0, 1, 0, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0];         // マップidx毎のモンスターの出現確率(分子)。
const   gMonsterName = ["スライム", "うさぎ", "ナイト", "ドラゴン", "魔王"];     // モンスター名称。

// マップ(32×32の番号はマップ画像のidx)。
const	gMap = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 3, 3, 7, 7, 7, 7, 7, 7, 7, 7, 7, 6, 6, 3, 6, 3, 6, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 3, 3, 6, 6, 7, 7, 7, 2, 2, 2, 7, 7, 7, 7, 7, 7, 7, 6, 3, 0, 0, 0, 3, 3, 0, 6, 6, 6, 0, 0, 0,
    0, 0, 3, 3, 6, 6, 6, 7, 7, 2, 2, 2, 7, 7, 2, 2, 2, 7, 7, 6, 3, 3, 3, 6, 6, 3, 6,13, 6, 0, 0, 0,
    0, 3, 3,10,11, 3, 3, 6, 7, 7, 2, 2, 2, 2, 2, 2, 1, 1, 7, 6, 6, 6, 6, 6, 3, 0, 6, 6, 6, 0, 0, 0,
    0, 0, 3, 3, 3, 0, 3, 3, 3, 7, 7, 2, 2, 2, 2, 7, 7, 1, 1, 6, 6, 6, 6, 3, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 7, 7, 7, 7, 2, 7, 6, 3, 1, 3, 6, 6, 6, 3, 0, 0, 0, 3, 3, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 6, 7, 2, 7, 6, 3, 1, 3, 3, 6, 6, 3, 0, 0, 0, 3, 3, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 7, 7, 7, 6, 3, 1, 1, 3, 3, 6, 3, 3, 0, 0, 3, 3, 3, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 6, 6, 7, 7, 7, 6, 3, 1, 1, 3, 3, 6, 3, 3, 0, 3,12, 3, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 6, 6, 7, 7, 6, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 6, 6, 6, 6, 3, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 6, 6, 3, 3, 3, 3, 1, 1, 3, 3, 3, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 4, 5, 3, 3, 3, 6, 6, 6, 3, 3, 3, 1, 1, 1, 1, 1, 3, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 8, 9, 3, 3, 3, 6, 6, 6, 6, 3, 3, 3, 3, 3, 3, 1, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 3, 3, 3, 3, 3, 3, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 6, 3, 3, 3, 3, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 6, 3, 3, 3, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 3, 3, 3, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 6, 6, 3, 6, 6, 6, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 6, 3, 6, 6, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 6, 3, 6, 6, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 3, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 6, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,14, 6, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 6, 7, 0, 0, 0, 0, 0, 0, 0, 0,
    7,15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 7, 7, 0, 0, 0, 0, 0,
    7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 7, 7, 7, 7,
   ];

// 仮想画面の処理。
function DrawMain()
{
    const g = TUG.GR.mG;    // 仮想画面の2D描画コンテキストを取得。

    if (gPhase<=1){
        DrawField(g);       // マップ描画。
    }else{
        DrawFight(g);       // 戦闘画面描画。
    }
}

// 戦闘画面処理。
function DrawFight(g)
{
    g.fillStyle = "#000000";                    // 背景色(黒)。
    g.fillRect(0, 0, WIDTH, HEIGHT);            // 画面全体を黒で描画。

    if(gPhase<=5){                              // 敵が生存している場合。
        if(IsBoss()){                           // ラスボスの場合。
            g.drawImage(gImgBoss, WIDTH/2-gImgBoss.width/2, HEIGHT/2-gImgBoss.height/2);    // ラスボスの描画。 
        }else{
            let w = gImgMonster.width/4;
            let h = gImgMonster.height; 
            g.drawImage(gImgMonster, gEnemyType*w,0,w,h, 
                Math.floor(WIDTH/2-w/2),Math.floor(HEIGHT/2-h/2),w,h);                      // 通常モンスターの描画。
        }
    }

    DrawStatus(g);                             // ステータス内容の描画。      
    DrawMessage(g);                            // メッセージの描画。

    if(gPhase==2){                             // 戦闘コマンド選択時。
        g.fillText("➡︎", 6, 96+14*gCursor);     // カーソル描画。
    }
}

// 経験値加算処理。
function AddExp(val)
{
    gEx += val;                                     // 経験値加算。
    while(gLv*(gLv+1)*2 <= gEx){                    // レベルアップ条件。
        gLv++;                                      // レベルアップ。
        gMHP += 4 + Math.floor(Math.random()*3);    // レベルアップ時にHP+4~6。
    }
}

//戦闘行動処理。
function Action(){
    gPhase++;           // フェーズ経過。

    if(((gPhase + gOrder)&1)==0){                   // 敵の行動順の場合。
        const d = GetDamege(gEnemyType+2);          // ダメージ計算結果取得。
        SetMessage(gMonsterName[gEnemyType]+"の攻撃！",d+"のダメージ！");
        gHP -= d;                                   // プレイヤーのHP減少。
        if(gHP <= 0){                               // プレイヤーの死亡時。
            gPhase=7;                               // 死亡フェーズ。
        }
        return;
    }

    // プレイヤーの行動順。
    if(gCursor == 0){                               //「戦う」選択時。
        const d = GetDamege(gLv+1);                 // ダメージ計算結果取得。
        SetMessage("あなたの攻撃！",d+"のダメージ！");
        gEnemyHP -= d;                              // 敵のHP減少。
        if(gEnemyHP <= 0){                          // 敵死亡時。
            gPhase = 5;                             // 敵撃退フェーズ。
        }
        return;
    }
    
    if(Math.random() < 0.5){    // 「逃げる」コマンドの成功時。
        SetMessage("あなたは逃げ出した！",null);
        gPhase=6;               // 戦闘終了フェーズ。
        return;
    }
    // 「逃げる」コマンドの失敗時。
    SetMessage("あなたは逃げ出した！","しかし回りこまれた！");
}

// ダメージ量算出処理。
function GetDamege(a){
    return(Math.floor(a*(1+Math.random())));    // 攻撃力の1〜2倍。
}

// 敵出現処理。
function AppearEnemy(t){
    gPhase = 1;                                 // 敵出現フェーズ。
    gEnemyHP = t*3+5;                           // 敵HP。
    gEnemyType=t;
    SetMessage(gMonsterName[gEnemyType]+"があらわれた！", null);
}


// 戦闘コマンド処理。
function CommandFight(){
    gPhase=2;               // 戦闘コマンと選択フェーズ。
    gCursor=0;              // 戦闘カーソルを初期化。
    SetMessage("    戦う","    逃げる")
}

// ボスかどうかの処理。
function IsBoss(){
    return(gEnemyType==gMonsterName.length-1);
}

// マップとプレーヤー描画。
function DrawField(g){
    let mx = Math.floor(gPlayerX/TILESIZE);     // プライヤーのタイル座標X。
    let my = Math.floor(gPlayerY/TILESIZE);     // プライヤーのタイル座標Y。

    // マップ描画。
    for(let dy=-SCR_HEIGHT; dy<=SCR_HEIGHT; dy++){      // 縦軸に画像を設置。
        let ty = my +dy;                                // タイルのY座標。
        let py = (ty + MAP_HEIGHT)% MAP_HEIGHT;         // ループ後のタイルのY座標
        for(let dx = -SCR_WIDTH; dx<=SCR_WIDTH;dx++){   // 横軸に画像を16個設置。
            let tx = mx + dx;                           // タイルのX座標。
            let px = (tx + MAP_WIDTH)% MAP_WIDTH;       // ループ後のタイルのX座標。
            DrawTile(g,
                     tx*TILESIZE + WIDTH/2-gPlayerX,
                     ty*TILESIZE + HEIGHT/2-gPlayerY,
                     gMap[py*MAP_WIDTH +px]);           // gMapの配列を使い、タイルの描画処理関数の呼び出し。
        }   
    }

    // プレイヤーの描画。
    g.drawImage(gImgPlayer,
        Math.floor(gFrame/8)%2*CHARAWIDTH,gAngle*CHARAHEIGHT,CHARAWIDTH,CHARAHEIGHT,
            WIDTH/2-CHARAWIDTH/2,HEIGHT/2-CHARAHEIGHT+TILESIZE/2,CHARAWIDTH,CHARAHEIGHT); // プレイヤー画像を中心に描画。    

    // ステータス画面。
    g.fillStyle = WINDSTYLE;    // デバッグウィンドウの色。
    g.fillRect(2, 2, 44,37);    // デバッグウィンドウの描画。
    DrawStatus(g);              // ステータス内容の描画。      

    // メッセージ画面。
    DrawMessage(g);             // メッセージの描画。
}

// メッセージの描画処理。
function DrawMessage(g)
{  
    if(!gMessage1){                     // メッセージ内容が存在しない場合。
        return;
    }
    g.fillStyle = WINDSTYLE;            // デバッグウィンドウの色。
    g.fillRect(4, 84, 120,30);          // デバッグウィンドウの描画。
    g.font = FONT;                      // 文字フォントを設定。
    g.fillStyle = FONTSTYLE;            // 文字色。
    g.fillText(gMessage1,6,96);         // テキストの表示。
    if(gMessage2){
        g.fillText(gMessage2,6,110);    // テキストの表示。
    }
}

// ステータス画面描画処理。
function DrawStatus(g)
{
    g.font = FONT;                  // 文字フォントを設定。
    g.fillStyle = FONTSTYLE;        // 文字色。
    g.fillText("Lv ",4,13); DrawTextR(g,gLv,42,13);    // テキストの表示。
    g.fillText("HP ",4,25); DrawTextR(g,gHP,42,25);    // テキストの表示。
    g.fillText("Ex ",4,37); DrawTextR(g,gEx,42,37);    // テキストの表示。
}

// 文字の右寄せ処理。
function DrawTextR(g,str,x,y)
{
    g.textAlign = "right";
    g.fillText(str,x,y);
    g.textAlign = "left";
}

// タイルの描画処理。
function DrawTile(g, x, y, idx)
{
    const ix = (idx % TILECOLUMN)*TILESIZE;                                 // タイルのidxからマップ画像上のx座標を取得。
    const iy = Math.floor(idx/TILEROW)*TILESIZE;                            // タイルのidxからマップ画面上のy座標を取得。
    g.drawImage(gImgMap,ix,iy,TILESIZE,TILESIZE, x ,y,TILESIZE,TILESIZE);   // 指定したidxのタイルを描画。
}

// コメント記載処理:。
function SetMessage( v1, v2 )
{
	gMessage1 = v1;
	gMessage2 = v2;
}

// 画像の読み込み処理。
function LoadImage()
{
    gImgMap = new Image();  gImgMap.src = gFileMap;             // マップ画像を読み込み。
    gImgPlayer = new Image();  gImgPlayer.src = gFilePlayer;    // プレイヤー画像を読み込み。
    gImgMonster = new Image(); gImgMonster.src = gFileMonster;  // モンスター画像を読み込み。
    gImgBoss = new Image(); gImgBoss.src = gFileBoss;           // ボス画像を読み込み。

}

// フィールド上での移動処理。
function TickField()
{
    if(gPhase != 0){
        return;
    }

    if(gMoveX != 0 || gMoveY !=0 || gMessage1){}         // 移動中またはメッセージ表示中の場合。
    else if(gKey[37]){gAngle=1;gMoveX=-TILESIZE;}        // 左。
    else if(gKey[38]){gAngle=3;gMoveY=-TILESIZE;}        // 上。
    else if(gKey[39]){gAngle=2;gMoveX= TILESIZE;}        // 右。
    else if(gKey[40]){gAngle=0;gMoveY= TILESIZE;}        // 下:。

    // 移動後のタイル座標判定
    let mx = Math.floor((gPlayerX + gMoveX)/ TILESIZE);   //移動後のタイルX座標。
    let my = Math.floor((gPlayerY + gMoveY)/ TILESIZE);   //移動後のタイルY座標。
    mx += MAP_WIDTH;                    // マップループ処理。
    mx %= MAP_WIDTH;                    // マップループ処理。
    my += MAP_HEIGHT;                   // マップループ処理。
    my %= MAP_HEIGHT;                   // マップループ処理。
    let m = gMap[my * MAP_WIDTH +mx];   // タイル番号。

    if(m<3){                            // 侵入不可の地形の番号だった場合
        gMoveX=0;                       // 移動禁止X。
        gMoveY=0;                       // 移動禁止Y。
    }

    if(Math.abs(gMoveX)+Math.abs(gMoveY)==SCROLL){   // マス目移動が終わる直前である場合。
        if(m==8||m==9){                              // お城の場合。
            gHP = gMHP;                              // HP全回復
            SetMessage("魔王を倒して！",null);
        }             
        if(m==10||m==11){                            // 街の場合。
            gHP = gMHP;                              // HP全回復
            SetMessage("東はてに家があり", "あなたを待っています");
        } 
        if(m==12) {                                  // 家の場合。
            gHP = gMHP;                              // HP全回復
            SetMessage("魔王へのカギは", "洞窟にあります");
        } 
        if(m==13) {                                  // 洞窟の場合。
            gItem =1;                                // カギ入手。
            SetMessage("カギを手に入れた！", null);
        } 
        if(m==14) {                                  // 扉の場合。
            if(gItem==0){                            // カギを持っていない場合。
                gPlayerY -= TILESIZE;                // 1マス上へ移動。
                SetMessage("カギが必要です！", null);
            }else{                                   // カギを持っている場合。
                SetMessage("扉が開いた！", null);
            }
        }
        if(m==15){                                   // 魔王。
            AppearEnemy(gMonsterName.length-1);
        }
        if(Math.random() * 8 <gEncounter[m]){           // 8分の1〜3の確率。
            let t=  Math.abs(gPlayerX/TILESIZE-START_X)+
                    Math.abs(gPlayerY/TILESIZE-START_Y);
            if(m==6){                                   // マップタイプが林だった場合。
                t+=8;                                   // 敵レベルを0.5上昇
            }
            if(m==7){                                   // マップタイプが山だった場合。
                t+=16;                                  // 敵レベルを1上昇。
            }
            t += Math.random()*8;                       // 敵レベルを0〜0.5上昇。
            t = Math.floor(t/16);
            t=Math.min(t,gMonsterName.length-2);        // 上限処理。
            AppearEnemy(t);
        }
    }

    gPlayerX += Math.sign(gMoveX)*SCROLL;       // プレイヤーX座標移動
    gPlayerY += Math.sign(gMoveY)*SCROLL;       // プレイヤーY座標移動
    gMoveX -= Math.sign(gMoveX)*SCROLL;         // X移動量
    gMoveY -= Math.sign(gMoveY)*SCROLL;         // Y移動量

    // マップループ処理。
    gPlayerX += (MAP_WIDTH*TILESIZE);
    gPlayerX %= (MAP_WIDTH*TILESIZE);
    gPlayerY += (MAP_HEIGHT*TILESIZE);
    gPlayerY %= (MAP_HEIGHT*TILESIZE);
}

// 描画関連の処理。
function WmPaint()
{
    DrawMain();                                 // まず仮想画面の描画。
    const ca = document.getElementById("main"); // mainキャンパスの要素を取得。
    const g = ca.getContext("2d");              // 2D描画コンテキストを取得。
    g.drawImage(TUG.GR.mCanvas, 0, 0, TUG.GR.mCanvas.width, TUG.GR.mCanvas.height,0,0,gWidth, gHeight);   // 仮想画面のイメージを実画面へ描画。
}

// キャンパスの大きさを処理。
function WmSize()
{
    const ca = document.getElementById("main"); // mainキャンパスの要素を取得。
    ca.width = window.innerWidth;               // キャンパスの幅をブラウザの幅へ変更
    ca.height= window.innerHeight;              // キャンポスの高さをブラウザの高さへ変更
    const g = ca.getContext("2d");              // 2D描画コンテキストを取得。
    g.imageSmoothingEnabled = g.msimageSmoothingEnabled = SMOOTH;  // 補完処理(ドットがくっきりする。)。

    // 実画面サイズを計測し、ドットのアスペクト比を維持したままでの最大サイズを計測。
    gWidth = ca.width;                 // 実画面へ描画時の幅。
    gHeight = ca.height;               // 実画面へ描画時の高さ。

    if(gWidth/WIDTH < gHeight/HEIGHT){      // 実画面の高さと仮想画面の高さの比率が幅のより大きい場合。
        gHeight = gWidth * HEIGHT/WIDTH;    // 高さに幅を合わせる。
    }else{
        gWidth = gHeight * WIDTH/HEIGHT;    // 幅に高さを合わせる。
    }
}

// タイマーイベント発生時の処理。
TUG.onTimer = function ()
{
    if(!gMessage1){
        gFrame++;           // 内部カウンタを加算。
        TickField();        // フィールド上での移動処理。
    }
    WmPaint();              // 描画関連の処理。
}

// キー入力(Down)イベント。（キーが押された時）
window.onkeydown = function( ev )
{
    let c = ev.keyCode;         // キーコード取得。
    if(gKey[c]!=0){             // 既に押下中の場合(キーリピート)。
        return;
    }
    gKey[c]=1;

    if(gPhase==1){              // 敵が現れた場合。
        CommandFight();         // 戦闘コマンド処理。
        return;
    }
    if(gPhase==2){              // 戦闘コマンド選択中の場合。
        if(c ==13|| c==90){     // EnterまたはZの場合。
            gOrder = Math.floor(Math.random()*2);   // 先行後攻処理。
            Action();           // 戦闘行動処理。
        }else{
            gCursor =1-gCursor
        }
        return;
    }
    if(gPhase==3){
        Action();               // 戦闘行動処理。
        return;
    }
    if(gPhase==4){
        CommandFight();         // 戦闘コマンド処理。
        return;
    }
    if(gPhase==5){
        gPhase=6;
        AddExp(gEnemyType + 1);      // EnemyType＋１を経験値と設定。
        SetMessage("敵をやっつけた！",null);
        return;
    }
    if(gPhase==6){
        if(IsBoss()&&gCursor==0){    // 敵がボスかつ「戦う」コマンドだった場合。
            SetMessage("魔王を倒した！", "世界に平和が訪れた");
            return;
        }
        gPhase=0;                    // マップ移動画面フェーズ。
    }
    if(gPhase==7){
        gPhase=8;
        SetMessage("あなたは死亡した",null);
        return;
    }
    if(gPhase==8){
        SetMessage("ゲームオーバー",null);
        return;
    }
        gMessage1=null;              // キー入力されたら一旦メッセージをNullにする。
        gMessage2=null;              // キー入力されたら一旦メッセージをNullにする。
}

// キー入力(Up)イベント。（キーが離された時）
window.onkeyup = function( ev )
{
    gKey[ev.keyCode]= 0;             // キーコード取得。
}

// ブラウザ起動イベント
window.onload = function()
{
    LoadImage();                                            // 画像の読み込み処理
    WmSize();                                               // キャンバスの大きさを初期化:。
    window.addEventListener("resize",function(){WmSize()})  // ブラウザサイズの変更時、WmSize()を呼び出すよう指示。
    TUG.init();
}
