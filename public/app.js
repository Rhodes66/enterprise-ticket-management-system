const state = {
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  tickets: [],
  technicians: [],
  selectedTicketId: null
};

const roleText = {
  employee: '员工 Employee',
  technician: '技术人员 Technician',
  admin: '管理员 Admin'
};

const statusText = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决',
  closed: '已关闭'
};

const priorityText = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急'
};

const categoryText = {
  account: '账号权限',
  hardware: '硬件设备',
  network: '网络问题',
  system: '业务系统',
  general: '其他问题'
};

function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return [...document.querySelectorAll(selector)];
}

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 2600);
}

async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || '请求失败');
  }
  return data;
}

function saveSession(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearSession() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function updateAuthView() {
  if (state.token && state.user) {
    $('#authPage').classList.add('hidden');
    $('#appPage').classList.remove('hidden');
    $('#currentUserName').textContent = state.user.name;
    $('#currentUserRole').textContent = roleText[state.user.role] || state.user.role;
    updateRoleVisibility();
    loadAll();
  } else {
    $('#authPage').classList.remove('hidden');
    $('#appPage').classList.add('hidden');
  }
}

function updateRoleVisibility() {
  const isAdmin = state.user?.role === 'admin';
  $all('.admin-only').forEach(el => el.classList.toggle('hidden', !isAdmin));
}

function switchView(viewName) {
  $all('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === viewName));
  $all('.view').forEach(view => view.classList.remove('active-view'));
  $(`#${viewName}View`).classList.add('active-view');
  $('#pageTitle').textContent = {
    overview: '数据看板',
    tickets: '工单列表',
    create: '创建工单',
    users: '用户管理'
  }[viewName];

  if (viewName === 'overview') loadDashboard();
  if (viewName === 'tickets') loadTickets();
  if (viewName === 'users') loadUsers();
}

function chartOrNull(id) {
  const el = document.getElementById(id);
  if (!el || typeof echarts === 'undefined') return null;
  return echarts.init(el);
}

function renderCharts(stats) {
  const statusChart = chartOrNull('statusChart');
  if (statusChart) {
    statusChart.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['45%', '70%'],
        data: stats.statusDistribution.map(item => ({ name: statusText[item.status] || item.status, value: item.count }))
      }]
    });
  }

  const priorityChart = chartOrNull('priorityChart');
  if (priorityChart) {
    priorityChart.setOption({
      tooltip: { trigger: 'item' },
      xAxis: { type: 'category', data: stats.priorityDistribution.map(item => priorityText[item.priority] || item.priority) },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: stats.priorityDistribution.map(item => item.count) }]
    });
  }

  const trendChart = chartOrNull('trendChart');
  if (trendChart) {
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: stats.trend.map(item => item.date) },
      yAxis: { type: 'value' },
      series: [{ type: 'line', smooth: true, data: stats.trend.map(item => item.count) }]
    });
  }

  const techChart = chartOrNull('techChart');
  if (techChart) {
    techChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: stats.technicianRanking.map(item => item.name) },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: stats.technicianRanking.map(item => item.count) }]
    });
  }
}

async function loadDashboard() {
  const stats = await api('/api/dashboard/stats');
  $('#statTotal').textContent = stats.cards.total;
  $('#statPending').textContent = stats.cards.pending;
  $('#statProcessing').textContent = stats.cards.processing;
  $('#statResolved').textContent = stats.cards.resolved;
  $('#statUrgent').textContent = stats.cards.urgent;
  setTimeout(() => renderCharts(stats), 50);
}

async function loadTickets() {
  const params = new URLSearchParams();
  if ($('#searchInput').value) params.set('search', $('#searchInput').value);
  if ($('#statusFilter').value) params.set('status', $('#statusFilter').value);
  if ($('#priorityFilter').value) params.set('priority', $('#priorityFilter').value);

  const data = await api(`/api/tickets?${params.toString()}`);
  state.tickets = data.tickets;
  renderTickets();
}

