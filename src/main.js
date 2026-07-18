const offensePositions = ['QB', 'RB', 'WR (X)', 'WR (Z)', 'Slot WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT'];
const defensePositions = ['LDE', 'DT 1', 'DT 2', 'RDE', 'SAM', 'MIKE', 'WILL', 'CB 1', 'CB 2', 'FS', 'SS'];
const dataVersion = `${window.ROSTER_DATA_VERSION || 'embedded-v1'}-broadcast-v12`;

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

function icon(name) {
  const icons = {
    save: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z M17 21v-8H7v8 M7 3v5h8',
    download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
    reset: 'M3 12a9 9 0 1 0 3-6.7L3 8 M3 3v5h5',
    search: 'M21 21l-4.3-4.3 M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z',
    eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    switch: 'M16 3h5v5 M4 20l17-17 M21 16v5h-5 M15 15l6 6 M4 4l5 5',
    trash: 'M3 6h18 M8 6V4h8v2 M6 6l1 15h10l1-15'
  };
  return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${icons[name]}"/></svg>`;
}

function cardHtml(player, slot, hidden) {
  if (!player || hidden) return '';
  const initials = player.name.split(' ').map(part => part[0]).join('').slice(0, 2);
  const photo = player.photo ? escapeHtml(player.photo) : '';
  const portrait = `<span>${escapeHtml(initials)}</span>${photo ? `<img class="portrait-main" src="${photo}" alt="${escapeHtml(player.name)}" loading="eager" decoding="async" onerror="this.remove()">` : ''}`;
  return `<article class="player-card">
    <div class="portrait">${portrait}</div>
    <div class="card-copy">
      <div class="slot-row"><span class="slot">${escapeHtml(slot.replace(/\s\d$/, ''))}</span><b class="jersey-badge">#${escapeHtml(player.number || '--')}</b></div>
      <h3>${escapeHtml(player.name)}</h3>
      <div class="meta"><strong>${escapeHtml(player.position)}</strong><span>${escapeHtml(player.height)} / ${escapeHtml(player.weight)}</span><span>${escapeHtml(player.exp)} YRS</span></div>
      ${player.status && player.status !== 'Active' ? `<div class="status-chip">${escapeHtml(player.status)}</div>` : ''}
    </div>
  </article>`;
}

function fieldHtml(side) {
  const lineup = state.lineups[side];
  const slots = side === 'offense' ? offensePositions : defensePositions;
  const sideLabel = side === 'offense' ? 'Offense' : 'Defense';
  const yardNumbers = [['30', 10], ['40', 30], ['50', 50], ['40', 70], ['30', 90]]
    .map(([number, x]) => `<span class="yard-number" style="left:${x}%"><b>${number[0]}</b><b>${number[1]}</b></span>`)
    .join('');
  const lineupLabel = lineup.title
    .replace(/^San Francisco 49ers\s+/i, '')
    .replace(/^Projected\s+/i, '')
    .replace(/^Starting\s+/i, '')
    .trim() || sideLabel;
  const cards = slots.map(slot => {
    const [x, y] = formation[side][slot];
    const offset = lineup.offsets[slot] || { x: 0, y: 0 };
    const player = playerById(lineup.slots[slot]);
    return `<div class="card-position slot-${slot.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" style="--x:${x};--y:${y};--enter-index:${slots.indexOf(slot)};left:calc(${x}% + ${offset.x || 0}px);top:calc(${y}% + ${offset.y || 0}px);z-index:${Math.round(20 + y)}">${cardHtml(player, slot, lineup.hidden[slot])}</div>`;
  }).join('');
  return `<section class="presentation ${side}" id="presentation" aria-label="San Francisco 49ers projected starting ${sideLabel.toLowerCase()}">
    ${fixedView === 'offense' || fixedView === 'defense' ? '<a class="presentation-back" href="index.html">Back to Studio</a>' : ''}
    <div class="stadium"></div>
    <div class="broadcast-bar">
      <div class="team-title"><span>San Francisco</span><h1>49ers ${escapeHtml(lineupLabel)}</h1></div>
      <img class="sf-mark" src="src/assets/49ers-logo.svg" alt="49ers">
      <div class="broadcast-title"><span>Projected</span><h2>Starting 11</h2></div>
    </div>
    <div class="field">
      <div class="field-lighting"></div>
      <div class="yard-lines">${Array.from({ length: 11 }, (_, i) => `<i style="left:${i * 10}%"></i>`).join('')}</div>
      <div class="numbers top">${yardNumbers}</div>
      <div class="numbers bottom">${yardNumbers}</div>
      <img class="midfield-logo" src="src/assets/49ers-logo.svg" alt="">
      <div class="hashes top-hashes">${Array.from({ length: 42 }, () => '<b></b>').join('')}</div>
      <div class="hashes bottom-hashes">${Array.from({ length: 42 }, () => '<b></b>').join('')}</div>
      ${cards}
    </div>
  </section>`;
}

