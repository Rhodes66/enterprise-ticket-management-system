# 作品集页面文案

## 项目标题

Enterprise Ticket Management System 企业内部工单管理系统

## 一句话介绍

一个模拟企业 IT 服务台场景的全栈 Web 系统，支持员工提交工单、技术人员处理工单、管理员管理工单和查看数据看板，并集成 AI 辅助摘要与处理建议功能。

## 项目背景

在企业日常运营中，员工经常会遇到网络、账号、软件、硬件和内部系统相关问题。为了提高问题处理效率，企业通常会使用 Service Desk / ITSM 类型系统统一收集、分配、跟踪和统计问题。本项目参考这一业务场景，设计并实现了一个企业内部工单管理系统。

## 我的目标

由于我希望申请信息技术、数据分析和人工智能相关研究生项目，同时实习期间直接参与开发的机会有限，因此我通过这个项目主动训练企业后台系统开发能力，包括业务流程设计、权限控制、数据库建模、接口开发和 AI API 集成。

## 核心功能

- 用户注册和登录
- 员工、技术人员、管理员三种角色
- 员工提交和查看自己的工单
- 管理员查看全部工单并分配处理人员
- 技术人员更新工单状态并添加处理记录
- 工单优先级和状态管理
- 数据统计看板
- AI 自动生成工单摘要
- AI 推荐工单优先级
- AI 提供处理建议

## 技术栈

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: SQLite
- Authentication: JWT
- AI: DeepSeek API compatible interface
- Documentation: Markdown

## 系统架构

```text
Browser
  ↓
Frontend UI
  ↓
Express RESTful API
  ↓
Authentication / Ticket / Dashboard / AI Modules
  ↓
SQLite Database
```

## 项目收获

通过该项目，我理解了企业后台系统不是简单页面组合，而是围绕真实业务流程进行设计。项目让我学习了如何设计不同角色权限，如何实现工单状态流转，如何使用数据库保存业务数据，如何通过接口连接前后端，以及如何把 AI 能力嵌入实际业务流程中。

## 后续优化方向

- 增加附件上传功能
- 增加 SLA 超时提醒
- 增加邮件通知
- 增加 Docker 部署
- 增加 API 测试
- 使用 MySQL 或 PostgreSQL 替代 SQLite
- 使用 Vue 或 React 重构前端
