/* ================= khởi động ================= */
import './style.css';
import {loop} from './render.js';
import {titleScreen,startPlay} from './intro.js';
import * as state from './state.js';
import * as ui from './ui.js';
import {advance,advanceOne,EVENTS} from './events.js';
import {LIFE,runLife,lifeChronicle} from './life.js';
import {SPOTS} from './explore.js';
import {fastForward,chooseFocus,talkThay,talkVo,talkLy,talkRen,talkCha,talkMe,talkSach,talkTong,talkCo,talkThao,fieldAction,fishAction,talkBuffalo,loseBuffalo,walkable,bfs,pathTo,hideSpots,PEN} from './dialogs.js';
import {update,canStand} from './input.js';
import {BUILDINGS,SIGNS,get,tolichY} from './map.js';
import {WA} from './constants.js';
import {startFlood,endFlood} from './minigames/flood.js';
import {startExam} from './minigames/exam.js';
import {startTraining,tmHit} from './minigames/training.js';
import {dailyFlush} from './minigames/daily.js';
import {startClimax,finishClimax,ZONE,endChapter} from './climax.js';
import {startEscort} from './camp.js';
import {W,H} from './constants.js';
import * as world from './world.js';
import * as trai from './trai.js';
import * as stats from './stats.js';
import * as nghe from './nghe.js';
import {talkSu,doorAction} from './dialogs.js';
import * as chuc from './chuc.js';
import {startDich} from './minigames/dich.js';
import {startCuop} from './minigames/cuop.js';
import {startSau} from './minigames/sau.js';
import {startKien} from './minigames/kien.js';
import {hoiVat,startVat,vatFlush} from './minigames/vat.js';
import {midChronicle} from './minigames/chung.js';
import * as cheo from './minigames/cheo.js';
import * as loi from './loi.js';
import * as ngu from './ngu.js';
import {talkHocQuan,talkVoQuan} from './dialogs.js';
import {prepCost} from './prep.js';
import * as ch2 from './chapter2/index.js';
import * as tron from './chapter2/trontrai.js';
import {personSprite} from './sprites.js';
import {loadPeople} from './person.js';
import {groundChunk,overview,prewarm} from './ground.js';

// chờ nạp ảnh nhân vật (src/assets/nguoi.png) rồi mới vẽ
loadPeople().catch(e=>console.error('Không nạp được ảnh nhân vật',e)).then(()=>{requestAnimationFrame(loop);titleScreen();
  for(const s of [0,1,2,3])prewarm(s,44,40);   // vẽ sẵn nền quanh làng, 4 mùa, lúc ở màn tiêu đề
  if(import.meta.env.MODE==='test')window.__dv=hook});

/* Hook cho tests/playtest.py và tests/bots.js. Chỉ có trong bản build `--mode test`, bản phát hành tự loại bỏ.
   step(dt) chạy đúng một nhịp cập nhật của game (phím, va chạm, minigame) để bot chơi nhanh hơn thời gian thật. */
const hook=import.meta.env.MODE==='test'&&{
  get S(){return state.S},get MG(){return state.MG},setS:state.setS,setMG:state.setMG,newState:state.newState,P:state.P,NPCS:state.NPCS,
  get modalOpen(){return ui.modalOpen},renderHUD:ui.renderHUD,get dialogOpen(){return ui.dialogOpen},pick:ui.pick,closeDialog:ui.closeDialog,mpick:ui.mpick,nextModal:ui.nextModal,startQuest:ui.startQuest,
  advance,advanceOne,EVENTS,LIFE,SPOTS,runLife,lifeChronicle,fastForward,chooseFocus,talkThay,talkVo,talkLy,talkRen,talkCha,talkMe,talkSach,talkTong,talkCo,talkThao,startPlay,fieldAction,fishAction,
  startFlood,endFlood,startExam,startTraining,tmHit,startClimax,finishClimax,startEscort,W,H,
  dailyFlush,step:update,canStand,walkable,bfs,pathTo,hideSpots,PEN,BUILDINGS,SIGNS,talkBuffalo,loseBuffalo,ZONE,tileAt:get,WA,tolichY,personSprite,groundChunk,overview,world,trai,stats,nghe,talkSu,loadSave:state.loadSave,doorAction,chuc,prepCost,endChapter,startDich,startCuop,startSau,startKien,hoiVat,startVat,vatFlush,midChronicle,cheo,loi,ngu,talkNgu:ngu.talkNgu,talkHocQuan,talkVoQuan,ch2,tron};
