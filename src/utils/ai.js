require('dotenv').config();

function localPrioritySuggestion(ticket) {
  const text = `${ticket.title} ${ticket.description}`.toLowerCase();
  if (/(无法|失败|崩溃|中断|宕机|不能登录|权限异常|urgent|critical|报表失败|系统)/.test(text)) {
    return 'high';
  }
  if (/(慢|卡顿|延迟|异常|错误|网络)/.test(text)) {
    return 'medium';
  }
  return 'low';
}

function localSummary(ticket) {
  return `工单摘要：${ticket.title}。问题类别为 ${ticket.category}，当前优先级为 ${ticket.priority}。用户描述的核心问题是：${ticket.description.slice(0, 120)}${ticket.description.length > 120 ? '...' : ''}`;
}

function localSuggestion(ticket) {
  const category = ticket.category;
  const suggestions = {
    account: '建议先核对用户账号状态、权限组、最近密码变更记录和 VPN 访问策略；必要时重置权限并要求用户重新登录验证。',
    hardware: '建议检查系统启动项、磁盘空间、内存占用和硬件健康状态；可先进行清理、杀毒和性能日志查看。',
    network: '建议检查本机网络配置、DNS、网关、代理/VPN 设置，并对比同网段其他设备连接情况。',
    system: '建议先复现问题，检查浏览器控制台、后端日志、接口返回和文件导出服务状态，再定位具体失败环节。',
    general: '建议先收集复现步骤、错误截图、发生时间、影响范围和用户环境信息，再安排对应技术人员处理。'
  };
  return suggestions[category] || suggestions.general;
}

async function callDeepSeek(systemPrompt, userPrompt) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/chat/completions';
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

  if (!apiKey) return null;

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI service error: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

function ticketPrompt(ticket) {
  return `标题：${ticket.title}\n类别：${ticket.category}\n优先级：${ticket.priority}\n状态：${ticket.status}\n问题描述：${ticket.description}`;
}

async function generateSummary(ticket) {
  const aiResult = await callDeepSeek(
    '你是企业 IT 服务台系统的工单分析助手。请用中文给出简洁、专业的工单摘要，不超过80字。',
    ticketPrompt(ticket)
  );
  return aiResult || localSummary(ticket);
}

async function suggestPriority(ticket) {
  const aiResult = await callDeepSeek(
    "你是企业 IT 工单分级助手。请只输出 low、medium、high、urgent 中的一个词，不要输出其他解释。",
    ticketPrompt(ticket)
  );
  const normalized = (aiResult || '').toLowerCase().trim();
  if (['low', 'medium', 'high', 'urgent'].includes(normalized)) return normalized;
  return localPrioritySuggestion(ticket);
}

async function generateSolutionSuggestion(ticket) {
  const aiResult = await callDeepSeek(
    '你是企业 IT 技术支持助手。请根据工单内容给技术人员提供3条可执行处理建议，中文输出，简洁专业。',
    ticketPrompt(ticket)
  );
  return aiResult || localSuggestion(ticket);
}

module.exports = {
  generateSummary,
  suggestPriority,
  generateSolutionSuggestion
};
