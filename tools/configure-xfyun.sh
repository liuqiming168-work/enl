#!/bin/zsh
set -e

project_dir="${0:A:h:h}"
credential_file="$project_dir/.xfyun.env"
umask 077

printf '讯飞 AppID: '
IFS= read -r app_id
printf '讯飞 APIKey（输入不会显示）: '
IFS= read -rs api_key
printf '\n讯飞 APISecret（输入不会显示）: '
IFS= read -rs api_secret
printf '\n'

if [[ -z "$app_id" || -z "$api_key" || -z "$api_secret" ]]; then
  printf '三项凭证都不能为空。\n' >&2
  exit 1
fi

{
  printf 'XFYUN_APP_ID=%s\n' "$app_id"
  printf 'XFYUN_API_KEY=%s\n' "$api_key"
  printf 'XFYUN_API_SECRET=%s\n' "$api_secret"
} > "$credential_file"

chmod 600 "$credential_file"
printf '配置完成：凭证仅保存在本机，且已被 Git 忽略。\n'
