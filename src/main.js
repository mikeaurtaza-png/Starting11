const offensePositions = ['QB', 'RB', 'WR (X)', 'WR (Z)', 'Slot WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT'];
const defensePositions = ['LDE', 'DT 1', 'DT 2', 'RDE', 'SAM', 'MIKE', 'WILL', 'CB 1', 'CB 2', 'FS', 'SS'];
const dataVersion = `${window.ROSTER_DATA_VERSION || 'embedded-v1'}-studio-v13`;

const defaultPlayers = (window.ROSTER_DATA || []).map(player => ({ ...player }));

const defaultLineups = {
  offense: {
    title: 'San Francisco 49ers Projected Starting Offense',
    slots: { QB: 'brock-purdy', RB: 'christian-mccaffrey', 'WR (X)': 'mike-evans', 'WR (Z)': 'ricky-pearsall', 'Slot WR': 'christian-kirk', TE: 'george-kittle', LT: 'trent-williams', LG: 'robert-jones', C: 'jake-brendel', RG: 'dominick-puni', RT: 'colton-mckivitz' },
    hidden: {},
    offsets: {}
  },
  defense: {
    title: 'San Francisco 49ers Projected Starting Defense',
    slots: { LDE: 'nick-bosa', 'DT 1': 'osa-odighizuwa', 'DT 2': 'c-j-west', RDE: 'mykel-williams', SAM: 'dre-greenlaw', MIKE: 'fred-warner', WILL: 'nick-martin', 'CB 1': 'deommodore-lenoir', 'CB 2': 'renardo-green', FS: 'ji-ayir-brown', SS: 'malik-mustapha' },
    hidden: {},
    offsets: {}
  }
};

const formation = {
  offense: {
    LT: [25, 26], LG: [37.5, 26], C: [50, 26], RG: [62.5, 26], RT: [75, 26], TE: [88, 28],
    'WR (X)': [10, 54], QB: [50, 53], 'WR (Z)': [90, 54], 'Slot WR': [73, 79], RB: [50, 80]
  },
  defense: {
    LDE: [23, 26], 'DT 1': [41, 26], 'DT 2': [59, 26], RDE: [77, 26],
    SAM: [30, 53], MIKE: [50, 53], WILL: [70, 53], 'CB 1': [10, 66], 'CB 2': [90, 66], FS: [37, 81], SS: [63, 81]
  }
};

let state = loadState();
const params = new URLSearchParams(location.search);
const fixedView = params.get('view');

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem('lineupStudio49ers'));
    if (stored?.dataVersion === dataVersion) return stored;
  } catch {}
  return structuredClone({ dataVersion, sourceNote: window.ROSTER_SOURCE_NOTE || '', players: defaultPlayers, lineups: defaultLineups, activeSide: 'offense', selectedSlot: 'QB' });
}

function saveState() {
  localStorage.setItem('lineupStudio49ers', JSON.stringify(state));
}

