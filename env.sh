#!/usr/bin/env bash

if [ ! -f .env ]; then
  echo "Generating .env file.."
  touch .env
  {
    echo "PORT=4001"

    echo "PROJECT=OTH"
    echo "MODULE=AuthServer"
    echo "ENVIRONMENT=Local"

    echo "CLIENT_URL=http://localhost:4200"
    echo "CLIENT_RESET_PASSWORD_URL=http://localhost:4200/reset-password"
    echo "CLIENT_VERIFICATION_SUCCESS_URL=http://localhost:4200/verify-account"

    echo "DATABASE_URL={Database Connection Url}"
    echo "POSTGRESQL_CONNECTION_LIMIT={Postgresql Connection Limit}"

    echo "CLOUDAMQP_APIKEY={MQ Api Key}"
    echo "CLOUDAMQP_URL={MQ Connection Url}"

    echo "AUTH_SERVER_QUEUE_CHANNEL=oth_auth_queue"
    echo "ORCHESTRATION_SERVER_QUEUE_CHANNEL=oth_orchestration_queue"

    echo "AUTO_VERIFY=false"

    echo "ACCESS_TOKEN_EXPIRE=1hour"
    echo "ACCESS_TOKEN_SECRET={Access Token Secret}"

    echo "REFRESH_TOKEN_EXPIRE=30days"
    echo "REFRESH_TOKEN_SECRET={Refresh Token Secret}"

    echo "RESET_PASSWORD_TOKEN_EXPIRE=1day"
    echo "RESET_PASSWORD_TOKEN_SECRET={Reset Token Secret}"

    echo "VERIFICATION_TOKEN_SECRET={Verification Token Secret"

    echo "RESPONSE_ENCRYPTION_SECRET={Response Encryption Secret}"
  } >>.env
else
  echo ".env file already exists. Nothing to do..."
fi
