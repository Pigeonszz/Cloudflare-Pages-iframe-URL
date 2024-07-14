#!/bin/bash

# 环境变量
TOKEN=
ACCOUNT_ID=
PROJECT_ID=
LANG= ZH_CN / ENG

# 语言选择
if [[ -z "$LANG" ]]; then
  LANG="ENG"
elif [[ "$LANG" == "zh_CN" ]]; then
  LANG="ZH-CN"
else
  LANG="ENG"
fi

# 语言字典
declare -A messages
messages=(
  ["ENG:dependency_not_installed"]="Error: %s is not installed."
  ["ENG:unsupported_package_manager"]="Unsupported Linux package manager. Please install %s manually."
  ["ENG:unsupported_os"]="Unsupported OS. Please install %s manually."
  ["ENG:api_request_failed"]="Error: API request failed"
  ["ENG:deployment_config_updated"]="Success: Deployment config updated successfully."
  ["ENG:new_deployment_triggered"]="Success: New deployment triggered successfully."
  ["ENG:failed_to_update_deployment_config"]="Error: Failed to update deployment config."
  ["ENG:failed_to_trigger_new_deployment"]="Error: Failed to trigger new deployment."
  ["ZH-CN:dependency_not_installed"]="错误: %s 未安装。"
  ["ZH-CN:unsupported_package_manager"]="不支持的Linux包管理器。请手动安装 %s。"
  ["ZH-CN:unsupported_os"]="不支持的操作系统。请手动安装 %s。"
  ["ZH-CN:api_request_failed"]="错误: API请求失败"
  ["ZH-CN:deployment_config_updated"]="成功: 部署配置更新成功。"
  ["ZH-CN:new_deployment_triggered"]="成功: 新部署触发成功。"
  ["ZH-CN:failed_to_update_deployment_config"]="错误: 更新部署配置失败。"
  ["ZH-CN:failed_to_trigger_new_deployment"]="错误: 触发新部署失败。"
)

# 函数：获取消息
get_message() {
  local key=$1
  local lang=${LANG:-ENG}
  printf "${messages["$lang:$key"]}" "${@:2}"
}

# 函数：检查并安装依赖项
check_and_install_dependencies() {
  local dependencies=("curl" "jq")

  for dep in "${dependencies[@]}"; do
    if ! command -v $dep &> /dev/null; then
      echo $(get_message "dependency_not_installed" $dep) >&2
      if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt-get &> /dev/null; then
          sudo apt-get update && sudo apt-get install -y $dep
        elif command -v dnf &> /dev/null; then
          sudo dnf install -y $dep
        elif command -v yum &> /dev/null; then
          sudo yum install -y $dep
        elif command -v apk &> /dev/null; then
          sudo apk add $dep
        elif command -v opkg &> /dev/null; then
          opkg update && opkg install $dep
        else
          echo $(get_message "unsupported_package_manager" $dep) >&2
          exit 1
        fi
      elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install $dep
      else
        echo $(get_message "unsupported_os" $dep) >&2
        exit 1
      fi
    fi
  done
}

# 函数：发送API请求
send_api_request() {
  local method=$1
  local url=$2
  local data=$3

  local response=$(curl -s -X $method \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    ${data:+ -d "$data"} \
    "$url")

  if [[ $(echo "$response" | jq -r '.success') != "true" ]]; then
    echo $(get_message "api_request_failed") >&2
    echo "$response" | jq >&2
    exit 1
  fi

  echo "$response" | jq
}

# 更新部署配置
update_deployment_config() {
  local url="https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_ID"
  local data='{
    "deployment_configs": {
      "production": {
        "env_vars": {
          "IFRAME_URL": {
            "type": "plain_text",
            "value": "https://iframe_url_1;service_name1,https://iframe_url_2;service_name2"
          }
        }
      }
    }
  }'

  send_api_request "PATCH" "$url" "$data"
}

# 触发新的部署
trigger_new_deployment() {
  local url="https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_ID/deployments"

  send_api_request "POST" "$url"
}

# 主逻辑
check_and_install_dependencies
if update_deployment_config; then
  echo $(get_message "deployment_config_updated")
  sleep 5
  if trigger_new_deployment; then
    echo $(get_message "new_deployment_triggered")
    exit 0
  else
    echo $(get_message "failed_to_trigger_new_deployment") >&2
    exit 1
  fi
else
  echo $(get_message "failed_to_update_deployment_config") >&2
  exit 1
fi
