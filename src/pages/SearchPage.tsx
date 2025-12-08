import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Loader2, Search, Filter, Calendar, User as UserIcon } from "lucide-react";
import { Badge } from "../components/ui/badge";

interface SearchResult {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  // Добавьте поля, которые возвращает ваш бекенд
}

export function SearchPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State для фильтров
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState("created_at");
  const [dateFrom, setDateFrom] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (sortBy) params.append("sort_by", sortBy);
      if (dateFrom) params.append("date_from", dateFrom);
      // Добавьте остальные фильтры

      // Используйте ваш baseUrl из конфига или env
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${baseUrl}/search/data?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setResults(data.data);
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Запускать поиск при изменении URL параметров
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    fetchResults();
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query }); // Это обновит URL и триггернет useEffect
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Search className="w-6 h-6 text-green-600" />
        {t('search.pageTitle')}
      </h1>

      {/* Форма расширенного поиска */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t('search.filtersTitle')}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? t('search.hideFilters') : t('search.showFilters')}
            </Button>
          </div>
        </CardHeader>
        
        {(showFilters || !results.length) && (
          <CardContent>
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2 lg:col-span-2">
                  <Label>{t('search.queryLabel')}</Label>
                  <Input 
                    placeholder={t('search.placeholder')} 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{t('search.sortBy')}</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">{t('search.sortDate')}</SelectItem>
                      <SelectItem value="title">{t('search.sortTitle')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('search.dateFrom')}</Label>
                  <Input 
                    type="date" 
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {t('search.searchButton')}
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Результаты */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : results.length > 0 ? (
          results.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-green-800 mb-1">{item.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{item.description || "No description"}</p>
                  </div>
                  <Badge variant="outline">{new Date(item.created_at).toLocaleDateString()}</Badge>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                   {/* Доп. инфо */}
                   <span className="flex items-center gap-1">
                     <Calendar className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString()}
                   </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">{t('search.noResults')}</h3>
            <p className="text-gray-500">{t('search.tryDifferent')}</p>
          </div>
        )}
      </div>
    </div>
  );
}