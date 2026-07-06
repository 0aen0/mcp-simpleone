# Хост кеширующего реестра-зеркала. Пусто (по умолчанию) = тянуть напрямую
# с Docker Hub. Чтобы ходить через зеркало, укажите хост СО СЛЕШЕМ на конце:
#   docker build --build-arg REGISTRY=your-mirror.example.com/ .
ARG REGISTRY=
ARG NODE_TAG=20-slim

############################################
# Stage 1 — builder: ставим всё и собираем TS
############################################
FROM ${REGISTRY}library/node:${NODE_TAG} AS builder
WORKDIR /app

# Зависимости (включая dev — нужны для tsc)
COPY package.json package-lock.json ./
RUN npm ci

# Исходники и сборка в dist/
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

############################################
# Stage 2 — runtime: только prod-зависимости
############################################
FROM ${REGISTRY}library/node:${NODE_TAG} AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Только production-зависимости
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Скомпилированный код. package.json уже на месте —
# он импортируется из dist/config.js как ../package.json
COPY --from=builder /app/dist ./dist

# Каталог для логов (LOG_OUTPUT=file|both) с правами для пользователя node
RUN mkdir -p /app/logs && chown -R node:node /app/logs

USER node

# HTTP/SSE транспорт слушает этот порт внутри контейнера
EXPOSE 3000

# Проверка живости по /health (есть только в http/sse режиме)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.MCP_PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# По умолчанию запускаем сетевой (HTTP/SSE) транспорт.
# Для stdio-режима переопределите команду: ["node","dist/index.js"]
CMD ["node", "dist/index.js", "--transport", "http", "--port", "3000"]
