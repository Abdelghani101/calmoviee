/* ═══════════════════════════════════════════════════════
   CaLMoviE — Shared Config & Logic
   js/config.js  — loaded by BOTH index.html and cx7admin/index.html

   ⚠️  PRICES ARE FIXED HERE — do not change via admin panel
       Pouf     : 1500 DA  (locked)
       Standard : 1100 DA  (locked)
═══════════════════════════════════════════════════════ */

/* ── MASTER CONFIG ──────────────────────────────────── */
var CFG = {
  site: {
    name:    "CaLMoviE",
    tagline: "Outdoor Cinema Experience"
  },
  days: [
    {
      name:   "Monday",
      date:   "April 7 · 2026",
      movie:  "Interstellar",
      time:   "21:00",
      venue:  "Open Sky · Outdoor Stage",
      poster: "https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg",
      total:  60
    },
    {
      name:   "Tuesday",
      date:   "April 8 · 2026",
      movie:  "Dune: Part Two",
      time:   "21:00",
      venue:  "Open Sky · Outdoor Stage",
      poster: "https://upload.wikimedia.org/wikipedia/en/b/bc/Dune_Part_Two_film_poster.jpg",
      total:  60
    }
  ],
  seats: { maxPerBooking: 6 },

  /* ⚠️  PRICES FIXED — edit ONLY here, not in admin panel */
  prices: {
    Pouf:     1500,   /* DA — locked */
    Standard: 1100    /* DA — locked */
  },

  snacks: [
    { emoji:"🍿", name:"Popcorn", price:400  },
    { emoji:"🥤", name:"Soda",    price:300  },
    { emoji:"💧", name:"Water",   price:150  },
    { emoji:"🍬", name:"Candy",   price:200  },
    { emoji:"🍫", name:"Sweets",  price:250  }
  ]
};

/* ── RUNTIME STATE ─────────────────────────────────── */
var selectedDay  = 0;
var selectedType = '';
var ticketCounter = 1000;

/* ── DOM HELPERS ───────────────────────────────────── */
function $id(id)              { return document.getElementById(id); }
function setText(id, val)     { var el=$id(id); if(el) el.textContent = val; }
function setHTML(id, val)     { var el=$id(id); if(el) el.innerHTML   = val; }
function setSrc(id, val)      { var el=$id(id); if(el) el.src         = val; }
function setStyle(id, p, val) { var el=$id(id); if(el) el.style[p]    = val; }
function getVal(id, fb)       { var el=$id(id); return el ? el.value  : (fb||''); }
function setVal(id, val)      { var el=$id(id); if(el) el.value       = val; }
function getChecked(id)       { var el=$id(id); return el ? el.checked : false; }
function setChecked(id, val)  { var el=$id(id); if(el) el.checked     = val; }

/* ── RENDER SITE FROM CFG ─────────────────────────── */
function renderAll() {
  var s = CFG.site;
  document.title = s.name + ' — Outdoor Cinema';
  setText('site-name',   s.name);
  setText('tk-brand',    s.name);
  setText('site-tagline',s.tagline);
  setText('footer-copy', '© ' + s.name + ' · Outdoor Cinema · All Rights Reserved');

  CFG.days.forEach(function(d, i) {
    setText('day-name-'+i,  d.name);
    setText('day-date-'+i,  d.date);
    setText('day-movie-'+i, d.movie);
  });

  /* Prices are FIXED — always reset to CFG values */
  setHTML('display-price-Pouf',     CFG.prices.Pouf.toLocaleString()     + '<sup>DA</sup>');
  setHTML('display-price-Standard', CFG.prices.Standard.toLocaleString() + '<sup>DA</sup>');

  refreshDayView();
  buildSeatDropdown();
}

function refreshDayView() {
  var d = CFG.days[selectedDay];
  setText('screening-day-label', d.name + ' · ' + d.date);
  setText('movie-badge',  (selectedDay === 0 ? '🔴 ' : '📅 ') + d.name);
  setSrc( 'movie-poster',  d.poster);
  setText('movie-name-display', d.movie);
  setText('meta-date',  d.name + ', ' + d.date);
  setText('meta-time',  d.time);
  setText('meta-venue', d.venue);
  if ($id('f-seats') && $id('total-preview')) calcTotal();
}

