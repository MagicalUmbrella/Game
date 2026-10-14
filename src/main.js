/* ================= khởi động ================= */
import './style.css';
import './input.js';
import {loop} from './render.js';
import {titleScreen,startPlay} from './intro.js';
import * as state from './state.js';
import * as ui from './ui.js';
import {advance,advanceOne} from './events.js';
import {fastForward,chooseFocus,talkThay,talkVo} from './dialogs.js';
import {startFlood,endFlood} from './minigames/flood.js';
import {startExam} from './minigames/exam.js';
import {startTraining,tmHit} from './minigames/training.js';
import {startClimax,finishClimax} from './climax.js';

requestAnimationFrame(loop);
titleScreen();

/* Hook cho tests/playtest.py. Chỉ có trong bản build `--mode test`, bản phát hành tự loại bỏ. */
if(import.meta.env.MODE==='test')window.__dv={
  get S(){return state.S},get MG(){return state.MG},setS:state.setS,newState:state.newState,
  get modalOpen(){return ui.modalOpen},get dialogOpen(){return ui.dialogOpen},pick:ui.pick,mpick:ui.mpick,
  advance,advanceOne,fastForward,chooseFocus,talkThay,talkVo,startPlay,
  startFlood,endFlood,startExam,startTraining,tmHit,startClimax,finishClimax};
