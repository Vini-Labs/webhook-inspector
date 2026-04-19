let CHANNEL = null;
let requests = [], selected = null, currentTab = 'body';
let currentFilter = 'ALL';

function startChannel() {
  const input = document.getElementById('channel-input');
  const value = input.value.trim();

  if (!value) {
    input.focus();
    return;
  }

  CHANNEL = value;

  document.getElementById('channel-screen').style.display = 'none';
  const main = document.getElementById('main');
  main.style.display = 'flex';

  document.getElementById('hook-url').textContent = `http://localhost:8080/hook/${CHANNEL}`;

  carregarHistorico();
  conectarWebSocket();
}

// Permite entrar com Enter
document.getElementById('channel-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') startChannel();
});

function setFilter(method, el) {
  currentFilter = method;
  document.querySelectorAll('.filter').forEach(f => f.classList.remove('active'));
  el.classList.add('active');
  renderList();
}

function formatTime(dt) {
  return new Date(dt).toLocaleTimeString('pt-BR');
}

function syntaxHL(json) {
  try {
    const str = JSON.stringify(typeof json === 'string' ? JSON.parse(json) : json, null, 2);
    return str.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, m => {
      if (/^"/.test(m)) return /:$/.test(m) ? `<span class="json-key">${m}</span>` : `<span class="json-str">${m}</span>`;
      return `<span class="json-num">${m}</span>`;
    });
  } catch {
    return json || '<span style="color:#555">vazio</span>';
  }
}

function renderList() {
  document.getElementById('count').textContent = requests.length;
  const list = document.getElementById('list');

  const filtered = currentFilter === 'ALL'
    ? requests
    : requests.filter(r => r.method === currentFilter);

  if (!filtered.length) {
    list.innerHTML = '<div class="empty">nenhuma requisição encontrada</div>';
    return;
  }

  list.innerHTML = filtered.map((r, i) => `
    <div class="item ${selected === i ? 'active' : ''} ${i === 0 ? 'new' : ''}" onclick="selectReq(${i})">
      <div class="item-top">
        <span class="method ${r.method}">${r.method}</span>
        <span class="item-time">${formatTime(r.receivedAt)}</span>
      </div>
      <div class="item-id">#${r.id} · ${r.sourceIp}</div>
    </div>
  `).join('');
}

function selectReq(i) {
  selected = i;
  renderList();
  const r = requests[i];

  document.getElementById('detail-header').innerHTML = `
    <span class="method ${r.method}" style="font-size:11px">${r.method}</span>
    <span style="font-size:13px;color:#ccc">/hook/${r.channelId}</span>
    <span style="font-size:11px;color:#555;margin-left:auto">${r.sourceIp}</span>
  `;

  document.getElementById('tabs').style.display = 'flex';
  renderTab(r);
}

function switchTab(tab, el) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  if (selected !== null) renderTab(requests[selected]);
}

function renderTab(r) {
  document.getElementById('content').innerHTML =
    `<pre>${syntaxHL(currentTab === 'body' ? r.body : r.headers)}</pre>`;
}

function copyContent() {
  if (selected === null) return;
  const r = requests[selected];
  const content = currentTab === 'body' ? r.body : r.headers;

  try {
    const formatted = JSON.stringify(JSON.parse(content), null, 2);
    navigator.clipboard.writeText(formatted);
  } catch {
    navigator.clipboard.writeText(content || '');
  }

  const btn = document.getElementById('copy-btn');
  btn.textContent = 'copiado!';
  btn.classList.add('copied');
  setTimeout(() => {
    btn.textContent = 'copiar';
    btn.classList.remove('copied');
  }, 2000);
}

function carregarHistorico() {
  fetch(`/hook/${CHANNEL}/requests`)
    .then(r => r.json())
    .then(data => {
      requests = data;
      renderList();
      if (data.length) selectReq(0);
    });
}

function conectarWebSocket() {
  const socket = new SockJS('/ws');
  const stomp = Stomp.over(socket);
  stomp.debug = null;

  stomp.connect({}, () => {
    document.getElementById('conn-status').textContent = `conectado · canal ${CHANNEL}`;

    stomp.subscribe(`/topic/hooks/${CHANNEL}`, msg => {
      requests.unshift(JSON.parse(msg.body));
      renderList();
      selectReq(0);
    });

  }, () => {
    document.getElementById('conn-status').textContent = 'desconectado';
    document.querySelector('.dot').style.background = '#E24B4A';
  });
}