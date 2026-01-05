FROM node:20-alpine
RUN npm install -g pnpm
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
RUN pnpm install
COPY . .
RUN pnpm run build
EXPOSE 3000
CMD ["node", "dist/src/main.js"]