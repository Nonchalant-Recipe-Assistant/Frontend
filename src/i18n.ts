import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// --- РЕСУРСЫ ПЕРЕВОДОВ ПРЯМО ЗДЕСЬ ---
const resources = {
  en: {
    translation: {
      header: {
        title: "Nonchalant Recipe Assistant",
        subtitle: "Your AI cooking companion",
        signIn: "Sign In",
        signInShort: "In",
        signUp: "Sign Up",
        signUpShort: "Up",
        profile: "Profile",
        settings: "Settings",
        help: "Help",
        logout: "Sign Out",
        login: "Log In"
      },
      chat: {
        title: "Recipe Chat",
        subtitle: "Get real recipes from our database",
        reset: "Reset Chat",
        searching: "Searching...",
        placeholder: "Type a message...",
        welcome: "Hello! Tell me what ingredients you have.",
        save: "Save",
        saved: "Saved",
        addedToFavorites: "Added \"{{title}}\" to favorites!"
      },
      auth: {
        title: "Nonchalant Recipe",
        subtitle: "Your AI-powered cooking companion",
        authenticationTitle: "Authentication",
        description: "Sign in to your account or create a new one to access your favorite recipes and groups.",
        signInTab: "Sign In",
        signUpTab: "Sign Up",
        emailLabel: "Email",
        emailPlaceholder: "Enter your email",
        passwordLabel: "Password",
        passwordPlaceholder: "Enter your password",
        createPasswordPlaceholder: "Create a password",
        confirmPasswordLabel: "Confirm Password",
        confirmPasswordPlaceholder: "Confirm your password",
        signInButton: "Sign In",
        signingIn: "Signing in...",
        signUpButton: "Create Account",
        creatingAccount: "Creating account...",
        orContinue: "Or continue with",
        googleButton: "Sign in with Google",
        connecting: "Connecting...",
        fillAllFields: "Please fill in all fields",
        welcomeBack: "Welcome back!",
        passwordsDoNotMatch: "Passwords don't match",
        passwordTooShort: "Password must be at least 6 characters",
        accountCreated: "Account created successfully! Welcome!",
        signingInGoogle: "Signing in with Google..."
      },
      errors: {
        userDataFetch: "Failed to get user data",
        loginFailed: "Login failed",
        network: "Network error - cannot connect to server",
        registrationFailed: "Registration failed",
        googleNotImplemented: "Google authentication not implemented yet",
        resendVerificationFailed: "Failed to resend verification",
        verifyEmailFailed: "Failed to verify email",
        uploadAvatarFailed: "Failed to upload avatar",
        notAuthenticated: "User not authenticated",
        noSession: "No valid session found",
        requestFailed: "Request failed"
      },
      verifyEmail: {
        title: "Email Verification",
        status: {
          ready: "Ready to verify.",
          noToken: "No verification token found.",
          connecting: "Connecting to server...",
          success: "Email verified successfully!",
          failed: "Verification failed.",
          error: "An unexpected error occurred. Check Console."
        },
        buttons: {
          goToApp: "Go to App",
          home: "Home",
          tryAgain: "Try Again"
        }
      },
      chatWidget: {
        title: "Recipe Chat",
        status: {
          online: "Online",
          connecting: "Connecting...",
          disconnected: "Disconnected"
        },
        private: "Private",
        public: "Public",
        to: "To:",
        userPlaceholder: "user@example.com",
        emptyTitle: "No messages yet",
        emptySubtitle: "Start a conversation about recipes!",
        badgePrivate: "Private",
        inputPlaceholder: "Type a message about recipes...",
        inputPrivatePlaceholder: "Private message to {{user}}..."
      },
      groups: {
        myGroups: "My Groups",
        loading: "Loading groups...",
        noGroups: "No groups yet",
        noGroupsDesc: "Create a group to share recipes with family and friends, or join an existing group.",
        create: "Create Group",
        createFirst: "Create Your First Group",
        creating: "Creating...",
        join: "Join Group",
        joining: "Joining...",
        leave: "Leave Group",
        delete: "Delete Group",
        share: "Share Recipe",
        shareBtn: "Share Recipe with Group",
        owner: "Owner",
        members_one: "{{count}} member",
        members_other: "{{count}} members",
        created: "Created {{date}}",
        copyInvite: "Copy Invite Code",
        cancel: "Cancel",
        
        createTitle: "Create New Group",
        createDesc: "Create a new group to share recipes with family and friends.",
        joinTitle: "Join a Group",
        joinDesc: "Enter an invite code to join an existing recipe sharing group.",
        shareTitle: "Share Recipe",
        shareDesc: "Share one of your favorite recipes with a group you're a member of.",
        
        nameLabel: "Group Name",
        descLabel: "Description (Optional)",
        codeLabel: "Invite Code",
        selectGroup: "Select Group",
        selectRecipe: "Select Recipe",
        
        placeholders: {
          name: "Enter group name...",
          desc: "Describe your group...",
          code: "Enter invite code...",
          selectGroup: "Choose a group...",
          selectRecipe: "Choose a recipe..."
        },
        
        confirmDeleteTitle: "Delete Group?",
        confirmDeleteDesc: "This will permanently delete \"{{name}}\" and remove all members. This action cannot be undone.",
        confirmLeaveTitle: "Leave Group?",
        confirmLeaveDesc: "Are you sure you want to leave \"{{name}}\"? You'll need a new invite to rejoin.",
        
        errors: {
          nameRequired: "Group name is required",
          createFailed: "Failed to create group",
          codeRequired: "Invite code is required",
          joinFailed: "Failed to join group",
          selectBoth: "Please select both a group and a recipe",
          recipeNotFound: "Recipe not found",
          shareFailed: "Failed to share recipe",
          getCodeFailed: "Failed to get invite code",
          copyFailed: "Failed to copy invite code",
          leaveFailed: "Failed to leave group",
          deleteFailed: "Failed to delete group"
        },
        success: {
          created: "Group created successfully!",
          joined: "Successfully joined group!",
          shared: "Recipe shared successfully!",
          codeCopied: "Invite code copied to clipboard!",
          left: "Left group successfully",
          deleted: "Group deleted successfully"
        }
      }, 
      profile: {
        title: "Profile & Settings",
        backToChat: "Back to Chat",
        testSignUp: "Test Sign Up",
        createTestAccount: "Create Test Account",
        testAccountDesc: "Create a test account to try out the application features.",
        defaultUsername: "Chef",
        verified: "Verified Account",
        unverified: "Unverified",
        changeAvatarTip: "Click avatar to change picture",
        tabs: {
          favorites: "Favorite Recipes",
          favoritesShort: "Favorites",
          groups: "Groups & Sharing",
          groupsShort: "Groups"
        },
        favorites: {
          emptyTitle: "No favorite recipes yet",
          emptyDesc: "Start a conversation with our AI assistant and save recipes you like by clicking the star button.",
          startCooking: "Start Cooking",
          savedOn: "Saved on {{date}}",
          confirmRemoveTitle: "Remove from favorites?",
          confirmRemoveDesc: "This will permanently remove \"{{title}}\" from your favorite recipes. This action cannot be undone.",
          remove: "Remove"
        },
        placeholders: {
          testEmail: "Enter test email..."
        },
        errors: {
          fileTooLarge: "File is too large (max 5MB)",
          invalidFileType: "Please upload an image file",
          avatarUpdateFailed: "Failed to update avatar",
          uploadError: "An error occurred while uploading",
          testAccountFailed: "Failed to create test account",
          emailPasswordRequired: "Email and password are required"
        },
        success: {
          avatarUpdated: "Avatar updated successfully!",
          recipeRemoved: "Recipe removed from favorites",
          testAccountCreated: "Test account created successfully!"
        }
      }, 
      recipePanel: {
        title: "Recipe Request",
        tip: "Add 2-3 main ingredients for best results. Too many filters can limit options.",
        ingredientsLabel: "Available Ingredients",
        ingredientsSubLabel: "(2-3 recommended)",
        ingredientsPlaceholder: "Type ingredients or click below for suggestions...",
        quickAdd: "Quick add:",
        combos: "Combos",
        categories: "By Category",
        popularCombos: "Popular combinations:",
        selectedIngredients: "Selected ingredients",
        toolsLabel: "Available Cooking Tools",
        timeLabel: "Time Available",
        skillLabel: "Cooking Skill Level",
        cuisineLabel: "Preferred Cuisine",
        dietLabel: "Dietary Preferences",
        notesLabel: "Additional Notes",
        optional: "(Optional)",
        selectTime: "Select time limit",
        selectDifficulty: "Select difficulty level",
        selectCuisine: "Select cuisine type",
        selectDiet: "Select dietary preference",
        anyPreference: "Any/No preference",
        notesPlaceholder: "Any dietary restrictions, preferences, or special requests...",
        submitButton: "Get Recipe Suggestions",
        searchTipsTitle: "Better search tips:",
        searchTip1: "Start with 2-3 main ingredients",
        searchTip2: "Use fewer filters for more options",
        searchTip3: "Common cuisines find more matches",
        searchTip4: "Click ingredients above to add them quickly",
        quality: {
          good: "Great! This should find good matches.",
          fair: "Good start. Consider adding more ingredients.",
          poor: "Try adding more ingredients or reducing filters."
        },
        errors: {
          noIngredients: "Please add at least one ingredient",
          fewIngredients: "Try adding 2-3 ingredients for better results",
          specific: "With multiple filters, try adding more ingredients",
          improveResults: "For better results",
          continueQuery: "Would you like to search anyway?"
        },
        category: {
          proteins: "Proteins",
          vegetables: "Vegetables",
          carbs: "Carbs",
          dairy: "Dairy & Alternatives",
          pantry: "Pantry Staples"
        }
      }, 
      search: {
        placeholder: "Search recipes, groups...",
        pageTitle: "Search Results",
        filtersTitle: "Advanced Search Filters",
        showFilters: "Show Filters",
        hideFilters: "Hide Filters",
        queryLabel: "Keywords",
        sortBy: "Sort By",
        sortDate: "Date Created",
        sortTitle: "Title / Name",
        dateFrom: "Date From",
        searchButton: "Search Data",
        noResults: "No results found",
        tryDifferent: "Try adjusting your search or filters to find what you're looking for."
      }
    }
  },
  ru: {
    translation: {
      header: {
        title: "Nonchalant Recipe Assistant",
        subtitle: "Ваш ИИ-компаньон по кулинарии",
        signIn: "Войти",
        signInShort: "Вход",
        signUp: "Регистрация",
        signUpShort: "Рег",
        profile: "Профиль",
        settings: "Настройки",
        help: "Помощь",
        logout: "Выйти",
        login: "Войти"
      },
      chat: {
        title: "Чат рецептов",
        subtitle: "Реальные рецепты из базы данных",
        reset: "Сбросить чат",
        searching: "Поиск...",
        placeholder: "Введите сообщение...",
        welcome: "Привет! Скажите, какие ингредиенты у вас есть.",
        save: "В избранное",
        saved: "Сохранено",
        addedToFavorites: "Рецепт \"{{title}}\" добавлен в избранное!"
      },
      auth: {
        title: "Nonchalant Recipe",
        subtitle: "Ваш ИИ-помощник на кухне",
        authenticationTitle: "Аутентификация",
        description: "Войдите в аккаунт или создайте новый, чтобы сохранять рецепты и вступать в группы.",
        signInTab: "Вход",
        signUpTab: "Регистрация",
        emailLabel: "Email",
        emailPlaceholder: "Введите ваш email",
        passwordLabel: "Пароль",
        passwordPlaceholder: "Введите ваш пароль",
        createPasswordPlaceholder: "Придумайте пароль",
        confirmPasswordLabel: "Подтвердите пароль",
        confirmPasswordPlaceholder: "Повторите пароль",
        signInButton: "Войти",
        signingIn: "Входим...",
        signUpButton: "Создать аккаунт",
        creatingAccount: "Создаем аккаунт...",
        orContinue: "Или продолжить через",
        googleButton: "Войти через Google",
        connecting: "Подключение...",
        fillAllFields: "Пожалуйста, заполните все поля",
        welcomeBack: "С возвращением!",
        passwordsDoNotMatch: "Пароли не совпадают",
        passwordTooShort: "Пароль должен быть не менее 6 символов",
        accountCreated: "Аккаунт успешно создан! Добро пожаловать!",
        signingInGoogle: "Вход через Google..."
      }, 
      errors: {
        userDataFetch: "Не удалось получить данные пользователя",
        loginFailed: "Ошибка входа",
        network: "Ошибка сети - нет соединения с сервером",
        registrationFailed: "Ошибка регистрации",
        googleNotImplemented: "Вход через Google пока не реализован",
        resendVerificationFailed: "Не удалось отправить повторное подтверждение",
        verifyEmailFailed: "Не удалось подтвердить email",
        uploadAvatarFailed: "Не удалось загрузить аватар",
        notAuthenticated: "Пользователь не авторизован",
        noSession: "Сессия истекла",
        requestFailed: "Запрос не удался"
      },
      verifyEmail: {
        title: "Подтверждение Email",
        status: {
          ready: "Готово к подтверждению.",
          noToken: "Токен подтверждения не найден.",
          connecting: "Подключение к серверу...",
          success: "Email успешно подтвержден!",
          failed: "Ошибка подтверждения.",
          error: "Произошла неожиданная ошибка."
        },
        buttons: {
          goToApp: "Перейти в приложение",
          home: "На главную",
          tryAgain: "Попробовать снова"
        }
      },
      chatWidget: {
        title: "Чат Рецептов",
        status: {
          online: "Онлайн",
          connecting: "Подключение...",
          disconnected: "Отключено"
        },
        private: "Приватный",
        public: "Общий",
        to: "Кому:",
        userPlaceholder: "user@example.com",
        emptyTitle: "Сообщений пока нет",
        emptySubtitle: "Начните обсуждение рецептов!",
        badgePrivate: "Приват",
        inputPlaceholder: "Введите сообщение о рецептах...",
        inputPrivatePlaceholder: "Личное сообщение для {{user}}..."
      },
      groups: {
        myGroups: "Мои Группы",
        loading: "Загрузка групп...",
        noGroups: "Нет групп",
        noGroupsDesc: "Создайте группу для обмена рецептами с друзьями или вступите в существующую.",
        create: "Создать группу",
        createFirst: "Создать первую группу",
        creating: "Создание...",
        join: "Вступить",
        joining: "Вступаем...",
        leave: "Покинуть группу",
        delete: "Удалить группу",
        share: "Поделиться рецептом",
        shareBtn: "Поделиться рецептом с группой",
        owner: "Владелец",
        members_one: "{{count}} участник",
        members_few: "{{count}} участника",
        members_many: "{{count}} участников",
        members_other: "{{count}} участников",
        created: "Создано {{date}}",
        copyInvite: "Скопировать код приглашения",
        cancel: "Отмена",
        
        createTitle: "Создание новой группы",
        createDesc: "Создайте новую группу для обмена рецептами.",
        joinTitle: "Вступить в группу",
        joinDesc: "Введите код приглашения, чтобы присоединиться к группе.",
        shareTitle: "Поделиться рецептом",
        shareDesc: "Выберите рецепт из избранного, чтобы отправить его в группу.",
        
        nameLabel: "Название группы",
        descLabel: "Описание (опционально)",
        codeLabel: "Код приглашения",
        selectGroup: "Выберите группу",
        selectRecipe: "Выберите рецепт",
        
        placeholders: {
          name: "Введите название...",
          desc: "Опишите вашу группу...",
          code: "Введите код...",
          selectGroup: "Выберите группу...",
          selectRecipe: "Выберите рецепт..."
        },
        
        confirmDeleteTitle: "Удалить группу?",
        confirmDeleteDesc: "Это действие навсегда удалит группу \"{{name}}\" и всех её участников. Отменить нельзя.",
        confirmLeaveTitle: "Покинуть группу?",
        confirmLeaveDesc: "Вы уверены, что хотите покинуть \"{{name}}\"? Чтобы вернуться, нужен будет новый код.",
        
        errors: {
          nameRequired: "Название группы обязательно",
          createFailed: "Не удалось создать группу",
          codeRequired: "Код приглашения обязателен",
          joinFailed: "Не удалось вступить в группу",
          selectBoth: "Пожалуйста, выберите группу и рецепт",
          recipeNotFound: "Рецепт не найден",
          shareFailed: "Не удалось поделиться рецептом",
          getCodeFailed: "Не удалось получить код",
          copyFailed: "Не удалось скопировать код",
          leaveFailed: "Не удалось покинуть группу",
          deleteFailed: "Не удалось удалить группу"
        },
        success: {
          created: "Группа успешно создана!",
          joined: "Вы успешно вступили в группу!",
          shared: "Рецепт отправлен!",
          codeCopied: "Код скопирован в буфер обмена!",
          left: "Вы покинули группу",
          deleted: "Группа удалена"
        }
      }, 
      profile: {
        title: "Профиль и Настройки",
        backToChat: "Назад в чат",
        testSignUp: "Тестовая рег.",
        createTestAccount: "Создать тестовый аккаунт",
        testAccountDesc: "Создайте тестовый аккаунт для проверки функций приложения.",
        defaultUsername: "Шеф",
        verified: "Подтвержден",
        unverified: "Не подтвержден",
        changeAvatarTip: "Нажмите на аватар, чтобы изменить",
        tabs: {
          favorites: "Избранные рецепты",
          favoritesShort: "Избранное",
          groups: "Группы и Обмен",
          groupsShort: "Группы"
        },
        favorites: {
          emptyTitle: "В избранном пока пусто",
          emptyDesc: "Начните диалог с ИИ-помощником и сохраняйте понравившиеся рецепты, нажимая на звездочку.",
          startCooking: "Начать готовить",
          savedOn: "Сохранено {{date}}",
          confirmRemoveTitle: "Удалить из избранного?",
          confirmRemoveDesc: "Это навсегда удалит \"{{title}}\" из ваших рецептов. Отменить нельзя.",
          remove: "Удалить"
        },
        placeholders: {
          testEmail: "Введите тестовый email..."
        },
        errors: {
          fileTooLarge: "Файл слишком большой (макс 5МБ)",
          invalidFileType: "Пожалуйста, загрузите изображение",
          avatarUpdateFailed: "Не удалось обновить аватар",
          uploadError: "Ошибка при загрузке",
          testAccountFailed: "Не удалось создать тестовый аккаунт",
          emailPasswordRequired: "Email и пароль обязательны"
        },
        success: {
          avatarUpdated: "Аватар успешно обновлен!",
          recipeRemoved: "Рецепт удален из избранного",
          testAccountCreated: "Тестовый аккаунт создан!"
        }
      }, 
      recipePanel: {
        title: "Поиск рецепта",
        tip: "Добавьте 2-3 основных ингредиента. Слишком много фильтров может уменьшить результаты.",
        ingredientsLabel: "Доступные ингредиенты",
        ingredientsSubLabel: "(рекомендуется 2-3)",
        ingredientsPlaceholder: "Введите ингредиент или выберите ниже...",
        quickAdd: "Быстро добавить:",
        combos: "Комбо",
        categories: "Категории",
        popularCombos: "Популярные сочетания:",
        selectedIngredients: "Выбрано",
        toolsLabel: "Кухонные инструменты",
        timeLabel: "Доступное время",
        skillLabel: "Навыки готовки",
        cuisineLabel: "Кухня",
        dietLabel: "Диета",
        notesLabel: "Заметки",
        optional: "(Опционально)",
        selectTime: "Выберите время",
        selectDifficulty: "Выберите сложность",
        selectCuisine: "Выберите кухню",
        selectDiet: "Выберите диету",
        anyPreference: "Неважно / Любое",
        notesPlaceholder: "Аллергии, предпочтения или пожелания...",
        submitButton: "Найти рецепты",
        searchTipsTitle: "Советы для поиска:",
        searchTip1: "Начните с 2-3 главных ингредиентов",
        searchTip2: "Меньше фильтров = больше рецептов",
        searchTip3: "Популярные кухни дают больше результатов",
        searchTip4: "Кликайте по ингредиентам выше для быстрого добавления",
        quality: {
          good: "Отлично! Должно найтись много хорошего.",
          fair: "Неплохо. Можно добавить еще ингредиентов.",
          poor: "Попробуйте добавить ингредиенты или убрать фильтры."
        },
        errors: {
          noIngredients: "Пожалуйста, добавьте хотя бы один ингредиент",
          fewIngredients: "Добавьте 2-3 ингредиента для лучшего результата",
          specific: "С таким количеством фильтров нужно больше ингредиентов",
          improveResults: "Для лучших результатов",
          continueQuery: "Всё равно искать?"
        },
        category: {
          proteins: "Белки (Мясо/Рыба)",
          vegetables: "Овощи",
          carbs: "Углеводы",
          dairy: "Молочные продукты",
          pantry: "Специи и соусы"
        }
      }, 
      search: {
        placeholder: "Поиск рецептов, групп...",
        pageTitle: "Результаты поиска",
        filtersTitle: "Расширенные фильтры",
        showFilters: "Показать фильтры",
        hideFilters: "Скрыть фильтры",
        queryLabel: "Ключевые слова",
        sortBy: "Сортировка",
        sortDate: "По дате создания",
        sortTitle: "По названию",
        dateFrom: "Дата от",
        searchButton: "Найти данные",
        noResults: "Ничего не найдено",
        tryDifferent: "Попробуйте изменить параметры поиска или фильтры."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources, // Используем переменную выше
    fallbackLng: 'en',
    debug: true, // Включаем дебаг, смотрите консоль браузера (F12)
    detection: {
      order: ['cookie', 'localStorage', 'navigator'],
      caches: ['cookie'],
      lookupCookie: 'lang',
    },
    interpolation: {
      escapeValue: false, 
    }
  });

export default i18n;