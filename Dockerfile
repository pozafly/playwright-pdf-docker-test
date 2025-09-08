FROM node:20-bookworm AS builder
WORKDIR /app
COPY package*.json ./

# postinstall에서 쓰는 스크립트(또는 전체 scripts)를 먼저 복사
COPY scripts ./scripts
# 2) 설치
RUN npm install --no-audit --no-fund
# 3) 나머지 소스 복사 및 빌드
COPY . .
RUN npm run build

FROM mcr.microsoft.com/playwright:v1.55.0-noble
WORKDIR /app
EXPOSE 3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ENTRYPOINT ["node", "server.js"]