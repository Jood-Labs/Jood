// BACKEND: This file currently returns demo recipes. Replace getRecipeSuggestions and getRecipeById with API requests while preserving the recipe data shape documented in README.md.

const recipes = [
    {
        id: 'pasta',
        name: 'مكرونة بالطماطم',
        description: 'وجبة بسيطة بصلصة الطماطم والثوم والريحان',
        minutes: 25,
        servings: 2,
        nutrition: {
            calories: 420,
            protein: 13,
            carbs: 65,
            fat: 12,
            fiber: 6,
        },
        ingredients: [
            {
                name: 'مكرونة',
                quantity: '٢٠٠ غرام',
                aliases: ['معكرونة', 'مكرونه', 'معكرونه'],
            },
            {
                name: 'طماطم',
                quantity: '٣ حبات',
                aliases: ['بندورة'],
            },
            { name: 'ثوم', quantity: 'فصّان' },
            { name: 'زيت زيتون', quantity: 'ملعقة كبيرة' },
            { name: 'ريحان', quantity: 'حسب الرغبة' },
        ],
        steps: [
            {
                title: 'جهّز المكونات',
                text: 'اغسل الطماطم وقطّعها ثم افرم الثوم',
                seconds: 0,
            },
            {
                title: 'اسلق المكرونة',
                text: 'اسلق المكرونة حسب الوقت المكتوب على العبوة وعدّل المؤقّت ليتوافق معه',
                seconds: 600,
            },
            {
                title: 'جهّز الصلصة',
                text: 'سخّن الزيت وأضف الثوم ثم الطماطم واتركها تتسبّك مع التحريك حتى تصل للقوام المناسب',
                seconds: 480,
            },
            {
                title: 'اجمع المكونات',
                text: 'صفِّ المكرونة وأضفها للصلصة وقلّبها ثم أضف الريحان وقدّمها',
                seconds: 0,
            },
        ],
    },
    {
        id: 'potatoes',
        name: 'بطاطس بالفرن',
        description: 'بطاطس متبّلة بالبابريكا وزيت الزيتون',
        minutes: 40,
        servings: 2,
        nutrition: {
            calories: 310,
            protein: 6,
            carbs: 45,
            fat: 12,
            fiber: 5,
        },
        ingredients: [
            {
                name: 'بطاطس',
                quantity: '٣ حبات متوسطة',
                aliases: ['بطاطا'],
            },
            { name: 'زيت زيتون', quantity: 'ملعقتان كبيرتان' },
            { name: 'بابريكا', quantity: 'ملعقة صغيرة' },
            { name: 'ملح', quantity: 'حسب الرغبة' },
        ],
        steps: [
            {
                title: 'جهّز الفرن والبطاطس',
                text: 'سخّن الفرن على ٢٠٠ درجة مئوية واغسل البطاطس وقطّعها لشرائح متقاربة الحجم',
                seconds: 0,
            },
            {
                title: 'تبّل البطاطس',
                text: 'قلّب البطاطس مع الزيت والبابريكا والملح ووزّعها بطبقة واحدة في الصينية',
                seconds: 0,
            },
            {
                title: 'أدخل الصينية للفرن',
                text: 'اخبز البطاطس لمدة ١٥ دقيقة قبل تقليبها',
                seconds: 900,
            },
            {
                title: 'قلّب وكمّل الخَبز',
                text: 'قلّب البطاطس وكمّل الخَبز حتى تنضج وتتحمّر وعدّل الوقت حسب حجم القطع وفرنك',
                seconds: 900,
            },
        ],
    },
    {
        id: 'salad',
        name: 'سلطة الحمص',
        description: 'سلطة خفيفة بالحمص والخضار وتتبيلة الليمون',
        minutes: 10,
        servings: 2,
        nutrition: {
            calories: 280,
            protein: 10,
            carbs: 34,
            fat: 11,
            fiber: 9,
        },
        ingredients: [
            {
                name: 'حمص مطبوخ',
                quantity: 'كوب ونصف',
                aliases: ['حمص'],
            },
            { name: 'خيار', quantity: 'حبة واحدة' },
            {
                name: 'طماطم',
                quantity: 'حبتان',
                aliases: ['بندورة'],
            },
            { name: 'ليمون', quantity: 'نصف حبة' },
            { name: 'زيت زيتون', quantity: 'ملعقة كبيرة' },
        ],
        steps: [
            {
                title: 'جهّز المكونات',
                text: 'صفِّ الحمص المطبوخ واغسل الخضار',
                seconds: 0,
            },
            {
                title: 'قطّع الخضار',
                text: 'قطّع الخيار والطماطم لمكعبات وضعها مع الحمص',
                seconds: 0,
            },
            {
                title: 'أضف التتبيلة',
                text: 'أضف عصير الليمون وزيت الزيتون وقلّب المكونات ثم قدّم السلطة',
                seconds: 0,
            },
        ],
    },
]