function producerHtml() {
  const side = state.activeSide;
  const lineup = state.lineups[side];
  const slots = side === 'offense' ? offensePositions : defensePositions;
  const selected = state.selectedSlot;
  const selectedPlayer = playerById(lineup.slots[selected]) || state.players[0];
  const positions = ['ALL', ...new Set(state.players.map(player => player.position).sort())];
  const sourceNote = state.sourceNote || window.ROSTER_SOURCE_NOTE || '';
  return `<main class="app-shell">
    <aside class="producer">
      <div class="producer-head"><div><p>Producer Studio</p><h2>49ers Lineup Control</h2></div><button data-action="switch-side">${side === 'offense' ? 'Defense' : 'Offense'}</button></div>
      <div class="control-card"><label>Presentation title</label><input data-title value="${escapeHtml(lineup.title)}"></div>
      <div class="slot-grid">${slots.map(slot => `<button data-slot="${escapeHtml(slot)}" class="${slot === selected ? 'active' : ''}"><span>${escapeHtml(slot.replace(/\s\d$/, ''))}</span><small>${escapeHtml(playerById(lineup.slots[slot])?.name || 'Open')}</small></button>`).join('')}</div>
      <div class="control-card"><div class="mini-toolbar">
        <button data-action="toggle-hidden">${icon('eye')} ${lineup.hidden[selected] ? 'Show' : 'Hide'}</button><button data-nudge="-8,0">Left</button><button data-nudge="8,0">Right</button><button data-nudge="0,-8">Up</button><button data-nudge="0,8">Down</button>
      </div></div>
      <div class="control-card editor"><h3>Edit selected player</h3>
        ${['name', 'number', 'position', 'height', 'weight', 'photo'].map(field => `<input data-player-field="${field}" placeholder="${field === 'photo' ? 'Headshot URL' : field}" value="${escapeHtml(selectedPlayer[field])}">`).join('')}
        <div class="photo-tools">
          <small>Photo source: ${escapeHtml(selectedPlayer.photoSource || (selectedPlayer.photo ? '49ers.com' : 'Manual'))}</small>
          <div>
            ${selectedPlayer.photoNflverseCached || selectedPlayer.nflverse?.headshot_url ? `<button data-photo-source="nflverse">Use NFLVerse</button>` : ''}
            ${selectedPlayer.photoClub ? `<button data-photo-source="club">Use 49ers.com</button>` : ''}
          </div>
        </div>
      </div>
      <div class="control-card roster-card"><div class="searchbox">${icon('search')}<input data-search placeholder="Search official roster"></div><div class="filter-row"><select data-filter>${positions.map(pos => `<option>${escapeHtml(pos)}</option>`).join('')}</select><select data-status-filter><option>ALL STATUS</option><option>Active</option><option>Reserve/Injured</option><option>Reserve/Left Squad</option></select></div><p class="source-note">${escapeHtml(sourceNote)}</p><div class="library" id="library"></div></div>
      <div class="actions"><button data-action="save">${icon('save')} Save</button><button data-action="export-1920">${icon('download')} PNG 1080</button><button data-action="export-3840">${icon('download')} PNG 4K</button><button data-action="reset">${icon('reset')} Reset</button><button data-action="clear">${icon('trash')} Clear cache</button></div>
    </aside>
    <div class="stage-shell"><div class="stage-links"><a href="?view=offense" target="_blank">Offense screen</a><a href="?view=defense" target="_blank">Defense screen</a><button data-action="switch-side">${icon('switch')} Switch preview</button></div><div class="preview-frame">${fieldHtml(side)}</div></div>
  </main>`;
}

function render() {
  const view = fixedView === 'offense' || fixedView === 'defense' ? fixedView : null;
  document.body.classList.toggle('presentation-mode', Boolean(view));
  document.body.classList.toggle('studio-mode', !view);
  document.getElementById('root').innerHTML = view ? fieldHtml(view) : producerHtml();
  if (!view) bindProducer();
}