function renderTickets() {
  const body = $('#ticketTableBody');
  if (!state.tickets.length) {
    body.innerHTML = '<tr><td colspan="9">暂无工单数据</td></tr>';
    return;
  }

  body.innerHTML = state.tickets.map(ticket => `
    <tr>
      <td>#${ticket.id}</td>
      <td>${escapeHtml(ticket.title)}</td>
      <td>${categoryText[ticket.category] || ticket.category}</td>
      <td><span class="badge ${ticket.priority}">${priorityText[ticket.priority]}</span></td>
      <td><span class="badge ${ticket.status}">${statusText[ticket.status]}</span></td>
      <td>${escapeHtml(ticket.creator_name)}</td>
      <td>${escapeHtml(ticket.assignee_name || '未分配')}</td>
      <td>${ticket.updated_at}</td>
      <td><button class="mini-btn" onclick="openTicket(${ticket.id})">详情</button></td>
    </tr>
  `).join('');
}

async function loadTechnicians() {
  if (state.user.role !== 'admin' && state.user.role !== 'technician') return;
  try {
    const data = await api('/api/users/technicians');
    state.technicians = data.technicians;
  } catch (error) {
    state.technicians = [];
  }
}

async function openTicket(id) {
  state.selectedTicketId = id;
  await loadTechnicians();
  const data = await api(`/api/tickets/${id}`);
  renderTicketDetail(data.ticket, data.comments);
  $('#ticketModal').classList.remove('hidden');
}

function renderTicketDetail(ticket, comments) {
  const canUseAi = state.user.role === 'admin' || state.user.role === 'technician';
  const canAssign = state.user.role === 'admin';
  const canUpdateStatus = state.user.role === 'admin' || state.user.role === 'technician' || state.user.id === ticket.creator_id;

  $('#ticketDetail').innerHTML = `
    <p class="eyebrow">Ticket #${ticket.id}</p>
    <h2>${escapeHtml(ticket.title)}</h2>
    <div class="detail-grid">
      <div class="detail-box"><strong>类别</strong><p>${categoryText[ticket.category] || ticket.category}</p></div>
      <div class="detail-box"><strong>优先级</strong><p><span class="badge ${ticket.priority}">${priorityText[ticket.priority]}</span></p></div>
      <div class="detail-box"><strong>状态</strong><p><span class="badge ${ticket.status}">${statusText[ticket.status]}</span></p></div>
      <div class="detail-box"><strong>提交人 / 处理人</strong><p>${escapeHtml(ticket.creator_name)} / ${escapeHtml(ticket.assignee_name || '未分配')}</p></div>
      <div class="detail-box full"><strong>问题描述</strong><p>${escapeHtml(ticket.description)}</p></div>
      <div class="detail-box full"><strong>AI 摘要</strong><p id="aiSummaryText">${escapeHtml(ticket.ai_summary || '暂未生成')}</p></div>
      <div class="detail-box full"><strong>AI 建议优先级</strong><p id="aiPriorityText">${escapeHtml(ticket.ai_priority || '暂未生成')}</p></div>
      <div class="detail-box full"><strong>AI 处理建议</strong><p id="aiSuggestionText">暂未生成</p></div>
    </div>

    <div class="detail-actions">
      ${canUseAi ? '<button class="secondary-btn" onclick="runAi(\'summary\')">生成摘要</button><button class="secondary-btn" onclick="runAi(\'priority\')">推荐优先级</button><button class="secondary-btn" onclick="runAi(\'suggestion\')">生成处理建议</button>' : ''}
      ${canUpdateStatus ? statusSelectHtml(ticket.status) : ''}
      ${canAssign ? assignSelectHtml(ticket.assignee_id) : ''}
    </div>

    <h3>处理记录</h3>
    <div id="commentList">
      ${comments.length ? comments.map(comment => `
        <div class="comment">
          <strong>${escapeHtml(comment.user_name)}</strong>
          <small> ${roleText[comment.user_role] || comment.user_role} · ${comment.created_at}</small>
          <p>${escapeHtml(comment.content)}</p>
        </div>
      `).join('') : '<p class="muted">暂无处理记录。</p>'}
    </div>

    <form id="commentForm" class="auth-form" onsubmit="addComment(event)">
      <label>新增处理记录</label>
      <textarea id="commentContent" rows="3" placeholder="记录处理进展、排查结果或用户反馈" required></textarea>
      <button class="primary-btn" type="submit">提交记录</button>
    </form>
  `;
}

