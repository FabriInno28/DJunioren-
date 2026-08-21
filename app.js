const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let DATA=null, exIndex=0, round=1, mode='single', phase='left', remaining=0, timer=null, pauseTimer=null, soundOn=true, ctx=null;
const music=$('#bgMusic');
music.volume=0.34;

function show(id){$$('.screen').forEach(s=>s.classList.remove('active'));$('#'+id).classList.add('active');scrollTo(0,0)}
function ensureAudioContext(){try{const A=window.AudioContext||window.webkitAudioContext;if(!ctx)ctx=new A();if(ctx.state==='suspended')ctx.resume()}catch(e){}}
function beep(freq=650,d=.07,vol=.06){if(!soundOn)return;ensureAudioContext();try{if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(vol,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+d);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+d)}catch(e){}}
async function startMusic(){if(!soundOn)return;ensureAudioContext();try{music.muted=false;music.volume=0.34;await music.play();updateSoundButtons()}catch(e){console.warn('Musik konnte noch nicht gestartet werden:',e)}}
function stopMusic(reset=false){try{music.pause();if(reset)music.currentTime=0}catch(e){}}
function setMusicLevel(level){if(soundOn){music.volume=level;if(music.paused)startMusic()}}
function toggleSound(){soundOn=!soundOn;if(soundOn){startMusic();beep(720,.06,.04)}else{stopMusic(false)}updateSoundButtons()}
function updateSoundButtons(){$$('.sound').forEach(b=>{b.textContent=soundOn?'♫':'×';b.classList.toggle('is-on',soundOn);b.setAttribute('aria-pressed',String(soundOn))})}
function fmt(s){return `00:${String(Math.max(0,s)).padStart(2,'0')}`}
function imgTag(e,n,active=false){const mirror=(e.id==='einbeinstand'&&n===1)||!!(e.mirror&&e.mirror[n]);return `<figure class="timer-pose ${active?'active-pose':''}"><img src="./${e.images[n]}" class="${mirror?'mirror':''}" alt="${e.labels[n]}"><figcaption>${e.labels[n]}</figcaption></figure>`}
function renderGrid(){const g=$('#exerciseGrid');g.innerHTML='';DATA.exercises.forEach((e,i)=>{const b=document.createElement('button');b.className='exercise-card';b.innerHTML=`<div class="thumb"><img src="./${e.images[0]}" alt="${e.title}"></div><div class="card-copy"><h3>${e.title}</h3><p>${e.teaser}</p></div>`;b.onclick=()=>openDetail(i);g.appendChild(b)})}
function openDetail(i){exIndex=i;const e=DATA.exercises[i];$('#detailTitle').textContent=e.title;$('#detailTeaser').textContent=e.teaser;$('#detailSteps').innerHTML=e.soGehts.map(x=>`<li>${x}</li>`).join('');$('#detailFocus').textContent=e.focus;$('#detailBenefit').textContent=e.benefit;const v=$('#detailVisual');v.innerHTML='';e.images.forEach((im,n)=>{const f=document.createElement('figure');f.className='pose';const mirror=(e.id==='einbeinstand'&&n===1)||!!(e.mirror&&e.mirror[n]);f.innerHTML=`<img src="./${im}" class="${mirror?'mirror':''}" alt="${e.labels[n]}"><figcaption>${e.labels[n]}</figcaption>`;v.appendChild(f)});show('detail')}

