import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Checkbox } from "./ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { X, Send, Plus, AlertCircle, Lightbulb, ChefHat, List, Grid } from "lucide-react"

interface RecipeInputPanelProps {
  onSendRecipeRequest: (data: RecipeRequestData) => void
}

export interface RecipeRequestData {
  ingredients: string[]
  tools: string[]
  timeLimit: string
  difficulty: string
  cuisine: string
  diet: string
  additionalNotes: string
}

const cookingTools = [
  "Oven", "Stovetop", "Microwave", "Air Fryer", "Slow Cooker", 
  "Pressure Cooker", "Grill", "Blender", "Food Processor", "Mixer"
]

const timeOptions = [
  "Any/No preference",
  "15 minutes or less",
  "30 minutes or less", 
  "1 hour or less",
  "2 hours or less"
]

const difficultyLevels = [
  "Any/No preference",
  "Beginner",
  "Intermediate", 
  "Advanced"
]

const cuisineTypes = [
  "Any/No preference",
  "Italian",
  "Chinese",
  "Mexican",
  "Indian",
  "Mediterranean",
  "Japanese",
  "Thai",
  "French",
  "American",
  "Korean"
]

const dietOptions = [
  "Any/No preference",
  "Vegetarian",
  "Vegan", 
  "Gluten Free",
  "Dairy Free",
  "Keto",
  "Paleo"
]

// Значительно расширенный список популярных комбинаций ингредиентов
const ingredientSuggestions = [
  // Быстрые и простые комбинации
  "chicken, rice, vegetables",
  "pasta, tomato, cheese",
  "eggs, bread, milk",
  "beef, potatoes, carrots",
  "fish, lemon, herbs",
  "tofu, soy sauce, vegetables",
  
  // Итальянские ингредиенты
  "pasta, garlic, olive oil",
  "tomato, basil, mozzarella",
  "chicken, pasta, cream",
  "eggplant, tomato, cheese",
  "risotto rice, mushrooms, parmesan",
  
  // Азиатские ингредиенты
  "rice, soy sauce, ginger",
  "noodles, vegetables, tofu",
  "chicken, broccoli, soy sauce",
  "pork, rice, vegetables",
  "shrimp, garlic, chili",
  
  // Мексиканские ингредиенты
  "beans, rice, cheese",
  "chicken, tortilla, avocado",
  "beef, tomatoes, spices",
  "corn, beans, peppers",
  "avocado, lime, cilantro",
]

// Категории ингредиентов для лучшей организации
const ingredientCategories = [
  {
    name: "Proteins",
    items: ["chicken", "beef", "pork", "fish", "shrimp", "tofu", "eggs", "lentils", "chickpeas", "beans"]
  },
  {
    name: "Vegetables",
    items: ["tomato", "potato", "carrot", "onion", "garlic", "broccoli", "spinach", "mushrooms", "bell peppers", "zucchini"]
  },
  {
    name: "Carbs",
    items: ["rice", "pasta", "bread", "quinoa", "oats", "flour", "potatoes", "noodles", "tortillas"]
  },
  {
    name: "Dairy & Alternatives",
    items: ["milk", "cheese", "yogurt", "butter", "cream", "mayo", "parmesan", "mozzarella"]
  },
  {
    name: "Pantry Staples",
    items: ["olive oil", "soy sauce", "salt", "pepper", "sugar", "honey", "spices", "herbs", "lemon", "lime"]
  }
]

