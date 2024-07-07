# Cloudflare API Token
TOKEN=""

# Cloudflare Pages project details
ACCOUNT_ID=""
PROJECT_ID=""

# Update deployment configuration
curl -X PATCH \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "deployment_configs": {
      "production": {
        "env_vars": {
          "IFRAME_URL": {
            "type": "plain_text",
            "value": "https://${ruleName}:${port}"
          }
        }
      }
    }
  }' \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_ID"

sleep 5  # 等待5秒钟，确保配置更新完成

# Trigger deployment
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_ID/deployments"
