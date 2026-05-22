FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY server.js stock-dashboard.html legend.html ./
COPY lib/ ./lib/
COPY static/ ./static/
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN mkdir -p /app/data && chown -R appuser:appgroup /app
USER appuser
EXPOSE 8080
CMD ["node", "server.js"]