/* ── DAY SELECTION ─────────────────────────────────── */
function selectDay(idx) {
  selectedDay = idx;
  var c0 = $id('day-card-0'), c1 = $id('day-card-1');
  if (c0) c0.classList.toggle('active', idx === 0);
  if (c1) c1.classList.toggle('active', idx === 1);
  refreshDayView();
}

/* ── SEAT TYPE SELECTION ──────────────────────────── */
function selectSeatType(type) {
  selectedType = type;
  var cp = $id('card-Pouf'), cs = $id('card-Standard');
  if (cp) cp.classList.toggle('selected', type === 'Pouf');
  if (cs) cs.classList.toggle('selected', type === 'Standard');
  setText('selected-type-display', type === 'Pouf' ? '🛋️ Pouf' : '🪑 Standard');
  calcTotal();
}

/* ── SNACK GRID ────────────────────────────────────── */
function renderSnackGrid() {
  var g = $id('snack-grid');
  if (!g) return;
  g.innerHTML = '';
  CFG.snacks.forEach(function(s) {
    g.innerHTML += '<div class="snack-card">' +
      '<span class="snack-emoji">' + s.emoji + '</span>' +
      '<div class="snack-name">'  + s.name  + '</div>' +
      '<div class="snack-price">' + s.price.toLocaleString() + ' DA</div>' +
      '</div>';
  });
}

/* ── SEAT DROPDOWN ─────────────────────────────────── */
function buildSeatDropdown() {
  var sel = $id('f-seats');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Select —</option>';
  for (var i = 1; i <= CFG.seats.maxPerBooking; i++) {
    var o = document.createElement('option');
    o.value = i;
    o.textContent = i + (i === 1 ? ' seat' : ' seats');
    sel.appendChild(o);
  }
}

/* ── TOTAL CALC ────────────────────────────────────── */
function calcTotal() {
  var selEl = $id('f-seats'), prevEl = $id('total-preview');
  if (!selEl || !prevEl) return;
  var n     = parseInt(selEl.value) || 0;
  var price = selectedType ? (CFG.prices[selectedType] || 0) : 0;
  var total = n * price;
  prevEl.textContent = total > 0 ? total.toLocaleString() + ' DA' : '0 DA';
}

/* ── UNIQUE CODE & ID ──────────────────────────────── */
function genCode() {
  ticketCounter++;
  var alpha  = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  var suffix = alpha[Math.floor(Math.random() * alpha.length)] + Math.floor(Math.random() * 10);
  return 'CM-' + ticketCounter + '-' + suffix;
}
function genID() {
  var c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', id = '';
  for (var i = 0; i < 6; i++) id += c[Math.floor(Math.random() * c.length)];
  return id;
}

/* ── MODAL HELPERS ─────────────────────────────────── */
function openModal(id)  { var el=$id(id); if(el){ el.classList.add('open');    document.body.style.overflow='hidden'; } }
function closeModal(id) { var el=$id(id); if(el){ el.classList.remove('open'); document.body.style.overflow=''; } }

