import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Checkbox } from "./ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { X, Send, Plus } from "lucide-react"

interface RecipeInputPanelProps {
  onSendRecipeRequest: (data: RecipeRequestData) => void
}

export interface RecipeRequestData {
  ingredients: string[]
  tools: string[]
  timeLimit: string
  difficulty: string
  cuisine: string
  additionalNotes: string
}

const cookingTools = [
  "Oven", "Stovetop", "Microwave", "Air Fryer", "Slow Cooker", 
  "Pressure Cooker", "Grill", "Blender", "Food Processor", "Mixer"
]

const timeOptions = [
  "15 minutes or less",
  "30 minutes or less", 
  "1 hour or less",
  "2 hours or less",
  "No time limit"
]

const difficultyLevels = [
  "Beginner",
  "Intermediate", 
  "Advanced",
  "Professional"
]

const cuisineTypes = [
  "Italian",
  "Chinese",
  "Mexican",
  "Indian",
  "Mediterranean",
  "Japanese",
  "Thai",
  "French",
  "American",
  "Korean",
  "Middle Eastern",
  "Greek",
  "Spanish",
  "Vietnamese",
  "German",
  "British",
  "Moroccan",
  "Brazilian",
  "Ethiopian",
  "Fusion",
  "Any/No preference"
]

export function RecipeInputPanel({ onSendRecipeRequest }: RecipeInputPanelProps) {
  const [ingredients, setIngredients] = useState<string[]>([])
  const [currentIngredient, setCurrentIngredient] = useState("")
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [timeLimit, setTimeLimit] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [cuisine, setCuisine] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()])
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

  const handleSubmit = () => {
    if (ingredients.length === 0) {
      alert("Please add at least one ingredient")
      return
    }

    onSendRecipeRequest({
      ingredients,
      tools: selectedTools,
      timeLimit,
      difficulty,
      cuisine,
      additionalNotes
    })

    // Reset form
    setIngredients([])
    setSelectedTools([])
    setTimeLimit("")
    setDifficulty("")
    setCuisine("")
    setAdditionalNotes("")
  }

  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="text-green-800">Recipe Request</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ingredients Input */}
        <div className="space-y-2">
          <Label>Available Ingredients</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add an ingredient..."
              value={currentIngredient}
              onChange={(e) => setCurrentIngredient(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
              className="flex-1"
            />
            <Button 
              onClick={addIngredient} 
              size="sm"
              className="bg-green-600 hover:bg-green-700 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {ingredients.map((ingredient, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="bg-green-100 text-green-800 hover:bg-green-200"
                >
                  {ingredient}
                  <button 
                    onClick={() => removeIngredient(ingredient)}
                    className="ml-1 hover:text-green-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Cooking Tools */}
        <div className="space-y-2 rounded-[0px]">
          <Label>Available Cooking Tools</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {cookingTools.map((tool) => (
              <div key={tool} className="flex items-center space-x-2">
                <Checkbox
                  id={tool}
                  checked={selectedTools.includes(tool)}
                  onCheckedChange={(checked) => handleToolChange(tool, checked as boolean)}
                />
                <Label htmlFor={tool} className="text-sm">{tool}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Time Limit */}
        <div className="space-y-2">
          <Label>Time Available</Label>
          <Select value={timeLimit} onValueChange={setTimeLimit}>
            <SelectTrigger>
              <SelectValue placeholder="Select time limit" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((time) => (
                <SelectItem key={time} value={time}>{time}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <Label>Cooking Skill Level</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty level" />
            </SelectTrigger>
            <SelectContent>
              {difficultyLevels.map((level) => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cuisine Type */}
        <div className="space-y-2">
          <Label>Preferred Cuisine</Label>
          <Select value={cuisine} onValueChange={setCuisine}>
            <SelectTrigger>
              <SelectValue placeholder="Select cuisine type" />
            </SelectTrigger>
            <SelectContent>
              {cuisineTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label>Additional Notes (Optional)</Label>
          <Textarea
            placeholder="Any dietary restrictions, preferences, or special requests..."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="resize-none h-20"
          />
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit}
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={ingredients.length === 0}
        >
          <Send className="w-4 h-4 mr-2" />
          Get Recipe Suggestions
        </Button>
      </CardContent>
    </Card>
  )
}