function playerById(id) {
  return state.players.find(player => player.id === id);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

function icon(name, size = 16) {
  const icons = {
    save: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z M17 21v-8H7v8 M7 3v5h8',
    download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
    reset: 'M3 12a9 9 0 1 0 3-6.7L3 8 M3 3v5h5',
    search: 'M21 21l-4.3-4.3 M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z',
    eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    eyeOff: 'M3 3l18 18 M10.6 10.6a2 2 0 0 0 2.8 2.8 M9.9 4.2A10.6 10.6 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-2.1 3.3 M6.6 6.6C3.7 8.6 2 12 2 12s3.5 8 10 8c1.5 0 2.9-.4 4.1-1',
    switch: 'M17 3l4 4-4 4 M3 7h18 M7 21l-4-4 4-4 M21 17H3',
    trash: 'M3 6h18 M8 6V4h8v2 M6 6l1 15h10l1-15',
    monitor: 'M3 4h18v12H3z M8 20h8 M12 16v4',
    roster: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8',
    chevron: 'M9 18l6-6-6-6',
    spark: 'M12 3l1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z',
    arrowUp: 'M12 19V5 M5 12l7-7 7 7',
    arrowDown: 'M12 5v14 M19 12l-7 7-7-7',
    arrowLeft: 'M19 12H5 M12 19l-7-7 7-7',
    arrowRight: 'M5 12h14 M12 5l7 7-7 7',
    external: 'M14 3h7v7 M10 14L21 3 M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5'
  };
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${icons[name]}"/></svg>`;
}

function cardHtml(player, slot, hidden) {
  if (!player || hidden) return '';
  const initials = player.name.split(' ').map(part => part[0]).join('').slice(0, 2);
  const photo = player.photo ? escapeHtml(player.photo) : '';
  return `<article class="player-card">
    <div class="portrait"><span>${escapeHtml(initials)}</span>${photo ? `<img class="portrait-main" src="${photo}" alt="${escapeHtml(player.name)}" loading="eager" decoding="async" onerror="this.remove()">` : ''}</div>
    <div class="card-copy">
      <div class="slot-row"><span class="slot">${escapeHtml(slot.replace(/\s\d$/, ''))}</span><b class="jersey-badge">${escapeHtml(player.number || '--')}</b></div>
      <h3>${escapeHtml(player.name)}</h3>
      <div class="meta"><strong>${escapeHtml(player.position)}</strong><span>${escapeHtml(player.height)} · ${escapeHtml(player.weight)}</span><span>${escapeHtml(player.exp)} YR</span></div>
      ${player.status && player.status !== 'Active' ? `<div class="status-chip">${escapeHtml(player.status)}</div>` : ''}
    </div>
  </article>`;
}

function fieldHtml(side) {
  const lineup = state.lineups[side];
  const slots = side === 'offense' ? offensePositions : defensePositions;
  const sideLabel = side === 'offense' ? 'Offense' : 'Defense';
  const yardNumbers = [['30', 10], ['40', 30], ['50', 50], ['40', 70], ['30', 90]]
    .map(([number, x]) => `<span class="yard-number" style="left:${x}%"><b>${number[0]}</b><b>${number[1]}</b></span>`).join('');
  const lineupLabel = lineup.title.replace(/^San Francisco 49ers\s+/i, '').replace(/^Projected\s+/i, '').replace(/^Starting\s+/i, '').trim() || sideLabel;
  const cards = slots.map((slot, index) => {
    const [x, y] = formation[side][slot];
    const offset = lineup.offsets[slot] || { x: 0, y: 0 };
    const player = playerById(lineup.slots[slot]);
    return `<div class="card-position slot-${slot.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" style="--x:${x};--y:${y};--enter-index:${index};left:calc(${x}% + ${offset.x || 0}px);top:calc(${y}% + ${offset.y || 0}px);z-index:${Math.round(20 + y)}">${cardHtml(player, slot, lineup.hidden[slot])}</div>`;
  }).join('');
  return `<section class="presentation ${side}" id="presentation" aria-label="San Francisco 49ers projected starting ${sideLabel.toLowerCase()}">
    ${fixedView ? '<a class="presentation-back" href="index.html">← Studio</a>' : ''}
    <div class="stadium"><div class="stadium-glow"></div></div>
    <div class="broadcast-bar">
      <div class="team-title"><span>San Francisco 49ers · 2026</span><h1>${escapeHtml(lineupLabel)}</h1></div>
      <img class="sf-mark" src="src/assets/49ers-logo.svg" alt="49ers">
      <div class="broadcast-title"><span>Starting lineup</span><h2>${sideLabel}</h2><small>Projected depth chart</small></div>
    </div>
    <div class="field">
      <div class="field-lighting"></div><div class="field-grain"></div>
      <div class="numbers top">${yardNumbers}</div><div class="numbers bottom">${yardNumbers}</div>
      <img class="midfield-logo" src="src/assets/49ers-logo.svg" alt="">
      ${cards}
    </div>
    <div class="broadcast-footer"><span>STARTING 11</span><i></i><span>${sideLabel.toUpperCase()}</span><b>SF</b></div>
  </section>`;
}

function playerPortrait(player, className = '') {
  const initials = player.name.split(' ').map(part => part[0]).join('').slice(0, 2);
  return `<span class="${className}"><span>${escapeHtml(initials)}</span>${player.photo ? `<img src="${escapeHtml(player.photo)}" alt="${escapeHtml(player.name)}" onerror="this.remove()">` : ''}</span>`;
}

function producerHtml() {
  const side = state.activeSide;
  const lineup = state.lineups[side];
  const slots = side === 'offense' ? offensePositions : defensePositions;
  const selected = slots.includes(state.selectedSlot) ? state.selectedSlot : slots[0];
  state.selectedSlot = selected;
  const selectedPlayer = playerById(lineup.slots[selected]) || state.players[0];
  const positions = ['ALL', ...new Set(state.players.map(player => player.position).filter(Boolean).sort())];
  const visibleCount = slots.filter(slot => !lineup.hidden[slot] && lineup.slots[slot]).length;
  return `<main class="app-shell">
    <header class="app-header">
      <div class="brand-lockup"><span class="brand-mark"><img src="src/assets/49ers-logo.svg" alt=""></span><div><b>STARTING<span>11</span></b><small>Broadcast lineup studio</small></div></div>
      <div class="live-state"><i></i><span>Local production</span><b>Autosaved</b></div>
      <div class="header-actions"><a href="?view=${side}" target="_blank">${icon('external')} Open live screen</a><button class="primary" data-action="export-1920">${icon('download')} Export 1080p</button></div>
    </header>

    <aside class="lineup-panel panel">
      <div class="panel-heading"><div><span>01</span><p>Lineup</p></div><strong>${visibleCount}/11</strong></div>
      <div class="side-switch" role="tablist" aria-label="Lineup side"><button data-side="offense" class="${side === 'offense' ? 'active' : ''}">Offense</button><button data-side="defense" class="${side === 'defense' ? 'active' : ''}">Defense</button></div>
      <label class="field-label" for="lineup-title">Presentation title</label><input id="lineup-title" data-title value="${escapeHtml(lineup.title)}">
      <div class="slots-heading"><span>Formation</span><small>Select a position to edit</small></div>
      <div class="slot-list">${slots.map((slot, index) => {
        const player = playerById(lineup.slots[slot]);
        return `<button data-slot="${escapeHtml(slot)}" class="${slot === selected ? 'active' : ''} ${lineup.hidden[slot] ? 'muted' : ''}"><span class="slot-index">${String(index + 1).padStart(2, '0')}</span><span class="slot-code">${escapeHtml(slot.replace(/\s\d$/, ''))}</span><span class="slot-player"><b>${escapeHtml(player?.name || 'Open slot')}</b><small>${player ? `#${escapeHtml(player.number || '--')} · ${escapeHtml(player.position)}` : 'Choose player'}</small></span>${lineup.hidden[slot] ? icon('eyeOff') : icon('chevron')}</button>`;
      }).join('')}</div>
      <div class="lineup-tools"><button data-action="reset">${icon('reset')} Reset side</button><button data-action="clear">${icon('trash')} Clear studio</button></div>
    </aside>

    <section class="stage-shell">
      <div class="stage-toolbar"><div><span class="eyebrow">Live canvas</span><h1>${side === 'offense' ? 'Offensive' : 'Defensive'} Starting 11</h1></div><div class="canvas-actions"><span><i></i> 16:9 · 1920 × 1080</span><button data-action="switch-side">${icon('switch')} Flip side</button></div></div>
      <div class="stage-wrap"><div class="preview-frame">${fieldHtml(side)}</div><div class="stage-aura"></div></div>
      <div class="stage-footer"><div><span class="key">↑</span><span class="key">↓</span><span class="key">←</span><span class="key">→</span><small>Nudge selected card</small></div><div><span>${visibleCount} visible</span><i></i><span>${state.players.length} roster players</span></div></div>
    </section>

    <aside class="inspector-panel panel">
      <div class="panel-heading"><div><span>02</span><p>Player inspector</p></div><span class="selected-position">${escapeHtml(selected)}</span></div>
      <div class="player-hero">${playerPortrait(selectedPlayer, 'hero-photo')}<div class="hero-copy"><span>#${escapeHtml(selectedPlayer.number || '--')} · ${escapeHtml(selectedPlayer.position)}</span><h2>${escapeHtml(selectedPlayer.name)}</h2><p>${escapeHtml(selectedPlayer.college || 'San Francisco 49ers')}</p></div></div>
      <div class="quick-controls"><button data-action="toggle-hidden">${lineup.hidden[selected] ? icon('eye') + ' Show card' : icon('eyeOff') + ' Hide card'}</button><div class="nudge-grid" aria-label="Card position"><button data-nudge="0,-8" title="Move up">${icon('arrowUp')}</button><button data-nudge="-8,0" title="Move left">${icon('arrowLeft')}</button><button data-nudge="0,8" title="Move down">${icon('arrowDown')}</button><button data-nudge="8,0" title="Move right">${icon('arrowRight')}</button></div></div>
      <details class="edit-details"><summary>Edit player details <span>${icon('chevron')}</span></summary><div class="edit-grid">
        ${['name', 'number', 'position', 'height', 'weight', 'photo'].map(field => `<label class="${field === 'photo' ? 'wide' : ''}"><span>${field === 'photo' ? 'Headshot URL' : field}</span><input data-player-field="${field}" value="${escapeHtml(selectedPlayer[field])}"></label>`).join('')}
        <div class="photo-source wide"><small>${escapeHtml(selectedPlayer.photoSource || 'Manual image')}</small><div>${selectedPlayer.photoNflverseCached || selectedPlayer.nflverse?.headshot_url ? '<button data-photo-source="nflverse">NFL source</button>' : ''}${selectedPlayer.photoClub ? '<button data-photo-source="club">49ers source</button>' : ''}</div></div>
      </div></details>
      <div class="roster-heading"><div><span>03</span><p>Roster library</p></div><b id="roster-count">${state.players.length}</b></div>
      <div class="searchbox">${icon('search')}<input data-search aria-label="Search roster" placeholder="Search players…"><kbd>⌘ K</kbd></div>
      <div class="filter-row"><select data-filter aria-label="Filter position">${positions.map(pos => `<option>${escapeHtml(pos)}</option>`).join('')}</select><select data-status-filter aria-label="Filter status"><option>ALL STATUS</option><option>Active</option><option>Reserve/Injured</option><option>Reserve/Left Squad</option></select></div>
      <div class="library" id="library"></div>
      <div class="inspector-actions"><button data-action="save">${icon('save')} Save state</button><button data-action="export-3840">${icon('spark')} Export 4K</button></div>
    </aside>
    <div class="toast" role="status" aria-live="polite"></div>
  </main>`;
}

function render() {
  const view = fixedView === 'offense' || fixedView === 'defense' ? fixedView : null;
  document.body.classList.toggle('presentation-mode', Boolean(view));
  document.body.classList.toggle('studio-mode', !view);
  document.getElementById('root').innerHTML = view ? fieldHtml(view) : producerHtml();
  if (!view) bindProducer();
}

function updatePreview() {
  const preview = document.querySelector('.preview-frame');
  if (preview) preview.innerHTML = fieldHtml(state.activeSide);
}

function showToast(message) {
  const toast = document.querySelector('.toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function nudgeSelected(dx, dy) {
  const lineup = state.lineups[state.activeSide];
  const current = lineup.offsets[state.selectedSlot] || { x: 0, y: 0 };
  lineup.offsets[state.selectedSlot] = { x: current.x + dx, y: current.y + dy };
  saveState();
  updatePreview();
}

function bindProducer() {
  document.querySelectorAll('[data-slot]').forEach(button => button.addEventListener('click', () => {
    state.selectedSlot = button.dataset.slot;
    saveState();
    render();
  }));
  document.querySelectorAll('[data-side]').forEach(button => button.addEventListener('click', () => {
    state.activeSide = button.dataset.side;
    state.selectedSlot = state.activeSide === 'offense' ? 'QB' : 'LDE';
    saveState();
    render();
  }));
  document.querySelectorAll('[data-action="switch-side"]').forEach(button => button.addEventListener('click', () => {
    state.activeSide = state.activeSide === 'offense' ? 'defense' : 'offense';
    state.selectedSlot = state.activeSide === 'offense' ? 'QB' : 'LDE';
    saveState();
    render();
  }));
  document.querySelector('[data-title]').addEventListener('input', event => {
    state.lineups[state.activeSide].title = event.target.value;
    saveState();
    updatePreview();
  });
  document.querySelectorAll('[data-player-field]').forEach(input => input.addEventListener('input', event => {
    const player = playerById(state.lineups[state.activeSide].slots[state.selectedSlot]);
    player[event.target.dataset.playerField] = event.target.value;
    if (event.target.dataset.playerField === 'photo') player.photoSource = 'Manual';
    saveState();
    updatePreview();
  }));
  document.querySelectorAll('[data-photo-source]').forEach(button => button.addEventListener('click', () => {
    const player = playerById(state.lineups[state.activeSide].slots[state.selectedSlot]);
    if (button.dataset.photoSource === 'nflverse' && (player.photoDisplay || player.photoNflverseCached || player.nflverse?.headshot_url)) {
      player.photo = player.photoDisplay || player.photoNflverseCached || player.nflverse.headshot_url;
      player.photoSource = player.photoDisplay ? 'NFLVerse / NFL.com local cutout' : 'NFLVerse / NFL.com';
    }
    if (button.dataset.photoSource === 'club' && player.photoClub) {
      player.photo = player.photoClub;
      player.photoSource = '49ers.com';
    }
    saveState();
    render();
  }));
  document.querySelectorAll('[data-nudge]').forEach(button => button.addEventListener('click', () => {
    const [dx, dy] = button.dataset.nudge.split(',').map(Number);
    nudgeSelected(dx, dy);
  }));
  document.querySelector('[data-action="toggle-hidden"]').addEventListener('click', () => {
    const lineup = state.lineups[state.activeSide];
    lineup.hidden[state.selectedSlot] = !lineup.hidden[state.selectedSlot];
    saveState();
    render();
  });
  document.querySelector('[data-action="save"]').addEventListener('click', () => { saveState(); showToast('Lineup saved'); });
  document.querySelector('[data-action="reset"]').addEventListener('click', () => {
    if (!confirm(`Reset the ${state.activeSide} lineup to its default?`)) return;
    state.lineups[state.activeSide] = structuredClone(defaultLineups[state.activeSide]);
    saveState(); render();
  });
  document.querySelector('[data-action="clear"]').addEventListener('click', () => {
    if (!confirm('Clear all local lineup edits and restore both sides?')) return;
    localStorage.removeItem('lineupStudio49ers');
    state = loadState(); render();
  });
  document.querySelectorAll('[data-action="export-1920"]').forEach(button => button.addEventListener('click', () => exportPng(1920, 1080)));
  document.querySelectorAll('[data-action="export-3840"]').forEach(button => button.addEventListener('click', () => exportPng(3840, 2160)));
  document.querySelector('[data-search]').addEventListener('input', renderLibrary);
  document.querySelector('[data-filter]').addEventListener('change', renderLibrary);
  document.querySelector('[data-status-filter]').addEventListener('change', renderLibrary);
  renderLibrary();
}

function renderLibrary() {
  const search = document.querySelector('[data-search]');
  if (!search) return;
  const query = search.value.toLowerCase().trim();
  const filter = document.querySelector('[data-filter]').value;
  const statusFilter = document.querySelector('[data-status-filter]').value;
  const lineup = state.lineups[state.activeSide];
  const players = state.players.filter(player => (filter === 'ALL' || player.position === filter) && (statusFilter === 'ALL STATUS' || player.status === statusFilter) && player.name.toLowerCase().includes(query));
  document.getElementById('roster-count').textContent = players.length;
  document.getElementById('library').innerHTML = players.length ? players.map(player => `<button data-player="${player.id}" class="${lineup.slots[state.selectedSlot] === player.id ? 'picked' : ''}">
    ${playerPortrait(player, 'library-photo')}<span class="library-copy"><strong>${escapeHtml(player.name)}</strong><em>#${escapeHtml(player.number || '--')} · ${escapeHtml(player.position)} · ${escapeHtml(player.exp)} YR</em></span><small>${player.status === 'Active' ? 'ACTIVE' : escapeHtml(player.status || 'ACTIVE')}</small>
  </button>`).join('') : '<div class="empty-roster"><b>No players found</b><span>Try a different name or filter.</span></div>';
  document.querySelectorAll('[data-player]').forEach(button => button.addEventListener('click', () => {
    lineup.slots[state.selectedSlot] = button.dataset.player;
    lineup.hidden[state.selectedSlot] = false;
    saveState(); render();
  }));
}

async function exportPng(width, height) {
  showToast(`Preparing ${width === 3840 ? '4K' : '1080p'} export…`);
  const css = Array.from(document.styleSheets).map(sheet => {
    try { return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n'); } catch { return ''; }
  }).join('\n');
  const markup = fieldHtml(state.activeSide).replace(/class="presentation ([^"]+)"/, 'class="presentation $1 export-presentation"');
  const html = `<html xmlns="http://www.w3.org/1999/xhtml"><head><style>${css}.export-presentation{width:${width}px!important;height:${height}px!important;min-height:0}</style></head><body>${markup}</body></html>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${html}</foreignObject></svg>`;
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    canvas.getContext('2d').drawImage(img, 0, 0);
    const link = document.createElement('a');
    link.download = `49ers-${state.activeSide}-starting-11-${width}x${height}.png`;
    link.href = canvas.toDataURL('image/png'); link.click();
    URL.revokeObjectURL(img.src);
    showToast('Export downloaded');
  };
  img.onerror = () => showToast('Export could not be created');
  img.src = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
}

window.addEventListener('keydown', event => {
  if (!document.body.classList.contains('studio-mode')) return;
  const typing = /INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName);
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault(); document.querySelector('[data-search]')?.focus(); return;
  }
  if (typing) return;
  const arrows = { ArrowUp: [0, -8], ArrowDown: [0, 8], ArrowLeft: [-8, 0], ArrowRight: [8, 0] };
  if (arrows[event.key]) { event.preventDefault(); nudgeSelected(...arrows[event.key]); }
});

window.addEventListener('storage', () => { state = loadState(); render(); });

if (fixedView === 'offense' || fixedView === 'defense') {
  let lastSnapshot = localStorage.getItem('lineupStudio49ers') || '';
  setInterval(() => {
    const nextSnapshot = localStorage.getItem('lineupStudio49ers') || '';
    if (nextSnapshot !== lastSnapshot) { lastSnapshot = nextSnapshot; state = loadState(); render(); }
  }, 600);
  window.addEventListener('keydown', event => { if (event.key === 'Escape') window.location.href = 'index.html'; });
}

render();