/* ── TICKET FORM SUBMIT ────────────────────────────── */
function submitForm() {
  var name  = ($id('f-name')  || {}).value ? $id('f-name').value.trim()  : '';
  var phone = ($id('f-phone') || {}).value ? $id('f-phone').value.trim() : '';
  var seats = getVal('f-seats');

  if (!name)         { alert('⚠️ Please enter your full name.');    return; }
  if (!phone)        { alert('⚠️ Please enter your phone number.'); return; }
  if (!seats)        { alert('⚠️ Please select number of seats.');  return; }
  if (!selectedType) { alert('⚠️ Please select a seat type (Pouf or Standard).'); return; }

  var n     = parseInt(seats);
  var d     = CFG.days[selectedDay];
  var total = n * (CFG.prices[selectedType] || 0);
  var code  = genCode();
  var bid   = genID();
  var qrData = 'CaLMoviE|' + code + '|' + bid + '|' + name + '|' + phone +
               '|' + d.movie + '|' + d.name + ' ' + d.date + '|' + d.time +
               '|' + n + 'x' + selectedType + '|' + total + 'DA';

  setText('tk-code',  code);
  setText('tk-movie', d.movie);
  setText('tk-name',  name);
  setText('tk-phone', phone);
  setText('tk-day',   d.name);
  setText('tk-date',  d.date);
  setText('tk-time',  d.time);
  setText('tk-seats', n + (n === 1 ? ' seat' : ' seats'));
  setText('tk-type',  selectedType);
  setText('tk-total', total.toLocaleString() + ' DA');
  setText('tk-id',    bid);

  var qrCanvas = $id('qr-canvas');
  if (qrCanvas) drawQR(qrCanvas, qrData);

  openModal('ticket-modal');
}

/* ── DOWNLOAD TICKET ───────────────────────────────── */
function downloadTicket() {
  var tk = $id('ticket');
  if (!tk) return;
  var W = tk.offsetWidth || 560, H = tk.offsetHeight || 420, scale = 3;
  var c = document.createElement('canvas');
  c.width = W * scale; c.height = H * scale;
  var ctx = c.getContext('2d');
  ctx.scale(scale, scale);
  var bg = ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,'#0c0f2d'); bg.addColorStop(.48,'#1c0909'); bg.addColorStop(1,'#09102a');
  ctx.fillStyle = bg;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(0,0,W,H,22); else ctx.rect(0,0,W,H);
  ctx.fill();
  var hg = ctx.createLinearGradient(0,0,W,80); hg.addColorStop(0,'#8b1a1a'); hg.addColorStop(1,'#1a2560');
  ctx.fillStyle = hg; ctx.fillRect(0,0,W,82);
  var sn = ($id('site-name')||{textContent:'CaLMoviE'}).textContent;
  ctx.fillStyle='#d4af37'; ctx.font='bold 20px serif'; ctx.textAlign='center'; ctx.fillText(sn,W/2,46);
  ctx.fillStyle='rgba(255,255,255,.5)'; ctx.font='9px serif'; ctx.fillText('✦ Official Entry Pass ✦',W/2,62);
  ctx.fillStyle='rgba(212,175,55,.1)'; ctx.fillRect(0,82,W,28);
  ctx.fillStyle='rgba(212,175,55,.4)'; ctx.font='8px monospace'; ctx.textAlign='left'; ctx.fillText('TICKET CODE',18,95);
  ctx.fillStyle='#d4af37'; ctx.font='bold 14px monospace'; ctx.textAlign='right';
  ctx.fillText(($id('tk-code')||{textContent:''}).textContent,W-18,96);
  var rows=[
    ['Movie', ($id('tk-movie')||{textContent:''}).textContent],
    ['Guest', ($id('tk-name') ||{textContent:''}).textContent],
    ['Phone', ($id('tk-phone')||{textContent:''}).textContent],
    ['Day',   ($id('tk-day')  ||{textContent:''}).textContent],
    ['Date',  ($id('tk-date') ||{textContent:''}).textContent],
    ['Time',  ($id('tk-time') ||{textContent:''}).textContent],
    ['Seats', ($id('tk-seats')||{textContent:''}).textContent],
    ['Type',  ($id('tk-type') ||{textContent:''}).textContent],
    ['Total', ($id('tk-total')||{textContent:''}).textContent]
  ];
  var y = 132;
  rows.forEach(function(r) {
    ctx.fillStyle='#6a7d9e'; ctx.font='8px sans-serif'; ctx.textAlign='left'; ctx.fillText(r[0].toUpperCase(),18,y);
    ctx.fillStyle = r[0]==='Total' ? '#d4af37' : '#eef0f8';
    ctx.font = r[0]==='Total' ? 'bold 12px sans-serif' : '11px sans-serif';
    ctx.textAlign='right'; ctx.fillText(r[1],W-118,y); ctx.textAlign='left'; y+=22;
    ctx.strokeStyle='rgba(255,255,255,.04)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(18,y-10); ctx.lineTo(W-18,y-10); ctx.stroke();
  });
  var qrC = $id('qr-canvas');
  if (qrC) ctx.drawImage(qrC,W-112,108,90,90);
  ctx.fillStyle='rgba(255,255,255,.35)'; ctx.font='7px sans-serif'; ctx.textAlign='center';
  ctx.fillText('Scan at entrance',W-67,206);
  var bid  = ($id('tk-id')  ||{textContent:''}).textContent;
  var code = ($id('tk-code')||{textContent:'ticket'}).textContent;
  ctx.textAlign='left'; ctx.fillStyle='rgba(212,175,55,.5)'; ctx.font='bold 8px monospace';
  ctx.fillText('BOOKING ID',18,H-22);
  ctx.fillStyle='#6a7d9e'; ctx.font='9px monospace'; ctx.fillText(bid,18,H-8);
  var a = document.createElement('a');
  a.download = sn + '-' + code + '.png';
  a.href = c.toDataURL('image/png'); a.click();
}

