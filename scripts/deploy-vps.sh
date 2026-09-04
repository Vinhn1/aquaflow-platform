#!/bin/bash
# ==============================================================================
# Script Triển Khai Nhanh AquaFlow CAWACO Trên Máy Chủ VPS Ubuntu
# ==============================================================================

set -e

echo "[AquaFlow Deploy] 1. Kiem tra tep cau hinh .env.production..."
if [ ! -f .env.production ]; then
  echo "LỖI: Chưa tìm thấy tệp .env.production!"
  echo "Vui lòng chạy: cp .env.production.example .env.production và điền các giá trị thực tế."
  exit 1
fi

echo "[AquaFlow Deploy] 2. Build Docker images va khoi chay co so du lieu..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d postgres

echo "[AquaFlow Deploy] 3. Doi PostgreSQL khoi dong hoan tat..."
sleep 5

echo "[AquaFlow Deploy] 4. Thuc thi Prisma Migration & Seed du lieu vao CSDL..."
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm --user root api npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm --user root api npx tsx apps/api/prisma/seed.ts

echo "[AquaFlow Deploy] 5. Khoi dong toan bo he thong (API + Admin Portal)..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

echo "[AquaFlow Deploy] 6. Kiem tra trang thai he thong..."
docker compose -f docker-compose.prod.yml ps

echo "=========================================================================="
echo " TRIEN KHAI HOAN TAT!"
echo " Backend API dang lang nghe tai: http://127.0.0.1:3005"
echo " Admin Portal dang lang nghe tai: http://127.0.0.1:8085"
echo " Kiem tra Health Check: curl http://127.0.0.1:3005/health"
echo "=========================================================================="