function normalizeName(value = '') {
    return String(value)
        .trim()
        .toLocaleLowerCase()
        .replace(/[ًٌٍَُِّْـ]/g, '')
        .replace(/[أإآ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/\s+/g, ' ')
}

function matchesIngredient(recipeIngredient, userIngredient) {
    return [
        recipeIngredient.name,
        ...(recipeIngredient.aliases || []),
    ].some(
        (name) =>
            normalizeName(name) === normalizeName(userIngredient.name)
    )
}

function dateDay(value) {
    if (!value) return null

    const [year, month, day] = value.split('-').map(Number)
    if (!year || !month || !day) return null

    return Date.UTC(year, month - 1, day) / 86400000
}

function todayDay() {
    const now = new Date()

    return (
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) /
        86400000
    )
}

function getPriorityDays(item) {
    const mode = item.expiryMode || (item.expiryDate ? 'date' : '')
    const enabled = item.expiringSoon ?? Boolean(mode)

    if (!enabled) return null

    if (mode === 'date') {
        const target = dateDay(item.expiryDate)

        if (target === null) return null

        const days = target - todayDay()
        return days >= 0 ? days : null
    }

    const offsets = {
        today: 0,
        'two-days': 2,
        week: 7,
    }

    if (mode in offsets) {
        const recorded =
            dateDay(item.expiryEstimateRecordedOn) ?? todayDay()

        const days = recorded + offsets[mode] - todayDay()
        return days >= 0 ? days : null
    }

    return 7
}

function rankRecipes(ingredients) {
    return recipes
        .map((recipe) => {
            const matches = ingredients
                .map((item) => ({
                    item,
                    days: getPriorityDays(item),
                }))
                .filter(
                    ({ item, days }) =>
                        days !== null &&
                        recipe.ingredients.some((entry) =>
                            matchesIngredient(entry, item)
                        )
                )

            return {
                ...recipe,

                ingredients: recipe.ingredients.map((entry) => ({
                    ...entry,
                    available: ingredients.some((item) =>
                        matchesIngredient(entry, item)
                    ),
                })),

                priorityNames: [
                    ...new Set(matches.map(({ item }) => item.name)),
                ],

                priorityDays: matches.length
                    ? Math.min(...matches.map(({ days }) => days))
                    : Infinity,
            }
        })
        .sort((a, b) => a.priorityDays - b.priorityDays)
}

export async function getRecipeSuggestions(
    input = {},
    { signal } = {}
) {
    if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError')
    }

    // BACKEND: POST the current ingredients, image/preference context, preparationTime, and servings to the recipe-suggestions endpoint and return the recipes array.
    const ingredients = Array.isArray(input.ingredients)
        ? input.ingredients
        : []

    return rankRecipes(ingredients)
}

export async function getRecipeById(
    id,
    input = {},
    options = {}
) {
    // BACKEND: Fetch a recipe by ID from the API instead of deriving it from the demo list.
    const result = await getRecipeSuggestions(input, options)
    const recipe = result.find((item) => item.id === id)

    if (!recipe) {
        throw new Error('الوصفة غير موجودة')
    }

    return recipe
}