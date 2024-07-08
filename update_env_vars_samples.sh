# 在开始之前需要获取
# 1 , 在我的个人资料 —— api令牌 —— 创建令牌 —— 权限为（帐户——Cloudflare Pages——编辑）
#
# 2 , 在浏览器的地址栏里，获取账户的唯一ID，形如 https://dash.cloudflare.com/4e39dda94a985e84e93cb5e2e07c5ff3/
# 这个 "c299f4beb4ee6bca0e2046a642b52ab9" 就是你的账户ID
#
# 3 , 在浏览器的地址栏里，获取项目名称，形如 https://dash.cloudflare.com/4e39dda94a985e84e93cb5e2e07c5ff3/pages/view/cloudflare-pages-iframe-url
# 这个 "cloudflare-pages-iframe-url" 就是项目名称
#
# 在此填写 Cloudflare API 令牌 
TOKEN=""

# 在此填写 Cloudflare 账户 ID
ACCOUNT_ID=""

# 使用curl命令更新环境变量，根据项目数量的多少需要配置相应数量的curl请求以更新环境变量

###   参考模板   ###
curl -X PATCH \ 
  -H "Content-Type: application/json" \ 
  -H "Authorization: Bearer $TOKEN" \ 
  -d '{
    "deployment_configs": {
      "production": {
        "env_vars": {
          "IFRAME_URL": {
            "type": "plain_text",
            "value": "在此填写iframe所要展示的URL" 
          }
        }
      }
    }
  }' \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_ID"
                                                            #将项目名称填入 "$PROJECT_ID"
###   参考模板   ###
  
#####   分界线   #####
sleep 5  # 等待5秒钟，确保环境变量更新完毕
#####   分界线   #####

# 使用curl命令触发重新部署，根据项目数量的多少需要配置相应数量的curl请求以触发重新部署

###   参考模板   ###
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_ID/deployments"
                                                            #将项目名称填入 "$PROJECT_ID"
###   参考模板   ###
