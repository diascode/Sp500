FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY server.js stock-dashboard.html legend.html ./
EXPOSE 8080
CMD ["node", "server.js"]
