# GitHub 上传指南（适合初学者）

## 1. 为什么要上传 GitHub

申请研究生时，GitHub 可以作为项目作品集证据。它能证明你不仅在简历上写了项目，而且真的有代码、文档、运行方式和项目结构。

## 2. 上传前检查

上传前确认项目里有这些文件：

```text
README.md
README_EN.md
package.json
server.js
src/
public/
docs/
.env.example
.gitignore
```

不要上传 `.env` 文件，因为里面可能有 API Key。

## 3. 创建 GitHub 仓库

1. 打开 GitHub
2. 点击 New repository
3. Repository name 填写：

```text
enterprise-ticket-management-system
```

4. Description 可以写：

```text
A full-stack enterprise IT service desk ticket management system with role-based access control, dashboard statistics and AI-assisted ticket handling.
```

5. 选择 Public
6. 不要勾选 Add README，因为项目里已经有 README
7. 点击 Create repository

## 4. 第一次上传命令

在项目目录里打开 cmd，然后输入：

```bash
git init
git add .
git commit -m "Initial commit: enterprise ticket management system"
git branch -M main
git remote add origin 你的GitHub仓库地址
git push -u origin main
```

其中 `你的GitHub仓库地址` 要换成 GitHub 页面上显示的地址。

## 5. 后续更新命令

以后每次改完代码或文档，可以输入：

```bash
git add .
git commit -m "Update project documentation"
git push
```

## 6. 建议的真实提交记录

不要一次性只提交全部内容。你之后学习和改进项目时，可以按照真实修改内容提交：

```text
Add user authentication module
Add ticket creation and list APIs
Add role-based access control
Add dashboard statistics API
Add AI assistance module
Improve frontend layout
Add HKBU application documentation
Add English README
Add screenshot guide
```

注意：这些提交应该在你真的修改或学习对应内容后提交，不要为了伪造经历乱改历史。

## 7. GitHub 页面展示建议

仓库首页最好能看到：

- 项目简介
- 技术栈
- 功能截图
- 运行方式
- 演示账号
- 技术架构
- 项目总结
- Future Improvements

这样招生老师或面试老师打开后会觉得项目完整度更高。
