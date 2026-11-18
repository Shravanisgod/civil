(() => {
  const game = document.getElementById("game");
  if (!game) return;

  game.innerHTML = `
    <div class="topbar">
      <div>
        <h1>⚔️ Rise of Empires</h1>
        <div class="subtitle">Build your village. Grow your food. Create an empire.</div>
      </div>
      <div class="day-box">DAY <b id="day">1</b></div>
    </div>

    <div class="resources" id="resources"></div>

    <div class="game-layout">
      <section class="world-panel">
        <div class="world-heading">
          <b>YOUR WORLD</b>
          <span>Move with WASD or arrow keys. Click a tile to select it.</span>
        </div>
        <div id="world"></div>
        <div class="help">
          Prepare soil, plant seeds, water crops, and harvest wheat.
        </div>
      </section>

      <aside class="side-panel">
        <section class="card">
          <h2>Selected Land</h2>
          <div id="selection">Click a tile.</div>
          <div id="actions" class="actions"></div>
        </section>

        <section class="card">
          <h2>Village</h2>
          <div id="village"></div>
          <div class="actions">
            <button id="sell">🪙 Sell 5 food</button>
            <button id="nextDay" class="primary">☀️ Advance Day</button>
          </div>
        </section>

        <section class="card">
          <h2>How to Play Nigger</h2>
          <p>1. Walk around using WASD nigger.</p>
          <p>2. Select empty grass nigger.</p>
          <p>3. Prepare the field nigger.</p>
          <p>4. Plant and water wheat nigger.</p>
          <p>5. Advance days to grow crops nigger.</p>
          <p>6. Harvest wheat for food and seeds.</p>
          <p>7. Collect wood and stone.</p>
        </section>

        <section class="card">
          <h2>History</h2>
          <div id="history" class="history"></div>
        </section>
      </aside>
    </div>

    <div id="notice" class="notice">
      Welcome! Your village starts today.
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    * { box-sizing:border-box; }

    body {
      margin:0;
      background:#101820;
      color:#f4f1e8;
      font-family:Arial,sans-serif;
    }

    #game {
      max-width:1500px;
      margin:auto;
      padding:18px;
    }

    .topbar {
      display:flex;
      justify-content:space-between;
      align-items:center;
      flex-wrap:wrap;
      gap:15px;
    }

    h1 {
      color:#f0ce78;
      margin:5px 0;
      font-size:32px;
    }

    .subtitle,.help {
      color:#b8c5c8;
      font-size:13px;
    }

    .day-box,.resource,.card,.world-panel {
      background:#202d37;
      border:1px solid #3b4d57;
      border-radius:10px;
    }

    .day-box { padding:12px 18px; }
    .day-box b { color:#f0ce78; font-size:22px; }

    .resources {
      display:grid;
      grid-template-columns:repeat(5,1fr);
      gap:8px;
      margin:17px 0;
    }

    .resource {
      padding:10px;
      text-align:center;
      font-size:13px;
    }

    .resource b {
      display:block;
      color:#f0ce78;
      font-size:20px;
      margin-top:4px;
    }

    .game-layout {
      display:grid;
      grid-template-columns:minmax(0,1fr) 300px;
      gap:14px;
    }

    .world-panel { padding:12px; }

    .world-heading {
      display:flex;
      justify-content:space-between;
      flex-wrap:wrap;
      gap:8px;
      margin-bottom:10px;
    }

    .world-heading span {
      color:#b8c5c8;
      font-size:12px;
    }

    #world {
      width:100%;
      height:min(68vh,680px);
      min-height:390px;
      overflow:hidden;
      border-radius:8px;
      background:#17252b;
    }

    #world canvas {
      display:block;
      width:100%;
      height:100%;
    }

    .help { margin-top:10px; line-height:1.5; }

    .side-panel {
      display:flex;
      flex-direction:column;
      gap:10px;
    }

    .card { padding:13px; }

    .card h2 {
      color:#f0ce78;
      font-size:17px;
      margin:0 0 10px;
    }

    .card p {
      color:#c1cdd0;
      font-size:13px;
      line-height:1.5;
    }

    #selection,#village {
      font-size:13px;
      line-height:1.8;
    }

    .actions {
      display:flex;
      flex-wrap:wrap;
      gap:6px;
      margin-top:10px;
    }

    button {
      border:0;
      border-radius:6px;
      padding:10px;
      background:#647783;
      color:white;
      font-weight:bold;
      cursor:pointer;
      flex:1;
      min-width:110px;
    }

    button:hover { filter:brightness(1.15); }

    button:disabled {
      opacity:.4;
      cursor:not-allowed;
    }

    button.primary {
      background:#b88d43;
      color:#151515;
    }

    .history {
      max-height:125px;
      overflow:auto;
      font-size:12px;
      line-height:1.7;
    }

    .notice {
      color:#f0ce78;
      padding:10px 2px;
      font-size:14px;
    }

    @media(max-width:850px) {
      .game-layout { grid-template-columns:1fr; }
      #world { height:55vh; }
    }

    @media(max-width:480px) {
      #game { padding:10px; }
      .resources { grid-template-columns:repeat(3,1fr); }
    }
  `;

  document.head.appendChild(style);

  function loadThree() {
    return new Promise((resolve,reject) => {
      if (window.THREE) return resolve(window.THREE);

      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js";

      script.onload = () => resolve(window.THREE);
      script.onerror = () => reject(new Error("Could not load 3D engine."));

      document.head.appendChild(script);
    });
  }

  loadThree().then(startGame).catch(error => {
    document.getElementById("world").textContent = error.message;
  });

  function startGame(THREE) {

    const SIZE = 12;

    let day = 1;
    let selected = 78;

    let food = 20;
    let wood = 15;
    let stone = 5;
    let coins = 20;
    let seeds = 5;

    let playerX = 6;
    let playerZ = 6;

    let history = ["Day 1: Your village was founded."];

    const tiles = [];

    const worldEl = document.getElementById("world");

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x9bc5d5);
    scene.fog = new THREE.Fog(0x9bc5d5,17,34);

    const camera = new THREE.PerspectiveCamera(48,1,0.1,100);

    camera.position.set(10,13,12);

    const renderer = new THREE.WebGLRenderer({
      antialias:true
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1,2)
    );

    renderer.shadowMap.enabled = true;

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    worldEl.appendChild(renderer.domElement);

    scene.add(
      new THREE.HemisphereLight(0xffffff,0x53634b,2)
    );

    const sun = new THREE.DirectionalLight(0xffffff,2.2);

    sun.position.set(-8,16,10);
    sun.castShadow = true;

    scene.add(sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60,60),
      new THREE.MeshStandardMaterial({
        color:0x557d48
      })
    );

    ground.rotation.x = -Math.PI/2;
    ground.position.y = -0.16;
    ground.receiveShadow = true;

    scene.add(ground);

    const materials = {
      grass:new THREE.MeshStandardMaterial({color:0x65934f}),
      forest:new THREE.MeshStandardMaterial({color:0x356b42}),
      dirt:new THREE.MeshStandardMaterial({color:0x8b6744}),
      water:new THREE.MeshStandardMaterial({color:0x367fa7}),
      rock:new THREE.MeshStandardMaterial({color:0x777d80}),
      wood:new THREE.MeshStandardMaterial({color:0x79502d}),
      leaves:new THREE.MeshStandardMaterial({color:0x28613b}),
      wheat:new THREE.MeshStandardMaterial({color:0xd8b84d}),
      ripe:new THREE.MeshStandardMaterial({color:0xf2d15c}),
      player:new THREE.MeshStandardMaterial({color:0xe7b85d}),
      shirt:new THREE.MeshStandardMaterial({color:0x3e78a8}),
      highlight:new THREE.MeshBasicMaterial({
        color:0xffe36c,
        transparent:true,
        opacity:0.28
      })
    };

    const objects = new THREE.Group();
    scene.add(objects);

    function addTree(x,z) {

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09,0.13,0.55,7),
        materials.wood
      );

      trunk.position.set(x,0.28,z);
      trunk.castShadow = true;

      objects.add(trunk);

      const top = new THREE.Mesh(
        new THREE.ConeGeometry(0.42,0.95,7),
        materials.leaves
      );

      top.position.set(x,0.95,z);
      top.castShadow = true;

      objects.add(top);

      return [trunk,top];
    }

    function addRock(x,z) {

      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.34),
        materials.rock
      );

      rock.position.set(x,0.22,z);
      rock.scale.set(1.2,0.8,1);
      rock.castShadow = true;

      objects.add(rock);

      return [rock];
    }

    function addCrop(tile) {

      const group = new THREE.Group();

      const height = 0.3 + Math.min(tile.growth,3)*0.19;

      for(let i=0;i<4;i++) {

        const stalk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025,0.035,height,5),
          tile.growth>=3 ? materials.ripe : materials.wheat
        );

        stalk.position.set(
          (i%2)*0.18-0.09,
          height/2+0.1,
          Math.floor(i/2)*0.18-0.09
        );

        group.add(stalk);

        if(tile.growth>=2) {

          const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.09,6,5),
            materials.ripe
          );

          head.position.set(
            stalk.position.x,
            height+0.1,
            stalk.position.z
          );

          group.add(head);
        }
      }

      group.position.set(tile.x,0,tile.z);

      objects.add(group);

      return [group];
    }

    function removeMeshes(meshes) {

      if(!meshes) return;

      meshes.forEach(mesh => {
        objects.remove(mesh);
      });
    }

    const tileGeometry = new THREE.BoxGeometry(0.96,0.18,0.96);

    for(let z=0;z<SIZE;z++) {

      for(let x=0;x<SIZE;x++) {

        const roll = Math.random();

        let type =
          roll<0.13 ? "forest" :
          roll<0.21 ? "rock" :
          roll<0.27 ? "water" :
          "grass";

        if(Math.abs(x-6)+Math.abs(z-6)<3) {
          type = "grass";
        }

        const tile = {
          x,z,type,
          field:false,
          crop:false,
          growth:0,
          watered:false,
          decoration:[],
          cropMeshes:[]
        };

        const mesh = new THREE.Mesh(
          tileGeometry,
          materials[type==="rock" ? "grass" : type]
        );

        mesh.position.set(x,-0.03,z);
        mesh.receiveShadow = true;
        mesh.userData.tile = tile;

        scene.add(mesh);

        tile.mesh = mesh;

        if(type==="forest") tile.decoration=addTree(x,z);
        if(type==="rock") tile.decoration=addRock(x,z);

        tiles.push(tile);
      }
    }

    const player = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19,0.23,0.55,9),
      materials.shirt
    );

    body.position.y=0.48;
    body.castShadow=true;

    player.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.18,12,10),
      materials.player
    );

    head.position.y=0.88;
    player.add(head);

    player.position.set(playerX,0,playerZ);

    scene.add(player);

    const selector = new THREE.Mesh(
      new THREE.BoxGeometry(1.02,0.025,1.02),
      materials.highlight
    );

    selector.position.y=0.08;

    scene.add(selector);

    function tileAt(x,z) {
      if(x<0 || z<0 || x>=SIZE || z>=SIZE) return null;
      return tiles[z*SIZE+x];
    }

    function notify(message) {
      document.getElementById("notice").textContent=message;
    }

    function addHistory(message) {
      history.unshift(`Day ${day}: ${message}`);
      history=history.slice(0,18);
    }

    function renderUI() {

      document.getElementById("day").textContent=day;

      document.getElementById("resources").innerHTML=`
        <div class="resource">🌾 Food<b>${food}</b></div>
        <div class="resource">🌱 Seeds<b>${seeds}</b></div>
        <div class="resource">🪵 Wood<b>${wood}</b></div>
        <div class="resource">🪨 Stone<b>${stone}</b></div>
        <div class="resource">🪙 Coins<b>${coins}</b></div>
      `;

      const tile=tiles[selected];

      document.getElementById("selection").innerHTML=`
        Terrain: ${tile.type}<br>
        Land: ${tile.field ? "Prepared field" : "Natural land"}<br>
        Crop: ${tile.crop ? `Wheat (${Math.min(tile.growth,3)}/3)` : "None"}<br>
        Watered today: ${tile.watered ? "Yes" : "No"}
      `;

      const actions=document.getElementById("actions");

      actions.innerHTML="";

      function addButton(label,fn,disabled=false) {

        const button=document.createElement("button");

        button.textContent=label;
        button.disabled=disabled;

        button.addEventListener("click",fn);

        actions.appendChild(button);
      }

      if(tile.type==="water") {

        addButton("Lake",()=>notify("Select land instead."));

      } else if(tile.type==="forest" && tile.decoration.length) {

        addButton("🪓 Gather wood (+4)",()=>gather(tile,"wood"));

      } else if(tile.type==="rock" && tile.decoration.length) {

        addButton("⛏️ Gather stone (+3)",()=>gather(tile,"stone"));

      } else if(tile.crop && tile.growth>=3) {

        addButton("🌾 Harvest wheat",()=>harvest(tile));

      } else if(tile.crop) {

        addButton(
          tile.watered ? "Already watered" : "💧 Water crop",
          ()=>water(tile),
          tile.watered
        );

      } else if(tile.field) {

        addButton(
          "🌱 Plant wheat (1 seed)",
          ()=>plant(tile),
          seeds<1
        );

      } else {

        addButton(
          "🟫 Prepare field (3 wood)",
          ()=>prepare(tile),
          wood<3 || tile.type!=="grass"
        );
      }

      document.getElementById("village").innerHTML=`
        Fields: ${tiles.filter(t=>t.field).length}<br>
        Growing crops: ${tiles.filter(t=>t.crop && t.growth<3).length}<br>
        Ready to harvest: ${tiles.filter(t=>t.crop && t.growth>=3).length}
      `;

      document.getElementById("history").innerHTML=
        history.map(item=>"• "+item).join("<br>");

      selector.position.set(tile.x,0.08,tile.z);
    }

    function selectTile(tile) {
      selected=tile.z*SIZE+tile.x;
      renderUI();
    }

    function prepare(tile) {

      if(tile.type!=="grass" || tile.field || tile.crop) {
        return notify("You can only prepare empty grass.");
      }

      if(wood<3) return notify("You need 3 wood.");

      wood-=3;
      tile.field=true;
      tile.mesh.material=materials.dirt;

      addHistory("Prepared a new field.");

      notify("Field prepared! Plant wheat now.");

      renderUI();
    }

    function plant(tile) {

      if(!tile.field || tile.crop) {
        return notify("Prepare an empty field first.");
      }

      if(seeds<1) return notify("You need a seed.");

      seeds--;

      tile.crop=true;
      tile.growth=0;
      tile.watered=false;

      tile.cropMeshes=addCrop(tile);

      addHistory("Planted wheat.");

      notify("Wheat planted! Water it and advance the day.");

      renderUI();
    }

    function water(tile) {

      if(!tile.crop || tile.watered) return;

      tile.watered=true;

      addHistory("Watered a wheat crop.");

      notify("Crop watered!");

      renderUI();
    }

    function harvest(tile) {

      if(!tile.crop || tile.growth<3) {
        return notify("This wheat is not ready.");
      }

      removeMeshes(tile.cropMeshes);

      tile.cropMeshes=[];

      tile.crop=false;
      tile.growth=0;
      tile.watered=false;

      food+=8;
      seeds+=2;
      coins+=2;

      addHistory("Harvested wheat: +8 food, +2 seeds, +2 coins.");

      notify("Harvest complete!");

      renderUI();
    }

    function gather(tile,resource) {

      if(resource==="wood") {

        wood+=4;

        removeMeshes(tile.decoration);

        tile.decoration=[];

        tile.type="grass";
        tile.mesh.material=materials.grass;

        addHistory("Gathered 4 wood.");

        notify("+4 wood collected!");

      } else {

        stone+=3;

        removeMeshes(tile.decoration);

        tile.decoration=[];

        tile.type="grass";
        tile.mesh.material=materials.grass;

        addHistory("Collected 3 stone.");

        notify("+3 stone collected!");
      }

      renderUI();
    }

    function advanceDay() {

      day++;

      let ready=0;

      tiles.forEach(tile=> {

        if(tile.crop) {

          tile.growth=Math.min(
            3,
            tile.growth+(tile.watered ? 1 : 0.5)
          );

          tile.watered=false;

          removeMeshes(tile.cropMeshes);

          tile.cropMeshes=addCrop(tile);

          if(tile.growth>=3) ready++;
        }
      });

      food=Math.max(0,food-1);

      addHistory("A new day began.");

      notify(
        ready>0
        ? `${ready} crop(s) are ready to harvest!`
        : "A new day begins. Keep tending your fields."
      );

      renderUI();
    }

    function sellFood() {

      if(food<5) return notify("You need 5 food.");

      food-=5;
      coins+=5;

      addHistory("Sold 5 food for 5 coins.");

      notify("Sold 5 food!");

      renderUI();
    }

    function move(dx,dz) {

      const next=tileAt(playerX+dx,playerZ+dz);

      if(!next || next.type==="water") return;

      playerX+=dx;
      playerZ+=dz;

      player.position.set(playerX,0,playerZ);

      selectTile(next);
    }

    window.addEventListener("keydown",event=> {

      if(["INPUT","TEXTAREA"].includes(document.activeElement.tagName)) return;

      const key=event.key.toLowerCase();

      const moves={
        w:[0,-1],
        arrowup:[0,-1],
        s:[0,1],
        arrowdown:[0,1],
        a:[-1,0],
        arrowleft:[-1,0],
        d:[1,0],
        arrowright:[1,0]
      };

      if(moves[key]) {

        event.preventDefault();

        move(...moves[key]);
      }
    });

    const raycaster=new THREE.Raycaster();

    const pointer=new THREE.Vector2();

    renderer.domElement.addEventListener("pointerdown",event=> {

      const rect=renderer.domElement.getBoundingClientRect();

      pointer.x=((event.clientX-rect.left)/rect.width)*2-1;

      pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;

      raycaster.setFromCamera(pointer,camera);

      const hits=raycaster.intersectObjects(
        tiles.map(t=>t.mesh)
      );

      if(hits.length) {
        selectTile(hits[0].object.userData.tile);
      }
    });

    document.getElementById("nextDay")
      .addEventListener("click",advanceDay);

    document.getElementById("sell")
      .addEventListener("click",sellFood);

    function resize() {

      const width=worldEl.clientWidth;
      const height=worldEl.clientHeight;

      if(!width || !height) return;

      camera.aspect=width/height;

      camera.updateProjectionMatrix();

      renderer.setSize(width,height,false);
    }

    window.addEventListener("resize",resize);

    resize();

    function animate() {

      requestAnimationFrame(animate);

      const target=new THREE.Vector3(
        playerX+7,
        10,
        playerZ+8
      );

      camera.position.lerp(target,0.055);

      camera.lookAt(playerX,0,playerZ);

      renderer.render(scene,camera);
    }

    renderUI();

    animate();
  }
})();
