#!/bin/bash
set -e

echo "[AquaFlow] 1. Dang tao tep .env.production va .env chuan..."
cat << 'EOF' > .env.production
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.websiteproject.id.vn

POSTGRES_DB=aquaflow_cawaco
POSTGRES_USER=aquaflow_user
POSTGRES_PASSWORD=cawaco_pg_pass_2026_x89kL

DATABASE_URL="postgresql://aquaflow_user:cawaco_pg_pass_2026_x89kL@postgres:5432/aquaflow_cawaco?schema=public"

JWT_SECRET=cawaco_jwt_secret_key_production_2026_x89kL_secure
JWT_EXPIRES_IN=7d
PAYMENT_WEBHOOK_SECRET=cawaco_vietqr_hmac_secret_production_2026

MOCK_CAWACO_API=false
MOCK_PAYMENT_GATEWAY=false
MOCK_ZALO_AUTH=false

ZALO_APP_ID=3879828502555234376
ZALO_APP_SECRET=e63PhT2GDL5N5v6L3OUw
ZALO_MINI_APP_ID=2784671839475576206
ZALO_OA_ID=2562028218754028209

VIETQR_CLIENT_ID=cawaco_client_id
VIETQR_API_KEY=cawaco_api_key

ZALO_OA_ACCESS_TOKEN=LQZE2UkNAqHQfCO9vfSkH5obm0pZZNj5FDxfUFck33T2xPWB_he_5K_NfnoewHuHJOMGEQ7hDJTVbBuQbUSpFtEesZNBpMGG1flpA-gjHnnLoDafXBbs4MxMxHUWiGWRHTk53OkwDnDlvRylhiuI6KlmWYwqWZKYUCtS9BMTCJXOwxX-lAaMS67rdLk5aYHNUzw-OiEo2Yqzv9eqrhiFVJ28uat-k6Le7fFpLQ_DLc9dcRvLsgeCP2J6uK_8imXe5lBjSDk4O3utxuuCxOWB0YtSc0x9j6X21llyVjpETLW4eFnouFHKGn-0mqkYu5nINv6nIhhY6b1oaBDRliS_Tbc4YIJcpnWALkIs5ApM2X5ndh1OkUelKbk7ts2Nra5BU9Z3PvtsLqbsi_a4iEeG46cKeLwpeqaHYGRTV-Y084u
ZALO_OA_REFRESH_TOKEN=tPCCTO1FcXlIdmHrZK-V6zIU0d28LU9qYCK_Ig5nmIIzvIjEWLUn8DxLAZ7xGS4ufUPR1PXBnXEV-Hu-Xr25AA75UYopJuH4uU9lRCDl-NRSs11BZWJgMgUGFKs_9DbXZRX52OyAesQFsqz8ed2hGOVcLdwwIRGNkUrl0Rr_bsocudPd-pATIyMk2rtyV_TNsSneES9EWnJUXaGbzoUc5wceG7oqDwj3ZPj2BvOJsagpcKHEw3YfN_2DTLl9C8ipwAHl3B4izY2ClXqqW0YA48Ex5twFE_XutOGwITuBeoE1ZKH9gZol8eVqJ3IAHPGkYSnj6e84ack2qLXKkbsWFhBRQpME3l0wtBaC1USTbJMzhbGddoNA7Opm4dIZOkrncjKWQhf2t5o8n31Cb6ZfHupS57fBTshbhbo3M94H
EOF

cp .env.production .env

echo "[AquaFlow] 2. Cap nhat mat khau PostgreSQL container dong nhat..."
docker compose -f docker-compose.prod.yml exec -T postgres psql -U aquaflow_user -d aquaflow_cawaco -c "ALTER USER aquaflow_user WITH PASSWORD 'cawaco_pg_pass_2026_x89kL';" 2>/dev/null || true

echo "[AquaFlow] 3. Dong bo Prisma Schema vao PostgreSQL..."
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm --user root api npx prisma db push --schema=apps/api/prisma/schema.prisma --accept-data-loss

echo "[AquaFlow] 3. Khoi tao du lieu he thong (seed)..."
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm --user root api npx tsx apps/api/prisma/seed.ts || true

echo "[AquaFlow] 4. Khoi dong lai cac container (Force Recreate)..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --force-recreate api admin

echo "[AquaFlow] 4. Cho 5 giay de backend khoi dong..."
sleep 5

echo "[AquaFlow] 4. Kich hoat dong bo tin nhan Zalo OA..."
curl -s -X POST http://127.0.0.1:3005/api/v1/zalo/sync
echo ""

echo "[AquaFlow] 5. Kiem tra danh sach hoi thoai hien tai tren VPS..."
curl -s http://127.0.0.1:3005/api/v1/zalo/conversations
echo ""
echo "[AquaFlow] HOAN TAT! Vui long mo trinh duyet va nhan Ctrl + F5."
