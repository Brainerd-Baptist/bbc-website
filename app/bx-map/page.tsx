// BX Building Map — v13 artifact embed
// APP_VERSION: 1.0.61
const APP_VERSION = "1.0.61";

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400;0,600;0,700;1,400&family=Archivo+Narrow:wght@600;700&family=Source+Sans+3:wght@400;500;600&display=swap";

// CSS from v13 artifact — global html/body overrides (lines 46-49) deliberately excluded
// to avoid breaking the rest of the site during SPA navigation.
const CSS = `
/* Tokens live on .app so a host page can theme the map by wrapping it */
.app{
  --surface:#f3f5f8; --surface-raised:#ffffff; --surface-sunken:#e9edf2; --paper:#fbfcfd;
  --fg:#101a33; --fg-muted:#4e5a73; --fg-subtle:#7a849a; --border:#d5dbe5; --border-strong:#aeb8c8;
  --navy:#00205b; --accent:#008299; --accent-text:#00728a; --accent-bg:#d9eff2; --accent-fg:#ffffff;
  --wall:#1c2740; --wall-thin:#5b6780; --entry:#1f8a4c; --emerg:#c9302c;
  --c-meeting:#dfe4f4; --c-kids:#dcefe2; --c-students:#f7e8cd; --c-hospitality:#f6e2df; --c-fitness:#d8edf1;
  --c-offices:#e7e6f2; --c-restroom:#ece4f4; --c-hall:#f6f7f9; --c-stairs:#e7ebf0; --c-elevator:#dfe5ec; --c-storage:#eceef1;
  --t-meeting:#3a4a8a; --t-kids:#2d6b45; --t-students:#8a5a10; --t-hospitality:#9a3f3a; --t-fitness:#106b7a;
  --t-offices:#5a4f8f; --t-restroom:#6b4d96; --t-hall:#5b6780; --t-stairs:#3c4a63; --t-elevator:#3c4a63; --t-storage:#66707f;
  --shadow:0 10px 30px rgba(16,26,51,.16); --focus:#ffb02e; --glass:rgba(255,255,255,.94);
  color-scheme:light;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]) .app{
    --surface:#0d1322; --surface-raised:#161e31; --surface-sunken:#0a0f1b; --paper:#111828;
    --fg:#e8ecf4; --fg-muted:#aab4c8; --fg-subtle:#7e8aa3; --border:#2a3550; --border-strong:#3d4a68;
    --navy:#dfe6ff; --accent:#2fb5cc; --accent-text:#5ccbe0; --accent-bg:#123a44; --accent-fg:#06222b;
    --wall:#dfe6f4; --wall-thin:#8f9bb5; --entry:#4fcf85; --emerg:#ff6b66;
    --c-meeting:#28345e; --c-kids:#1e3f2c; --c-students:#4a3714; --c-hospitality:#4a2a2a; --c-fitness:#123c47;
    --c-offices:#33305a; --c-restroom:#3a2f55; --c-hall:#1a2236; --c-stairs:#26314a; --c-elevator:#2c3b53; --c-storage:#222b3d;
    --t-meeting:#b8c4f5; --t-kids:#9edcb7; --t-students:#f0c97a; --t-hospitality:#f3a8a1; --t-fitness:#86d7e8;
    --t-offices:#c1b8f4; --t-restroom:#cbb4f0; --t-hall:#9aa6c0; --t-stairs:#b9c4da; --t-elevator:#b9c4da; --t-storage:#a3adc0;
    --shadow:0 12px 34px rgba(0,0,0,.5); --glass:rgba(22,30,49,.94);
    color-scheme:dark;
  }
}
:root[data-theme="dark"] .app, [data-theme*="dark"] .app, .dark .app, .app.dark{
    --surface:#0d1322; --surface-raised:#161e31; --surface-sunken:#0a0f1b; --paper:#111828;
    --fg:#e8ecf4; --fg-muted:#aab4c8; --fg-subtle:#7e8aa3; --border:#2a3550; --border-strong:#3d4a68;
    --navy:#dfe6ff; --accent:#2fb5cc; --accent-text:#5ccbe0; --accent-bg:#123a44; --accent-fg:#06222b;
    --wall:#dfe6f4; --wall-thin:#8f9bb5; --entry:#4fcf85; --emerg:#ff6b66;
    --c-meeting:#28345e; --c-kids:#1e3f2c; --c-students:#4a3714; --c-hospitality:#4a2a2a; --c-fitness:#123c47;
    --c-offices:#33305a; --c-restroom:#3a2f55; --c-hall:#1a2236; --c-stairs:#26314a; --c-elevator:#2c3b53; --c-storage:#222b3d;
    --t-meeting:#b8c4f5; --t-kids:#9edcb7; --t-students:#f0c97a; --t-hospitality:#f3a8a1; --t-fitness:#86d7e8;
    --t-offices:#c1b8f4; --t-restroom:#cbb4f0; --t-hall:#9aa6c0; --t-stairs:#b9c4da; --t-elevator:#b9c4da; --t-storage:#a3adc0;
    --shadow:0 12px 34px rgba(0,0,0,.5); --glass:rgba(22,30,49,.94);
    color-scheme:dark;
}
.app,.app *{box-sizing:border-box}
.app{height:100%;min-height:0;position:relative;display:grid;grid-template-rows:1fr;background:var(--surface);color:var(--fg);font-family:"Source Sans 3",system-ui,-apple-system,"Segoe UI",sans-serif;font-size:15px;line-height:1.4;overflow:hidden;-webkit-tap-highlight-color:transparent}
.app button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer;touch-action:manipulation}
.app button:focus-visible,.app input:focus-visible,.app [tabindex]:focus-visible{outline:3px solid var(--focus);outline-offset:2px}
.stage{position:relative;min-height:0;display:grid;grid-template-columns:1fr;grid-template-rows:1fr;height:100%}
.mapwrap{position:relative;overflow:hidden;background:var(--surface);touch-action:none;cursor:grab;min-height:0}
.mapwrap.dragging{cursor:grabbing}
.mapwrap svg.map{width:100%;height:100%;display:block}
.ftop{position:absolute;left:0;right:0;top:0;padding:calc(10px + env(safe-area-inset-top,0px)) 12px 10px;z-index:4;pointer-events:none;display:grid;gap:8px;background:linear-gradient(to bottom,var(--surface) 0%,var(--surface) 62%,transparent 100%)}
.ftop>*{pointer-events:auto}
.row1{display:flex;gap:8px;align-items:stretch}
.search{position:relative;flex:1 1 auto;min-width:0}
.search input{width:100%;height:44px;padding:0 40px 0 40px;border-radius:14px;border:1px solid var(--border);background:var(--glass);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);color:var(--fg);font-size:16px;box-shadow:0 2px 10px rgba(0,0,0,.08)}
.search input::placeholder{color:var(--fg-subtle)}
.search svg.ico{position:absolute;left:13px;top:50%;transform:translateY(-50%);width:18px;height:18px;fill:none;stroke:var(--fg-subtle);stroke-width:2;pointer-events:none}
.search .clear{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:32px;height:32px;border-radius:50%;color:var(--fg-subtle);display:none;align-items:center;justify-content:center}
.search .clear.show{display:flex}
.seg{display:inline-flex;flex:none;background:var(--glass);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid var(--border);border-radius:14px;padding:3px;gap:2px;box-shadow:0 2px 10px rgba(0,0,0,.08)}
.seg button{padding:0 12px;height:36px;border-radius:11px;font-weight:600;font-size:14px;color:var(--fg-muted);white-space:nowrap}
.seg button[aria-pressed="true"]{background:var(--navy);color:#fff}
.dark .seg button[aria-pressed="true"],[data-theme*="dark"] .seg button[aria-pressed="true"]{color:#0d1322}
@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]) .seg button[aria-pressed="true"]{color:#0d1322} }
.results{position:absolute;top:calc(100% + 6px);left:0;right:0;background:var(--surface-raised);border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow);max-height:min(46vh,380px);overflow:auto;z-index:20;display:none}
.results.show{display:block}
.results button{display:flex;width:100%;align-items:center;gap:10px;padding:11px 12px;text-align:left;border-bottom:1px solid var(--border);min-height:44px}
.results button:last-child{border-bottom:0}
.results button:hover,.results button.active{background:var(--surface-sunken)}
.results .sw{width:12px;height:12px;border-radius:3px;flex:none;border:1px solid var(--border-strong)}
.results .nm{flex:1;min-width:0;font-weight:600;font-size:15px}
.results .lv{font-size:12px;color:var(--fg-subtle);white-space:nowrap}
.results .empty{padding:12px;color:var(--fg-subtle)}
.chips{display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;padding:2px 2px 4px;scrollbar-width:none;-webkit-overflow-scrolling:touch;mask-image:linear-gradient(90deg,#000 calc(100% - 28px),transparent);-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 28px),transparent)}
.chips::-webkit-scrollbar{display:none}
.chip{flex:none;display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px 0 9px;border-radius:999px;background:var(--glass);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid var(--border);font-size:13px;font-weight:600;color:var(--fg-muted);box-shadow:0 1px 4px rgba(0,0,0,.08)}
.chip i{width:10px;height:10px;border-radius:3px;border:1px solid rgba(0,0,0,.15)}
.chip[aria-pressed="true"]{border-color:var(--accent);color:var(--accent-text);background:var(--accent-bg)}
.ctrls{position:absolute;right:12px;bottom:12px;display:flex;flex-direction:column;gap:8px;z-index:3;transition:bottom .28s cubic-bezier(.2,.8,.2,1)}
.ctrls button{width:44px;height:44px;border-radius:14px;background:var(--glass);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid var(--border);box-shadow:0 2px 10px rgba(0,0,0,.1);color:var(--fg-muted);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:600}
.ctrls button svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ctrls button:active{transform:scale(.96)}
.legend{position:absolute;left:12px;bottom:12px;z-index:3;background:var(--glass);backdrop-filter:blur(8px);border:1px solid var(--border);border-radius:12px;padding:8px 10px;display:grid;grid-template-columns:auto auto;gap:4px 14px;font-size:12px;color:var(--fg-muted)}
.legend div{display:flex;align-items:center;gap:6px;white-space:nowrap}
.legend svg{width:16px;height:16px}
.levelbadge{position:absolute;left:12px;bottom:12px;z-index:3;font-family:"Archivo",sans-serif;font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--fg-subtle);background:var(--glass);border:1px solid var(--border);border-radius:999px;padding:6px 10px;transition:bottom .28s cubic-bezier(.2,.8,.2,1);pointer-events:none}
.room{stroke:var(--wall-thin);stroke-width:2;transition:fill .18s,stroke .18s,filter .18s;cursor:pointer}
.room.meeting{fill:var(--c-meeting)} .room.kids{fill:var(--c-kids)} .room.students{fill:var(--c-students)}
.room.hospitality{fill:var(--c-hospitality)} .room.fitness{fill:var(--c-fitness)} .room.offices{fill:var(--c-offices)}
.room.restroom{fill:var(--c-restroom)} .room.hall{fill:var(--c-hall)} .room.stairs{fill:var(--c-stairs)}
.room.elevator{fill:var(--c-elevator)} .room.storage{fill:var(--c-storage)}
.g-room.inner .room{stroke-dasharray:6 5;stroke-width:2.2;filter:brightness(.93)}
.g-room:hover .room{filter:brightness(.94)}
.g-room.selected .room{stroke:var(--accent);stroke-width:7;filter:none}
.g-room.selected .rlabel{fill:var(--accent-text)}
.g-room.dim .room{fill:var(--surface-sunken);opacity:.5}
.g-room.dim .rlabel,.g-room.dim .deco{opacity:.25}
.rlabel{font-family:"Archivo Narrow","Archivo",sans-serif;font-weight:600;fill:var(--fg);pointer-events:none;text-anchor:middle;dominant-baseline:middle;letter-spacing:.01em}
.rlabel.meeting{fill:var(--t-meeting)} .rlabel.kids{fill:var(--t-kids)} .rlabel.students{fill:var(--t-students)}
.rlabel.hospitality{fill:var(--t-hospitality)} .rlabel.fitness{fill:var(--t-fitness)} .rlabel.offices{fill:var(--t-offices)}
.rlabel.restroom{fill:var(--t-restroom)} .rlabel.hall{fill:var(--t-hall);font-weight:500;font-style:italic;paint-order:stroke;stroke:var(--c-hall);stroke-width:5px;stroke-linejoin:round}
.rlabel.stairs{fill:var(--t-stairs);paint-order:stroke;stroke:var(--c-stairs);stroke-width:6px;stroke-linejoin:round}
.rlabel.elevator{fill:var(--t-elevator)} .rlabel.storage{fill:var(--t-storage)}
.g-room.elevator .rlabel{font-size:15px}
.outline{fill:none;stroke:var(--wall);stroke-width:9;stroke-linejoin:miter;pointer-events:none}
.deco{pointer-events:none}
.tread{stroke:var(--wall-thin);stroke-width:1.6;fill:none}
.court{fill:none;stroke:var(--t-fitness);stroke-width:2;opacity:.55}
.arc{fill:none;stroke:var(--wall-thin);stroke-width:2.5;stroke-linecap:round}
.counter-out{fill:none;stroke:var(--wall-thin);stroke-width:1.5;stroke-linejoin:round;stroke-linecap:round;opacity:.55}
.exit rect{stroke:var(--surface);stroke-width:2}
.exit.primary rect{fill:var(--entry)} .exit.emerg rect{fill:var(--emerg)}
.exit text{fill:#fff;font-family:"Archivo",sans-serif;font-weight:700;font-size:14px;text-anchor:middle;dominant-baseline:middle;letter-spacing:.06em}
.exit.selected rect{stroke:var(--accent);stroke-width:5}
.door line{stroke:var(--surface);stroke-width:12;stroke-linecap:butt}
.door path{fill:none;stroke:var(--wall-thin);stroke-width:1.6}
.door text{fill:var(--fg-muted);font-family:"Archivo Narrow",sans-serif;font-size:17px;font-weight:600;pointer-events:none}
.icon-rr{fill:var(--t-restroom)}
.icon-el{fill:none;stroke:var(--t-elevator);stroke-width:3}
.poi circle{fill:var(--surface-raised);stroke:var(--wall-thin);stroke-width:2;cursor:pointer}
.poi.aed circle{stroke:#c9302c}.poi.aed .i-fill{fill:#c9302c}.poi.aed .i-bolt{fill:none;stroke:#fff;stroke-width:1.8;stroke-linejoin:round}
.poi.coffee .i-line{fill:none;stroke:var(--fg-muted);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.poi.selected circle{stroke:var(--accent);stroke-width:5}
.ctxlabel{font-family:"Archivo",sans-serif;font-weight:600;font-size:17px;letter-spacing:.18em;fill:var(--fg-subtle);text-anchor:middle;dominant-baseline:middle;pointer-events:none}
.north path{fill:var(--fg-subtle)}.north text{font-family:"Archivo",sans-serif;font-weight:700;font-size:18px;fill:var(--fg-subtle);text-anchor:middle}
.pulse{fill:none;stroke:var(--accent);stroke-width:4;opacity:0;pointer-events:none}
@keyframes ring{0%{opacity:.9;stroke-width:4}100%{opacity:0;stroke-width:40}}
.pulse.go{animation:ring 1s ease-out 1}
.panel{background:var(--surface-raised);display:flex;flex-direction:column;min-height:0}
.shead{padding:10px 16px 8px;flex:none}
.grab{width:40px;height:5px;border-radius:3px;background:var(--border-strong);margin:0 auto 8px;display:none}
.trow{display:flex;align-items:flex-start;gap:12px}
.trow .sw{width:14px;height:14px;border-radius:4px;margin-top:6px;flex:none;border:1px solid rgba(0,0,0,.12)}
.trow h2{margin:0;font-family:"Archivo",sans-serif;font-weight:700;font-size:19px;line-height:1.2;color:var(--navy);text-wrap:balance}
.trow .meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.tag{font-size:11.5px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;padding:3px 8px;border-radius:999px;background:var(--surface-sunken);color:var(--fg-muted)}
.tag.acc{background:var(--accent-bg);color:var(--accent-text)}
.trow .x{margin-left:auto;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--fg-subtle);flex:none}
.trow .x:hover{background:var(--surface-sunken)}
.sbody{padding:0 16px 16px;overflow:auto;font-size:14.5px;min-height:0;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
.sbody p{margin:6px 0 10px;color:var(--fg-muted);max-width:60ch}
.near h3{font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--fg-subtle);margin:12px 0 6px;font-weight:600}
.near ul{list-style:none;margin:0;padding:0;display:grid;gap:4px}
.near li button{display:flex;align-items:center;gap:8px;width:100%;min-height:44px;padding:7px 10px;border-radius:10px;text-align:left;border:1px solid var(--border);background:var(--paper)}
.near li button:hover{border-color:var(--accent)}
.near li svg{width:16px;height:16px;flex:none}
.near li .d{margin-left:auto;font-size:12px;color:var(--fg-subtle);font-variant-numeric:tabular-nums}
.sbody .foot{margin-top:12px;font-size:12px;color:var(--fg-subtle)}
.sbody .foot button{color:var(--accent-text);font-weight:600}
.welcome{padding:18px 16px;color:var(--fg-muted);font-size:14px;display:none}
.welcome h2{font-family:"Archivo",sans-serif;font-size:17px;color:var(--navy);margin:0 0 6px}
.welcome p{margin:0 0 10px;max-width:38ch}
.panel:not(.open) .shead,.panel:not(.open) .sbody{display:none}
.panel:not(.open) .welcome{display:block}
.peek{display:none;padding:2px 16px 12px;color:var(--fg-muted);font-size:14px}
.peek b{color:var(--fg);font-family:"Archivo",sans-serif}
@media (min-width:860px){
  .stage{grid-template-columns:1fr 360px}
  .panel{border-left:1px solid var(--border)}
  .ftop{max-width:640px}
  .levelbadge{display:none}
}
@media (max-width:859px){
  .stage{grid-template-columns:1fr}
  .panel{position:absolute;left:0;right:0;bottom:0;height:88%;border-radius:18px 18px 0 0;box-shadow:var(--shadow);border-top:1px solid var(--border);transform:translateY(calc(100% - var(--peek,64px)));transition:transform .28s cubic-bezier(.2,.8,.2,1);z-index:6;will-change:transform}
  .panel.dragging{transition:none}
  .panel[data-state="half"]{transform:translateY(50%)}
  .panel[data-state="full"]{transform:translateY(0)}
  .panel[data-state="hidden"]{transform:translateY(100%)}
  .grab{display:block}
  .shead{touch-action:none;cursor:grab;padding-top:8px}
  .welcome{display:none!important}
  .panel:not(.open) .peek{display:block}
  .panel:not(.open) .shead{display:block}
  .panel:not(.open) .trow{display:none}
  .sbody{padding-bottom:calc(16px + env(safe-area-inset-bottom,0px))}
  .panel[data-state="peek"] .sbody{overflow:hidden}
  .legend{display:none}
  .ctrls .desk{display:none}
}
@media (prefers-reduced-motion:reduce){.panel,.room,.ctrls,.levelbadge{transition:none}.pulse.go{animation:none}}
`;

