"use strict";

var TUG = TUG || {};
TUG.GR = {};

TUG.mCurrentFrame = 0;  // 経過フレーム数。
TUG.mFPS=60;            // フレームレート。
TUG.mHeight=120;        // 仮想画面・高さ。
TUG.mWidth=128;         // 仮想画面・幅。


TUG.init = function()
{
    TUG.GR.mCanvas = document.createElement("canvas");             // 仮想画面の作成。
    TUG.GR.mCanvas.width = TUG.mWidth;                                  // 仮想画面の幅を設定。
    TUG.GR.mCanvas.height = TUG.mHeight;                                // 仮想画面の高さを設定。
    TUG.GR.mG = TUG.GR.mCanvas.getContext("2d");     // 仮想画面の2D描画コンテキストを取得。

    requestAnimationFrame(TUG.wmTimer);
    // setInterval(function(){TUG.wmTimer()},33);                  // 33ms感覚でWmTimer()を呼び出すよう指示。
}

TUG.wmTimer = function()
{
    if(!TUG.mCurrentFrame){ //　初回呼び出し時。
        TUG.mCurrentFrame = performance.now();  // 開始時刻を設定。
    } 

    let d =Math.floor((performance.now()- TUG.mCurrentFrame)*TUG.mFPS/1000)- TUG.mCurrentFrame;
    console.log(d);
    if(d>0){
        TUG.onTimer();
        TUG.mCurrentFrame+=d;
    }


    requestAnimationFrame(TUG.wmTimer);
}

TUG.onTimer = function()
{

}

