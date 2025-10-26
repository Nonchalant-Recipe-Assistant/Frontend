# 🍳 CookAI Frontend

**Frontend-часть умного генератора рецептов** на основе искусственного интеллекта.

[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff.svg)](https://vitejs.dev/)

## 🎯 О проекте

CookAI — это веб-приложение, которое использует искусственный интеллект для генерации персонализированных рецептов. Пользователи могут указывать имеющиеся продукты, кухонные приборы, время приготовления и уровень сложности, а система создает уникальные рецепты специально под их запрос.

### Основные возможности:
- 🎯 **Персонализированная генерация рецептов** под конкретные продукты и условия
- ⏱️ **Адаптация под ваши возможности** - время, приборы, сложность
- 💾 **Сохранение в избранное** - создавайте личную кулинарную коллекцию
- 👥 **Группы пользователей** - делитесь рецептами с друзьями
- 📱 **Адаптивный интерфейс** - удобство на любом устройстве

## 🛠 Технологический стек

### Frontend:
- **React 18** - пользовательский интерфейс
- **TypeScript** - типизация и надежность кода
- **Vite** - быстрая сборка и разработка
- **Tailwind CSS** - современная стилизация
- **React Router** - навигация между страницами
- **React Query/TanStack Query** - управление состоянием серверных данных
- **Figma** - UI

## 🎨 Прототипы и дизайн

### Figma-макеты:
- [📱 Полный прототип приложения](https://www.figma.com/make/M009AXArtUIENBj8fSu9Sf/Nonchalant-Recipe-Assistant?node-id=0-1&p=f&t=5UOfCiDVCAsSEdda-0&fullscreen=1)

## 🔗 API сервера

### Swagger (remote access): [link](http://25.29.64.173:3000/docs)
### How to use:
1. Connect to local network and open link
2. Choose endpoint and press "Test it out"
3. Enter test data and see the result

## 🔗 Процесс связи Frontend и Backend:
📡 Как работает подключение:
Frontend (React приложение) → отправляет HTTP запросы → Backend (API сервер) → возвращает данные с рецептами
### ✅Что нужно для работы:
- Backend должен быть запущен и доступен по сети
- Frontend знает правильный IP/адрес бекенда
- Брандмауэр разрешает подключения на порту бекенда
- Оба компьютера в одной сети Hamachi