// HTML structure from v13 artifact (lines 199-253)
const HTML = `<div class="app" id="app">
  <div class="stage">
    <div class="mapwrap" id="mapwrap">
      <div class="ftop" id="ftop">
        <div class="row1">
          <div class="search">
            <svg class="ico" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
            <input id="q" type="search" placeholder="Search the map" autocomplete="off" aria-label="Search the map" enterkeyhint="search">
            <button class="clear" id="qclear" aria-label="Clear search">&#x2715;</button>
            <div class="results" id="results" role="listbox"></div>
          </div>
          <div class="seg" role="group" aria-label="Level">
            <button id="lv-lower" aria-pressed="true">Lower</button>
            <button id="lv-upper" aria-pressed="false">Upper</button>
          </div>
        </div>
        <div class="chips" id="chips"></div>
      </div>
      <svg class="map" id="map" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="BX floor plan"></svg>
      <div class="legend" id="legend"></div>
      <div class="levelbadge" id="levelbadge">Lower Level</div>
      <div class="ctrls" id="ctrls">
        <button id="zin" class="desk" aria-label="Zoom in">+</button>
        <button id="zout" class="desk" aria-label="Zoom out">&minus;</button>
        <button id="zrot" aria-label="Rotate the map a quarter turn" title="Rotate"><svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.5-5.8"/><path d="M20 4v5h-5"/></svg></button>
        <button id="zfit" aria-label="Fit to screen" title="Fit"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>
      </div>
    </div>
    <aside class="panel" id="panel" data-state="peek" aria-live="polite">
      <div class="shead" id="shead">
        <div class="grab" aria-hidden="true"></div>
        <div class="peek" id="peek"><b>BX Building Map</b> \xB7 Tap a room, or search</div>
        <div class="trow">
          <span class="sw" id="p-sw"></span>
          <div style="min-width:0">
            <h2 id="p-name"></h2>
            <div class="meta" id="p-meta"></div>
          </div>
          <button class="x" id="p-close" aria-label="Close">&#x2715;</button>
        </div>
      </div>
      <div class="welcome">
        <h2>Pick any space</h2>
        <p>Tap a room to highlight it and see what’s nearest: restrooms, stairs and exits. Switch levels with the toggle, or type a name in the search box.</p>
        <p>Both levels are oriented the same way: Austin St. and the main entrance at the top, the Gym (Blue Lot end) on the right, CrossView and CrossTies (Green Lot end) on the left. Use the rotate button to turn the plan a quarter turn at a time.</p>
        <p>Green pills are the main entrances; red pills are emergency exits. The lower level has no doors on the Soccer Field side because it sits below grade there.</p>
      </div>
      <div class="sbody" id="sbody">
        <p id="p-note"></p>
        <div class="near" id="p-near"></div>
        <div class="foot" id="p-foot"></div>
      </div>
    </aside>
  </div>
</div>`;


