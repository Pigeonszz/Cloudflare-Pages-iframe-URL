# 本文档假设你已经完成以下步骤：

- 拥有一个 GitHub 账号
- 拥有一个 Cloudflare 账号
- 已成功部署 STUN 穿透服务

## 1. Fork 项目

请前往 [项目地址](https://github.com/Pigeonszz/Cloudflare-Pages-iframe-URL/fork) 并 Fork 此项目。

## 2. 获取 Cloudflare 帐户 ID

登录 [Cloudflare 控制面板](https://dash.cloudflare.com/?to=/:account/workers-and-pages)，记录下你的 "帐户 ID"。

## 3. 创建 Pages 项目

1. 前往 Cloudflare 控制面板并选择 "Pages"。
2. 连接到 GitHub，选择你刚刚 Fork 的项目进行部署。
3. 记录下 "项目名称"。

按照 `README.zh-cn.md` 中的说明，填写环境变量。

## 4. 创建 D1 数据库

1. 前往 [Cloudflare 控制面板](https://dash.cloudflare.com/?to=/:account/workers/services/view/:worker/)，创建一个 D1 数据库，名称随意。
2. 绑定你的 D1 数据库到已部署的项目：设置 --> 函数 --> 绑定数据库，"变量名称"设为: `D1`。

## 5. 初始化数据库 (若有)

访问 `https://$域名/api/init` 进行数据库初始化

## 6. 创建 API Token

前往 [API Token 创建页面](https://dash.cloudflare.com/?to=/profile/api-tokens)，创建一个 "API Token"。权限设置为：账户 - Cloudflare Pages - 编辑。

## 7. 下载并修改脚本

从 [此](https://github.com/Pigeonszz/shell/blob/main/Cloudflare_iframe_URLs/update_env_vars_min.sh) 下载脚本，并按照以下方式修改：

```bash
TOKEN=<API Token>
ACCOUNT_ID=<帐户 ID>
PROJECT_ID=<项目名称>
IFRAME_URL=<你 STUN 穿透的公网地址+端口>
```

IFRAME_URL格式请参考 `README.zh-cn.md`。

## 8. 使用脚本

你可以将修改后的脚本复制粘贴到 NAT 穿透工具的自定义脚本中，或保存为 `.sh` 文件并使用以下命令运行：

```bash
bash /path/to/update_env_vars_min.sh
```
