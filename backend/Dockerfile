FROM node:22-alpine AS builder
WORKDIR /backend
COPY package*.json ./ 
RUN npm install
COPY . .
EXPOSE 3000
CMD ["sh", "-c", "node ./src/index.js"]