#!/bin/bash

# Default language
LANG="en"

# Language messages
declare -A MESSAGES

# English messages
MESSAGES["en_MSG_ERROR_DEPENDENCY"]="Error: cURL is not installed. Please install it using:"
MESSAGES["en_MSG_ERROR_UNSUPPORTED_PKG"]="Error: Unsupported package manager. Please install cURL manually."
MESSAGES["en_MSG_ERROR_CONFIG"]="Error: Failed to update config (HTTP status code: "
MESSAGES["en_MSG_ERROR_DEPLOY"]="Error: Failed to deploy project (HTTP status code: "
MESSAGES["en_MSG_DEPLOY_SUCCESS"]="Deployment triggered successfully."

# Chinese (Simplified) messages
MESSAGES["zh-cn_MSG_ERROR_DEPENDENCY"]="错误：未安装 cURL。请使用以下命令安装："
MESSAGES["zh-cn_MSG_ERROR_UNSUPPORTED_PKG"]="错误：不支持的包管理器。请手动安装 cURL。"
MESSAGES["zh-cn_MSG_ERROR_CONFIG"]="错误：更新配置失败（HTTP 状态码："
MESSAGES["zh-cn_MSG_ERROR_DEPLOY"]="错误：部署项目失败（HTTP 状态码："
MESSAGES["zh-cn_MSG_DEPLOY_SUCCESS"]="部署成功触发。"

# Chinese (Traditional) messages
MESSAGES["zh-tw_MSG_ERROR_DEPENDENCY"]="錯誤：未安裝 cURL。請使用以下命令安裝："
MESSAGES["zh-tw_MSG_ERROR_UNSUPPORTED_PKG"]="錯誤：不支持的包管理器。請手動安裝 cURL。"
MESSAGES["zh-tw_MSG_ERROR_CONFIG"]="錯誤：更新配置失敗（HTTP 狀態碼："
MESSAGES["zh-tw_MSG_ERROR_DEPLOY"]="錯誤：部署項目失敗（HTTP 狀態碼："
MESSAGES["zh-tw_MSG_DEPLOY_SUCCESS"]="部署成功觸發。"

# Japanese messages
MESSAGES["jp_MSG_ERROR_DEPENDENCY"]="エラー: cURLがインストールされていません。以下のコマンドを使用してインストールしてください:"
MESSAGES["jp_MSG_ERROR_UNSUPPORTED_PKG"]="エラー: サポートされていないパッケージマネージャーです。cURLを手動でインストールしてください。"
MESSAGES["jp_MSG_ERROR_CONFIG"]="エラー: 設定の更新に失敗しました（HTTPステータスコード: "
MESSAGES["jp_MSG_ERROR_DEPLOY"]="エラー: プロジェクトのデプロイに失敗しました（HTTPステータスコード: "
MESSAGES["jp_MSG_DEPLOY_SUCCESS"]="デプロイが正常にトリガーされました。"

# Function to get message by key
get_message() {
  local key="$LANG"_"$1"
  echo "${MESSAGES[$key]}"
}

TOKEN=""
ACCOUNT_ID=""
PROJECT_ID=""
IFRAME_URL=""

MSG_ERROR_DEPENDENCY=$(get_message "MSG_ERROR_DEPENDENCY")
MSG_ERROR_UNSUPPORTED_PKG=$(get_message "MSG_ERROR_UNSUPPORTED_PKG")
MSG_ERROR_CONFIG=$(get_message "MSG_ERROR_CONFIG")
MSG_ERROR_DEPLOY=$(get_message "MSG_ERROR_DEPLOY")
MSG_DEPLOY_SUCCESS=$(get_message "MSG_DEPLOY_SUCCESS")

check_dependencies() {
  if command -v apt-get > /dev/null; then
    if ! dpkg -s curl > /dev/null 2>&1; then
      echo "$MSG_ERROR_DEPENDENCY sudo apt-get install curl"
      exit 1
    fi
  elif command -v yum > /dev/null; then
    if ! rpm -q curl > /dev/null 2>&1; then
      echo "$MSG_ERROR_DEPENDENCY sudo yum install curl"
      exit 1
    fi
  elif command -v pacman > /dev/null; then
    if ! pacman -Qi curl > /dev/null 2>&1; then
      echo "$MSG_ERROR_DEPENDENCY sudo pacman -S curl"
      exit 1
    fi
  elif command -v opkg > /dev/null; then
    if ! opkg list-installed | grep -q curl; then
      echo "$MSG_ERROR_DEPENDENCY opkg update && opkg install curl"
      exit 1
    fi
  elif command -v apk > /dev/null; then
    if ! apk info | grep -q curl; then
      echo "$MSG_ERROR_DEPENDENCY apk add curl"
      exit 1
    fi
  else
    echo "$MSG_ERROR_UNSUPPORTED_PKG"
    exit 1
  fi
}

update_config() {
  response=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
    \"deployment_configs\": {
      \"production\": {
        \"env_vars\": {
          \"IFRAME_URL\": {
            \"type\": \"plain_text\",
            \"value\": \"$IFRAME_URL\"
          }
        }
      }
    }
  }" \
    "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_ID")

  if [[ "$response" -ne 200 ]]; then
    echo "$MSG_ERROR_CONFIG $response)"
    exit 1
  fi
}

deploy_project() {
  response=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_ID/deployments")

  if [[ "$response" -ne 200 ]]; then
    echo "$MSG_ERROR_DEPLOY $response)"
    exit 1
  fi
}

check_dependencies

update_config

sleep 5

deploy_project

echo "$MSG_DEPLOY_SUCCESS"