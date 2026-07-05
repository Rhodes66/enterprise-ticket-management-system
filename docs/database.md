# 数据库表设计

本项目使用 SQLite 作为本地数据库，核心表包括 users、tickets、comments 和 logs。

## 1. users 用户表

| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER | 用户 ID，主键 |
| name | TEXT | 用户姓名 |
| email | TEXT | 用户邮箱，唯一 |
| password_hash | TEXT | 加密后的密码 |
| role | TEXT | 用户角色：employee、technician、admin |
| created_at | TEXT | 创建时间 |

## 2. tickets 工单表

| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER | 工单 ID，主键 |
| title | TEXT | 工单标题 |
| description | TEXT | 工单描述 |
| category | TEXT | 工单类别 |
| priority | TEXT | 优先级：low、medium、high、urgent |
| status | TEXT | 状态：pending、processing、resolved、closed |
| creator_id | INTEGER | 提交人 ID |
| assignee_id | INTEGER | 处理人 ID |
| ai_summary | TEXT | AI 生成摘要 |
| ai_priority | TEXT | AI 推荐优先级 |
| created_at | TEXT | 创建时间 |
| updated_at | TEXT | 更新时间 |
| closed_at | TEXT | 关闭时间 |

## 3. comments 处理记录表

| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER | 记录 ID，主键 |
| ticket_id | INTEGER | 对应工单 ID |
| user_id | INTEGER | 评论用户 ID |
| content | TEXT | 处理记录内容 |
| created_at | TEXT | 创建时间 |

## 4. logs 操作日志表

| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER | 日志 ID，主键 |
| user_id | INTEGER | 操作用户 ID |
| action | TEXT | 操作类型 |
| target_type | TEXT | 操作对象类型 |
| target_id | INTEGER | 操作对象 ID |
| detail | TEXT | 操作详情 |
| created_at | TEXT | 创建时间 |

## 5. 设计说明

- users 表用于身份认证和角色权限判断。
- tickets 表是项目核心业务表，记录工单的状态、优先级、提交人与处理人。
- comments 表用于记录工单处理过程，模拟企业系统中的处理日志。
- logs 表用于记录关键操作，方便后续扩展审计功能。
