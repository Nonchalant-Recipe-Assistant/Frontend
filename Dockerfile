# Этап 1: Сборка (Build)
FROM node:20-alpine as build

WORKDIR /app

# Копируем файлы зависимостей
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Аргумент для адреса API (важно для Vite)
# По умолчанию ставим localhost, так как браузер будет обращаться снаружи контейнера
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Собираем проект (создается папка build)
RUN npm run build

# Этап 2: Запуск через Nginx (Production ready)
FROM nginx:alpine

# Копируем собранные файлы из этапа build в папку Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Копируем конфиг Nginx (см. Шаг 2)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]