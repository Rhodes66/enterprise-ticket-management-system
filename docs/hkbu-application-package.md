# HKBU 申请材料项目包：Enterprise Ticket Management System

> 用途：本文件用于帮助你把项目写进简历、个人陈述、作品集和面试回答中。请注意：该项目应写为“企业业务场景模拟项目 / 个人全栈项目”，不要写成某公司真实实习项目。

---

## 1. 项目定位

**中文项目名：企业内部工单管理系统**  
**英文项目名：Enterprise Ticket Management System**  
**项目类型：企业业务场景模拟项目 / Full-stack Web Project / AI-assisted Business System**

该项目模拟企业内部 IT 服务台的业务流程，围绕员工提交问题、技术人员处理问题、管理员分配与统计问题进行系统设计。项目包含用户认证、角色权限、工单流转、数据库存储、数据统计看板和 AI 辅助处理建议，适合作为申请信息技术管理、数据分析与人工智能、软件工程相关方向的作品集项目。

---

## 2. 简历项目经历：正式版

**Enterprise Ticket Management System 企业内部工单管理系统**  
**项目类型：企业业务场景模拟项目 / 全栈 Web 开发项目**  
**技术栈：HTML、CSS、JavaScript、Node.js、Express、SQLite、JWT、bcryptjs、ECharts、DeepSeek API**

- 基于企业内部 IT 服务台场景，设计并开发了一个全栈工单管理系统，支持员工提交工单、技术人员处理工单、管理员分配工单和查看数据统计看板。
- 使用 Node.js 与 Express 搭建后端服务，设计 RESTful API 实现登录注册、工单创建、工单查询、状态更新、处理记录、用户管理和数据统计等功能。
- 使用 SQLite 设计并实现 users、tickets、comments、logs 等数据表，完成用户信息、工单信息、处理记录和操作日志的数据持久化。
- 实现员工、技术人员、管理员三类角色权限控制，不同角色拥有不同操作范围，模拟企业后台系统中常见的权限边界。
- 集成 ECharts 数据看板，展示工单状态分布、优先级分布、每日新增趋势和技术人员处理量排行，提高系统的数据分析与管理价值。
- 接入 AI 辅助模块，用于生成工单摘要、推荐优先级和提供处理建议，探索 AI 在企业 IT 服务流程中的实际应用。

---

## 3. 简历项目经历：短版

**Enterprise Ticket Management System 企业内部工单管理系统**  
基于 Node.js、Express、SQLite 和 JavaScript 开发的企业 IT 工单管理系统，实现登录注册、角色权限控制、工单创建与分配、状态流转、处理记录、数据统计看板和 AI 辅助摘要/处理建议等功能。项目模拟企业内部 IT 服务台业务流程，提升了我在后端接口设计、数据库建模、权限控制、前后端联调和 AI 业务应用方面的实践能力。

---

## 4. 个人陈述 Personal Statement 项目段落

由于我在实习期间直接参与企业级开发的机会有限，我在课外主动完成了一个企业内部工单管理系统项目，用于模拟真实企业 IT 服务台的业务流程。该系统包含员工提交工单、技术人员处理工单、管理员分配工单、角色权限控制、数据统计看板和 AI 辅助建议等功能。

在开发过程中，我不仅学习了 Web 系统从需求分析、功能设计、数据库建模到接口开发的完整流程，也进一步理解了企业信息系统中权限控制、业务流转和数据管理的重要性。相比普通页面练习，该项目更强调真实业务场景和系统完整性，让我能够把软件工程知识与企业管理需求结合起来。同时，我也尝试将 AI 能力应用于工单摘要、优先级判断和处理建议生成，这增强了我对人工智能技术在企业服务和信息管理领域落地应用的兴趣。

该项目帮助我认识到，信息技术的价值不仅在于实现功能，更在于解决组织中的实际问题、提升流程效率并支持管理决策。因此，我希望在研究生阶段继续系统学习数据分析、人工智能和信息系统管理相关知识，进一步提升自己从业务问题出发进行技术设计与应用开发的能力。

---

## 5. 面试 1 分钟介绍稿

我做过一个企业内部工单管理系统，项目背景是模拟公司 IT 服务台的日常工作流程。员工可以在系统中提交账号、网络、硬件或业务系统问题，技术人员负责处理工单，管理员可以分配工单并查看数据统计。

