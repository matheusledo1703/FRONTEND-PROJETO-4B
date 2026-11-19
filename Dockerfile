FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV VITE_URL_DA_API=/api

EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host"]