function statusSelectHtml(current) {
  return `
    <select id="statusUpdateSelect">
      ${Object.keys(statusText).map(key => `<option value="${key}" ${key === current ? 'selected' : ''}>${statusText[key]}</option>`).join('')}
    </select>
    <button class="primary-btn" onclick="updateStatus()">更新状态</button>
  `;
}

function assignSelectHtml(currentAssigneeId) {
  return `
    <select id="assignSelect">
      <option value="">选择技术人员</option>
      ${state.technicians.map(user => `<option value="${user.id}" ${Number(currentAssigneeId) === Number(user.id) ? 'selected' : ''}>${escapeHtml(user.name)}</option>`).join('')}
    </select>
    <button class="primary-btn" onclick="assignTicket()">分配工单</button>
  `;
}

async function runAi(type) {
  const ticketId = state.selectedTicketId;
  const data = await api(`/api/ai/tickets/${ticketId}/${type}`, { method: 'POST', body: '{}' });

  if (type === 'summary') $('#aiSummaryText').textContent = data.summary;
  if (type === 'priority') $('#aiPriorityText').textContent = data.priority;
  if (type === 'suggestion') $('#aiSuggestionText').textContent = data.suggestion;

  toast('AI 辅助内容已生成');
  await loadTickets();
  await loadDashboard();
}

async function updateStatus() {
  const status = $('#statusUpdateSelect').value;
  await api(`/api/tickets/${state.selectedTicketId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
  toast('状态已更新');
  await openTicket(state.selectedTicketId);
  await loadTickets();
  await loadDashboard();
}

async function assignTicket() {
  const assignee_id = Number($('#assignSelect').value);
  if (!assignee_id) return toast('请选择技术人员');

  await api(`/api/tickets/${state.selectedTicketId}/assign`, {
    method: 'PUT',
    body: JSON.stringify({ assignee_id })
  });
  toast('工单已分配');
  await openTicket(state.selectedTicketId);
  await loadTickets();
  await loadDashboard();
}

async function addComment(event) {
  event.preventDefault();
  const content = $('#commentContent').value;
  await api(`/api/tickets/${state.selectedTicketId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content })
  });
  toast('处理记录已添加');
  await openTicket(state.selectedTicketId);
  await loadTickets();
}

async function loadUsers() {
  if (state.user.role !== 'admin') return;
  const data = await api('/api/users');
  $('#usersList').innerHTML = data.users.map(user => `
    <div class="user-row">
      <div>
        <strong>${escapeHtml(user.name)}</strong><br>
        <span>${escapeHtml(user.email)}</span>
      </div>
      <span>${roleText[user.role] || user.role}</span>
    </div>
  `).join('');
}

async function loadAll() {
  try {
    await loadTechnicians();
    await loadDashboard();
    await loadTickets();
    if (state.user.role === 'admin') await loadUsers();
  } catch (error) {
    toast(error.message);
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

$all('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    $all('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    $('#loginForm').classList.toggle('hidden', tab.dataset.tab !== 'login');
    $('#registerForm').classList.toggle('hidden', tab.dataset.tab !== 'register');
  });
});

$('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.target);
  try {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(form.entries()))
    });
    saveSession(data.token, data.user);
    toast('登录成功');
    updateAuthView();
  } catch (error) {
    toast(error.message);
  }
});

$('#registerForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.target);
  try {
    const data = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(form.entries()))
    });
    saveSession(data.token, data.user);
    toast('注册成功');
    updateAuthView();
  } catch (error) {
    toast(error.message);
  }
});

$('#ticketForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.target);
  try {
    await api('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(form.entries()))
    });
    event.target.reset();
    toast('工单创建成功');
    switchView('tickets');
    await loadTickets();
    await loadDashboard();
  } catch (error) {
    toast(error.message);
  }
});

$all('.nav-item').forEach(item => {
  item.addEventListener('click', () => switchView(item.dataset.view));
});

$('#refreshBtn').addEventListener('click', loadAll);
$('#filterBtn').addEventListener('click', loadTickets);
$('#logoutBtn').addEventListener('click', () => {
  clearSession();
  updateAuthView();
});
$('#closeModalBtn').addEventListener('click', () => $('#ticketModal').classList.add('hidden'));

window.openTicket = openTicket;
window.runAi = runAi;
window.updateStatus = updateStatus;
window.assignTicket = assignTicket;
window.addComment = addComment;

updateAuthView();
