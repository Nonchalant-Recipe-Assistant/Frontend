// vite-env.d.ts

/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Объявляем, что VITE_API_BASE_URL существует и является строкой
  readonly VITE_API_BASE_URL: string 
  // Если у вас будут другие переменные, начинающиеся с VITE_, добавьте их здесь:
  // readonly VITE_ANOTHER_VAR: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}