function bindProducer() {
  document.querySelectorAll('[data-slot]').forEach(button => button.addEventListener('click', () => {
    state.selectedSlot = button.dataset.slot;
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
    document.querySelector('.preview-frame').innerHTML = fieldHtml(state.activeSide);
  });
  document.querySelectorAll('[data-player-field]').forEach(input => input.addEventListener('input', event => {
    const player = playerById(state.lineups[state.activeSide].slots[state.selectedSlot]);
    player[event.target.dataset.playerField] = event.target.value;
    if (event.target.dataset.playerField === 'photo') player.photoSource = 'Manual';
    saveState();
    document.querySelector('.preview-frame').innerHTML = fieldHtml(state.activeSide);
  }));
  document.querySelectorAll('[data-photo-source]').forEach(button => button.addEventListener('click', () => {
    const player = playerById(state.lineups[state.activeSide].slots[state.selectedSlot]);
    if (button.dataset.photoSource === 'nflverse' && (player.photoDisplay || player.photoNflverseCached || player.nflverse?.headshot_url)) {
      player.photo = player.photoDisplay || player.photoNflverseCached || player.nflverse.headshot_url;
      player.photoSource = player.photoDisplay ? 'NFLVerse / NFL.com high-quality local cutout' : (player.photoNflverseCached ? 'NFLVerse / NFL.com cached locally' : 'NFLVerse / NFL.com');
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
    const lineup = state.lineups[state.activeSide];
    const current = lineup.offsets[state.selectedSlot] || { x: 0, y: 0 };
    lineup.offsets[state.selectedSlot] = { x: current.x + dx, y: current.y + dy };
    saveState();
    document.querySelector('.preview-frame').innerHTML = fieldHtml(state.activeSide);
  }));
  document.querySelector('[data-action="toggle-hidden"]').addEventListener('click', () => {
    const lineup = state.lineups[state.activeSide];
    lineup.hidden[state.selectedSlot] = !lineup.hidden[state.selectedSlot];
    saveState();
    render();
  });
  document.querySelector('[data-action="save"]').addEventListener('click', saveState);
  document.querySelector('[data-action="reset"]').addEventListener('click', () => {
    state.lineups[state.activeSide] = structuredClone(defaultLineups[state.activeSide]);
    saveState();
    render();
  });
  document.querySelector('[data-action="clear"]').addEventListener('click', () => {
    localStorage.removeItem('lineupStudio49ers');
    state = loadState();
    render();
  });
  document.querySelector('[data-action="export-1920"]').addEventListener('click', () => exportPng(1920, 1080));
  document.querySelector('[data-action="export-3840"]').addEventListener('click', () => exportPng(3840, 2160));
  document.querySelector('[data-search]').addEventListener('input', renderLibrary);
  document.querySelector('[data-filter]').addEventListener('change', renderLibrary);
  document.querySelector('[data-status-filter]').addEventListener('change', renderLibrary);
  renderLibrary();
}

function renderLibrary() {
  const query = document.querySelector('[data-search]').value.toLowerCase();
  const filter = document.querySelector('[data-filter]').value;
  const statusFilter = document.querySelector('[data-status-filter]').value;
  const lineup = state.lineups[state.activeSide];
  document.getElementById('library').innerHTML = state.players
    .filter(player => (filter === 'ALL' || player.position === filter) && (statusFilter === 'ALL STATUS' || player.status === statusFilter) && player.name.toLowerCase().includes(query))
    .map(player => {
      const initials = player.name.split(' ').map(part => part[0]).join('').slice(0, 2);
      return `<button data-player="${player.id}" class="${lineup.slots[state.selectedSlot] === player.id ? 'picked' : ''}">
        <span class="library-photo"><span>${escapeHtml(initials)}</span>${player.photo ? `<img src="${escapeHtml(player.photo)}" alt="" onerror="this.remove()">` : ''}</span>
        <span><strong>${escapeHtml(player.name)}</strong><em>#${escapeHtml(player.number || '--')} ${escapeHtml(player.position)}</em></span>
        <small>${escapeHtml(player.status || 'Active')}</small>
      </button>`;
    })
    .join('');
  document.querySelectorAll('[data-player]').forEach(button => button.addEventListener('click', () => {
    lineup.slots[state.selectedSlot] = button.dataset.player;
    lineup.hidden[state.selectedSlot] = false;
    saveState();
    render();
  }));
}

async function exportPng(width, height) {
  const css = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
      } catch {
        return '';
      }
    })
    .join('\n');
  const markup = fieldHtml(state.activeSide).replace('class="presentation"', 'class="presentation export-presentation"');
  const html = `<html xmlns="http://www.w3.org/1999/xhtml"><head><style>${css}.export-presentation{width:${width}px;height:${height}px;min-height:0}</style></head><body>${markup}</body></html>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${html}</foreignObject></svg>`;
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(img, 0, 0);
    const link = document.createElement('a');
    link.download = `49ers-${state.activeSide}-lineup-${width}x${height}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  img.src = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
}

window.addEventListener('storage', () => {
  state = loadState();
  render();
});

if (fixedView === 'offense' || fixedView === 'defense') {
  let lastSnapshot = localStorage.getItem('lineupStudio49ers') || '';
  setInterval(() => {
    const nextSnapshot = localStorage.getItem('lineupStudio49ers') || '';
    if (nextSnapshot !== lastSnapshot) {
      lastSnapshot = nextSnapshot;
      state = loadState();
      render();
    }
  }, 600);
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') window.location.href = 'index.html';
  });
}

render();
