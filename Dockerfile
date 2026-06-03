FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY server.js stock-dashboard.html legend.html ./
COPY lib/ ./lib/
COPY static/ ./static/
COPY entrypoint.sh ./
RUN apk add --no-cache su-exec \
 && addgroup -S appgroup && adduser -S appuser -G appgroup \
 && mkdir -p /app/data && chown -R appuser:appgroup /app \
 && chmod +x /app/entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["/app/entrypoint.sh"]
