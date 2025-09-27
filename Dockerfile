FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install --legacy-peer-deps || yarn install || pnpm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