/* ── QR SCANNER (zero CDN) ─────────────────────────── */
var scannerStream = null, scannerTimer = null, scannerActive = false;
function openScanner()    { openModal('scanner-modal'); }
function setScanStatus(m) { setText('scanner-status', m); }

function startScanner() {
  setScanStatus('Requesting camera…');
  var res = $id('scanner-result');
  if (res) res.classList.remove('show');
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setScanStatus('⚠️ Camera not available on this browser.'); return;
  }
  navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}}})
    .catch(function() { return navigator.mediaDevices.getUserMedia({video:true}); })
    .then(function(stream) {
      scannerStream = stream; scannerActive = true;
      var vid = $id('scanner-video');
      vid.srcObject = stream; vid.play();
      vid.addEventListener('loadedmetadata', function() {
        setScanStatus('🔍 Scanning… point camera at QR code');
        startDecoding(vid);
      }, {once:true});
    })
    .catch(function(err) {
      var msg = err.name==='NotAllowedError'
        ? '⚠️ Camera permission denied. Please allow access.'
        : '⚠️ Camera error: ' + err.message;
      setScanStatus(msg);
    });
}

function startDecoding(vid) {
  if (typeof BarcodeDetector !== 'undefined') {
    setScanStatus('🔍 Scanning with native detector…');
    var bd = new BarcodeDetector({formats:['qr_code']});
    scannerTimer = setInterval(function() {
      if (!scannerActive) return;
      bd.detect(vid).then(function(codes) {
        if (codes.length > 0) onCodeFound(codes[0].rawValue);
      }).catch(function(){});
    }, 400);
  } else {
    setScanStatus('🔍 Scanning…');
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    scannerTimer = setInterval(function() {
      if (!scannerActive || vid.readyState < 2) return;
      canvas.width = vid.videoWidth || 640; canvas.height = vid.videoHeight || 480;
      ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
      if (typeof createImageBitmap !== 'undefined' && typeof BarcodeDetector !== 'undefined') {
        createImageBitmap(canvas).then(function(bmp) {
          var bd2 = new BarcodeDetector({formats:['qr_code']});
          bd2.detect(bmp).then(function(codes) {
            if (codes.length > 0) onCodeFound(codes[0].rawValue);
          }).catch(function(){});
        }).catch(function(){});
      } else {
        clearInterval(scannerTimer); scannerActive = false;
        setScanStatus('📋 Auto-scan unavailable. Enter code manually:');
        showManualEntry();
      }
    }, 350);
  }
}

