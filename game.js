
(() => {
  const style = document.createElement("style");
  style.textContent = `
    * { box-sizing:border-box }
    body { margin:0; background:#101820; color:#eee; font-family:Arial,sans-serif }
    #game { max-width:1200px; margin:auto; padding:18px }
    .top { display:flex; justify-content:space-between; flex-wrap:wrap; gap:12px; align-items:center }
    h1 { color:#e8c66a; margin:8px 0 }
    .stats { display:flex; flex-wrap:wrap; gap:9px; margin:18px 0 }
    .stat,.panel { background:#202d37; border:1px solid #394b56; border-radius:9px; padding:12px }
    .stat { flex:1; min-width:100px; text-align:center }
    .stat b { display:block; color:#f2d47c; font-size:20px; margin-top:5px }
    .layout { display:grid; grid-template-columns:1fr 260px; gap:15px }
    #map { display:grid; grid-template-columns:repeat(14,1fr); gap:3px; background:#111b21; padding:7px; border-radius:10px }
    .tile { aspect-ratio:1; border:1px solid #ffffff20; border-radius:4px; cursor:pointer; display:grid; place-items:center; font-size:clamp(13px,2.5vw,25px); position:relative }
    .tile:hover { outline:2px solid white; z-index:2 }
    .tile.selected { outline:3px solid #ffe071; z-index:3 }
    .grass { background:#527b43 }
    .forest { background:#285b3c }
    .mountain { background:#777b7d }
    .water { background:#245a83 }
    .desert { background:#b99a5b }
    .panel { margin-bottom:12px }
    button { background:#b88d43; color:#151515; border:0; padding:11px; border-radius:6px; cursor:pointer; font-weight:bold; margin:3px }
    button:hover { background:#e5bc69 }
    button:disabled { opacity:.35; cursor:not-allowed }
    .actions { display:flex; flex-wrap:wrap; gap:5px; margin-top:10px }
    .actions button { flex:1; min-width:100px }
    .log { height:130px; overflow:auto; font-size:13px; line-height:1.7; color:#c8d3d8 }
    .small { color:#aebbc1; font-size:13px; line-height:1.5 }
    #message { color:#f1d27a; min-height:22px; margin:10px 0 }
    @media(max-width:700px) { .layout {grid-template-columns:1fr} }
  `;
  document.head.appendChild(style);

  document.body.innerHTML = `
    <div id="game">
      <div class="top">
        <div><h1>⚔️ RISE OF EMPIRES</h1><div class="small">Build an empire. Conquer the world.</div></div>
        <div class="panel">Year <b id="year">1</b> | Turn <b id="turn">1</b></div>
      </div>
      <div class="stats" id="stats"></div>
      <div class="layout">
        <div>
          <div class="panel">
            <b>🌍 YOUR WORLD</b>
            <p class="small">Select a tile to inspect it. Expand your empire one tile at a time.</p>
            <div id="map"></div>
          </div>
          <div class="panel">
            <b>📜 Selected Territory</b>
            <div id="selected" class="small">Select a tile.</div>
            <div class="actions" id="tileActions"></div>
          </div>
        </div>
        <div>
          <div class="panel">
            <b>🏛️ Empire Management</b>
            <div id="empire" class="small"></div>
            <div class="actions">
              <button onclick="Civ.build('Farm')">🌾 Farm</button>
              <button onclick="Civ.build('House')">🏠 House</button>
              <button onclick="Civ.build('Lumber Mill')">🪓 Lumber Mill</button>
              <button onclick="Civ.build('Mine')">⛏️ Mine</button>
              <button onclick="Civ.build('Barracks')">⚔️ Barracks</button>
            </div>
          </div>
          <div class="panel">
            <b>🔬 Technology</b>
            <div id="tech" class="small"></div>
            <button onclick="Civ.research()">Research (20 Gold)</button>
          </div>
          <div class="panel">
            <b>🏰 Rival Civilization</b>
            <div id="rival" class="small"></div>
          </div>
          <div class="panel">
            <b>📜 History</b>
            <div id="log" class="log"></div>
          </div>
          <button style="width:100%;padding:15px" onclick="Civ.endTurn()">⏩ END TURN</button>
          <button style="width:100%;background:#526b80;color:white" onclick="location.reload()">↻ New World</button>
        </div>
      </div>
      <div id="message"></div>
    </div>
  `;

  const W = 14, H = 10;
  let year = 1, turn = 1;
  let resources = { food: 100, wood: 100, stone: 60, gold: 100 };
  let population = 10, soldiers = 0, happiness = 80;
  let research = 0, tech = 0;
  let selected = 0;
  let buildings = { Farm: 1, House: 1, "Lumber Mill": 0, Mine: 0, Barracks: 0 };
  let rival = { name: "The Iron Kingdom", power: 10, land: 3 };
  let history = ["Year 1: Your civilization was founded."];
  let gameOver = false;

  const terrain = ["grass","grass","grass","forest","mountain","desert","water"];
  const icons = {grass:"🌱",forest:"🌲",mountain:"⛰️",desert:"🏜️",water:"🌊"};
  let tiles = [];

  for (let i=0;i<W*H;i++) {
    const t = terrain[Math.floor(Math.random()*terrain.length)];
    tiles.push({type:t, owner:null, building:null});
  }

  // Create a starting settlement.
  const start = 5*W+5;
  tiles[start] = {type:"grass",owner:"player",building:"Capital"};
  tiles[start+1] = {type:"grass",owner:"player",building:null};
  tiles[start+W] = {type:"grass",owner:"player",building:null};

  function log(msg) {
    history.unshift("Year "+year+": "+msg);
    history = history.slice(0,30);
  }

  function notify(msg) {
    document.getElementById("message").textContent = msg;
  }

  function cost(building) {
    const costs = {
      Farm:{wood:20,stone:0,gold:5},
      House:{wood:30,stone:10,gold:10},
      "Lumber Mill":{wood:40,stone:10,gold:10},
      Mine:{wood:25,stone:20,gold:15},
      Barracks:{wood:50,stone:30,gold:30}
    };
    return costs[building];
  }

  function canAfford(c) {
    return Object.keys(c).every(k=>resources[k]>=c[k]);
  }

  function spend(c) {
    Object.keys(c).forEach(k=>resources[k]-=c[k]);
  }

  function render() {
    document.getElementById("year").textContent=year;
    document.getElementById("turn").textContent=turn;

    document.getElementById("stats").innerHTML = `
      <div class="stat">🌾 Food<b>${Math.floor(resources.food)}</b></div>
      <div class="stat">🪵 Wood<b>${Math.floor(resources.wood)}</b></div>
      <div class="stat">🪨 Stone<b>${Math.floor(resources.stone)}</b></div>
      <div class="stat">🪙 Gold<b>${Math.floor(resources.gold)}</b></div>
      <div class="stat">👥 People<b>${population}</b></div>
      <div class="stat">⚔️ Soldiers<b>${soldiers}</b></div>
    `;

    document.getElementById("map").innerHTML=tiles.map((t,i)=>{
      let content=icons[t.type];
      if(t.building==="Capital") content="🏰";
      else if(t.building==="Farm") content="🌾";
      else if(t.building==="House") content="🏠";
      else if(t.building==="Lumber Mill") content="🪓";
      else if(t.building==="Mine") content="⛏️";
      else if(t.building==="Barracks") content="⚔️";
      else if(t.owner==="player") content="🏳️";
      else if(t.owner==="rival") content="🚩";
      return `<div class="tile ${t.type} ${i===selected?"selected":""}" data-i="${i}" title="${t.type}">${content}</div>`;
    }).join("");

    document.getElementById("empire").innerHTML=`
      Population: ${population}<br>
      Territory: ${tiles.filter(t=>t.owner==="player").length}<br>
      Happiness: ${happiness}%<br>
      Buildings: ${Object.values(buildings).reduce((a,b)=>a+b,0)}
    `;

    document.getElementById("tech").innerHTML=`
      Technology level: ${tech}<br>
      Research progress: ${research}/100<br>
      Each level increases production.
    `;

    document.getElementById("rival").innerHTML=`
      ${rival.name}<br>
      Power: ${rival.power}<br>
      Territory: ${rival.land} tiles<br>
      Relationship: ${rival.power>soldiers?"Stronger":"Weaker"} than your army
    `;

    document.getElementById("log").innerHTML=history.map(x=>"• "+x).join("<br>");

    const t=tiles[selected];
    document.getElementById("selected").innerHTML=`
      Terrain: ${t.type}<br>
      Owner: ${t.owner||"Unclaimed"}<br>
      Building: ${t.building||"None"}
    `;

    const actions=document.getElementById("tileActions");
    actions.innerHTML="";
    if(t.owner!=="player" && t.owner!=="rival" && t.type!=="water") {
      actions.innerHTML='<button onclick="Civ.expand()">Expand Territory (20 Gold)</button>';
    }
    if(t.owner==="player" && !t.building) {
      actions.innerHTML='<button onclick="Civ.placeFarm()">Build Farm Here</button>';
    }

    document.querySelectorAll(".tile").forEach(el=>{
      el.addEventListener("click",()=>{
        selected=Number(el.dataset.i);
        render();
      });
    });
  }

  function build(name) {
    if(gameOver)return;
    const c=cost(name);
    if(!canAfford(c))return notify("Not enough resources!");
    const land=tiles.findIndex(t=>t.owner==="player"&&!t.building&&t.type!=="water");
    if(land===-1)return notify("You need an empty territory!");
    spend(c);
    tiles[land].building=name;
    buildings[name]++;
    log("Built a "+name+".");
    render();
  }

  function placeFarm() {
    if(gameOver)return;
    const t=tiles[selected];
    if(t.owner!=="player"||t.building)return notify("Select an empty tile you own.");
    if(!canAfford(cost("Farm")))return notify("Not enough resources!");
    spend(cost("Farm"));
    t.building="Farm";
    buildings.Farm++;
    log("A new farm was built.");
    render();
  }

  function expand() {
    if(gameOver)return;
    const t=tiles[selected];
    if(t.owner||t.type==="water")return notify("This land is unavailable.");
    if(resources.gold<20)return notify("You need 20 gold.");
    const adjacent=[selected-W,selected+W,selected-1,selected+1];
    if(!adjacent.some(i=>i>=0&&i<tiles.length&&tiles[i].owner==="player"))
      return notify("You can only expand next to your territory.");
    resources.gold-=20;
    t.owner="player";
    log("Expanded into new territory!");
    render();
  }

  function researchTech() {
    if(gameOver)return;
    if(resources.gold<20)return notify("You need 20 gold.");
    resources.gold-=20;
    research+=25;
    if(research>=100) {
      research-=100;
      tech++;
      log("Technology advanced to level "+tech+"!");
      notify("New technology unlocked!");
    } else notify("Research progress increased.");
    render();
  }

  function endTurn() {
    if(gameOver)return;
    turn++;
    year++;

    let foodGain=buildings.Farm*12*(1+tech*.15);
    let woodGain=buildings["Lumber Mill"]*10;
    let stoneGain=buildings.Mine*8;
    let goldGain=buildings.Mine*3+population*.5;

    resources.food+=foodGain;
    resources.wood+=woodGain;
    resources.stone+=stoneGain;
    resources.gold+=goldGain;

    resources.food-=population*2;

    if(resources.food<0) {
      population=Math.max(1,population-2);
      happiness=Math.max(0,happiness-10);
      resources.food=0;
      log("Food shortage! Population declined.");
    } else {
      happiness=Math.min(100,happiness+2);
      if(population<buildings.House*10+10 && resources.food>30) {
        population++;
        log("Your population grew.");
      }
    }

    // Rival civilization grows.
    if(Math.random()<.65) {
      rival.power+=Math.floor(Math.random()*5)+1;
      rival.land++;
    }

    // Small random events.
    const event=Math.random();
    if(event<.08) {
      resources.gold+=30;
      log("Merchants visited! +30 gold.");
    } else if(event<.14) {
      resources.food+=30;
      log("A good harvest! +30 food.");
    } else if(event<.18) {
      resources.wood+=20;
      log("Travelers brought supplies! +20 wood.");
    }

    if(happiness<=0) {
      gameOver=true;
      notify("Your civilization has collapsed!");
    }

    if(tiles.filter(t=>t.owner==="player").length>=W*H-10) {
      gameOver=true;
      notify("VICTORY! You have conquered the world!");
    }

    render();
  }

  window.Civ={build,placeFarm,expand,research:researchTech,endTurn};
  render();
  notify("Welcome, ruler. Your civilization begins today!");
})();
