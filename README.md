# HomeService Hub

HomeService Hub 是一个家政与本地生活服务平台，连接客户、技师和运营管理员，支持在线下单、派单、订单状态流转、实时通知、技师审核和服务项目管理。

## 主要功能

- Customer：浏览服务、查看推荐技师、下单、跟踪订单、取消订单、评价服务。
- Worker：查看待接订单，按状态执行接单、出发、开始服务、完工。
- Admin：管理全部订单、技师审核、服务项目创建、上下架和定价维护。
- 订单状态流转：`PENDING -> ASSIGNED -> ACCEPTED -> ON_THE_WAY -> IN_PROGRESS -> COMPLETED -> RATED`，支持取消。
- 实时通知：后端 WebSocket Gateway 推送订单状态变更、新派单和技师出发通知。
- 审计日志：关键写操作通过 NestJS Interceptor 记录操作人、动作、目标实体和参数。

## 快速启动（Docker Compose）

```bash
cd /Users/gaobo/repositories/gitlab/评审项目/0-1代码生成提示词/wje主题项目提示词/wje-554
docker compose up --build
```

访问地址：

- 前端：http://localhost:38204
- 后端健康检查：http://localhost:38304/api/health
- 后端 API：http://localhost:38304/api

演示账号：

| 角色 | 用户名 | 密码 |
| --- | --- | --- |
| Admin | admin | admin123 |
| Customer | customer | customer123 |
| Worker | worker | worker123 |

## 本地开发

后端：

```bash
cd backend
npm install
npm run prisma:generate
npm run start:dev
```

前端：

```bash
cd frontend
npm install
npm run dev
```

本地开发端口：

- Vite 前端：`38204`
- NestJS 后端：`38304`

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | React 18、TypeScript、Material UI、Vite、Zustand、Axios |
| 后端 | NestJS、TypeScript、JWT、WebSocket Gateway、Prisma |
| 数据库 | PostgreSQL |
| 部署 | Docker Compose、Nginx |

## 目录结构

```text
frontend/              React + Vite 前端
  src/api/             Axios API 封装
  src/stores/          Zustand 状态管理
  src/constants/       前端共享枚举与类目配置
  src/components/      通用组件、布局、通知组件
  src/pages/           首页、订单、技师、服务等页面
backend/               NestJS 后端
  prisma/schema.prisma PostgreSQL/Prisma 模型与枚举
  src/constants/       后端共享枚举
  src/common/          Guard、Decorator、Filter、Interceptor、Middleware
  src/modules/         Auth、Service、Order、Worker、Notification、Audit、Dashboard
  database/            数据库初始化与种子脚本
docker-compose.yml     前后端与 PostgreSQL 编排
.env                   本地 Docker Compose 环境变量
.env.example           环境变量示例
```

## 环境变量

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `COMPOSE_PROJECT_NAME` | Compose 项目名，避免依赖目录名 | `wjehomesvc` |
| `POSTGRES_USER` | PostgreSQL 用户 | `wjehomesvc` |
| `POSTGRES_PASSWORD` | PostgreSQL 密码 | `wjehomesvc_password` |
| `POSTGRES_DB` | PostgreSQL 数据库 | `wjehomesvc` |
| `DATABASE_URL` | Prisma 数据库连接 | `postgresql://...` |
| `JWT_SECRET` | JWT 签名密钥 | 开发密钥 |
| `JWT_EXPIRES_IN` | JWT 过期时间 | `7d` |
| `FRONTEND_PORT` | 前端映射端口 | `38204` |
| `BACKEND_PORT` | 后端端口 | `38304` |
| `VITE_API_BASE_URL` | 前端 API 基础路径 | `/api` |
| `VITE_WS_URL` | 前端 WebSocket 地址 | `ws://localhost:38304/notifications` |

## Docker 部署说明

`docker-compose.yml` 顶层固定 `name: wjehomesvc`，并通过 `.env` 设置 `COMPOSE_PROJECT_NAME=wjehomesvc`。所有容器名、网络名和命名卷都带此前缀，因此项目放在中文目录或任意目录名下也能稳定启动。

前端容器使用多阶段构建，先执行 Vite 构建，再由 Nginx 托管静态文件。Nginx 会将 `/api` 反向代理到 Docker 网络内的 `backend:38304`，并为前端路由启用 `try_files`。

后端容器构建时执行 `prisma generate`，运行 NestJS 服务。PostgreSQL 配置健康检查，后端依赖数据库健康后启动，前端依赖后端健康后启动。

## License

MIT
