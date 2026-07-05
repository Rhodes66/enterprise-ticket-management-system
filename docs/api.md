# API 接口说明

## 1. 认证接口

### POST /api/auth/register

注册用户。

请求示例：

```json
{
  "name": "Rodes Qian",
  "email": "rodes@example.com",
  "password": "123456",
  "role": "employee"
}
```

### POST /api/auth/login

用户登录。

请求示例：

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### GET /api/auth/me

获取当前登录用户信息。需要携带 Bearer Token。

## 2. 工单接口

### GET /api/tickets

获取工单列表。支持筛选：

```text
/api/tickets?status=pending&priority=high&search=VPN
```

不同角色看到的数据范围不同：

- 员工只能看到自己提交的工单
- 技术人员可以看到未分配或分配给自己的工单
- 管理员可以看到全部工单

### POST /api/tickets

创建工单。

```json
{
  "title": "VPN 登录失败",
  "description": "外出办公时无法登录公司 VPN。",
  "category": "account",
  "priority": "high"
}
```

### GET /api/tickets/:id

查看工单详情，包括处理记录。

### PUT /api/tickets/:id/assign

管理员分配工单给技术人员。

```json
{
  "assignee_id": 2
}
```

### PUT /api/tickets/:id/status

更新工单状态。

```json
{
  "status": "processing"
}
```

### PUT /api/tickets/:id/priority

更新工单优先级。

```json
{
  "priority": "urgent"
}
```

### POST /api/tickets/:id/comments

添加处理记录。

```json
{
  "content": "已核对 VPN 权限组，发现用户账号未加入远程办公权限组。"
}
```

## 3. 数据看板接口

### GET /api/dashboard/stats

返回统计数据，包括：

- 总工单数量
- 待处理数量
- 处理中数量
- 已解决数量
- 紧急工单数量
- 状态分布
- 优先级分布
- 每日新增趋势
- 技术人员处理量排行

## 4. AI 辅助接口

### POST /api/ai/tickets/:id/summary

生成工单摘要。

### POST /api/ai/tickets/:id/priority

推荐工单优先级。

### POST /api/ai/tickets/:id/suggestion

生成处理建议。

## 5. 用户接口

### GET /api/users/technicians

获取技术人员列表。

### GET /api/users

管理员获取所有用户列表。
