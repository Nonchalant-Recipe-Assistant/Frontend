import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from "./ui/button";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.resolvedLanguage === 'en' ? 'ru' : 'en';
    
    // 1. Меняем язык в интерфейсе React
    i18n.changeLanguage(newLang);
    
    // 2. Опционально: явно дергаем бек (хотя библиотека i18next-browser-languagedetector сама умеет ставить куки,
    // но по заданию надо "На backend в cookies реализовать сохранение", поэтому можно отправить запрос)
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    fetch(`${baseUrl}/auth/set-language?lang=${newLang}`, { method: 'POST' })
      .catch(err => console.error("Failed to sync lang with backend", err));
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleLanguage}
      className="gap-2"
    >
      <Globe className="w-4 h-4" />
      <span className="uppercase">{i18n.resolvedLanguage}</span>
    </Button>
  );
};

export default LanguageSwitcher;