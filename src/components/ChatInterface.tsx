import { useState, useRef, useEffect } from "react"
import { ChatMessage } from "./ChatMessage"
import { RecipeInputPanel, RecipeRequestData } from "./RecipeInputPanel"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Send, RotateCcw } from "lucide-react"
import { ScrollArea } from "./ui/scroll-area"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your Nonchalant Recipe Assistant. Tell me what ingredients you have, and I'll suggest some delicious recipes for you. You can also specify your cooking tools, time constraints, and skill level below.",
      isUser: false,
      timestamp: "Just now"
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [showRecipePanel, setShowRecipePanel] = useState(true)
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

  const generateRecipeResponse = (data: RecipeRequestData): string => {
    const { ingredients, tools, timeLimit, difficulty, cuisine, additionalNotes } = data
    
    // Mock recipe suggestions based on ingredients and cuisine
    const getRecipeIdeas = (cuisineType: string) => {
      const cuisineRecipes = {
        'Italian': ['Pasta Primavera', 'Risotto', 'Minestrone Soup', 'Caprese Salad'],
        'Chinese': ['Fried Rice', 'Stir-Fry Noodles', 'Sweet and Sour Chicken', 'Hot Pot'],
        'Mexican': ['Quesadillas', 'Tacos', 'Burrito Bowl', 'Mexican Rice'],
        'Indian': ['Curry', 'Biryani', 'Dal', 'Tikka Masala'],
        'Mediterranean': ['Greek Salad', 'Hummus Bowl', 'Grilled Vegetables', 'Falafel'],
        'Japanese': ['Ramen', 'Sushi Bowl', 'Teriyaki', 'Miso Soup'],
        'Thai': ['Pad Thai', 'Green Curry', 'Tom Yum Soup', 'Thai Basil Stir-Fry'],
        'French': ['Ratatouille', 'Quiche', 'French Onion Soup', 'Coq au Vin'],
        'American': ['Comfort Food Casserole', 'BBQ Bowl', 'Mac and Cheese', 'Grilled Burger'],
        'Korean': ['Bibimbap', 'Korean BBQ', 'Kimchi Fried Rice', 'Bulgogi'],
        'Middle Eastern': ['Shawarma Bowl', 'Tabbouleh', 'Stuffed Grape Leaves', 'Kebabs'],
        'default': ['Mediterranean Pasta', 'Asian Stir-Fry', 'Comfort Food Casserole', 'Fresh Garden Salad', 'Hearty Soup']
      }
      
      return cuisineRecipes[cuisineType] || cuisineRecipes['default']
    }
    
    const recipeIdeas = cuisine && cuisine !== 'Any/No preference' ? getRecipeIdeas(cuisine) : getRecipeIdeas('default')
    const selectedRecipe = recipeIdeas[Math.floor(Math.random() * recipeIdeas.length)]
    
    return `Based on your ingredients (${ingredients.join(', ')})${cuisine && cuisine !== 'Any/No preference' ? ` and your preference for ${cuisine} cuisine` : ''}, I recommend making a ${selectedRecipe}!

Here's what I suggest:

🧑‍🍳 **Recipe**: ${selectedRecipe}
🍽️ **Cuisine**: ${cuisine || 'Fusion style'}
⏰ **Time**: ${timeLimit || 'Flexible timing'}
📊 **Difficulty**: ${difficulty || 'Adaptable to your skill level'}
🔧 **Tools needed**: ${tools.length > 0 ? tools.join(', ') : 'Basic kitchen tools'}

**Quick Instructions:**
1. Prep your ${ingredients.slice(0, 2).join(' and ')} first
2. ${tools.includes('Oven') ? 'Preheat your oven to 375°F' : 'Heat your cooking surface'}
3. Combine ingredients thoughtfully${cuisine && cuisine !== 'Any/No preference' ? ` with ${cuisine} cooking techniques` : ''}
4. Cook until aromatic and properly heated
5. Season to taste and enjoy!

${additionalNotes ? `\n**Special notes**: I've considered your note about "${additionalNotes}" in this suggestion.` : ''}

Would you like a more detailed recipe, or shall we explore other options with your ingredients?`
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
      
      // Simulate AI response
      setTimeout(() => {
        addMessage("That's interesting! Let me help you with that. Feel free to use the recipe panel below to get more specific suggestions, or continue our conversation here.", false)
      }, 1000)
    }
  }

  const handleRecipeRequest = (data: RecipeRequestData) => {
    // Create user message from the recipe request
    const userMessage = `I have these ingredients: ${data.ingredients.join(', ')}. ${
      data.tools.length > 0 ? `Available tools: ${data.tools.join(', ')}. ` : ''
    }${data.timeLimit ? `Time limit: ${data.timeLimit}. ` : ''}${
      data.difficulty ? `Skill level: ${data.difficulty}. ` : ''
    }${data.cuisine ? `Preferred cuisine: ${data.cuisine}. ` : ''}${data.additionalNotes ? `Additional notes: ${data.additionalNotes}` : ''}`

    addMessage(userMessage, true)
    
    // Generate AI response
    setTimeout(() => {
      const response = generateRecipeResponse(data)
      addMessage(response, false)
    }, 1500)
  }

  const handleReset = () => {
    setMessages([
      {
        id: "1",
        text: "Hello! I'm your Nonchalant Recipe Assistant. Tell me what ingredients you have, and I'll suggest some delicious recipes for you. You can also specify your cooking tools, time constraints, and skill level below.",
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
          <p className="text-xs md:text-sm text-green-600 hidden sm:block">Get personalized cooking suggestions</p>
        </div>
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
            placeholder="Type a message..."
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
        <div className="flex items-center mt-2">
          <button
            onClick={() => setShowRecipePanel(!showRecipePanel)}
            className="text-xs md:text-sm text-green-600 hover:text-green-700"
          >
            {showRecipePanel ? 'Hide' : 'Show'} Recipe Panel
          </button>
        </div>
      </div>
    </div>
  )
}