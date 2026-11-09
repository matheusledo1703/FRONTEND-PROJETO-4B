FROM node:22-alpine AS construcao
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Endereço da API que o navegador vai chamar
ARG VITE_URL_DA_API=http://localhost:3000/api
ENV VITE_URL_DA_API=$VITE_URL_DA_API

RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=construcao /app/dist /usr/share/nginx/html
EXPOSE 80
