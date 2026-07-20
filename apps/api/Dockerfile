FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci
COPY tsconfig.base.json ./
COPY apps/api apps/api
RUN npm run db:generate && npm run build -w @portfolio/api
EXPOSE 4000
CMD ["npm", "run", "start", "-w", "@portfolio/api"]
