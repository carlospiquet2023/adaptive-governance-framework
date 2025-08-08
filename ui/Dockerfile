# Dockerfile para UI React (Vite ou Next.js)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn install --frozen-lockfile || npm install
COPY . .
RUN yarn build || npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