const JS = `
const DATA = {"lower":{"size":[2250,1140],"outline":[[80,75],[1965,75],[1965,280],[2055,280],[2055,760],[2145,760],[2145,1100],[120,1100],[120,780],[230,780],[230,490],[50,490],[50,335],[80,335]],"rooms":[{"id":"l-playroom","name":"Playroom","cat":"kids","poly":[[80,75],[230,75],[230,335],[80,335]],"note":"Corner room off the lobby with a curved partition wall. The nursery restroom and a small closet sit between it and the Nursery.","tags":["kids"]},{"id":"l-nursery-closet","name":"Nursery Closet","cat":"storage","poly":[[230,130],[300,130],[300,195],[230,195]],"short":"Cl.","note":"Small closet on the Playroom side of the nursery restroom.","tags":["storage"]},{"id":"l-nursery-rr","name":"Nursery Restroom","cat":"restroom","poly":[[230,195],[300,195],[300,260],[230,260]],"short":"RR","note":"Small child-size restroom by the nursery door, with doors from both the Nursery and the Playroom.","tags":["restroom"]},{"id":"l-nursery","name":"Nursery","cat":"kids","poly":[[230,75],[410,75],[410,270],[300,270],[300,130],[230,130]],"note":"Check-in desk outside the door faces the Lobby Hall. The venue map labels this space Nursing Room.","tags":["kids"]},{"id":"l-cafe","name":"Lobby Caf\\u00e9","cat":"hospitality","poly":[[410,75],[690,75],[690,340],[410,340]],"note":"Open to the lobby along its south edge; the serving counter sweeps from the Nursery wall toward the Lobby Stairs.","tags":["hospitality"]},{"id":"l-lobby-stairs","name":"Lobby Stairs","cat":"stairs","poly":[[690,130],[770,130],[770,250],[690,250]],"note":"Up to CrossTies and the upper lobby.","dir":"up","tags":["stairs"]},{"id":"l-lobby","name":"Lobby Hall","cat":"hall","poly":[[230,335],[690,335],[690,250],[770,250],[770,75],[850,75],[850,290],[950,290],[950,445],[655,445],[400,445],[300,470],[230,490]],"note":"Main gathering hall between the Caf\\u00e9, Nursery, Kitchen serving counter and The Crossing. The caf\\u00e9 counter sits against the angled Crossing wall facing the front doors. The only outside doors are at the Entry Vestibule and the Welcome Desk.","label":[520,395,0],"tags":["hall"]},{"id":"l-desk-hall","name":"Desk Hall","cat":"hall","poly":[[850,200],[1310,200],[1310,290],[850,290]],"label":[1080,245,0],"short":"Desk Hall","note":"Runs from the Entry Vestibule east along the back of the Welcome Desk to Gym Door A. The Welcome Desk's door is at the gym end.","tags":["hall"]},{"id":"l-checkin","name":"Entry Vestibule","cat":"hall","poly":[[850,75],[1010,75],[1010,200],[850,200]],"note":"Main front doors, the only exterior doors on this side. Welcome Desk is immediately east; Desk Hall runs behind it to Gym Door A.","label":[930,140,0],"tags":["hall"]},{"id":"l-desk","name":"Welcome Desk","cat":"hospitality","poly":[[1010,75],[1310,75],[1310,200],[1010,200]],"note":"Front desk counter inside the main entrance. Staff door opens onto Desk Hall near Gym Door A.","tags":["hospitality"]},{"id":"l-kitchen","name":"Kitchen","cat":"hospitality","poly":[[950,290],[1310,290],[1310,485],[950,485]],"note":"Commercial kitchen. Its west wall lines up with CrossPointe Hall; the serving counter faces the Lobby Hall. Desk Hall runs along its north wall to Gym Door A.","tags":["hospitality"]},{"id":"l-janitor","name":"Janitor's Closet","cat":"storage","poly":[[950,485],[1085,485],[1085,570],[1045,570],[1045,615],[950,615]],"short":"Janitor","label":[1000,550,0],"note":"Janitor's closet against the kitchen's back wall; its door opens from the narrow hallway that also serves CrossPointe A and B. A tiny closet belonging to CrossPointe A is carved out of its south-east corner.","tags":["storage"]},{"id":"l-cpa-closet","name":"CrossPointe A Closet","cat":"storage","poly":[[1045,570],[1085,570],[1085,615],[1045,615]],"short":"","note":"Tiny closet entered from inside CrossPointe A.","tags":["storage"]},{"id":"l-kitchenette","name":"Crossing Kitchenette","cat":"hospitality","poly":[[655,445],[850,445],[850,600],[790,600]],"note":"Kitchenette behind The Crossing, filling the wedge between the Lobby Hall, CrossPointe Hall and the angled Crossing wall. Door from CrossPointe Hall at its north-east corner, a second door into The Crossing's entry passage, and a serving counter through the angled wall into The Crossing.","label":[790,520,0],"short":"Kitchenette","fs":19,"tags":["hospitality"]},{"id":"l-cp-hall","name":"CrossPointe Hall","cat":"hall","poly":[[850,445],[950,445],[950,615],[1085,615],[1085,700],[950,700],[950,1100],[850,1100]],"note":"Runs from the Lobby Hall south past the Kitchen, the Janitor's Closet, the restrooms and the Caf\\u00e9 Stairs, with a narrow side hallway to the CrossPointe A and B doors. The Crossing's back door opens onto it near the Caf\\u00e9 Stairs. The south end is below grade, so there is no exterior door.","label":[900,760,90],"tags":["hall"]},{"id":"l-cp-a","name":"CrossPointe A","cat":"meeting","poly":[[1085,485],[1310,485],[1310,670],[1085,670]],"tags":["meeting"]},{"id":"l-cp-b","name":"CrossPointe B","cat":"meeting","poly":[[1085,670],[1310,670],[1310,840],[1085,840]],"note":"Door at the top of its west wall, from the small hall outside CrossPointe A.","tags":["meeting"]},{"id":"l-cp-c","name":"CrossPointe C","cat":"meeting","poly":[[1085,840],[1310,840],[1310,975],[1085,975]],"tags":["meeting"]},{"id":"l-rr-w","name":"Women's Restroom (CrossPointe Hall)","cat":"restroom","poly":[[950,700],[1085,700],[1085,850],[950,850]],"short":"Women","gender":"w","tags":["restroom"]},{"id":"l-rr-m","name":"Men's Restroom (CrossPointe Hall)","cat":"restroom","poly":[[950,850],[1085,850],[1085,1000],[950,1000]],"short":"Men","gender":"m","tags":["restroom"]},{"id":"l-cafe-landing","name":"Caf\\u00e9 Stairs Landing","cat":"hall","poly":[[950,1000],[1310,1000],[1310,1100],[950,1100]],"short":"","note":"Landing at the foot of the Caf\\u00e9 Stairs, across from Gym Door B. No exterior door here: this side of the lower level is below grade.","tags":["hall"]},{"id":"l-cafe-stairs","name":"Caf\\u00e9 Stairs","cat":"stairs","poly":[[1120,975],[1310,975],[1310,1045],[1120,1045]],"dir":"up","label":[1172,1010,0],"note":"Up to CrossTies Caf\\u00e9. Gym Door B is across the hall. A small closet under the stairs opens from CrossPointe C.","tags":["stairs"]},{"id":"l-stair-closet","name":"Closet under Caf\\u00e9 Stairs","cat":"storage","poly":[[1228,978],[1308,978],[1308,1042],[1228,1042]],"inner":true,"short":"Closet","fs":15,"note":"Small closet under the Caf\\u00e9 Stairs; its door opens from CrossPointe C.","tags":["storage"]},{"id":"l-crossing","name":"The Crossing","cat":"meeting","poly":[[230,490],[300,468],[400,445],[655,445],[790,600],[850,600],[850,815],[750,815],[750,945],[300,945]],"note":"Main worship room. Double doors from CrossPointe Hall open into a narrow entry passage at the back; stage on the west wall with a closet at its north end, A/V booth at the back, two storage closets (double doors) and the ramp behind it, kitchenette serving counter at the north-east corner, balcony lounge along the south side.","label":[520,720,0],"tags":["meeting"]},{"id":"l-stage-closet","name":"Stage Closet","cat":"storage","poly":[[230,490],[300,490],[300,545],[230,545]],"short":"Closet","note":"Closet at the north end of the stage.","tags":["storage"]},{"id":"l-crossing-entry","name":"Crossing Entry (from CrossPointe Hall)","cat":"meeting","poly":[[750,600],[850,600],[850,662],[750,662]],"inner":true,"short":"Entry","fs":15,"note":"Narrow entry passage just inside The Crossing's double doors from CrossPointe Hall, running past the kitchenette door to the A/V booth.","tags":["meeting"]},{"id":"l-av","name":"A/V Booth","cat":"meeting","poly":[[755,668],[845,668],[845,778],[755,778]],"inner":true,"note":"Raised sound and lighting booth inside The Crossing, at the back of the room past the entry passage; its door, at the east end, opens from a few narrow steps between the booth and the north storage closet.","label":[800,723,90],"tags":["meeting"]},{"id":"l-av-stair","name":"A/V Booth Steps","cat":"stairs","poly":[[810,782],[848,782],[848,813],[810,813]],"dir":"up","short":"","note":"Tiny, narrow steps up to the A/V booth, between the booth and the north storage closet.","tags":["stairs"]},{"id":"l-store-1","name":"Crossing Storage (north)","cat":"storage","poly":[[750,815],[850,815],[850,925],[750,925]],"short":"Storage","note":"Storage closet behind The Crossing, next to the A/V booth steps; its double doors open out into The Crossing.","tags":["storage"]},{"id":"l-store-2","name":"Crossing Storage (south)","cat":"storage","poly":[[750,925],[850,925],[850,1050],[750,1050]],"short":"Storage","note":"Storage closet behind The Crossing, between the north closet and the ramp; its double doors open out onto the balcony.","tags":["storage"]},{"id":"l-ramp","name":"Crossing Ramp","cat":"hall","poly":[[750,1050],[850,1050],[850,1100],[750,1100]],"short":"Ramp","note":"Runs east\\u2013west behind the storage closets, from the east end of the Crossing Balcony to The Crossing's back door on CrossPointe Hall by the Caf\\u00e9 Stairs.","label":[800,1075,0],"tags":["hall"]},{"id":"l-stage","name":"Stage","cat":"meeting","poly":[[230,545],[300,545],[300,945],[230,945]],"label":[265,745,90],"tags":["meeting"]},{"id":"l-balcony","name":"Crossing Balcony","cat":"meeting","poly":[[300,945],[750,945],[750,1100],[300,1100]],"note":"Raised lounge seating along the south side of The Crossing. The ramp leaves from its east end.","tags":["meeting"]},{"id":"l-crossing-stairs","name":"Crossing Stairs","cat":"stairs","poly":[[140,830],[230,830],[230,940],[140,940]],"dir":"up","note":"West stair up to CrossView.","tags":["stairs"]},{"id":"l-west-vest","name":"West Vestibule","cat":"hall","poly":[[120,780],[230,780],[230,830],[120,830]],"label":[175,805,0],"short":"Vest.","tags":["hall"]},{"id":"l-rr-hall","name":"Restroom Hall (Crossing Stairs)","cat":"hall","poly":[[168,945],[300,945],[300,1015],[168,1015]],"short":"","note":"Tiny hallway at the foot of the Crossing Stairs serving the two adults-only restrooms, with a tiny maintenance closet at its west end.","tags":["hall"]},{"id":"l-rr-maint","name":"Maintenance Closet (Restroom Hall)","cat":"storage","poly":[[130,945],[168,945],[168,1015],[130,1015]],"short":"","note":"Tiny maintenance closet at the west end of the restroom hall by the Crossing Stairs.","tags":["storage"]},{"id":"l-adult-rr-1","name":"Restroom (Adults only, west)","cat":"restroom","poly":[[130,1015],[215,1015],[215,1100],[130,1100]],"short":"RR","tags":["restroom"]},{"id":"l-adult-rr-2","name":"Restroom (Adults only, east)","cat":"restroom","poly":[[215,1015],[300,1015],[300,1100],[215,1100]],"short":"RR","tags":["restroom"]},{"id":"l-elev-lobby","name":"Elevator Lobby","cat":"hall","poly":[[80,335],[230,335],[230,490],[80,490]],"note":"West exit (double doors to the parking lot), elevator and stair up to CrossView.","label":[110,390,90],"short":"Elev. Lobby","tags":["hall"]},{"id":"l-elevator","name":"Elevator","cat":"elevator","poly":[[140,340],[230,340],[230,410],[140,410]],"tags":["elevator"]},{"id":"l-elev-stairs","name":"Elevator Stairs","cat":"stairs","poly":[[140,440],[230,440],[230,490],[140,490]],"dir":"up","tags":["stairs"]},{"id":"l-gym","name":"Gym","cat":"fitness","poly":[[1310,220],[1965,220],[1965,1100],[1310,1100]],"note":"Full basketball court. Gym Door A (north, by the Kitchen) and Gym Door B (south, by the Caf\\u00e9 Stairs) open onto CrossPointe Hall. Restrooms are along the north wall.","label":[1637,1060,0],"tags":["fitness","students"]},{"id":"l-gym-locker-w","name":"Women's Locker Room","cat":"restroom","poly":[[1315,75],[1440,75],[1440,220],[1315,220]],"short":"W Locker","gender":"w","note":"Women's locker room off the gym's north wall; the women's restroom is next door.","tags":["restroom"]},{"id":"l-gym-rr-w","name":"Women's Restroom (Gym)","cat":"restroom","poly":[[1440,75],[1565,75],[1565,220],[1440,220]],"short":"Women","gender":"w","tags":["restroom"]},{"id":"l-gym-locker-m","name":"Men's Locker Room","cat":"restroom","poly":[[1565,75],[1690,75],[1690,220],[1565,220]],"short":"M Locker","gender":"m","note":"Men's locker room off the gym's north wall; the men's restroom is next door.","tags":["restroom"]},{"id":"l-gym-rr-m","name":"Men's Restroom (Gym)","cat":"restroom","poly":[[1690,75],[1815,75],[1815,220],[1690,220]],"short":"Men","gender":"m","tags":["restroom"]},{"id":"l-gym-maint","name":"Maintenance Closet (Gym)","cat":"storage","poly":[[1815,75],[1870,75],[1870,220],[1815,220]],"short":"Maint.","note":"Small maintenance closet on the gym's north wall, next to the storage room.","tags":["storage"]},{"id":"l-gym-store","name":"Gym Storage","cat":"storage","poly":[[1870,75],[1965,75],[1965,220],[1870,220]],"short":"Stor.","note":"Storage room at the north-east corner of the gym.","tags":["storage"]},{"id":"l-east-1","name":"East Storage","cat":"storage","poly":[[1975,280],[2055,280],[2055,420],[1975,420]],"short":"Storage","note":"Storage room off the gym's east wall, through double doors.","tags":["storage"]},{"id":"l-east-2","name":"East Closet","cat":"storage","poly":[[1975,420],[2055,420],[2055,530],[1975,530]],"short":"Closet","note":"Closet off the East Corridor.","tags":["storage"]},{"id":"l-east-corr","name":"East Corridor","cat":"hall","poly":[[1975,530],[2055,530],[2055,760],[1975,760]],"label":[2015,645,90],"note":"Exterior-side corridor along the gym's east wall with a door to the outside steps.","tags":["hall"]},{"id":"l-east-hall","name":"Green Room","cat":"storage","poly":[[1975,760],[2145,760],[2145,1100],[1975,1100]],"note":"Green room behind the gym, with a door from the gym, the East Corridor door, the East Stairs up to the upper level and two sets of double doors to the back (Blue Lot side).","label":[2040,1000,90],"tags":["storage"]},{"id":"l-east-stairs","name":"East Stairs","cat":"stairs","poly":[[2095,770],[2145,770],[2145,870],[2095,870]],"dir":"up","tags":["stairs"]}],"doors":[{"pt":[230,100],"o":"v","double":false,"name":"","swing":"e","hinge":"a","w":null},{"pt":[230,310],"o":"v","double":false,"name":"","swing":"w","hinge":"a","w":null},{"pt":[336,270],"o":"h","double":false,"name":"","swing":"n","hinge":"b","w":null},{"pt":[300,245],"o":"v","double":false,"name":"","swing":"w","hinge":"b","w":null},{"pt":[230,250],"o":"v","double":false,"name":"","swing":"e","hinge":"b","w":null},{"pt":[274,130],"o":"h","double":false,"name":"","swing":"s","hinge":"b","w":null},{"pt":[1262,200],"o":"h","double":false,"name":"","swing":"n","hinge":"a","w":null},{"pt":[1310,244],"o":"v","double":true,"name":"Gym Door A","swing":"e","hinge":"a","w":null},{"pt":[1310,330],"o":"v","double":false,"name":"","swing":"e","hinge":"a","w":null},{"pt":[1230,485],"o":"h","double":false,"name":"","swing":"s","hinge":"b","w":null},{"pt":[950,427],"o":"v","double":false,"name":"","swing":"e","hinge":"a","w":null},{"pt":[850,468],"o":"v","double":false,"name":"","swing":"w","hinge":"a","w":null},{"pt":[832,600],"o":"h","double":false,"name":"","swing":"n","hinge":"a","w":null},{"pt":[983,615],"o":"h","double":false,"name":"","swing":"n","hinge":"a","w":null},{"pt":[1085,596],"o":"v","double":false,"name":"","swing":"w","hinge":"a","w":null},{"pt":[1085,643],"o":"v","double":false,"name":"","swing":"e","hinge":"a","w":null},{"pt":[1085,688],"o":"v","double":false,"name":"","swing":"e","hinge":"b","w":null},{"pt":[1102,975],"o":"h","double":false,"name":"","swing":"s","hinge":"a","w":null},{"pt":[950,808],"o":"v","double":false,"name":"","swing":"e","hinge":"a","w":null},{"pt":[950,896],"o":"v","double":false,"name":"","swing":"e","hinge":"a","w":null},{"pt":[1310,946],"o":"v","double":false,"name":"","swing":"e","hinge":"a","w":null},{"pt":[1274,975],"o":"h","double":false,"name":"","swing":"s","hinge":"b","w":null},{"pt":[1310,1073],"o":"v","double":false,"name":"Gym Door B","swing":"w","hinge":"a","w":null},{"pt":[850,1070],"o":"v","double":false,"name":"Back door","swing":"e","hinge":"a","w":null},{"pt":[750,993],"o":"v","double":true,"name":"","swing":"w","hinge":"a","w":null},{"pt":[829,778],"o":"h","double":false,"name":"","swing":"n","hinge":"a","w":null},{"pt":[750,870],"o":"v","double":true,"name":"","swing":"w","hinge":"a","w":null},{"pt":[850,630],"o":"v","double":true,"name":"","swing":"e","hinge":"a","w":null},{"pt":[265,545],"o":"h","double":false,"name":"","swing":"n","hinge":"a","w":null},{"pt":[205,940],"o":"h","double":false,"name":"","swing":"s","hinge":"a","w":null},{"pt":[258,1015],"o":"h","double":false,"name":"","swing":"s","hinge":"a","w":null},{"pt":[192,1015],"o":"h","double":false,"name":"","swing":"s","hinge":"a","w":null},{"pt":[168,980],"o":"v","double":false,"name":"","swing":"w","hinge":"a","w":26},{"pt":[1377,220],"o":"h","double":false,"name":"","swing":"n","hinge":"a","w":null},{"pt":[1502,220],"o":"h","double":false,"name":"","swing":"n","hinge":"a","w":null},{"pt":[1627,220],"o":"h","double":false,"name":"","swing":"n","hinge":"a","w":null},{"pt":[1752,220],"o":"h","double":false,"name":"","swing":"n","hinge":"a","w":null},{"pt":[1843,220],"o":"h","double":true,"name":"","swing":"n","hinge":"a","w":48},{"pt":[1918,220],"o":"h","double":true,"name":"","swing":"n","hinge":"a","w":null},{"pt":[1965,337],"o":"v","double":true,"name":"","swing":"e","hinge":"a","w":null},{"pt":[2026,530],"o":"h","double":false,"name":"","swing":"n","hinge":"b","w":null},{"pt":[2030,760],"o":"h","double":false,"name":"","swing":"s","hinge":"a","w":null},{"pt":[1975,1050],"o":"v","double":true,"name":"","swing":"e","hinge":"a","w":null},{"pt":[889,75],"o":"h","swing":"n","double":true,"name":""},{"pt":[953,75],"o":"h","swing":"n","double":true,"name":""},{"pt":[1280,75],"o":"h","swing":"n","double":true,"name":""},{"pt":[80,406],"o":"v","swing":"w","double":true,"name":""},{"pt":[120,815],"o":"v","swing":"w","double":true,"name":""},{"pt":[1965,253],"o":"v","swing":"e","double":true,"name":""},{"pt":[2055,639],"o":"v","swing":"e","double":true,"name":""},{"pt":[2145,941],"o":"v","swing":"e","double":true,"name":""},{"pt":[2145,1005],"o":"v","swing":"e","double":true,"name":""}],"exits":[{"pt":[889,75],"side":"n","name":"BX Entrance, west doors (Austin St.)","double":true,"primary":true},{"pt":[953,75],"side":"n","name":"BX Entrance, east doors (Austin St.)","double":true,"primary":true},{"pt":[1280,75],"side":"n","name":"Welcome Desk doors (Austin St.)","double":true,"primary":true},{"pt":[80,406],"side":"w","name":"Elevator Lobby entrance (Green Lot side)","double":true,"primary":true},{"pt":[120,815],"side":"w","name":"West exit, Crossing Stairs (Green Lot side)","double":true},{"pt":[1965,253],"side":"e","name":"Gym back doors (Blue Lot side)","double":true},{"pt":[2055,639],"side":"e","name":"East Corridor back doors (Blue Lot side)","double":true},{"pt":[2145,941],"side":"e","name":"Green Room back doors, north (Blue Lot side)","double":true},{"pt":[2145,1005],"side":"e","name":"Green Room back doors, south (Blue Lot side)","double":true}],"arcs":["M230,110 C130,140 130,270 230,300","M410,265 C520,262 560,200 690,155","M350,300 a35,35 0 0 0 70,0","M950,300 C905,320 905,390 950,410","M721,520 L747,551"],"court":{"rect":[1420,340,1850,960]},"pois":[{"id":"l-aed","type":"aed","pt":[1000,118],"name":"AED & first aid","note":"Automated external defibrillator and first-aid kit on the wall just inside the front doors, beside the Welcome Desk."},{"id":"l-coffee","type":"coffee","pt":[750,417],"name":"Caf\\u00e9 counter","note":"U-shaped caf\\u00e9 counter in the Lobby Hall, backed up to the kitchenette wall where CrossPointe Hall meets the Lobby Hall, countertop facing the front doors."}],"counters":["M700,440 L700,392 L800,392 L800,440"],"arcs_transform":""},"upper":{"size":[2250,1110],"outline":[[2125,1015],[240,1015],[240,710],[320,710],[320,440],[180,440],[180,50],[2050,50],[2050,700],[2125,700]],"rooms":[{"id":"u-east-stairs","name":"East Stairs","cat":"stairs","poly":[[2120,810],[2050,810],[2050,710],[2120,710]],"dir":"down","tags":["stairs"]},{"id":"u-east-hall","name":"East Stair Hall","cat":"hall","poly":[[2125,1015],[2050,1015],[2050,810],[2125,810]],"label":[2088,910,90],"note":"Stair tower on the gym's east side, down to the East Stair Hall and south-east exit.","tags":["hall"]},{"id":"u-gym-void","name":"Gym (open below)","cat":"fitness","poly":[[1950,925],[1395,925],[1395,250],[1950,250]],"rounded":30,"short":"Gym","sub":"open to below","note":"Open volume over the basketball court. The Walking Track circles it.","label":[1673,590,0],"tags":["fitness","students"]},{"id":"u-track","name":"Walking Track","cat":"fitness","poly":[[2050,1015],[1345,1015],[1345,210],[2050,210]],"hole":[[1950,925],[1395,925],[1395,250],[1950,250]],"note":"Loop track around the gym opening. Doors from the Fitness Center, CrossView Hall (double), the CrossTies Caf\\u00e9, and the East Stair Hall (double). Four double-door storage closets sit along its Blue Lot side.","label":[1698,230,0],"tags":["fitness"]},{"id":"u-track-store-1","name":"Track Storage 1","cat":"storage","poly":[[1950,816],[1890,816],[1890,756],[1950,756]],"short":"St.","note":"Double-door storage closet on the Walking Track.","tags":["storage"]},{"id":"u-track-store-2","name":"Track Storage 2","cat":"storage","poly":[[1950,742],[1890,742],[1890,682],[1950,682]],"short":"St.","note":"Double-door storage closet on the Walking Track.","tags":["storage"]},{"id":"u-track-store-3","name":"Track Storage 3","cat":"storage","poly":[[1950,513],[1890,513],[1890,453],[1950,453]],"short":"St.","note":"Double-door storage closet on the Walking Track.","tags":["storage"]},{"id":"u-track-store-4","name":"Track Storage 4","cat":"storage","poly":[[1950,433],[1890,433],[1890,373],[1950,373]],"short":"St.","note":"Double-door storage closet on the Walking Track.","tags":["storage"]},{"id":"u-fitness","name":"Fitness Center","cat":"fitness","poly":[[2050,210],[1345,210],[1345,50],[2050,50]],"tags":["fitness"]},{"id":"u-group-fitness","name":"Group Fitness","cat":"fitness","poly":[[1345,210],[1040,210],[1040,50],[1345,50]],"tags":["fitness"]},{"id":"u-fit-maint","name":"Maintenance Closet (Fitness)","cat":"storage","poly":[[1040,210],[1000,210],[1000,50],[1040,50]],"short":"","label":[1020,130,90],"note":"Narrow maintenance closet between the HIIT Room and Group Fitness, entered from CrossView Hall.","tags":["storage"]},{"id":"u-hiit","name":"HIIT Room","cat":"fitness","poly":[[1000,210],[850,210],[850,50],[1000,50]],"short":"HIIT Room","note":"Labeled Game Room on the original architectural plan; it is the HIIT Room today.","tags":["fitness"]},{"id":"u-lobby-stairs","name":"Lobby Stairs","cat":"stairs","poly":[[850,170],[750,170],[750,60],[850,60]],"dir":"down","note":"Down to the main lobby.","tags":["stairs"]},{"id":"u-lobby-void","name":"Lobby (open below)","cat":"hall","poly":[[750,290],[490,290],[490,50],[750,50]],"short":"Lobby","sub":"open to below","note":"Open volume over the main lobby and Lobby Caf\\u00e9, between CrossView and the Lobby Stairs. Labeled \\u201cLobby (Below)\\u201d on the venue map.","tags":["hall"]},{"id":"u-crossview","name":"CrossView","cat":"students","poly":[[400,295],[180,295],[180,50],[400,50]],"note":"Corner room off CrossView Hall with a reception nook at its north end and a small closet just inside the door.","tags":["students","meeting"]},{"id":"u-crossview-closet","name":"CrossView Closet","cat":"storage","poly":[[400,272],[350,272],[350,222],[400,222]],"inner":true,"short":"Cl.","fs":14,"note":"Small closet inside CrossView, behind the entry door; its own door opens from inside the room.","tags":["storage"]},{"id":"u-elev-lobby","name":"Elevator Lobby","cat":"hall","poly":[[250,440],[180,440],[180,295],[250,295]],"label":[215,368,90],"short":"Elev. Lobby","tags":["hall"]},{"id":"u-elev-stairs-1","name":"Elevator Stairs","cat":"stairs","poly":[[315,430],[250,430],[250,395],[315,395]],"dir":"down","short":"","tags":["stairs"]},{"id":"u-elevator","name":"Elevator","cat":"elevator","poly":[[315,390],[250,390],[250,335],[315,335]],"tags":["elevator"]},{"id":"u-elev-stairs-2","name":"Elevator Stairs","cat":"stairs","poly":[[315,330],[250,330],[250,295],[315,295]],"dir":"down","short":"","tags":["stairs"]},{"id":"u-cv-hall","name":"CrossView Hall","cat":"hall","poly":[[810,510],[730,430],[730,390],[320,390],[320,295],[400,295],[400,50],[490,50],[490,290],[750,290],[750,210],[1345,210],[1345,260],[1070,260],[1070,390]],"note":"Wraps the south side of The Crossing opening, linking CrossView, the Lobby Stairs, the Game Room and the fitness rooms.","label":[590,340,0],"tags":["hall"]},{"id":"u-loft-hall","name":"Loft Hall","cat":"hall","poly":[[1070,1015],[1000,1015],[1000,390],[1070,390]],"label":[1035,680,90],"note":"Runs between the Loft and the Administrative Offices block, from the CrossTies Caf\\u00e9 down to CrossView Hall. A door at its north end leads into the CrossTies Lobby.","tags":["hall"]},{"id":"u-ct-cafe","name":"CrossTies Caf\\u00e9","cat":"students","poly":[[1345,1015],[1070,1015],[1070,715],[1345,715]],"label":[1205,842,0],"fs":25,"note":"Snack counter at the top of the Caf\\u00e9 Stairs, with a small kitchen (sink and fridge) on the Walking Track wall.","tags":["students","meeting","hospitality"]},{"id":"u-cafe-kitchen","name":"Caf\\u00e9 Kitchen","cat":"hospitality","poly":[[1345,810],[1265,810],[1265,715],[1345,715]],"inner":true,"short":"Kitchen","fs":15,"note":"Small kitchen with a sink and fridge on the back wall of the CrossTies Caf\\u00e9, entered from the caf\\u00e9.","tags":["hospitality"]},{"id":"u-cafe-stairs","name":"Caf\\u00e9 Stairs","cat":"stairs","poly":[[1295,950],[1205,950],[1205,885],[1295,885]],"dir":"down","note":"Down to CrossPointe Hall and Gym Door B.","tags":["stairs"]},{"id":"u-loft","name":"The Loft","cat":"students","poly":[[1345,715],[1070,715],[1070,390],[1345,390]],"note":"Student room between the CrossTies Caf\\u00e9 and the Weight Room; the two share a wall.","tags":["students","meeting"]},{"id":"u-weight","name":"Weight Room","cat":"fitness","poly":[[1345,390],[1070,390],[1070,260],[1345,260]],"tags":["fitness"]},{"id":"u-office-hall","name":"Administrative Offices (hall)","cat":"offices","poly":[[1000,865],[910,865],[910,595],[1000,595]],"label":[955,710,90],"short":"Admin Offices","note":"Entry hall for the Administrative Offices suite (venue map name), with a small storage closet by Office 1.","tags":["offices"]},{"id":"u-office-closet","name":"Admin Storage Closet","cat":"storage","poly":[[960,865],[910,865],[910,815],[960,815]],"inner":true,"short":"St.","fs":14,"note":"Small storage closet inside the Administrative Offices, by Office 1.","tags":["storage"]},{"id":"u-office-1","name":"Administrative Office 1","cat":"offices","poly":[[910,865],[810,865],[810,795],[910,795]],"short":"1","note":"Individual office in the Administrative Offices suite; not labeled separately on the plan.","tags":["offices"]},{"id":"u-office-2","name":"Administrative Office 2","cat":"offices","poly":[[910,795],[810,795],[810,730],[910,730]],"short":"2","note":"Individual office in the Administrative Offices suite; not labeled separately on the plan.","tags":["offices"]},{"id":"u-office-3","name":"Administrative Office 3","cat":"offices","poly":[[910,730],[810,730],[810,660],[910,660]],"short":"3","note":"Individual office in the Administrative Offices suite; not labeled separately on the plan.","tags":["offices"]},{"id":"u-office-4","name":"Administrative Office 4","cat":"offices","poly":[[910,660],[810,660],[810,595],[910,595]],"short":"4","note":"Individual office in the Administrative Offices suite; not labeled separately on the plan.","tags":["offices"]},{"id":"u-conf","name":"Conference Room","cat":"meeting","poly":[[1000,595],[810,595],[810,510],[1000,510]],"short":"Conf. Room","tags":["meeting"]},{"id":"u-rr-w","name":"Women's Restroom (Loft Hall)","cat":"restroom","poly":[[1000,510],[810,510],[810,430],[1000,430]],"short":"Women","gender":"w","tags":["restroom"]},{"id":"u-rr-m","name":"Men's Restroom (Loft Hall)","cat":"restroom","poly":[[1000,430],[810,430],[810,360],[1000,360]],"short":"Men","gender":"m","tags":["restroom"]},{"id":"u-crossing-void","name":"The Crossing (open below)","cat":"meeting","short":"The Crossing","sub":"open to below","fs":36,"poly":[[810,865],[465,865],[380,780],[320,780],[320,455],[380,455],[380,390],[470,390],[730,390],[730,430],[810,510]],"note":"Upper volume of the worship room, open all the way to the outside wall above the stage. CrossView Hall runs along its south side; small maintenance closets sit in the corners by the Crossing Stairs and the Elevator Stairs.","label":[570,630,0],"tags":["meeting"]},{"id":"u-maint","name":"Maintenance Closet (Crossing Stairs)","cat":"storage","poly":[[465,865],[320,865],[320,780],[380,780]],"short":"Maint.","note":"Maintenance closet at the end of CrossTies Hall, next to the Crossing Stairs.","tags":["storage"]},{"id":"u-maint-2","name":"Maintenance Closet (Elevator Stairs)","cat":"storage","poly":[[380,455],[320,455],[320,390],[380,390]],"short":"Maint.","note":"Small maintenance closet at the top of the Elevator Stairs, tucked into the corner of The Crossing opening on the back side of its wall.","tags":["storage"]},{"id":"u-crossing-stairs","name":"Crossing Stairs","cat":"stairs","poly":[[315,840],[245,840],[245,710],[315,710]],"dir":"down","note":"Down to the west side of The Crossing.","tags":["stairs"]},{"id":"u-ct-lobby","name":"CrossTies Lobby","cat":"students","poly":[[1000,1015],[820,1015],[820,905],[1000,905]],"note":"Entrance lobby for the student wing. Ends at the Administrative Offices wall, where a door leads to Loft Hall and the CrossTies Caf\\u00e9.","tags":["students","meeting","hall"]},{"id":"u-ct-hall","name":"CrossTies Hall","cat":"hall","poly":[[1000,905],[240,905],[240,865],[1000,865]],"label":[650,885,0],"note":"Open run along the CrossTies A\\u2013D doors, continuous with the CrossTies Lobby, ending at the Crossing Stairs and the maintenance closet.","tags":["hall"]},{"id":"u-checkin","name":"Check-In Desk","cat":"hospitality","poly":[[1070,388],[1036,388],[1036,288],[1070,288]],"inner":true,"short":"Check-In Desk","fs":14,"note":"Small check-in desk backed up to the Weight Room's outside wall at the Loft corner, across from the restrooms, facing out into CrossView Hall (the venue map's Information point).","tags":["hospitality"]},{"id":"u-ct-a","name":"CrossTies A","cat":"students","poly":[[820,1015],[670,1015],[670,905],[820,905]],"tags":["students","meeting"]},{"id":"u-ct-b","name":"CrossTies B","cat":"students","poly":[[670,1015],[520,1015],[520,905],[670,905]],"tags":["students","meeting"]},{"id":"u-ct-c","name":"CrossTies C","cat":"students","poly":[[520,1015],[370,1015],[370,905],[520,905]],"tags":["students","meeting"]},{"id":"u-ct-d","name":"CrossTies D","cat":"students","poly":[[370,1015],[240,1015],[240,905],[370,905]],"tags":["students","meeting"]}],"doors":[{"pt":[400,216],"o":"v","double":false,"name":"","swing":"w","hinge":"b","w":null},{"pt":[954,210],"o":"h","double":false,"name":"","swing":"n","hinge":"b","w":null},{"pt":[1096,210],"o":"h","double":false,"name":"","swing":"n","hinge":"a","w":null},{"pt":[1303,210],"o":"h","double":false,"name":"","swing":"n","hinge":"b","w":null},{"pt":[1117,260],"o":"h","double":false,"name":"","swing":"s","hinge":"a","w":null},{"pt":[1020,210],"o":"h","double":false,"name":"","swing":"n","hinge":"b","w":30},{"pt":[1345,236],"o":"v","double":true,"name":"","swing":"w","hinge":"b","w":null},{"pt":[1389,210],"o":"h","double":false,"name":"","swing":"n","hinge":"b","w":null},{"pt":[1990,210],"o":"h","double":false,"name":"","swing":"n","hinge":"b","w":null},{"pt":[2050,980],"o":"v","double":true,"name":"","swing":"e","hinge":"b","w":null},{"pt":[1345,975],"o":"v","double":false,"name":"","swing":"w","hinge":"b","w":null},{"pt":[1265,760],"o":"v","double":false,"name":"","swing":"e","hinge":"b","w":null},{"pt":[1070,671],"o":"v","double":false,"name":"","swing":"w","hinge":"b","w":null},{"pt":[1070,423],"o":"v","double":false,"name":"","swing":"w","hinge":"b","w":null},{"pt":[1000,680],"o":"v","double":false,"name":"","swing":"w","hinge":"b","w":null},{"pt":[963,595],"o":"h","double":false,"name":"","swing":"n","hinge":"b","w":null},{"pt":[910,632],"o":"v","double":false,"name":"","swing":"w","hinge":"b","w":null},{"pt":[910,702],"o":"v","double":false,"name":"","swing":"w","hinge":"b","w":null},{"pt":[910,765],"o":"v","double":false,"name":"","swing":"w","hinge":"b","w":null},{"pt":[910,834],"o":"v","double":false,"name":"","swing":"w","hinge":"b","w":null},{"pt":[935,815],"o":"h","double":false,"name":"","swing":"s","hinge":"b","w":null},{"pt":[1000,917],"o":"v","double":true,"name":"","swing":"e","hinge":"b","w":null},{"pt":[788,905],"o":"h","double":false,"name":"","swing":"s","hinge":"b","w":null},{"pt":[644,905],"o":"h","double":false,"name":"","swing":"s","hinge":"b","w":null},{"pt":[485,905],"o":"h","double":false,"name":"","swing":"s","hinge":"b","w":null},{"pt":[335,905],"o":"h","double":false,"name":"","swing":"s","hinge":"b","w":null},{"pt":[391,865],"o":"h","double":false,"name":"","swing":"n","hinge":"b","w":null},{"pt":[278,865],"o":"h","double":false,"name":"","swing":"n","hinge":"b","w":null},{"pt":[375,222],"o":"h","double":false,"name":"","swing":"s","hinge":"b","w":null},{"pt":[1950,786],"o":"v","double":true,"name":"","swing":"e","hinge":"b","w":null},{"pt":[1950,712],"o":"v","double":true,"name":"","swing":"e","hinge":"b","w":null},{"pt":[1950,483],"o":"v","double":true,"name":"","swing":"e","hinge":"b","w":null},{"pt":[1950,403],"o":"v","double":true,"name":"","swing":"e","hinge":"b","w":null},{"pt":[1102,1015],"o":"h","swing":"s","double":true,"name":""},{"pt":[1038,1015],"o":"h","swing":"s","double":true,"name":""},{"pt":[180,407],"o":"v","swing":"w","double":true,"name":""},{"pt":[180,343],"o":"v","swing":"w","double":true,"name":""},{"pt":[2125,971],"o":"v","swing":"e","double":true,"name":""}],"exits":[{"pt":[1102,1015],"side":"s","name":"CrossTies Caf\\u00e9 doors to the parking lot (Pink Lot side)","double":true},{"pt":[1038,1015],"side":"s","name":"CrossTies Lobby doors to the parking lot (Soccer Field side)","double":true},{"pt":[180,407],"side":"w","name":"Elevator Lobby entrance, north doors (Green Lot side)","double":true,"primary":true},{"pt":[180,343],"side":"w","name":"Elevator Lobby entrance, south doors (Green Lot side)","double":true,"primary":true},{"pt":[2125,971],"side":"e","name":"Emergency exit with exterior stair (Blue Lot side)","double":true}],"arcs":["M1900,860 L1990,860 L1990,815"],"pois":[{"id":"u-aed","type":"aed","pt":[1062,222],"name":"AED","note":"Automated external defibrillator on the hall wall right beside the Group Fitness door, near the HIIT Room."},{"id":"u-coffee","type":"coffee","pt":[1190,960],"name":"Coffee (CrossTies Caf\\u00e9)","note":"Coffee at the CrossTies Caf\\u00e9 counter."}],"counters":[],"arcs_transform":"rotate(180 1125.0 555.0)"}};
const CATS = { meeting:"Meeting", restroom:"Restrooms", kids:"Kids", students:"Students", fitness:"Fitness", hospitality:"Hospitality", offices:"Offices", storage:"Storage", vert:"Stairs & Elevator", stairs:"Stairs", elevator:"Elevator", hall:"Hall" };
const CHIP_ORDER = ["meeting","restroom","kids","students","fitness","hospitality","offices","storage","vert"];
const LEVEL_NAME = {lower:"Lower Level", upper:"Upper Level"};
const $ = s => document.querySelector(s);
const app=$('#app'), svg = $('#map'), wrap = $('#mapwrap'), panel=$('#panel'), ftop=$('#ftop');
const NS = 'http://www.w3.org/2000/svg';
let level = 'lower', selected = null, activeCats = new Set(), vb = null, rot = 0, anim=null;
try{ rot = parseInt(localStorage.getItem('bxmap-rot')||'0',10)||0; }catch(e){}

// ---------- helpers
function el(tag, attrs, parent){ const e=document.createElementNS(NS,tag); for(const k in attrs) if(attrs[k]!==null && attrs[k]!==undefined) e.setAttribute(k, attrs[k]); if(parent) parent.appendChild(e); return e; }
function polyD(pts){ return 'M'+pts.map(p=>p.join(',')).join('L')+'Z'; }
function roundedD(pts, r){ const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]); const x0=Math.min(...xs), x1=Math.max(...xs), y0=Math.min(...ys), y1=Math.max(...ys);
  return \`M\${x0+r},\${y0}H\${x1-r}A\${r},\${r} 0 0 1 \${x1},\${y0+r}V\${y1-r}A\${r},\${r} 0 0 1 \${x1-r},\${y1}H\${x0+r}A\${r},\${r} 0 0 1 \${x0},\${y1-r}V\${y0+r}A\${r},\${r} 0 0 1 \${x0+r},\${y0}Z\`; }
function bbox(pts){ const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]); return {x0:Math.min(...xs),x1:Math.max(...xs),y0:Math.min(...ys),y1:Math.max(...ys)}; }
function centroid(pts){ let a=0,cx=0,cy=0; for(let i=0;i<pts.length;i++){ const [x1,y1]=pts[i],[x2,y2]=pts[(i+1)%pts.length]; const f=x1*y2-x2*y1; a+=f; cx+=(x1+x2)*f; cy+=(y1+y2)*f; } a*=0.5; if(Math.abs(a)<1e-6){ const b=bbox(pts); return [(b.x0+b.x1)/2,(b.y0+b.y1)/2]; } return [cx/(6*a), cy/(6*a)]; }
function area(pts){ let a=0; for(let i=0;i<pts.length;i++){ const [x1,y1]=pts[i],[x2,y2]=pts[(i+1)%pts.length]; a+=x1*y2-x2*y1; } return Math.abs(a)/2; }
function roomById(id){ for(const L of ['lower','upper']){ const r=DATA[L].rooms.find(r=>r.id===id); if(r) return {r,L}; } return null; }
function labelPos(r){ if(r.label) return r.label; if(r.hole){ const b=bbox(r.poly), h=bbox(r.hole); return [(b.x0+b.x1)/2, (h.y1+b.y1)/2, 0]; } const c=centroid(r.poly); return [c[0],c[1],0]; }
function isNarrow(){ return matchMedia('(max-width:859px)').matches; }
function center(){ const s=DATA[level].size; return [s[0]/2, s[1]/2]; }
// rotate a point by the current map rotation about the level centre (map coords -> rotated map coords)
function rotPt(p){ const [cx,cy]=center(); const a=rot*Math.PI/180; const dx=p[0]-cx, dy=p[1]-cy; return [cx+dx*Math.cos(a)-dy*Math.sin(a), cy+dx*Math.sin(a)+dy*Math.cos(a)]; }
function rotBBox(b){ const pts=[[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]].map(rotPt); return bbox(pts); }
const swapped = ()=> (rot%180)!==0;

// ---------- icons (kept upright regardless of map rotation)
function upright(g, x, y){ const k=el('g',{transform:\`rotate(\${-rot} \${x} \${y})\`},g); return k; }
function rrIcon(g, x, y, gender, scale){ const s=scale||1; const u=upright(g,x,y);
  const person=(dx, female)=>{ const p=el('g',{transform:\`translate(\${x+dx},\${y}) scale(\${s})\`,class:'icon-rr'},u); el('circle',{cx:0,cy:-14,r:4.2},p);
    if(female) el('path',{d:'M-4,-8h8l4,12h-3l1.5,10h-3v-3.5h-3v3.5h-3l1.5,-10h-3z'},p); else el('path',{d:'M-4.5,-8h9v12h-2v10h-2.5v-8h0v8h-2.5v-10h-2z'},p); };
  if(gender==='w') person(0,true); else if(gender==='m') person(0,false); else { person(-7,true); person(7,false); } }
function elevIcon(g,x,y){ const u=upright(g,x,y); const p=el('g',{transform:\`translate(\${x},\${y})\`,class:'icon-el'},u); el('rect',{x:-16,y:-16,width:32,height:32,rx:3},p); el('path',{d:'M-7,-2 l4,-6 l4,6 M7,2 l-4,6 l-4,-6'},p); }

// ---------- render a level
function render(){
  svg.innerHTML='';
  const L = DATA[level];
  const [cx,cy]=center();
  const root = el('g',{id:'root',transform:\`rotate(\${rot} \${cx} \${cy})\`},svg);
  const gRooms = el('g',{id:'rooms'},root);
  const decoTop = el('g',{class:'deco'},root);
  for(const r of L.rooms){
    const g = el('g',{class:\`g-room \${r.cat}\${r.inner?' inner':''}\`, 'data-id':r.id, tabindex:0, role:'button','aria-label':r.name},gRooms);
    let d = r.rounded ? roundedD(r.poly, r.rounded) : polyD(r.poly);
    if(r.hole) d += ' ' + polyD(r.hole);
    el('path',{d, class:\`room \${r.cat}\`, 'fill-rule':'evenodd'},g);
    const b=bbox(r.poly);
    if(r.cat==='stairs'){ const horiz=(b.x1-b.x0)>(b.y1-b.y0); const n=Math.max(4,Math.round((horiz?(b.x1-b.x0):(b.y1-b.y0))/14));
      for(let i=1;i<n;i++){ const t=i/n; if(horiz) el('line',{x1:b.x0+(b.x1-b.x0)*t,y1:b.y0+3,x2:b.x0+(b.x1-b.x0)*t,y2:b.y1-3,class:'tread'},g); else el('line',{x1:b.x0+3,y1:b.y0+(b.y1-b.y0)*t,x2:b.x1-3,y2:b.y0+(b.y1-b.y0)*t,class:'tread'},g); } }
    if(r.cat==='elevator'){ const c=centroid(r.poly); elevIcon(g,c[0],c[1]-10); }
    const small=(b.x1-b.x0)<90||(b.y1-b.y0)<90;
    if(r.cat==='restroom'){ const c=[(b.x0+b.x1)/2,(b.y0+b.y1)/2]; rrIcon(g,c[0],c[1]-(small?0:16),r.gender,small?0.9:1.25); }
    // label: upright on screen, running along the room's longer on-screen axis
    const [lx,ly,rotd]=labelPos(r);
    const A=area(r.poly)-(r.hole?area(r.hole):0);
    let txt = r.short!==undefined ? r.short : r.name;
    if(r.cat==='restroom') txt = small ? '' : (r.short||'RR');
    let fs = Math.max(18, Math.min(46, Math.sqrt(A)/9));
    if(r.cat==='hall') fs = Math.max(19, Math.min(30, fs));
    if(r.cat==='restroom') fs = 18;
    if(r.cat==='stairs'||r.cat==='elevator') fs=17;
    if(r.short!==undefined && r.short.length<=2) fs=22;
    if(r.fs) fs=r.fs;
    if(txt){
      const w=b.x1-b.x0, h=b.y1-b.y0;
      let verticalInMap = rotd!==0 || (!r.label && w < txt.length*fs*0.48 && h > w*1.4);
      const verticalOnScreen = verticalInMap !== swapped();
      const screenAngle = verticalOnScreen ? -90 : 0;
      const yOff = r.cat==='elevator' ? 26 : (r.cat==='restroom' && !small ? 26 : 0);
      const t = el('text',{x:lx,y:ly+yOff,class:\`rlabel \${r.cat}\`,'font-size':fs, transform:\`rotate(\${screenAngle-rot} \${lx} \${ly+yOff})\`},g);
      t.textContent=txt;
      if(r.sub){ const s=el('text',{x:lx,y:ly+yOff+fs*0.8,class:\`rlabel \${r.cat}\`,'font-size':Math.max(15,fs*0.5),'font-weight':500,'font-style':'italic', transform:\`rotate(\${screenAngle-rot} \${lx} \${ly+yOff+fs*0.8})\`},g); s.textContent=r.sub; }
    }
  }
  if(L.court){ const [x0,y0,x1,y1]=L.court.rect; const ccx=(x0+x1)/2, ccy=(y0+y1)/2, w=x1-x0; const c=el('g',{class:'court'},decoTop);
    el('rect',{x:x0,y:y0,width:w,height:y1-y0},c); el('line',{x1:x0,y1:ccy,x2:x1,y2:ccy},c); el('circle',{cx:ccx,cy:ccy,r:w*0.13},c);
    for(const end of [0,1]){ const sy = end? y1 : y0, dir = end? -1 : 1; const kw=w*0.26, kh=(y1-y0)*0.2; el('rect',{x:ccx-kw/2,y:end?sy-kh:sy,width:kw,height:kh},c); el('circle',{cx:ccx,cy:sy+dir*kh,r:w*0.13},c); const R=w*0.46; el('path',{d:\`M\${ccx-R},\${sy} A\${R},\${R} 0 0 \${end?1:0} \${ccx+R},\${sy}\`},c); } }
  const ga = el('g',{transform:L.arcs_transform||null},decoTop);
  for(const d of L.arcs) el('path',{d,class:'arc'},ga);
  for(const d of (L.counters||[])) el('path',{d,class:'counter-out'},ga);
  el('path',{d:polyD(L.outline),class:'outline'},root);
  // doors
  const gD = el('g',{class:'doors'},root);
  for(const d of L.doors){
    const [x,y]=d.pt; const w = d.w || (d.double ? 64 : 34); const h=w/2; const hs = d.hinge==='b' ? -1 : 1;
    const map = (u,v)=>{ v=v*hs; if(d.o==='v') return d.swing==='e' ? [x+u,y+v] : [x-u,y+v]; return d.swing==='s' ? [x+v,y+u] : [x+v,y-u]; };
    const P=(u,v)=>map(u,v).join(',');
    const g=el('g',{class:'door'},gD);
    el('line',{x1:map(0,-h)[0],y1:map(0,-h)[1],x2:map(0,h)[0],y2:map(0,h)[1]},g);
    const arc=(hu,hv,r,from,to)=>{ let s=''; const n=10; for(let i=0;i<=n;i++){ const a=from+(to-from)*i/n; s+=(i?'L':'M')+P(hu+Math.cos(a)*r, hv+Math.sin(a)*r); } return s; };
    if(d.double){ el('path',{d:\`M\${P(0,-h)}L\${P(h,-h)}\`+arc(0,-h,h,0,Math.PI/2)},g); el('path',{d:\`M\${P(0,h)}L\${P(h,h)}\`+arc(0,h,h,0,-Math.PI/2)},g); }
    else { el('path',{d:\`M\${P(0,-h)}L\${P(w,-h)}\`+arc(0,-h,w,0,Math.PI/2)},g); }
    if(d.name){ const lp=map(w*0.55, h+10); const t=el('text',{x:lp[0],y:lp[1],'text-anchor':'middle'},g); t.textContent=d.name; const vert = (d.o==='v') !== swapped(); t.setAttribute('transform',\`rotate(\${(vert?-90:0)-rot} \${lp[0]} \${lp[1]})\`); }
  }
  // exits: green = main entrance, red = emergency exit; pills stay upright
  const gEx = el('g',{id:'exits'},root);
  L.exits.forEach((e,i)=>{ const [x,y]=e.pt; const primary=!!e.primary; const w=primary?86:54, h=26;
    const g=el('g',{class:'exit '+(primary?'primary':'emerg'),'data-exit':i,tabindex:0,role:'button','aria-label':e.name},gEx);
    const off={n:[0,-h/2-2],s:[0,h/2+2],e:[w/2+2,0],w:[-w/2-2,0]}[e.side]; const px=x+off[0], py=y+off[1];
    const u=upright(g,px,py); el('rect',{x:px-w/2,y:py-h/2,width:w,height:h,rx:6},u); const t=el('text',{x:px,y:py+1},u); t.textContent=primary?'ENTRANCE':'EXIT'; });
  // points of interest
  const gP = el('g',{id:'pois'},root);
  (L.pois||[]).forEach((p,i)=>{ const [x,y]=p.pt; const g=el('g',{class:'poi '+p.type,'data-poi':i,tabindex:0,role:'button','aria-label':p.name},gP); const u=upright(g,x,y);
    el('circle',{cx:x,cy:y,r:17},u); const ic=el('g',{transform:\`translate(\${x},\${y})\`},u);
    if(p.type==='aed'){ el('path',{d:'M0,8 C-9,0 -12,-6 -6,-9 C-3,-10 -1,-8 0,-6 C1,-8 3,-10 6,-9 C12,-6 9,0 0,8Z',class:'i-fill'},ic); el('path',{d:'M1,-6 L-3,0 L1,0 L-1,5',class:'i-bolt'},ic); }
    else { el('path',{d:'M-7,-5h11v6a4,4 0 0 1 -4,4h-3a4,4 0 0 1 -4,-4zM4,-3h2a2.5,2.5 0 0 1 0,5h-2M-8,8h13',class:'i-line'},ic); } });
  // site context
  const ctx = el('g',{class:'ctx'},root); const ob=bbox(L.outline); const cxm=(ob.x0+ob.x1)/2, cym=(ob.y0+ob.y1)/2;
  const lab=(x,y,txt,r)=>{ const t=el('text',{x,y,class:'ctxlabel',transform:r?\`rotate(\${r} \${x} \${y})\`:null},ctx); t.textContent=txt; };
  lab(cxm, ob.y0-42, level==='lower' ? 'AUSTIN ST.  ·  BX ENTRANCE' : 'AUSTIN ST.');
  lab(cxm, ob.y1+48, level==='lower' ? 'SOCCER FIELD  ·  PINK LOT   (LOWER LEVEL IS BELOW GRADE HERE — NO DOORS)' : 'SOCCER FIELD  ·  PINK LOT');
  lab(ob.x1+44, cym, 'BLUE LOT', 90); lab(ob.x0-44, cym, 'GREEN LOT', -90);
  const na=el('g',{class:'north',transform:\`translate(\${ob.x1+40},\${ob.y0-40})\`},ctx); el('path',{d:'M0,-22 L9,10 L0,4 L-9,10 Z'},na); const nt=el('text',{x:0,y:30},na); nt.textContent='N';
  el('circle',{id:'pulse',class:'pulse',r:20},root);
  applyFilter();
  $('#levelbadge').textContent=LEVEL_NAME[level];
  if(selected){ const s=roomById(selected); if(s && s.L===level) markSelected(); }
}

// ---------- viewport: fit within the un-occluded part of the screen
function insets(){ const r=wrap.getBoundingClientRect(); const top = ftop.getBoundingClientRect().height + 6;
  let bottom = 0; if(isNarrow()){ const st=panel.dataset.state; const H=r.height; bottom = st==='full' ? H*0.88 : st==='half' ? H*0.44 : st==='hidden' ? 0 : peekHeight(); }
  return {top, bottom, left:0, right:0, r}; }
function peekHeight(){ return Math.min(120, $('#shead').getBoundingClientRect().height + 6); }
function levelBox(){ const b=rotBBox(bbox(DATA[level].outline)); const pad=100; return {x0:b.x0-pad,x1:b.x1+pad,y0:b.y0-pad,y1:b.y1+pad}; }
function applyVB(){ svg.setAttribute('viewBox',\`\${vb.x} \${vb.y} \${vb.w} \${vb.h}\`); }
function targetFor(b, padFrac){ // b in rotated map coords
  const ins=insets(); const r=ins.r; const aw=Math.max(80, r.width-ins.left-ins.right), ah=Math.max(80, r.height-ins.top-ins.bottom);
  const bw=(b.x1-b.x0)*(1+padFrac), bh=(b.y1-b.y0)*(1+padFrac);
  let s=Math.min(aw/bw, ah/bh); const lb=levelBox(); const sMin=Math.min(r.width/((lb.x1-lb.x0)*2.2), r.height/((lb.y1-lb.y0)*2.2)); const sMax=Math.max(r.width,r.height)/((lb.x1-lb.x0)/8); s=Math.max(sMin,Math.min(sMax,s));
  const w=r.width/s, h=r.height/s; const acx=ins.left+aw/2, acy=ins.top+ah/2; const cx=(b.x0+b.x1)/2, cy=(b.y0+b.y1)/2;
  return {x:cx-acx/s, y:cy-acy/s, w, h}; }
function fitLevel(animate){ const t=targetFor(levelBox(),0); if(animate) animateVB(t); else { vb=t; applyVB(); } }
function fitTo(b, padFrac){ animateVB(targetFor(rotBBox(b), padFrac)); }
function animateVB(t){ if(!vb || matchMedia('(prefers-reduced-motion: reduce)').matches){ vb=t; applyVB(); return; } const s={...vb}; const t0=performance.now(); cancelAnimationFrame(anim);
  const step=n=>{ const k=Math.min(1,(n-t0)/340); const e=1-Math.pow(1-k,3); vb={x:s.x+(t.x-s.x)*e,y:s.y+(t.y-s.y)*e,w:s.w+(t.w-s.w)*e,h:s.h+(t.h-s.h)*e}; applyVB(); if(k<1) anim=requestAnimationFrame(step); }; anim=requestAnimationFrame(step); }
function clientToSvg(cx,cy){ const r=wrap.getBoundingClientRect(); const s=Math.max(vb.w/r.width, vb.h/r.height); const ox=(r.width - vb.w/s)/2, oy=(r.height - vb.h/s)/2; return [vb.x+(cx-r.left-ox)*s, vb.y+(cy-r.top-oy)*s]; }
function zoomAt(factor, cx, cy){ const [px,py]=clientToSvg(cx,cy); const lb=levelBox(); const minW=(lb.x1-lb.x0)/8, maxW=(lb.x1-lb.x0)*2.4; let nw=vb.w*factor; nw=Math.max(minW,Math.min(maxW,nw)); const f=nw/vb.w; vb={x:px-(px-vb.x)*f, y:py-(py-vb.y)*f, w:nw, h:vb.h*f}; applyVB(); }

// ---------- pan / zoom / tap
let ptrs=new Map(), last=null, pinch=null, moved=false, downTarget=null, wasPinch=false, lastTap=0;
wrap.addEventListener('pointerdown',e=>{ if(e.target.closest('.ftop,.ctrls,.legend')) return; wrap.setPointerCapture(e.pointerId); ptrs.set(e.pointerId,[e.clientX,e.clientY]);
  if(ptrs.size===1){ moved=false; wasPinch=false; downTarget=e.target; last=[e.clientX,e.clientY]; } else { wasPinch=true; const a=[...ptrs.values()]; pinch={d:Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]), c:[(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2]}; } });
wrap.addEventListener('pointermove',e=>{ if(!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId,[e.clientX,e.clientY]);
  if(ptrs.size===1 && last){ const dx=e.clientX-last[0], dy=e.clientY-last[1]; if(Math.hypot(dx,dy)>4){ moved=true; wrap.classList.add('dragging'); } if(moved){ const r=wrap.getBoundingClientRect(); const s=Math.max(vb.w/r.width, vb.h/r.height); vb.x-=dx*s; vb.y-=dy*s; applyVB(); } last=[e.clientX,e.clientY]; }
  else if(ptrs.size===2 && pinch){ const a=[...ptrs.values()]; const d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]); const c=[(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2]; zoomAt(pinch.d/d, c[0], c[1]); const r=wrap.getBoundingClientRect(); const s=Math.max(vb.w/r.width, vb.h/r.height); vb.x-=(c[0]-pinch.c[0])*s; vb.y-=(c[1]-pinch.c[1])*s; applyVB(); pinch={d,c}; moved=true; } });
const endPtr=e=>{ ptrs.delete(e.pointerId); if(ptrs.size<2) pinch=null; if(ptrs.size===0){ last=null; wrap.classList.remove('dragging'); if(!moved && !wasPinch && downTarget && e.type==='pointerup'){ const now=performance.now(); const dbl = now-lastTap<320; lastTap=now; tap(downTarget, e, dbl); } downTarget=null; } };
wrap.addEventListener('pointerup',endPtr); wrap.addEventListener('pointercancel',endPtr);
wrap.addEventListener('wheel',e=>{ e.preventDefault(); zoomAt(e.deltaY>0?1.12:0.89, e.clientX, e.clientY); },{passive:false});
function tap(t, ev, dbl){ const g=t.closest && t.closest('.g-room'); if(g){ select(g.dataset.id, true); return; } const ex=t.closest && t.closest('.exit'); if(ex){ selectExit(+ex.dataset.exit); return; } const po=t.closest && t.closest('.poi'); if(po){ selectPoi(+po.dataset.poi); return; }
  if(dbl){ zoomAt(0.6, ev.clientX, ev.clientY); return; } if(isNarrow() && panel.classList.contains('open')) setSheet('peek'); }
$('#zin').onclick=()=>{ const r=wrap.getBoundingClientRect(); zoomAt(0.75, r.left+r.width/2, r.top+r.height/2); };
$('#zout').onclick=()=>{ const r=wrap.getBoundingClientRect(); zoomAt(1.33, r.left+r.width/2, r.top+r.height/2); };
$('#zfit').onclick=()=>{ if(selected){ const s=roomById(selected); if(s&&s.L===level){ fitTo(bbox(s.r.poly), isNarrow()?1.2:1.6); return; } } fitLevel(true); };
$('#zrot').onclick=()=>{ rot=(rot+90)%360; try{ localStorage.setItem('bxmap-rot',String(rot)); }catch(e){} render(); if(selected && roomById(selected).L===level) fitTo(bbox(roomById(selected).r.poly), isNarrow()?1.2:1.6); else fitLevel(true); };

// ---------- selection & sheet
function setSheet(state){ panel.dataset.state=state; const ins = isNarrow() ? (state==='full'? wrap.getBoundingClientRect().height*0.88 : state==='half'? wrap.getBoundingClientRect().height*0.44 : peekHeight()) : 0; $('#ctrls').style.bottom = isNarrow() ? (ins+12)+'px' : '12px'; $('#levelbadge').style.bottom = isNarrow() ? (ins+12)+'px' : '12px'; }
function markSelected(){ document.querySelectorAll('.g-room.selected,.exit.selected,.poi.selected').forEach(x=>x.classList.remove('selected')); const g=svg.querySelector(\`.g-room[data-id="\${selected}"]\`); if(g){ g.classList.add('selected'); g.parentNode.appendChild(g); const c=centroid(roomById(selected).r.poly); const p=svg.querySelector('#pulse'); p.setAttribute('cx',c[0]); p.setAttribute('cy',c[1]); p.classList.remove('go'); void p.getBoundingClientRect(); p.classList.add('go'); } }
function select(id, zoom){ const s=roomById(id); if(!s) return; selected=id; if(s.L!==level) setLevel(s.L, true); markSelected(); showPanel(s.r, s.L); if(isNarrow()) setSheet('half'); if(zoom) fitTo(bbox(s.r.poly), isNarrow()?1.2:1.6); try{ history.replaceState(null,'','#'+id); }catch(e){} }
function selectExit(i){ const e=DATA[level].exits[i]; selected=null; document.querySelectorAll('.g-room.selected,.exit.selected,.poi.selected').forEach(x=>x.classList.remove('selected')); const g=svg.querySelector(\`.exit[data-exit="\${i}"]\`); g.classList.add('selected'); showPanel({name:e.name, cat:e.primary?'entrance':'exit', poly:[e.pt,e.pt,e.pt], note: e.primary ? 'Main entrance. Double doors that open out to the parking lot.' : 'Emergency exit. Exterior double doors; not a regular entrance.'}, level, true); if(isNarrow()) setSheet('half'); fitTo({x0:e.pt[0]-160,x1:e.pt[0]+160,y0:e.pt[1]-160,y1:e.pt[1]+160},0.2); }
function selectPoi(i){ const p=DATA[level].pois[i]; selected=null; document.querySelectorAll('.g-room.selected,.exit.selected,.poi.selected').forEach(x=>x.classList.remove('selected')); svg.querySelector(\`.poi[data-poi="\${i}"]\`).classList.add('selected'); showPanel({name:p.name,cat:'poi',poly:[p.pt,p.pt,p.pt],note:p.note},level,true); if(isNarrow()) setSheet('half'); fitTo({x0:p.pt[0]-160,x1:p.pt[0]+160,y0:p.pt[1]-160,y1:p.pt[1]+160},0.2); }
function clearSel(){ selected=null; document.querySelectorAll('.g-room.selected,.exit.selected,.poi.selected').forEach(x=>x.classList.remove('selected')); panel.classList.remove('open'); setSheet('peek'); fitLevel(true); try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){} }
$('#p-close').onclick=clearSel;
document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ clearSel(); $('#results').classList.remove('show'); } });

function dist(a,b){ return Math.hypot(a[0]-b[0],a[1]-b[1]); }
function nearest(r, L, pred, n){ const c=centroid(r.poly); return DATA[L].rooms.filter(x=>x!==r && pred(x)).map(x=>({x, d:dist(c,centroid(x.poly))})).sort((a,b)=>a.d-b.d).slice(0,n); }
function nearestExits(r,L,n){ const c=centroid(r.poly); return DATA[L].exits.map((e,i)=>({e,i,d:dist(c,e.pt)})).sort((a,b)=>a.d-b.d).slice(0,n); }
function ft(d){ return Math.round(d/8)+' ft'; }
const ICO={ rr:'<svg viewBox="0 0 24 24"><circle cx="8" cy="5" r="2.2" fill="currentColor"/><path d="M6 8h4l2 6h-1.5l.8 6H5.7l.8-6H5z" fill="currentColor"/><circle cx="17" cy="5" r="2.2" fill="currentColor"/><path d="M14.5 8h5v6h-1.2v6h-2.6v-6h-1.2z" fill="currentColor"/></svg>',
  st:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 20h5v-4h4v-4h4V8h5"/></svg>',
  ex:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 4h6v16h-6M3 12h10M9 8l4 4-4 4"/></svg>',
  el:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 11l2-3 2 3M12 13l2 3 2-3"/></svg>' };
function showPanel(r, L, isPoint){
  panel.classList.add('open');
  $('#p-name').textContent=r.name;
  $('#p-sw').style.background = r.cat==='poi' ? 'var(--accent)' : r.cat==='entrance' ? 'var(--entry)' : r.cat==='exit' ? 'var(--emerg)' : \`var(--c-\${r.cat})\`;
  const meta=$('#p-meta'); meta.innerHTML='';
  const t1=document.createElement('span'); t1.className='tag acc'; t1.textContent=LEVEL_NAME[L]; meta.appendChild(t1);
  const tags = r.cat==='poi' ? ['Point of interest'] : r.cat==='entrance' ? ['Main entrance'] : r.cat==='exit' ? ['Emergency exit'] : (r.tags||[r.cat]).filter(t=>t!=='hall').map(t=>CATS[t]);
  for(const tg of tags){ const t2=document.createElement('span'); t2.className='tag'; t2.textContent=tg; meta.appendChild(t2); }
  $('#p-note').textContent = r.note || \`\${r.name} on the \${LEVEL_NAME[L].toLowerCase()}.\`;
  const near=$('#p-near'); near.innerHTML='';
  const addList=(title, items)=>{ if(!items.length) return; const h=document.createElement('h3'); h.textContent=title; near.appendChild(h); const ul=document.createElement('ul');
    for(const it of items){ const li=document.createElement('li'); const b=document.createElement('button'); b.innerHTML=\`\${it.ico}<span>\${it.name}</span><span class="d">\${it.d}</span>\`; b.onclick=()=>{ if(it.exit!==undefined){ selectExit(it.exit); } else select(it.id,true); }; li.appendChild(b); ul.appendChild(li); } near.appendChild(ul); };
  if(!isPoint){
    if(r.cat!=='restroom') addList('Nearest restrooms', nearest(r,L,x=>x.cat==='restroom',3).map(o=>({ico:ICO.rr,name:o.x.name,d:ft(o.d),id:o.x.id})));
    if(r.cat!=='stairs') addList('Nearest stairs & elevator', nearest(r,L,x=>x.cat==='stairs'||x.cat==='elevator',3).map(o=>({ico:o.x.cat==='elevator'?ICO.el:ICO.st,name:o.x.name,d:ft(o.d),id:o.x.id})));
    addList('Nearest exits', nearestExits(r,L,2).map(o=>({ico:ICO.ex,name:o.e.name,d:ft(o.d),exit:o.i})));
  }
  const foot=$('#p-foot'); foot.innerHTML='';
  if(!isPoint){ const b=document.createElement('button'); b.textContent='Zoom to this space'; b.onclick=()=>fitTo(bbox(r.poly),isNarrow()?1.2:1.6); foot.appendChild(b); foot.appendChild(document.createTextNode('  ·  Distances are straight-line estimates.')); }
  $('#sbody').scrollTop=0;
}
// sheet drag (mobile)
(function(){ const head=$('#shead'); let sy=0, startT=0, dragging=false, h0=0, y0=0;
  const stateY=st=>{ const H=panel.getBoundingClientRect().height; return st==='full'?0: st==='half'? H*0.5 : H-peekHeight(); };
  head.addEventListener('pointerdown',e=>{ if(!isNarrow() || e.target.closest('button')) return; dragging=true; head.setPointerCapture(e.pointerId); sy=e.clientY; startT=performance.now(); y0=stateY(panel.dataset.state); panel.classList.add('dragging'); });
  head.addEventListener('pointermove',e=>{ if(!dragging) return; const dy=e.clientY-sy; const H=panel.getBoundingClientRect().height; const y=Math.max(0, Math.min(H-peekHeight(), y0+dy)); panel.style.transform=\`translateY(\${y}px)\`; });
  const end=e=>{ if(!dragging) return; dragging=false; panel.classList.remove('dragging'); panel.style.transform=''; const dy=e.clientY-sy; const v=dy/Math.max(1,performance.now()-startT); const H=panel.getBoundingClientRect().height; const y=y0+dy;
    let st; if(Math.abs(dy)<8){ st = panel.dataset.state==='peek' ? (panel.classList.contains('open')?'half':'peek') : panel.dataset.state==='half' ? 'full' : 'half'; }
    else if(v<-0.5) st = panel.dataset.state==='peek' ? 'half' : 'full'; else if(v>0.5) st = panel.dataset.state==='full' ? 'half' : 'peek';
    else { const cands=[['full',0],['half',H*0.5],['peek',H-peekHeight()]]; st=cands.sort((a,b)=>Math.abs(a[1]-y)-Math.abs(b[1]-y))[0][0]; }
    if(!panel.classList.contains('open')) st='peek'; setSheet(st); };
  head.addEventListener('pointerup',end); head.addEventListener('pointercancel',end);
})();

// ---------- level toggle
function setLevel(L, quiet){ if(level===L) return; level=L; $('#lv-lower').setAttribute('aria-pressed', L==='lower'); $('#lv-upper').setAttribute('aria-pressed', L==='upper'); render(); if(!quiet){ if(selected && roomById(selected).L!==L){ selected=null; clearSel(); } fitLevel(true); } }
$('#lv-lower').onclick=()=>setLevel('lower'); $('#lv-upper').onclick=()=>setLevel('upper');

// ---------- chips + legend
const chips=$('#chips');
for(const c of CHIP_ORDER){ const b=document.createElement('button'); b.className='chip'; b.setAttribute('aria-pressed','false'); b.dataset.cat=c; const col = c==='vert' ? 'var(--c-stairs)' : \`var(--c-\${c})\`; b.innerHTML=\`<i style="background:\${col}"></i>\${CATS[c]}\`; b.onclick=()=>{ if(activeCats.has(c)) activeCats.delete(c); else activeCats.add(c); b.setAttribute('aria-pressed', activeCats.has(c)); applyFilter(); }; chips.appendChild(b); }
function roomMatches(r){ if(!activeCats.size) return true; for(const t of (r.tags||[r.cat])){ if(activeCats.has(t)) return true; if(activeCats.has('vert') && (t==='stairs'||t==='elevator')) return true; } return false; }
function applyFilter(){ for(const r of DATA[level].rooms){ const g=svg.querySelector(\`.g-room[data-id="\${r.id}"]\`); if(g) g.classList.toggle('dim', !roomMatches(r)); } }
$('#legend').innerHTML = \`<div><svg viewBox="0 0 16 16"><rect x="1" y="1" width="14" height="14" rx="3" fill="var(--entry)"/></svg>Main entrance</div>
<div><svg viewBox="0 0 16 16"><rect x="1" y="1" width="14" height="14" rx="3" fill="var(--emerg)"/></svg>Emergency exit</div>
<div><svg viewBox="0 0 16 16" fill="none" stroke="var(--wall-thin)" stroke-width="1.3"><path d="M2 14V2h10M2 2a12 12 0 0 1 12 12"/></svg>Door &amp; swing</div>
<div><svg viewBox="0 0 16 16"><rect x="1" y="1" width="14" height="14" fill="var(--c-stairs)" stroke="var(--wall-thin)"/><path d="M4 1v14M7 1v14M10 1v14M13 1v14" stroke="var(--wall-thin)" stroke-width="1"/></svg>Stairs</div>
<div><svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="var(--surface-raised)" stroke="#c9302c" stroke-width="1.5"/><path d="M8 11.5C4.5 8.5 4 6.5 6 5.5c1-.4 1.6.2 2 .9.4-.7 1-1.3 2-.9 2 1 1.5 3-2 6z" fill="#c9302c"/></svg>AED</div>
<div><svg viewBox="0 0 16 16"><rect x="1" y="1" width="14" height="14" fill="var(--c-elevator)" stroke="var(--wall-thin)"/><path d="M6 8l2-3 2 3M6 9l2 3 2-3" fill="none" stroke="var(--t-elevator)"/></svg>Elevator</div>\`;

// ---------- search
const q=$('#q'), results=$('#results'), qclear=$('#qclear');
function allItems(){ const out=[]; for(const L of ['lower','upper']){ for(const r of DATA[L].rooms) out.push({name:r.name, sub:(r.tags||[]).filter(t=>t!=='hall').map(t=>CATS[t]).join(' · '), cat:r.cat, L, id:r.id}); DATA[L].exits.forEach((e,i)=>out.push({name:e.name, sub:e.primary?'Main entrance':'Emergency exit', cat:e.primary?'entrance':'exit', L, exit:i})); (DATA[L].pois||[]).forEach((p,i)=>out.push({name:p.name, sub:'Point of interest', cat:'poi', L, poi:i})); } return out; }
const ITEMS=allItems(); let activeIdx=-1;
function swatch(it){ return it.cat==='exit'?'var(--emerg)':it.cat==='entrance'?'var(--entry)':it.cat==='poi'?'var(--accent)':\`var(--c-\${it.cat})\`; }
function doSearch(){ const v=q.value.trim().toLowerCase(); qclear.classList.toggle('show', v.length>0); if(!v){ results.classList.remove('show'); return; }
  const hits=ITEMS.filter(it=> (it.name+' '+it.sub).toLowerCase().includes(v)).slice(0,14); results.innerHTML=''; activeIdx=-1;
  if(!hits.length){ results.innerHTML='<div class="empty">No match. Try a room name like “Loft” or a word like “restroom”.</div>'; results.classList.add('show'); return; }
  hits.forEach(it=>{ const b=document.createElement('button'); b.setAttribute('role','option'); b.innerHTML=\`<span class="sw" style="background:\${swatch(it)}"></span><span class="nm">\${it.name}\${it.sub?\` <span style="font-weight:400;color:var(--fg-subtle)">· \${it.sub}</span>\`:''}</span><span class="lv">\${LEVEL_NAME[it.L]}</span>\`;
    b.onclick=()=>{ results.classList.remove('show'); q.value=it.name; qclear.classList.add('show'); q.blur(); if(it.poi!==undefined){ setLevel(it.L,true); selectPoi(it.poi); } else if(it.exit!==undefined){ setLevel(it.L,true); selectExit(it.exit); } else select(it.id,true); };
    results.appendChild(b); });
  results.classList.add('show'); }
q.addEventListener('input',doSearch); q.addEventListener('focus',doSearch);
q.addEventListener('keydown',e=>{ const opts=[...results.querySelectorAll('button')]; if(!opts.length) return; if(e.key==='ArrowDown'){ e.preventDefault(); activeIdx=(activeIdx+1)%opts.length; } else if(e.key==='ArrowUp'){ e.preventDefault(); activeIdx=(activeIdx-1+opts.length)%opts.length; } else if(e.key==='Enter'){ e.preventDefault(); (opts[Math.max(0,activeIdx)]).click(); return; } else return; opts.forEach((o,i)=>o.classList.toggle('active',i===activeIdx)); });
qclear.onclick=()=>{ q.value=''; doSearch(); q.focus(); };
document.addEventListener('click',e=>{ if(!e.target.closest('.search')) results.classList.remove('show'); });

// ---------- boot
render(); setSheet('peek'); fitLevel(false);
const h=(location.hash||'').slice(1); if(h && roomById(h)) select(h,true);
let rsz; addEventListener('resize',()=>{ clearTimeout(rsz); rsz=setTimeout(()=>{ setSheet(panel.dataset.state); if(selected && roomById(selected).L===level) fitTo(bbox(roomById(selected).r.poly), isNarrow()?1.2:1.6); else fitLevel(false); },120); });
`;

export default function BxMapPage() {
  return (
    <>
      <link rel="stylesheet" href={FONTS_URL} />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div
        style={{ height: 'calc(100dvh - 56px)', overflow: 'hidden', position: 'relative' }}
        dangerouslySetInnerHTML={{ __html: HTML }}
      />
      <script dangerouslySetInnerHTML={{ __html: JS }} />
    </>
  );
}