export function RecipeInputPanel({ onSendRecipeRequest }: RecipeInputPanelProps) {
  const [ingredients, setIngredients] = useState<string[]>([])
  const [currentIngredient, setCurrentIngredient] = useState("")
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [timeLimit, setTimeLimit] = useState("Any/No preference")
  const [difficulty, setDifficulty] = useState("Any/No preference")
  const [cuisine, setCuisine] = useState("Any/No preference")
  const [diet, setDiet] = useState("Any/No preference")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [viewMode, setViewMode] = useState<"combos" | "categories">("combos")

  const addIngredient = () => {
    const trimmedIngredient = currentIngredient.trim()
    if (trimmedIngredient && !ingredients.includes(trimmedIngredient)) {
      setIngredients([...ingredients, trimmedIngredient])
      setCurrentIngredient("")
    }
  }

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient))
  }

  const handleToolChange = (tool: string, checked: boolean) => {
    if (checked) {
      setSelectedTools([...selectedTools, tool])
    } else {
      setSelectedTools(selectedTools.filter(t => t !== tool))
    }
  }

  const addSuggestion = (suggestion: string) => {
    const newIngredients = suggestion.split(',').map(s => s.trim()).filter(s => s)
    setIngredients([...ingredients, ...newIngredients])
  }

  const addSingleIngredient = (ingredient: string) => {
    if (!ingredients.includes(ingredient)) {
      setIngredients([...ingredients, ingredient])
    }
  }

  const validateForm = (): string[] => {
    const errors: string[] = []
    
    if (ingredients.length === 0) {
      errors.push("Please add at least one ingredient")
    }
    
    if (ingredients.length === 1) {
      errors.push("Try adding 2-3 ingredients for better results")
    }
    
    // Проверяем, не слишком ли специфичный запрос
    const specificFilters = [
      cuisine !== "Any/No preference",
      diet !== "Any/No preference",
      timeLimit !== "Any/No preference",
      difficulty !== "Any/No preference"
    ].filter(Boolean).length
    
    if (specificFilters >= 3 && ingredients.length < 2) {
      errors.push("With multiple filters, try adding more ingredients")
    }
    
    return errors
  }

  const handleSubmit = () => {
    const errors = validateForm();
    
    // Check for critical error first
    if (errors.length > 0 && errors[0] === "Please add at least one ingredient") {
      alert("Please add at least one ingredient");
      return;
    }

    // If there are only warnings (non-critical errors), show confirm dialog
    if (errors.length > 0) {
      const shouldProceed = confirm(
        `For better results:\n\n${errors.join('\n')}\n\nWould you like to search anyway?`
      );
      if (!shouldProceed) return;
    }

    // Submit the form
    onSendRecipeRequest({
      ingredients,
      tools: selectedTools,
      timeLimit,
      difficulty,
      cuisine,
      diet,
      additionalNotes
    });
  }

  const getSearchQuality = (): { quality: "good" | "fair" | "poor"; message: string } => {
    const ingredientCount = ingredients.length
    const filterCount = [
      cuisine !== "Any/No preference",
      diet !== "Any/No preference", 
      timeLimit !== "Any/No preference",
      difficulty !== "Any/No preference",
      selectedTools.length > 0
    ].filter(Boolean).length

    if (ingredientCount >= 3) {
      return { quality: "good", message: "Great! This should find good matches." }
    } else if (ingredientCount >= 2 && filterCount <= 2) {
      return { quality: "fair", message: "Good start. Consider adding more ingredients." }
    } else {
      return { quality: "poor", message: "Try adding more ingredients or reducing filters." }
    }
  }

  const searchQuality = getSearchQuality()

  return (
    <Card className="border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-green-800 flex items-center gap-2">
          <ChefHat className="w-5 h-5" />
          Recipe Request
        </CardTitle>
        <div className="flex items-start gap-2 text-sm text-gray-600 bg-blue-50 p-2 rounded-md">
          <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <span>💡 <strong>Tip:</strong> Add 2-3 main ingredients for best results. Too many filters can limit options.</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Quality Indicator */}
        <div 
          className={`p-3 rounded-lg text-sm ${
            searchQuality.quality === "good" ? "bg-green-50 text-green-700 border border-green-200" :
            searchQuality.quality === "fair" ? "bg-yellow-50 text-yellow-700 border border-yellow-200" :
            "bg-orange-50 text-orange-700 border border-orange-200"
          }`}
          data-testid="search-quality-indicator"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{searchQuality.message}</span>
          </div>
        </div>

        {/* Ingredients Input */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Available Ingredients
            <span className="text-xs text-gray-500">(2-3 recommended)</span>
          </Label>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Type ingredients or click below for suggestions..."
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                data-testid="ingredient-input"
              />
              
              {/* Quick Add Buttons - всегда видимые */}
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">Quick add:</span>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant={viewMode === "combos" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("combos")}
                      className="h-7 text-xs"
                      data-testid="combos-view-button"
                    >
                      <List className="w-3 h-3 mr-1" />
                      Combos
                    </Button>
                    <Button
                      type="button"
                      variant={viewMode === "categories" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("categories")}
                      className="h-7 text-xs"
                      data-testid="categories-view-button"
                    >
                      <Grid className="w-3 h-3 mr-1" />
                      By Category
                    </Button>
                  </div>
                </div>

                {/* Ingredient Suggestions based on view mode */}
                <div 
                  className="border border-gray-200 rounded-md p-3 bg-gray-50 max-h-60 overflow-y-auto"
                  data-testid="ingredient-suggestions"
                >
                  {viewMode === "combos" ? (
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500 font-medium">Popular combinations:</div>
                      <div className="grid grid-cols-1 gap-2">
                        {ingredientSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => addSuggestion(suggestion)}
                            className="w-full text-left p-2 bg-white hover:bg-green-50 border border-gray-200 rounded-md text-sm transition-colors"
                            data-testid={`suggestion-${suggestion.replace(/, /g, '-').toLowerCase()}`}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ingredientCategories.map((category, index) => (
                        <div key={index} data-testid={`category-${category.name.toLowerCase()}`}>
                          <div className="font-medium text-sm text-gray-700 mb-2">{category.name}</div>
                          <div className="flex flex-wrap gap-1">
                            {category.items.map((item, itemIndex) => (
                              <button
                                key={itemIndex}
                                onClick={() => addSingleIngredient(item)}
                                className="px-2 py-1 text-xs bg-white hover:bg-green-100 border border-gray-300 rounded-md transition-colors"
                                data-testid={`ingredient-${item}`}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button 
              onClick={addIngredient} 
              size="sm"
              className="bg-green-600 hover:bg-green-700 flex-shrink-0 h-10"
              data-testid="add-ingredient-button"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {ingredients.length > 0 && (
            <div className="mt-3">
              <div className="text-sm font-medium text-gray-700 mb-2">Selected ingredients:</div>
              <div className="flex flex-wrap gap-2" data-testid="selected-ingredients">
                {ingredients.map((ingredient, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1 py-1.5"
                    data-testid={`ingredient-badge-${ingredient}`}
                  >
                    {ingredient}
                    <button 
                      onClick={() => removeIngredient(ingredient)}
                      className="hover:text-green-600 ml-1"
                      data-testid={`remove-ingredient-${ingredient}`}
                      aria-label={`Remove ${ingredient}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cooking Tools */}
        <div className="space-y-2">
          <Label>Available Cooking Tools <span className="text-gray-500 text-sm font-normal">(Optional)</span></Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" data-testid="cooking-tools">
            {cookingTools.map((tool) => (
              <div key={tool} className="flex items-center space-x-2">
                <Checkbox
                  id={tool}
                  checked={selectedTools.includes(tool)}
                  onCheckedChange={(checked) => handleToolChange(tool, checked as boolean)}
                  data-testid={`tool-checkbox-${tool}`}
                />
                <Label htmlFor={tool} className="text-sm">{tool}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Time Limit */}
          <div className="space-y-2">
            <Label>Time Available</Label>
            <Select value={timeLimit} onValueChange={setTimeLimit}>
              <SelectTrigger data-testid="time-limit-select">
                <SelectValue placeholder="Select time limit" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time} data-testid={`time-option-${time}`}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label>Cooking Skill Level</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger data-testid="difficulty-select">
                <SelectValue placeholder="Select difficulty level" />
              </SelectTrigger>
              <SelectContent>
                {difficultyLevels.map((level) => (
                  <SelectItem key={level} value={level} data-testid={`difficulty-option-${level}`}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cuisine Type */}
          <div className="space-y-2">
            <Label>Preferred Cuisine</Label>
            <Select value={cuisine} onValueChange={setCuisine}>
              <SelectTrigger data-testid="cuisine-select">
                <SelectValue placeholder="Select cuisine type" />
              </SelectTrigger>
              <SelectContent>
                {cuisineTypes.map((type) => (
                  <SelectItem key={type} value={type} data-testid={`cuisine-option-${type}`}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dietary Preferences */}
          <div className="space-y-2">
            <Label>Dietary Preferences</Label>
            <Select value={diet} onValueChange={setDiet}>
              <SelectTrigger data-testid="diet-select">
                <SelectValue placeholder="Select dietary preference" />
              </SelectTrigger>
              <SelectContent>
                {dietOptions.map((option) => (
                  <SelectItem key={option} value={option} data-testid={`diet-option-${option}`}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label>Additional Notes <span className="text-gray-500 text-sm font-normal">(Optional)</span></Label>
          <Textarea
            placeholder="Any dietary restrictions, preferences, or special requests..."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="resize-none h-20"
            data-testid="additional-notes-textarea"
          />
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit}
          className="w-full bg-green-600 hover:bg-green-700"
          // disabled={ingredients.length === 0}
          data-testid="submit-recipe-button"
        >
          <Send className="w-4 h-4 mr-2" />
          Get Recipe Suggestions
        </Button>

        {/* Quick Tips */}
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Better search tips:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Start with 2-3 main ingredients</li>
            <li>Use fewer filters for more options</li>
            <li>Common cuisines find more matches</li>
            <li>Click ingredients above to add them quickly</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}