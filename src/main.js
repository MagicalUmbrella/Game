/* ================= khởi động ================= */
import './style.css';
import {loop} from './render.js';
import {titleScreen,startPlay} from './intro.js';
import * as state from './state.js';
import * as ui from './ui.js';
import {advance,advanceOne} from './events.js';
import {fastForward,chooseFocus,talkThay,talkVo,talkLy,talkRen,talkCha,talkMe,talkSach,talkTong,talkBuffalo,loseBuffalo,walkable,bfs,pathTo,hideSpots,PEN} from './dialogs.js';
import {update,canStand} from './input.js';
import {BUILDINGS,SIGNS,get,tolichY} from './map.js';
import {WA} from './constants.js';
import {startFlood,endFlood} from './minigames/flood.js';
import {startExam} from './minigames/exam.js';
import {startTraining,tmHit} from './minigames/training.js';
import {startClimax,finishClimax,ZONE} from './climax.js';
import {personSprite} from './sprites.js';

requestAnimationFrame(loop);
titleScreen();

/* Hook cho tests/playtest.py và tests/bots.js. Chỉ có trong bản build `--mode test`, bản phát hành tự loại bỏ.
   step(dt) chạy đúng một nhịp cập nhật của game (phím, va chạm, minigame) để bot chơi nhanh hơn thời gian thật. */
if(import.meta.env.MODE==='test')window.__dv={
  get S(){return state.S},get MG(){return state.MG},setS:state.setS,setMG:state.setMG,newState:state.newState,P:state.P,NPCS:state.NPCS,
  get modalOpen(){return ui.modalOpen},get dialogOpen(){return ui.dialogOpen},pick:ui.pick,mpick:ui.mpick,nextModal:ui.nextModal,startQuest:ui.startQuest,
  advance,advanceOne,fastForward,chooseFocus,talkThay,talkVo,talkLy,talkRen,talkCha,talkMe,talkSach,talkTong,startPlay,
  startFlood,endFlood,startExam,startTraining,tmHit,startClimax,finishClimax,
  step:update,canStand,walkable,bfs,pathTo,hideSpots,PEN,BUILDINGS,SIGNS,talkBuffalo,loseBuffalo,ZONE,tileAt:get,WA,tolichY,personSprite};
