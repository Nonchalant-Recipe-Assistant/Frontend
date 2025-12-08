import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function SearchBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-sm flex items-center">
      <Input
        type="text"
        placeholder={t('search.placeholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        // pr-12 добавляет отступ справа, чтобы текст не заезжал под кнопку
        className="pr-12 bg-gray-50 focus:bg-white transition-colors"
      />
      <Button 
        type="submit" 
        variant="ghost" 
        size="sm" 
        // absolute positioning: прижимаем кнопку к правому краю
        className="absolute right-1 top-1 bottom-1 h-auto w-10 text-gray-500 hover:text-green-600 hover:bg-green-50"
      >
        <Search className="w-4 h-4" />
      </Button>
    </form>
  );
}