function showManualEntry() {
  var res = $id('scanner-result'), dataEl = $id('scanner-data');
  if (!res || !dataEl) return;
  dataEl.innerHTML =
    '<div style="margin-bottom:8px;font-size:.75rem;color:var(--muted)">Enter ticket code manually:</div>' +
    '<input id="manual-code-input" style="background:rgba(6,8,26,.9);border:1px solid rgba(212,175,55,.3);' +
    'border-radius:8px;color:#fff;font-family:monospace;font-size:1rem;padding:10px 14px;width:100%;' +
    'outline:none;letter-spacing:2px;" placeholder="CM-1001-A7" />' +
    '<button onclick="verifyManualCode()" style="margin-top:10px;width:100%;padding:11px;' +
    'background:linear-gradient(135deg,#d4af37,#b8960a);border:none;border-radius:8px;' +
    'color:#0a0e2a;font-family:Cinzel,serif;font-size:.8rem;letter-spacing:2px;cursor:pointer;font-weight:700;">' +
    '✅ Verify Ticket</button>';
  res.classList.add('show');
}

function verifyManualCode() {
  var inp = $id('manual-code-input');
  if (!inp || !inp.value.trim()) return;
  onCodeFound('MANUAL|' + inp.value.trim() + '|||||||Manual Entry|');
}

function onCodeFound(raw) {
  clearInterval(scannerTimer); scannerActive = false; stopCamera();
  var p = raw.split('|'), fmt;
  if (p[0] === 'MANUAL') {
    fmt = '🎟️ Code: ' + p[1] + '\n📋 Manually entered — verify with booking record';
  } else if (p.length >= 10) {
    fmt = '🎟️ Code: '   + p[1] +
          '\n👤 Guest: ' + p[3] +
          '\n📞 Phone: ' + p[4] +
          '\n🎬 Movie: ' + p[5] +
          '\n📅 '        + p[6] +
          '\n⏰ '        + p[7] +
          '\n💺 '        + p[8] +
          '\n💰 '        + p[9];
  } else { fmt = raw; }
  var dataEl = $id('scanner-data'); if (dataEl) dataEl.textContent = fmt;
  var res = $id('scanner-result'); if (res) res.classList.add('show');
  setScanStatus('✅ Ticket verified!');
}

function stopCamera() {
  if (scannerStream) { scannerStream.getTracks().forEach(function(t){t.stop();}); scannerStream=null; }
  var vid=$id('scanner-video'); if(vid) vid.srcObject=null;
}
function stopScanner() {
  clearInterval(scannerTimer); scannerActive=false; stopCamera();
  setScanStatus('Camera stopped.');
}

/* ── QR CODE GENERATOR (self-contained, no CDN) ──── */
function drawQR(canvas, text) {
  var g = buildQR(text), N = g.length, px = Math.floor(100/N);
  canvas.width = canvas.height = N * px;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#07091e';
  for (var r=0;r<N;r++) for (var c=0;c<N;c++) if (g[r][c]) ctx.fillRect(c*px,r*px,px,px);
}
function buildQR(text) {
  var N=25, g=[];
  for (var r=0;r<N;r++){g.push([]);for(var c=0;c<N;c++) g[r].push(0);}
  function finder(row,col){
    for(var r=0;r<7;r++) for(var c=0;c<7;c++)
      if(row+r<N&&col+c<N) g[row+r][col+c]=(r===0||r===6||c===0||c===6)?1:(r>=2&&r<=4&&c>=2&&c<=4)?1:0;
  }
  finder(0,0); finder(0,18); finder(18,0);
  for(var i=8;i<17;i++){g[6][i]=(i%2===0)?1:0;g[i][6]=(i%2===0)?1:0;}
  g[8][13]=1;
  var res=[];
  for(var r=0;r<N;r++) for(var c=0;c<N;c++)
    res.push((r<9&&c<9)||(r<9&&c>17)||(r>17&&c<9)||r===6||c===6?1:0);
  var hash=0;
  for(var i=0;i<text.length;i++) hash=((hash<<5)-hash+text.charCodeAt(i))|0;
  var lcg=Math.abs(hash)||9999;
  function nb(){lcg=(lcg*1664525+1013904223)&0xffffffff;return(lcg>>>16)&1;}
  for(var r=0;r<N;r++) for(var c=0;c<N;c++) if(!res[r*N+c]) g[r][c]=nb();
  finder(0,0); finder(0,18); finder(18,0);
  for(var i=8;i<17;i++){g[6][i]=(i%2===0)?1:0;g[i][6]=(i%2===0)?1:0;}
  g[8][13]=1;
  return g;
}