function prepareExercise(single=true){mode=single?'single':'training';phase='left';remaining=DATA.training.workSeconds;renderTimer();show('timer');setMusicLevel(.34);startMusic();beep(760,.1,.07);clearInterval(timer);timer=setInterval(tick,1000)}
function renderTimer(){const e=DATA.exercises[exIndex];$('#timerTitle').textContent=e.title.toUpperCase();$('#roundChip').textContent=mode==='training'?`RUNDE ${round} VON ${DATA.training.rounds}`:'';$('#roundChip').style.display=mode==='training'?'inline-block':'none';$('#sideLabel').textContent=phase==='left'?'LINKES BEIN':'RECHTES BEIN';$('#clock').textContent=fmt(remaining);$('#timerCue').textContent=e.timerCue;const active=phase==='left'?0:1;$('#timerVisual').innerHTML=e.images.slice(0,2).map((_,n)=>imgTag(e,n,n===active)).join('');$('#ringBar').style.width=(remaining/DATA.training.workSeconds*100)+'%'}
function tick(){remaining--;renderTimer();if(remaining<=3&&remaining>0)beep(470+remaining*70,.05,.04);if(remaining<=0){clearInterval(timer);if(phase==='left')startSwitch();else finishExercise()}}
function startSwitch(){const e=DATA.exercises[exIndex];$('#switchTitle').textContent=e.title.toUpperCase();show('switch');setMusicLevel(.22);let n=DATA.training.switchSeconds;$('#switchCount').textContent=n;beep(820,.12,.07);const sw=setInterval(()=>{n--;$('#switchCount').textContent=Math.max(0,n);if(n>0)beep(520+n*60,.05,.04);if(n<=0){clearInterval(sw);phase='right';remaining=DATA.training.workSeconds;renderTimer();show('timer');setMusicLevel(.34);beep(760,.08,.06);timer=setInterval(tick,1000)}},1000)}
function finishExercise(){beep(880,.12,.07);if(mode==='single'){setMusicLevel(.18);show('detail');return}let isLast=exIndex===DATA.exercises.length-1;if(isLast&&round>=DATA.training.rounds){setMusicLevel(.14);show('finish');return}let nextIndex=exIndex+1;if(isLast){round++;nextIndex=0}const n=DATA.exercises[nextIndex];$('#nextTitle').textContent=n.title;$('#nextTeaser').textContent=n.teaser;show('pause');setMusicLevel(.18);let p=DATA.training.pauseSeconds;$('#pauseCount').textContent=p;clearInterval(pauseTimer);pauseTimer=setInterval(()=>{p--;$('#pauseCount').textContent=Math.max(0,p);if(p<=3&&p>0)beep(460+p*60,.04,.035);if(p<=0){clearInterval(pauseTimer);exIndex=nextIndex;phase='left';remaining=DATA.training.workSeconds;renderTimer();show('timer');setMusicLevel(.34);beep(760,.08,.05);timer=setInterval(tick,1000)}},1000)}
function startTraining(){exIndex=0;round=1;mode='training';phase='left';remaining=DATA.training.workSeconds;renderTimer();show('timer');startMusic();setMusicLevel(.34);beep(760,.1,.07);clearInterval(timer);timer=setInterval(tick,1000)}
function reset(){clearInterval(timer);clearInterval(pauseTimer);round=1;exIndex=0;stopMusic(true);show('overview')}

$('#startTraining').onclick=startTraining;
$('#startExercise').onclick=()=>prepareExercise(true);
$('#again').onclick=startTraining;
$('#homeBtn').onclick=reset;
$('#quitTimer').onclick=()=>{clearInterval(timer);setMusicLevel(.18);openDetail(exIndex)};
$('#skipPause').onclick=()=>{clearInterval(pauseTimer);let isLast=exIndex===DATA.exercises.length-1;let nextIndex=exIndex+1;if(isLast){round++;nextIndex=0}exIndex=nextIndex;phase='left';remaining=DATA.training.workSeconds;renderTimer();show('timer');setMusicLevel(.34);beep(760,.08,.05);timer=setInterval(tick,1000)};
$$('[data-back]').forEach(b=>b.onclick=()=>{stopMusic(false);show('overview')});
$$('.sound').forEach(b=>b.onclick=toggleSound);

document.addEventListener('visibilitychange',()=>{if(document.hidden){music.volume=.12}else if(soundOn&&!$('#overview').classList.contains('active')){setMusicLevel(.30)}});

fetch('./training.json?v=4').then(r=>r.json()).then(d=>{DATA=d;renderGrid();updateSoundButtons()}).catch(err=>{console.error(err);document.body.insertAdjacentHTML('beforeend','<div style="padding:20px">Training konnte nicht geladen werden.</div>')});
