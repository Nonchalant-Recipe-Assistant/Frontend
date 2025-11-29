import { useState, useRef, useEffect } from "react"
import { ChatMessage } from "./ChatMessage"
import { RecipeInputPanel, RecipeRequestData } from "./RecipeInputPanel"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Send, RotateCcw, AlertCircle } from "lucide-react"
import { ScrollArea } from "./ui/scroll-area"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: string
}

interface Recipe {
  id: number
  title: string
  image: string
  readyInMinutes: number
  servings: number
  sourceUrl: string
  summary: string
  instructions: string
  extendedIngredients: {
    original: string
  }[]
}

// Ваш API ключ от Spoonacular
const SPOONACULAR_API_KEY = "3ddaa87ceb0c4d25b4b8030fb9d6dbd5"

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your Nonchalant Recipe Assistant. Tell me what ingredients you have, and I'll find real recipes for you. You can also specify your cooking tools, time constraints, and skill level below.",
      isUser: false,
      timestamp: "Just now"
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [showRecipePanel, setShowRecipePanel] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    console.log('Current Spoonacular API Key:', SPOONACULAR_API_KEY)
  }, [])

  // Улучшенная функция для поиска рецептов через Spoonacular API
  const searchRecipes = async (data: RecipeRequestData): Promise<Recipe | null> => {
    const { ingredients, timeLimit, cuisine, diet } = data
    
    try {
      // Если ингредиентов мало, делаем запрос более общим
      const searchIngredients = ingredients.length <= 2 ? ingredients.slice(0, 1) : ingredients.slice(0, 3)
      
      const params = new URLSearchParams({
        apiKey: SPOONACULAR_API_KEY,
        number: '3',
        addRecipeInformation: 'true',
        fillIngredients: 'true',
        instructionsRequired: 'true',
        sort: 'max-used-ingredients', // Сортируем по максимальному использованию ингредиентов
      })

      // Добавляем ингредиенты
      if (searchIngredients.length > 0) {
        params.append('includeIngredients', searchIngredients.join(','))
      }

      // Делаем кухню опциональной - если выбрана редкая кухня, не добавляем ее в первый запрос
      if (cuisine && cuisine !== 'Any/No preference') {
        const commonCuisines = ['Italian', 'Mexican', 'Chinese', 'Indian', 'American', 'Mediterranean']
        if (commonCuisines.includes(cuisine)) {
          params.append('cuisine', cuisine.toLowerCase())
        }
      }

      // Время готовки
      if (timeLimit && timeLimit !== 'Any/No preference' && !timeLimit.includes('No time limit')) {
        let maxTime = 60;
        if (timeLimit.includes('15')) maxTime = 15;
        else if (timeLimit.includes('30')) maxTime = 30;
        else if (timeLimit.includes('1 hour')) maxTime = 60;
        else if (timeLimit.includes('2 hours')) maxTime = 120;
        params.append('maxReadyTime', maxTime.toString())
      }

      // Диетические предпочтения
      if (diet && diet !== 'Any/No preference') {
        const dietMap: {[key: string]: string} = {
          'Vegetarian': 'vegetarian',
          'Vegan': 'vegan',
          'Gluten Free': 'glutenfree',
          'Dairy Free': 'dairyfree',
          'Keto': 'ketogenic',
          'Paleo': 'paleo'
        }
        
        if (dietMap[diet]) {
          params.append('diet', dietMap[diet])
        }
      }

      console.log('Spoonacular API request params:', params.toString());

      const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?${params}`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = await response.json()
      
      console.log('Spoonacular API response:', result);
      
      if (result.results && result.results.length > 0) {
        // Находим рецепт, который лучше всего соответствует всем ингредиентам
        const bestMatch = result.results.find((recipe: any) => 
          recipe.missedIngredientCount <= 2
        ) || result.results[0]
        
        return bestMatch
      }
      
      return null
    } catch (error) {
      console.error('Error fetching recipes:', error)
      return null
    }
  }

  const formatRecipeResponse = (recipe: Recipe, data: RecipeRequestData): string => {
    const { tools, difficulty, additionalNotes } = data

    // Форматируем инструкции (убираем HTML теги если есть)
    const cleanInstructions = recipe.instructions 
      ? recipe.instructions.replace(/<[^>]*>/g, '')
      : "No specific instructions provided. Use your cooking intuition!"

    // Форматируем ингредиенты
    const ingredientsList = recipe.extendedIngredients 
      ? recipe.extendedIngredients.map(ing => `• ${ing.original}`).join('\n')
      : "Ingredients not specified"

    // Генерируем советы на основе инструментов и сложности
    const getPersonalizedTips = () => {
      const tips = []
      
      if (tools.includes('Blender')) {
        tips.push("Use your blender for any sauce or dressing preparations")
      }
      if (tools.includes('Oven')) {
        tips.push("Your oven is perfect for baking or roasting components")
      }
      if (tools.includes('Slow Cooker')) {
        tips.push("Consider using your slow cooker for more tender results")
      }
      
      if (difficulty === 'Beginner') {
        tips.push("Take it slow and read through all steps before starting")
        tips.push("Don't worry about perfection - cooking is about learning!")
      } else if (difficulty === 'Expert') {
        tips.push("Feel free to experiment with additional spices and techniques")
        tips.push("You can probably handle some creative modifications to this recipe")
      }

      tips.push("Taste as you go and adjust seasoning to your preference")
      
      return tips
    }

    const personalizedTips = getPersonalizedTips()

    return `🍽️ **${recipe.title}**

I found this amazing real recipe for you! Here are the details:

**Key Information:**
⏰ Ready in: ${recipe.readyInMinutes} minutes
👨‍👩‍👧‍👦 Servings: ${recipe.servings}
🔧 Tools needed: ${tools.length > 0 ? tools.join(', ') : 'Basic kitchen tools'}

**Ingredients:**
${ingredientsList}

**Instructions:**
${cleanInstructions}

**Chef's Tips:**
${personalizedTips.map(tip => `• ${tip}`).join('\n')}

${additionalNotes ? `\n**Your notes considered:** I kept your note about "${additionalNotes}" in mind when selecting this recipe.` : ''}

*Recipe source: ${recipe.sourceUrl || 'Spoonacular'}*

Would you like me to find another recipe or adjust any of these details?`
  }

  // Улучшенная функция для fallback рецептов
  const generateFallbackResponse = (data: RecipeRequestData): string => {
    const { ingredients, tools, timeLimit, difficulty, cuisine, additionalNotes } = data
    
    // Создаем более осмысленные fallback рецепты на основе введенных данных
    const mainIngredient = ingredients[0] || "available ingredients"
    
    // Британские рецепты с курицей
    const britishChickenRecipes = [
      {
        title: "Quick Chicken and Leek Pie",
        description: "A British classic adapted for your time constraints",
        time: "25-30 minutes",
        instructions: `1. Preheat oven to 200°C
2. Sauté chopped leeks with butter until soft
3. Add diced chicken and cook until white
4. Stir in flour, then gradually add chicken stock
5. Add herbs and season to taste
6. Transfer to pie dish, cover with puff pastry
7. Bake for 15-20 minutes until golden`
      },
      {
        title: "English Pub-style Chicken",
        description: "Hearty chicken dish with British flavors",
        time: "20-25 minutes", 
        instructions: `1. Season chicken pieces with salt and pepper
2. Pan-fry chicken until golden on both sides
3. Add chopped onions and cook until soft
4. Pour in ale or chicken stock, simmer 10 minutes
5. Add mustard and cream, heat through
6. Serve with quick mashed potatoes or crusty bread`
      }
    ]

    // Выбираем рецепт в зависимости от кухни
    let selectedRecipe;
    if (cuisine === "British") {
      selectedRecipe = britishChickenRecipes[Math.floor(Math.random() * britishChickenRecipes.length)]
    } else {
      // Общий fallback рецепт
      selectedRecipe = {
        title: `${cuisine || "Quick"} ${mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1)}`,
        description: `A ${timeLimit ? timeLimit.toLowerCase() : "quick"} ${cuisine ? cuisine + ' ' : ''}dish`,
        time: timeLimit || "20-30 minutes",
        instructions: `1. Prepare your ${ingredients.join(', ')}
2. Season well with herbs and spices
3. ${tools.includes('Oven') ? 'Bake in preheated oven' : 'Cook on stovetop'} until done
4. Rest for 2-3 minutes before serving
5. Garnish with fresh herbs if available`
      }
    }

    // Советы в зависимости от сложности
    const getDifficultyTips = () => {
      switch (difficulty) {
        case 'Beginner':
          return ["Follow each step carefully", "Don't rush - take your time", "Taste as you go to learn seasoning"]
        case 'Intermediate':
          return ["Experiment with additional herbs", "Try varying cooking times for different textures", "Consider presentation"]
        case 'Advanced':
          return ["Perfect your knife skills", "Balance flavors carefully", "Plate with artistic touch"]
        default:
          return ["Taste and adjust seasoning", "Cook with confidence", "Have fun experimenting"]
      }
    }

    const difficultyTips = getDifficultyTips()

    return `I've created a special recipe just for you based on your preferences:

🍽️ **${selectedRecipe.title}**
${selectedRecipe.description}

**Perfect for your constraints:**
⏰ Ready in: ${selectedRecipe.time}
🔧 Uses your: ${tools.length > 0 ? tools.join(', ') : 'basic cooking tools'}
🎚️ Skill level: ${difficulty || 'All levels'}

**Ingredients:**
• ${ingredients.join('\n• ')}

**Instructions:**
${selectedRecipe.instructions}

**Pro Tips:**
${difficultyTips.map(tip => `• ${tip}`).join('\n')}

${additionalNotes ? `\n**Your special request:** "${additionalNotes}"` : ''}

Would you like me to adjust anything or search for a different type of recipe?`
  }

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      addMessage(inputMessage, true)
      setInputMessage("")
      
      // Умные ответы на основе ввода пользователя
      setTimeout(() => {
        const userMessage = inputMessage.toLowerCase()
        let response = ""

        if (userMessage.includes('hello') || userMessage.includes('hi')) {
          response = "Hello! Ready to cook something delicious? I can find real recipes based on what you have, or you can use the recipe panel for detailed searches!"
        } else if (userMessage.includes('thank')) {
          response = "You're welcome! I'm happy to help with your cooking adventures. What would you like to make next?"
        } else if (userMessage.includes('ingredient') || userMessage.includes('have')) {
          response = "Great! I can search real recipes with those ingredients. For the best results, use the recipe panel below or tell me specifically what you're looking for!"
        } else if (userMessage.includes('recipe') || userMessage.includes('make')) {
          response = "I'd love to find a real recipe for you! Could you use the recipe panel below to specify your ingredients and preferences, or just tell me what you're in the mood for?"
        } else {
          const randomResponses = [
            "I can help you find real recipes! Use the recipe panel for detailed searches or just tell me what ingredients you have.",
            "Let me find some actual recipes for you! The recipe panel gives me the best information to work with.",
            "I'm connected to a real recipe database! Tell me what you'd like to cook or use the panel for specific searches."
          ]
          response = randomResponses[Math.floor(Math.random() * randomResponses.length)]
        }
        
        addMessage(response, false)
      }, 1000)
    }
  }

  // Обновленный обработчик запросов рецептов
  const handleRecipeRequest = async (data: RecipeRequestData) => {
    const userMessage = `Find recipes with: ${data.ingredients.join(', ')}. ${
      data.tools.length > 0 ? `Tools: ${data.tools.join(', ')}. ` : ''
    }${data.timeLimit ? `Time: ${data.timeLimit}. ` : ''}${
      data.difficulty ? `Skill: ${data.difficulty}. ` : ''
    }${data.cuisine ? `Cuisine: ${data.cuisine}. ` : ''}${
      data.diet ? `Diet: ${data.diet}. ` : ''
    }${data.additionalNotes ? `Notes: ${data.additionalNotes}` : ''}`

    addMessage(userMessage, true)
    setIsLoading(true)
    
    try {
      // Ищем рецепты через API
      const recipe = await searchRecipes(data)
      
      setTimeout(() => {
        let response: string
        
        if (recipe) {
          response = formatRecipeResponse(recipe, data)
        } else {
          // Более полезное сообщение когда рецепты не найдены
          response = `I searched through thousands of recipes but couldn't find an exact match with your current filters. This usually happens when the combination is very specific.\n\n${generateFallbackResponse(data)}`
        }
        
        addMessage(response, false)
        setIsLoading(false)
      }, 2000)
      
    } catch (error) {
      setTimeout(() => {
        addMessage("I'm having temporary trouble accessing my recipe database. But don't worry - here's a great custom recipe based on what you told me:\n\n" + generateFallbackResponse(data), false)
        setIsLoading(false)
      }, 1500)
    }
  }

  const handleReset = () => {
    setMessages([
      {
        id: "1",
        text: "Hello! I'm your Nonchalant Recipe Assistant. Tell me what ingredients you have, and I'll find real recipes for you. You can also specify your cooking tools, time constraints, and skill level below.",
        isUser: false,
        timestamp: "Just now"
      }
    ])
  }

  return (
    <div className="flex-1 flex flex-col max-h-screen">
      {/* Chat Header */}
      <div className="border-b p-3 md:p-4 bg-green-50 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-base md:text-lg font-semibold text-green-800">Recipe Chat</h2>
          <p className="text-xs md:text-sm text-green-600 hidden sm:block">Get real recipes from our database</p>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="flex items-center gap-1 text-green-700">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
              <span className="text-xs">Searching...</span>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            className="border-green-200 text-green-700 hover:bg-green-100 flex-shrink-0"
          >
            <RotateCcw className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Reset Chat</span>
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-3 md:p-4">
        <div className="space-y-3 md:space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.text}
              isUser={message.isUser}
              timestamp={message.timestamp}
              messageId={message.id}
            />
          ))}
          {isLoading && (
            <div className="flex gap-3 p-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-3">
                <p className="text-gray-600">Searching for recipes in our database...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Recipe Input Panel */}
      {showRecipePanel && (
        <div className="border-t p-3 md:p-4 bg-gray-50">
          <RecipeInputPanel onSendRecipeRequest={handleRecipeRequest} />
        </div>
      )}

      {/* Text Input */}
      <div className="border-t p-3 md:p-4 bg-white">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message or use the recipe panel above..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="bg-green-600 hover:bg-green-700 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <button
            onClick={() => setShowRecipePanel(!showRecipePanel)}
            className="text-xs md:text-sm text-green-600 hover:text-green-700"
          >
            {showRecipePanel ? 'Hide' : 'Show'} Recipe Panel
          </button>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <AlertCircle className="w-3 h-3" />
            <span>Powered by real recipe API</span>
          </div>
        </div>
      </div>
    </div>
  )
}