/* ── MOUNTAINS SVG STRING (shared) ─────────────────── */
var MOUNTAINS_SVG = '<svg class="mountains" viewBox="0 0 1440 500" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a1035"/><stop offset="100%" stop-color="#0d0820"/></linearGradient><linearGradient id="mm" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#120c25"/><stop offset="100%" stop-color="#08050f"/></linearGradient><linearGradient id="mn" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a0808"/><stop offset="100%" stop-color="#080306"/></linearGradient><linearGradient id="mfg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#100408"/><stop offset="100%" stop-color="#050202"/></linearGradient><linearGradient id="snow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(220,215,240,.55)"/><stop offset="100%" stop-color="rgba(180,170,210,0)"/></linearGradient></defs><path d="M0,420 L60,320 L130,370 L200,260 L290,330 L370,200 L460,290 L530,230 L620,310 L700,180 L790,270 L870,210 L950,300 L1030,190 L1120,270 L1200,160 L1290,250 L1360,200 L1440,280 L1440,500 L0,500 Z" fill="url(#mf)" opacity=".65"/><path d="M200,260 L220,290 L230,275 L245,295 L200,260 Z" fill="url(#snow)"/><path d="M370,200 L395,238 L410,218 L425,242 L370,200 Z" fill="url(#snow)"/><path d="M700,180 L728,222 L742,200 L758,228 L700,180 Z" fill="url(#snow)"/><path d="M1200,160 L1228,205 L1242,183 L1258,210 L1200,160 Z" fill="url(#snow)"/><path d="M0,460 L80,370 L160,410 L240,310 L340,380 L420,280 L520,360 L600,290 L680,340 L760,250 L850,330 L940,260 L1040,340 L1130,270 L1220,350 L1310,280 L1390,330 L1440,300 L1440,500 L0,500 Z" fill="url(#mm)" opacity=".8"/><path d="M240,310 L262,345 L275,325 L288,348 L240,310 Z" fill="url(#snow)" opacity=".7"/><path d="M420,280 L446,318 L460,298 L474,322 L420,280 Z" fill="url(#snow)" opacity=".7"/><path d="M760,250 L788,292 L803,270 L818,296 L760,250 Z" fill="url(#snow)" opacity=".7"/><path d="M0,490 L100,400 L190,440 L280,360 L380,415 L470,330 L570,395 L660,325 L760,385 L860,310 L960,375 L1060,300 L1160,370 L1260,305 L1360,365 L1440,340 L1440,500 L0,500 Z" fill="url(#mn)"/><path d="M280,360 L300,390 L312,374 L324,393 L280,360 Z" fill="url(#snow)" opacity=".5"/><path d="M470,330 L492,364 L505,346 L518,368 L470,330 Z" fill="url(#snow)" opacity=".5"/><path d="M0,500 L0,455 L80,430 L170,460 L260,420 L360,448 L460,415 L560,445 L660,410 L760,440 L860,408 L960,438 L1060,412 L1160,442 L1260,418 L1360,445 L1440,425 L1440,500 Z" fill="url(#mfg)"/><g fill="#050202" opacity=".9"><polygon points="40,455 50,430 60,455"/><polygon points="55,458 67,428 79,458"/><polygon points="72,456 83,432 94,456"/><polygon points="300,448 312,420 324,448"/><polygon points="318,450 330,424 342,450"/><polygon points="640,445 653,415 666,445"/><polygon points="660,447 673,419 686,447"/><polygon points="940,440 953,412 966,440"/><polygon points="958,442 971,416 984,442"/><polygon points="1250,445 1262,418 1274,445"/><polygon points="1268,447 1280,421 1292,447"/><polygon points="1380,450 1392,422 1404,450"/></g><ellipse cx="720" cy="480" rx="280" ry="30" fill="rgba(155,28,28,.18)" opacity=".6"/><ellipse cx="720" cy="490" rx="180" ry="16" fill="rgba(212,175,55,.08)" opacity=".5"/></svg>';
