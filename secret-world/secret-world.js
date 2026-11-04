(() => {
  const rooms = [
    {name:'The Art Room',icon:'🎨',bg:'#f5e1e9',costume:'#b7cce4',body:'🎨',heading:'Where it all began ♡',story:'My background in Fine Arts and Product Design taught me to notice color, composition and all the little details that make a story beautiful.',key:'The Artist Key'},
    {name:'Beauty Vanity',icon:'💄',bg:'#fce7e5',costume:'#efb3c6',body:'💄',heading:'A little makeup magic',story:'As a makeup artist, I love everything from soft glam to creative transformations. For me, makeup is another way to tell a story.',key:'The Beauty Key'},
    {name:'Cosplay Closet',icon:'🎭',bg:'#ebe4f6',costume:'#b6a0db',body:'✨',heading:'Step into another world',story:'Cosplay lets me bring characters to life through makeup, styling, costumes and imagination. Every transformation starts with a creative idea.',key:'The Imagination Key'},
    {name:'Travel Window',icon:'✈️',bg:'#e3edf6',costume:'#c8d7eb',body:'📸',heading:'Inspired by two worlds',story:'I grew up in the Philippines and now live in Germany. Travel, different cultures, cafés and everyday discoveries inspire my storytelling.',key:'The Adventure Key'},
    {name:'Creator Desk',icon:'📷',bg:'#e8f0e5',costume:'#e6b4d1',body:'🎬',heading:'Ideas become content',story:'Today I combine my love of art, beauty, cosplay and lifestyle into UGC: thoughtful concepts, filming, editing and authentic stories for brands.',key:'The Creator Key'}
  ];
  const map=document.getElementById('sw-map');
  if(!map)return;
  const visited=new Set();let active=-1;
  const portrait=document.getElementById('sw-portrait');
  const photoFiles=['art.jpg','beauty.jpg','cosplay.jpg','travel.jpg','creator.jpg'];
  function showPhoto(file){if(!portrait)return;portrait.classList.add('sw-changing');portrait.src='secret-world/'+file;portrait.onload=()=>portrait.classList.remove('sw-changing');portrait.onerror=()=>portrait.classList.remove('sw-changing');}
  const story=document.getElementById('sw-story'),title=document.getElementById('sw-story-title'),copy=document.getElementById('sw-story-text'),reward=document.getElementById('sw-reward'),next=document.getElementById('sw-next'),character=document.getElementById('sw-character');
  rooms.forEach((r,i)=>{const btn=document.createElement('button');btn.type='button';btn.className='sw-room';btn.style.setProperty('--room-bg',r.bg);btn.setAttribute('aria-pressed','false');btn.innerHTML=`<span class="sw-room-icon" aria-hidden="true">${r.icon}</span><strong>${r.name}</strong><small>✧ Tap to explore</small>`;btn.addEventListener('click',()=>openRoom(i));map.appendChild(btn)});
  const buttons=[...map.querySelectorAll('.sw-room')];
  function update(){document.getElementById('sw-count').textContent=`🔑 ${visited.size} / 5 Keys`;document.getElementById('sw-keys').textContent=rooms.map((_,i)=>visited.has(i)?'🔑':'◇').join(' ');buttons.forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===active));b.querySelector('small').textContent=visited.has(i)?'✓ Key collected':'✧ Tap to explore'})}
  function openRoom(i){active=i;visited.add(i);const r=rooms[i];story.classList.remove('sw-finale');document.querySelector('.sw-story-head').textContent=`✿ MEMORY ${i+1} OF 5`;title.textContent=r.heading;copy.textContent=r.story;reward.textContent=`🔑 Collected: ${r.key}`;showPhoto(photoFiles[i]);next.textContent=visited.size===5?'✦ Unlock the final story':`Next room →`;update()}
  function finale(){active=-1;story.classList.add('sw-finale');document.querySelector('.sw-story-head').textContent='✦ ALL FIVE KEYS COLLECTED ✦';title.textContent='You found the real me! ♡';copy.textContent="Artist, makeup lover, cosplayer, traveler and storyteller. These little worlds come together in Junjuns UGC. Let's make something wonderful together!";reward.textContent='🏆 Achievement unlocked: Meet the Creator';showPhoto('welcome.jpg');next.textContent='Let’s create together ↗';update()}
  next.addEventListener('click',()=>{if(story.classList.contains('sw-finale')){window.location.hash='contact';return}if(visited.size===5){finale();return}const n=rooms.findIndex((_,i)=>!visited.has(i));openRoom(n)});
  document.getElementById('sw-restart').addEventListener('click',()=>{visited.clear();active=-1;story.classList.remove('sw-finale');document.querySelector('.sw-story-head').textContent='✿ YOUR ADVENTURE STARTS HERE';title.textContent='Welcome to my world ♡';copy.textContent='Click a room to discover a little piece of my story. Collect all five keys to unlock a special ending!';reward.textContent='✧ Five memories are waiting for you';showPhoto('welcome.jpg');next.textContent='Explore the Art Room →';update()});update();
})();

