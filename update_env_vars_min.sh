TOKEN=""
ACCOUNT_ID=""

curl -X PATCH \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
  "deployment_configs": {
    "production": {
      "env_vars": {
        "IFRAME_URL": {
          "type": "plain_text",
          "value": "https://iframe_url"
        }
      }
    }
  }
}' \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_ID"

sleep 5

curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_ID/deployments"
