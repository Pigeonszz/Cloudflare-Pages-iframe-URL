#!/bin/bash

TOKEN=""
ACCOUNT_ID=""
PROJECT_ID=""
IFRAME_URL=""

MSG_ERROR_DEPENDENCY="Error: cURL is not installed. Please install it using:"
MSG_ERROR_UNSUPPORTED_PKG="Error: Unsupported package manager. Please install cURL manually."
MSG_ERROR_CONFIG="Error: Failed to update config (HTTP status code: "
MSG_ERROR_DEPLOY="Error: Failed to deploy project (HTTP status code: "
MSG_DEPLOY_SUCCESS="Deployment triggered successfully."

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