这个项目主要包括登录注册、角色权限、工单创建、工单分配、状态更新、处理记录、数据看板和 AI 辅助建议等功能。后端使用 Node.js 和 Express，数据库使用 SQLite，前端使用 HTML、CSS、JavaScript 和 ECharts。

我认为这个项目最大的价值是让我从真实业务场景出发理解系统开发，而不是只做页面展示。通过项目，我学习了企业后台系统常见的权限控制、业务流转、数据库设计和接口开发方式，也尝试把 AI 能力嵌入实际业务流程中，例如自动生成工单摘要、推荐优先级和给出处理建议。

---

## 6. 面试 3 分钟详细介绍稿

这个项目叫 Enterprise Ticket Management System，中文是企业内部工单管理系统。它是一个企业业务场景模拟项目，主要模拟公司内部 IT 服务台的工作流程。比如员工遇到网络、账号、电脑或系统权限问题时，可以在系统中提交工单；技术人员可以查看并处理工单；管理员可以分配工单、管理用户并查看统计数据。

我选择这个项目，是因为我希望补强自己在真实企业系统开发方面的实践能力。相比普通的学生管理系统或简单问答网页，工单系统更接近企业内部真实使用的后台系统，它涉及用户角色、权限边界、业务流程、数据存储和统计分析等内容。

技术上，项目后端使用 Node.js 和 Express 搭建接口服务，数据库使用 SQLite，前端使用 HTML、CSS、JavaScript 和 ECharts。系统设计了 users、tickets、comments 和 logs 等数据表，分别存储用户信息、工单信息、处理记录和操作日志。用户登录后，系统会根据 JWT 识别身份，并根据员工、技术人员、管理员三种角色展示不同功能。

项目的核心业务流程是：员工创建工单，系统保存工单信息；技术人员或管理员查看工单详情，添加处理记录并更新状态；管理员可以分配处理人员，并通过数据看板查看工单数量、状态分布、优先级分布、每日新增趋势和技术人员处理量。除此之外，我还加入了 AI 辅助模块，可以根据工单描述生成摘要、推荐优先级和提供处理建议。

通过这个项目，我最大的收获是理解了一个企业后台系统不是简单的增删改查，而是需要围绕业务流程进行设计。比如，不同角色能看到什么、能操作什么，工单从创建到关闭应该经过哪些状态，管理员需要哪些数据来管理团队效率，这些都是系统设计时需要考虑的问题。这个项目也让我更清楚地认识到 AI 技术可以嵌入具体业务场景，而不是只作为聊天功能存在。

---

## 7. 作品集页面展示文案

### Enterprise Ticket Management System

**Enterprise IT Service Desk Simulation / Full-stack Web Project**

This project is a full-stack web application that simulates an internal IT service desk system in an enterprise environment. It supports ticket submission, ticket assignment, status tracking, role-based access control, data visualization, and AI-assisted ticket analysis.

**Key Features**

- User authentication and role-based access control
- Three user roles: employee, technician, and administrator
- Ticket creation, assignment, status update, and comment tracking
- Dashboard for ticket statistics and technician workload analysis
- AI-assisted ticket summary, priority recommendation, and solution suggestion
- SQLite database design for users, tickets, comments, and logs

**Technical Stack**

HTML, CSS, JavaScript, Node.js, Express, SQLite, JWT, ECharts, DeepSeek API

**Project Value**

The project demonstrates my understanding of enterprise business workflows, backend API development, database design, permission control, dashboard visualization, and practical AI integration in business systems.

---

## 8. 不能这样写

不要写：

- “我在某大厂开发了企业内部工单系统”
- “我负责公司真实线上工单平台开发”
- “该系统已被企业正式使用”
- “自主研发 AI 大模型”

除非这些都是真实发生的，否则不要写。

---

## 9. 推荐写法

可以写：

- “企业业务场景模拟项目”
- “个人全栈开发项目”
- “模拟企业 IT 服务台流程设计并实现”
- “基于 AI API 实现工单摘要、优先级推荐和处理建议”
- “用于补强自己在企业后台系统开发方面的实践能力”

这种写法真实、稳妥，也足够有含金量。
