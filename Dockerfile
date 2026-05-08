FROM node:22-alpine
WORKDIR /app
COPY server.js stock-dashboard.html legend.html ./
EXPOSE 8080
CMD ["node", "server.js"]
