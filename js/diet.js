/**
 * WorkIn&Out — Diet & Nutrition Manager
 * window.DietManager
 */
(function () {
  'use strict';

  const KEYS = {
    LOG: 'workinout_diet_log',
  };

  /* ══════════════════════════════════════════
     MEALS DATABASE  (20+ meals)
  ══════════════════════════════════════════ */
  const MEALS_DB = [
    // ── BREAKFAST ──────────────────────────
    {
      id: 'oatmeal_berries', name: 'Oatmeal with Berries & Honey',
      category: 'breakfast', image: '🥣',
      calories: 320, protein: 10, carbs: 58, fats: 6,
      cost: 3.50, prepTime: 5, cookTime: 10, servings: 1,
      tags: ['vegan', 'high-carb', 'budget-friendly'],
      ingredients: [
        { item: 'Rolled oats', amount: 80, unit: 'g' },
        { item: 'Almond milk', amount: 240, unit: 'ml' },
        { item: 'Mixed berries', amount: 100, unit: 'g' },
        { item: 'Honey', amount: 15, unit: 'ml' },
        { item: 'Chia seeds', amount: 10, unit: 'g' },
      ],
      instructions: [
        'Combine oats and almond milk in a saucepan over medium heat.',
        'Cook, stirring occasionally, for 8-10 minutes until thick and creamy.',
        'Transfer to a bowl and top with mixed berries.',
        'Drizzle with honey and sprinkle chia seeds. Serve immediately.',
      ],
    },
    {
      id: 'egg_white_omelette', name: 'Egg White Veggie Omelette',
      category: 'breakfast', image: '🍳',
      calories: 215, protein: 28, carbs: 8, fats: 8,
      cost: 4.20, prepTime: 5, cookTime: 10, servings: 1,
      tags: ['high-protein', 'low-carb', 'keto-friendly'],
      ingredients: [
        { item: 'Egg whites', amount: 6, unit: 'large' },
        { item: 'Spinach', amount: 50, unit: 'g' },
        { item: 'Bell pepper', amount: 60, unit: 'g' },
        { item: 'Mushrooms', amount: 60, unit: 'g' },
        { item: 'Olive oil', amount: 5, unit: 'ml' },
        { item: 'Salt & pepper', amount: 0, unit: 'to taste' },
      ],
      instructions: [
        'Dice the bell pepper and slice the mushrooms.',
        'Heat olive oil in a non-stick pan over medium heat.',
        'Sauté peppers and mushrooms for 3 minutes, then add spinach until wilted.',
        'Pour in the whisked egg whites and cook undisturbed for 2 minutes.',
        'Fold omelette in half, slide onto a plate and season.',
      ],
    },
    {
      id: 'greek_yogurt_parfait', name: 'Greek Yogurt Protein Parfait',
      category: 'breakfast', image: '🥛',
      calories: 370, protein: 30, carbs: 42, fats: 8,
      cost: 5.00, prepTime: 5, cookTime: 0, servings: 1,
      tags: ['high-protein', 'quick', 'no-cook'],
      ingredients: [
        { item: 'Non-fat Greek yogurt', amount: 200, unit: 'g' },
        { item: 'Granola', amount: 40, unit: 'g' },
        { item: 'Banana', amount: 1, unit: 'medium' },
        { item: 'Protein powder (vanilla)', amount: 25, unit: 'g' },
        { item: 'Blueberries', amount: 60, unit: 'g' },
      ],
      instructions: [
        'Mix protein powder into Greek yogurt until smooth.',
        'Layer half the yogurt mixture in a glass or bowl.',
        'Add a layer of granola and sliced banana.',
        'Top with remaining yogurt, blueberries, and remaining granola.',
      ],
    },
    {
      id: 'avocado_toast_eggs', name: 'Avocado Toast with Poached Eggs',
      category: 'breakfast', image: '🥑',
      calories: 450, protein: 22, carbs: 38, fats: 24,
      cost: 6.50, prepTime: 10, cookTime: 10, servings: 1,
      tags: ['healthy-fats', 'popular'],
      ingredients: [
        { item: 'Sourdough bread', amount: 2, unit: 'slices' },
        { item: 'Ripe avocado', amount: 1, unit: 'medium' },
        { item: 'Eggs', amount: 2, unit: 'large' },
        { item: 'Lemon juice', amount: 10, unit: 'ml' },
        { item: 'Red chilli flakes', amount: 0, unit: 'pinch' },
        { item: 'Salt & pepper', amount: 0, unit: 'to taste' },
      ],
      instructions: [
        'Toast the sourdough slices until golden.',
        'Mash avocado with lemon juice, salt and pepper.',
        'Bring a pot of water to a gentle simmer. Add a splash of vinegar.',
        'Crack eggs into the water and poach for 3 minutes.',
        'Spread avocado on toast, top with poached eggs and chilli flakes.',
      ],
    },

    // ── LUNCH ──────────────────────────────
    {
      id: 'grilled_chicken_salad', name: 'Grilled Chicken & Quinoa Salad',
      category: 'lunch', image: '🥗',
      calories: 480, protein: 46, carbs: 35, fats: 14,
      cost: 9.00, prepTime: 15, cookTime: 20, servings: 1,
      tags: ['high-protein', 'meal-prep', 'gluten-free'],
      ingredients: [
        { item: 'Chicken breast', amount: 180, unit: 'g' },
        { item: 'Quinoa (dry)', amount: 60, unit: 'g' },
        { item: 'Cherry tomatoes', amount: 100, unit: 'g' },
        { item: 'Cucumber', amount: 80, unit: 'g' },
        { item: 'Baby spinach', amount: 60, unit: 'g' },
        { item: 'Olive oil', amount: 15, unit: 'ml' },
        { item: 'Lemon juice', amount: 15, unit: 'ml' },
        { item: 'Oregano', amount: 0, unit: 'pinch' },
      ],
      instructions: [
        'Cook quinoa in 120ml water for 15 min, then fluff and cool.',
        'Season chicken with olive oil, oregano, salt and pepper.',
        'Grill chicken 6-7 min per side until cooked through. Slice.',
        'Combine quinoa, halved tomatoes, sliced cucumber and spinach.',
        'Top with sliced chicken and dress with lemon juice and remaining olive oil.',
      ],
    },
    {
      id: 'tuna_wrap', name: 'High-Protein Tuna Wrap',
      category: 'lunch', image: '🌯',
      calories: 420, protein: 38, carbs: 40, fats: 12,
      cost: 5.50, prepTime: 10, cookTime: 0, servings: 1,
      tags: ['high-protein', 'quick', 'no-cook', 'budget-friendly'],
      ingredients: [
        { item: 'Canned tuna in water', amount: 1, unit: 'can (185g)' },
        { item: 'Whole-wheat tortilla', amount: 1, unit: 'large' },
        { item: 'Greek yogurt', amount: 50, unit: 'g' },
        { item: 'Dijon mustard', amount: 10, unit: 'g' },
        { item: 'Romaine lettuce', amount: 40, unit: 'g' },
        { item: 'Tomato', amount: 60, unit: 'g' },
        { item: 'Red onion', amount: 20, unit: 'g' },
      ],
      instructions: [
        'Drain and flake the tuna.',
        'Mix tuna with Greek yogurt and Dijon mustard.',
        'Lay tortilla flat; add lettuce, tomato and red onion.',
        'Spoon tuna mixture in the center and wrap tightly.',
        'Slice in half and serve immediately.',
      ],
    },
    {
      id: 'turkey_meatballs', name: 'Turkey Meatballs with Zucchini Noodles',
      category: 'lunch', image: '🍝',
      calories: 520, protein: 50, carbs: 18, fats: 28,
      cost: 10.00, prepTime: 20, cookTime: 25, servings: 2,
      tags: ['high-protein', 'low-carb', 'meal-prep'],
      ingredients: [
        { item: 'Ground turkey', amount: 400, unit: 'g' },
        { item: 'Zucchini', amount: 3, unit: 'medium' },
        { item: 'Egg', amount: 1, unit: 'large' },
        { item: 'Parmesan', amount: 30, unit: 'g' },
        { item: 'Garlic', amount: 3, unit: 'cloves' },
        { item: 'Marinara sauce', amount: 200, unit: 'ml' },
        { item: 'Italian seasoning', amount: 5, unit: 'g' },
      ],
      instructions: [
        'Mix turkey, egg, parmesan, minced garlic and seasoning. Form into balls.',
        'Brown meatballs in an oiled pan over medium-high heat, 3 min each side.',
        'Pour marinara sauce over meatballs, cover and simmer 15 min.',
        'Spiralise zucchini into noodles and sauté 2 min in olive oil.',
        'Serve meatballs and sauce over zucchini noodles.',
      ],
    },
    {
      id: 'lentil_soup', name: 'High-Protein Red Lentil Soup',
      category: 'lunch', image: '🍲',
      calories: 380, protein: 22, carbs: 56, fats: 8,
      cost: 4.00, prepTime: 10, cookTime: 30, servings: 2,
      tags: ['vegan', 'high-protein', 'budget-friendly', 'meal-prep'],
      ingredients: [
        { item: 'Red lentils', amount: 200, unit: 'g' },
        { item: 'Carrots', amount: 2, unit: 'medium' },
        { item: 'Onion', amount: 1, unit: 'large' },
        { item: 'Tomatoes (canned)', amount: 400, unit: 'g' },
        { item: 'Vegetable broth', amount: 800, unit: 'ml' },
        { item: 'Cumin', amount: 5, unit: 'g' },
        { item: 'Turmeric', amount: 3, unit: 'g' },
        { item: 'Olive oil', amount: 15, unit: 'ml' },
      ],
      instructions: [
        'Dice onion and carrots. Sauté in olive oil 5 min.',
        'Add cumin and turmeric; cook 1 more minute.',
        'Stir in lentils, tomatoes and broth. Bring to a boil.',
        'Reduce heat and simmer 25 min until lentils are soft.',
        'Blend half the soup for a creamy texture. Season and serve.',
      ],
    },

    // ── DINNER ─────────────────────────────
    {
      id: 'salmon_asparagus', name: 'Baked Salmon with Asparagus',
      category: 'dinner', image: '🐟',
      calories: 520, protein: 52, carbs: 12, fats: 28,
      cost: 14.00, prepTime: 10, cookTime: 20, servings: 1,
      tags: ['high-protein', 'omega-3', 'keto-friendly', 'gluten-free'],
      ingredients: [
        { item: 'Salmon fillet', amount: 200, unit: 'g' },
        { item: 'Asparagus', amount: 150, unit: 'g' },
        { item: 'Olive oil', amount: 20, unit: 'ml' },
        { item: 'Garlic', amount: 2, unit: 'cloves' },
        { item: 'Lemon', amount: 1, unit: 'medium' },
        { item: 'Fresh dill', amount: 5, unit: 'g' },
      ],
      instructions: [
        'Preheat oven to 200°C / 400°F.',
        'Place salmon and asparagus on a lined baking sheet.',
        'Drizzle with olive oil, minced garlic, lemon juice and dill.',
        'Bake 18-20 minutes until salmon flakes easily.',
        'Serve with lemon wedges.',
      ],
    },
    {
      id: 'chicken_stir_fry', name: 'Chicken & Veggie Stir-Fry with Brown Rice',
      category: 'dinner', image: '🍜',
      calories: 580, protein: 48, carbs: 55, fats: 16,
      cost: 8.50, prepTime: 15, cookTime: 20, servings: 1,
      tags: ['high-protein', 'meal-prep', 'balanced'],
      ingredients: [
        { item: 'Chicken breast', amount: 180, unit: 'g' },
        { item: 'Brown rice (dry)', amount: 70, unit: 'g' },
        { item: 'Broccoli', amount: 100, unit: 'g' },
        { item: 'Snap peas', amount: 80, unit: 'g' },
        { item: 'Carrots', amount: 60, unit: 'g' },
        { item: 'Soy sauce', amount: 30, unit: 'ml' },
        { item: 'Sesame oil', amount: 10, unit: 'ml' },
        { item: 'Ginger', amount: 5, unit: 'g' },
        { item: 'Garlic', amount: 2, unit: 'cloves' },
      ],
      instructions: [
        'Cook brown rice according to package instructions.',
        'Slice chicken into strips. Chop all vegetables into bite-sized pieces.',
        'Heat sesame oil in a wok over high heat.',
        'Stir-fry chicken 5-6 min, then remove. Add vegetables and stir-fry 4 min.',
        'Return chicken, add soy sauce, garlic and ginger. Toss well.',
        'Serve over brown rice.',
      ],
    },
    {
      id: 'beef_sweet_potato', name: 'Lean Beef & Sweet Potato Bowl',
      category: 'dinner', image: '🥩',
      calories: 640, protein: 50, carbs: 60, fats: 18,
      cost: 12.00, prepTime: 15, cookTime: 30, servings: 1,
      tags: ['high-protein', 'bulking', 'meal-prep'],
      ingredients: [
        { item: 'Lean ground beef (90/10)', amount: 200, unit: 'g' },
        { item: 'Sweet potato', amount: 200, unit: 'g' },
        { item: 'Black beans (canned)', amount: 100, unit: 'g' },
        { item: 'Corn', amount: 60, unit: 'g' },
        { item: 'Salsa', amount: 60, unit: 'ml' },
        { item: 'Chilli powder', amount: 5, unit: 'g' },
        { item: 'Olive oil', amount: 10, unit: 'ml' },
      ],
      instructions: [
        'Dice sweet potato, toss with olive oil and roast at 200°C for 25 min.',
        'Brown ground beef in a pan; drain any excess fat.',
        'Season beef with chilli powder, salt and pepper.',
        'Add drained beans and corn; cook 3 more minutes.',
        'Assemble bowl with sweet potato, beef mixture and salsa.',
      ],
    },
    {
      id: 'vegetable_curry', name: 'Chickpea & Vegetable Curry',
      category: 'dinner', image: '🍛',
      calories: 480, protein: 20, carbs: 68, fats: 14,
      cost: 6.00, prepTime: 10, cookTime: 30, servings: 2,
      tags: ['vegan', 'gluten-free', 'budget-friendly'],
      ingredients: [
        { item: 'Chickpeas (canned)', amount: 400, unit: 'g' },
        { item: 'Coconut milk', amount: 200, unit: 'ml' },
        { item: 'Diced tomatoes (canned)', amount: 400, unit: 'g' },
        { item: 'Spinach', amount: 100, unit: 'g' },
        { item: 'Onion', amount: 1, unit: 'large' },
        { item: 'Curry powder', amount: 15, unit: 'g' },
        { item: 'Garlic', amount: 4, unit: 'cloves' },
        { item: 'Brown rice', amount: 100, unit: 'g' },
      ],
      instructions: [
        'Cook brown rice. Dice onion and mince garlic.',
        'Sauté onion in oil 5 min; add garlic and curry powder, cook 1 min.',
        'Stir in tomatoes, coconut milk and drained chickpeas.',
        'Simmer uncovered 20 min until sauce thickens.',
        'Stir in spinach until wilted. Serve over brown rice.',
      ],
    },

    // ── SNACKS ─────────────────────────────
    {
      id: 'protein_shake', name: 'Post-Workout Protein Shake',
      category: 'snack', image: '🥤',
      calories: 280, protein: 35, carbs: 26, fats: 4,
      cost: 3.50, prepTime: 5, cookTime: 0, servings: 1,
      tags: ['high-protein', 'quick', 'no-cook', 'post-workout'],
      ingredients: [
        { item: 'Whey protein powder', amount: 30, unit: 'g' },
        { item: 'Banana', amount: 1, unit: 'medium' },
        { item: 'Almond milk', amount: 250, unit: 'ml' },
        { item: 'Peanut butter', amount: 15, unit: 'g' },
        { item: 'Ice cubes', amount: 4, unit: 'cubes' },
      ],
      instructions: [
        'Add all ingredients to a blender.',
        'Blend on high for 45-60 seconds until smooth.',
        'Pour into a glass and consume within 30 minutes post-workout.',
      ],
    },
    {
      id: 'rice_cakes_pb', name: 'Rice Cakes with Peanut Butter & Banana',
      category: 'snack', image: '🍌',
      calories: 240, protein: 8, carbs: 36, fats: 8,
      cost: 2.50, prepTime: 5, cookTime: 0, servings: 1,
      tags: ['quick', 'no-cook', 'pre-workout'],
      ingredients: [
        { item: 'Rice cakes', amount: 3, unit: 'cakes' },
        { item: 'Natural peanut butter', amount: 30, unit: 'g' },
        { item: 'Banana', amount: 1, unit: 'medium' },
        { item: 'Honey', amount: 5, unit: 'ml' },
      ],
      instructions: [
        'Spread peanut butter evenly on rice cakes.',
        'Slice banana and arrange on top.',
        'Drizzle with honey and serve immediately.',
      ],
    },
    {
      id: 'hummus_veggies', name: 'Hummus & Veggie Sticks',
      category: 'snack', image: '🥕',
      calories: 190, protein: 8, carbs: 22, fats: 8,
      cost: 3.00, prepTime: 5, cookTime: 0, servings: 1,
      tags: ['vegan', 'quick', 'no-cook', 'low-calorie'],
      ingredients: [
        { item: 'Hummus', amount: 100, unit: 'g' },
        { item: 'Carrots', amount: 80, unit: 'g' },
        { item: 'Celery', amount: 60, unit: 'g' },
        { item: 'Bell pepper', amount: 80, unit: 'g' },
        { item: 'Cucumber', amount: 60, unit: 'g' },
      ],
      instructions: [
        'Cut all vegetables into sticks of similar size.',
        'Arrange on a plate around a bowl of hummus.',
        'Serve as a snack or appetiser.',
      ],
    },
    {
      id: 'overnight_oats', name: 'Overnight Oats with Protein',
      category: 'snack', image: '🥄',
      calories: 340, protein: 26, carbs: 44, fats: 7,
      cost: 3.00, prepTime: 5, cookTime: 0, servings: 1,
      tags: ['high-protein', 'meal-prep', 'no-cook'],
      ingredients: [
        { item: 'Rolled oats', amount: 60, unit: 'g' },
        { item: 'Protein powder', amount: 25, unit: 'g' },
        { item: 'Almond milk', amount: 180, unit: 'ml' },
        { item: 'Chia seeds', amount: 10, unit: 'g' },
        { item: 'Mixed berries', amount: 80, unit: 'g' },
        { item: 'Honey', amount: 10, unit: 'ml' },
      ],
      instructions: [
        'Mix oats, protein powder, chia seeds and almond milk in a jar.',
        'Stir well, ensuring no powder lumps remain.',
        'Refrigerate overnight (at least 6 hours).',
        'In the morning, top with berries and honey.',
      ],
    },
    {
      id: 'boiled_eggs_toast', name: 'Hard-Boiled Eggs on Wholegrain Toast',
      category: 'snack', image: '🥚',
      calories: 270, protein: 20, carbs: 24, fats: 10,
      cost: 2.80, prepTime: 5, cookTime: 12, servings: 1,
      tags: ['high-protein', 'budget-friendly'],
      ingredients: [
        { item: 'Eggs', amount: 2, unit: 'large' },
        { item: 'Wholegrain bread', amount: 2, unit: 'slices' },
        { item: 'Butter', amount: 5, unit: 'g' },
        { item: 'Salt & pepper', amount: 0, unit: 'to taste' },
        { item: 'Paprika', amount: 0, unit: 'pinch' },
      ],
      instructions: [
        'Place eggs in cold water; bring to a boil and cook 10-12 min.',
        'Transfer to ice water to cool, then peel.',
        'Toast bread and spread with butter.',
        'Halve the eggs and place on toast. Season with salt, pepper and paprika.',
      ],
    },
    {
      id: 'trail_mix', name: 'Homemade Protein Trail Mix',
      category: 'snack', image: '🥜',
      calories: 310, protein: 12, carbs: 28, fats: 18,
      cost: 3.20, prepTime: 5, cookTime: 0, servings: 2,
      tags: ['vegan', 'no-cook', 'portable'],
      ingredients: [
        { item: 'Almonds', amount: 30, unit: 'g' },
        { item: 'Cashews', amount: 30, unit: 'g' },
        { item: 'Pumpkin seeds', amount: 20, unit: 'g' },
        { item: 'Dark chocolate chips', amount: 20, unit: 'g' },
        { item: 'Dried cranberries', amount: 20, unit: 'g' },
        { item: 'Sunflower seeds', amount: 15, unit: 'g' },
      ],
      instructions: [
        'Measure all ingredients and combine in a bowl.',
        'Toss to mix evenly.',
        'Divide into 2 portions or store in an airtight container for up to 2 weeks.',
      ],
    },
    {
      id: 'cottage_cheese_bowl', name: 'Cottage Cheese Berry Bowl',
      category: 'snack', image: '🍓',
      calories: 220, protein: 26, carbs: 20, fats: 4,
      cost: 3.50, prepTime: 3, cookTime: 0, servings: 1,
      tags: ['high-protein', 'low-fat', 'quick', 'no-cook'],
      ingredients: [
        { item: 'Low-fat cottage cheese', amount: 200, unit: 'g' },
        { item: 'Strawberries', amount: 80, unit: 'g' },
        { item: 'Blueberries', amount: 50, unit: 'g' },
        { item: 'Honey', amount: 10, unit: 'ml' },
        { item: 'Flaxseeds', amount: 8, unit: 'g' },
      ],
      instructions: [
        'Spoon cottage cheese into a bowl.',
        'Slice strawberries and add both berries on top.',
        'Drizzle with honey and sprinkle flaxseeds.',
        'Serve immediately or refrigerate up to 2 hours.',
      ],
    },
    {
      id: 'black_bean_burrito', name: 'High-Protein Black Bean Burrito',
      category: 'lunch', image: '🌮',
      calories: 540, protein: 28, carbs: 72, fats: 14,
      cost: 5.50, prepTime: 10, cookTime: 10, servings: 1,
      tags: ['vegan', 'high-protein', 'budget-friendly'],
      ingredients: [
        { item: 'Black beans (canned)', amount: 200, unit: 'g' },
        { item: 'Whole-wheat tortilla', amount: 1, unit: 'large' },
        { item: 'Brown rice (cooked)', amount: 100, unit: 'g' },
        { item: 'Avocado', amount: 0.5, unit: 'medium' },
        { item: 'Salsa', amount: 60, unit: 'ml' },
        { item: 'Cumin', amount: 3, unit: 'g' },
        { item: 'Lime juice', amount: 10, unit: 'ml' },
      ],
      instructions: [
        'Drain and rinse black beans; season with cumin and lime juice.',
        'Warm beans in a pan for 3-4 minutes, lightly mashing.',
        'Warm tortilla in a dry pan 30 seconds per side.',
        'Layer rice, beans and sliced avocado on tortilla.',
        'Add salsa, roll tightly, and serve.',
      ],
    },
    {
      id: 'tuna_nicoise', name: 'Tuna Niçoise Salad',
      category: 'dinner', image: '🥙',
      calories: 460, protein: 42, carbs: 28, fats: 18,
      cost: 11.00, prepTime: 15, cookTime: 12, servings: 1,
      tags: ['high-protein', 'gluten-free', 'omega-3'],
      ingredients: [
        { item: 'Canned tuna in olive oil', amount: 160, unit: 'g' },
        { item: 'Eggs', amount: 2, unit: 'large' },
        { item: 'Green beans', amount: 100, unit: 'g' },
        { item: 'Cherry tomatoes', amount: 80, unit: 'g' },
        { item: 'Kalamata olives', amount: 40, unit: 'g' },
        { item: 'Mixed salad leaves', amount: 60, unit: 'g' },
        { item: 'Dijon mustard dressing', amount: 20, unit: 'ml' },
      ],
      instructions: [
        'Hard-boil eggs for 10 minutes; cool, peel and halve.',
        'Blanch green beans in boiling water for 3 minutes; cool.',
        'Arrange salad leaves on a plate.',
        'Top with tuna, eggs, green beans, tomatoes and olives.',
        'Drizzle with mustard dressing and serve.',
      ],
    },
  ];

  /* ── Calorie needs ───────────────────────── */
  function calculateCalorieNeeds(goal, tdee) {
    const base = Number(tdee) || 2000;
    let calories;

    switch (goal) {
      case 'lose_weight':    calories = Math.round(base * 0.80); break;
      case 'lose_weight_fast': calories = Math.round(base * 0.70); break;
      case 'maintain':       calories = base; break;
      case 'gain_muscle':    calories = Math.round(base * 1.10); break;
      case 'bulk':           calories = Math.round(base * 1.20); break;
      default:               calories = base;
    }

    // Macro split (protein first, then adjust carbs/fats)
    const proteinCal = calories * (goal === 'gain_muscle' || goal === 'bulk' ? 0.32 : 0.28);
    const fatCal     = calories * 0.28;
    const carbCal    = calories - proteinCal - fatCal;

    return {
      calories,
      protein: Math.round(proteinCal / 4),
      fats:    Math.round(fatCal    / 9),
      carbs:   Math.round(carbCal   / 4),
    };
  }

  /* ── Get meals by category / filters ────── */
  function getMealsByCategory(category, filters = {}) {
    let meals = category ? MEALS_DB.filter(m => m.category === category) : [...MEALS_DB];

    if (filters.maxCalories) meals = meals.filter(m => m.calories <= filters.maxCalories);
    if (filters.minProtein)  meals = meals.filter(m => m.protein  >= filters.minProtein);
    if (filters.tag)         meals = meals.filter(m => m.tags.includes(filters.tag));
    if (filters.maxCost)     meals = meals.filter(m => m.cost    <= filters.maxCost);

    return meals;
  }

  /* ── Generate a daily meal plan ──────────── */
  function getDailyMealPlan(goal, filters = {}) {
    const needs = calculateCalorieNeeds(goal, filters.tdee || 2000);

    const pick = (cat, maxCal) => {
      const options = getMealsByCategory(cat, { ...filters, maxCalories: maxCal });
      return options[Math.floor(Math.random() * options.length)] || getMealsByCategory(cat)[0];
    };

    const breakfast = pick('breakfast', needs.calories * 0.28);
    const lunch     = pick('lunch',     needs.calories * 0.35);
    const dinner    = pick('dinner',    needs.calories * 0.35);
    const snack     = pick('snack',     needs.calories * 0.15);

    const plan = [breakfast, lunch, snack, dinner].filter(Boolean);
    const totalCals = plan.reduce((a, m) => a + m.calories, 0);

    return { meals: plan, totalCalories: totalCals, targets: needs };
  }

  /* ── Render meal card HTML ───────────────── */
  function renderMealCard(meal, showAddBtn = false) {
    const tagBadges = (meal.tags || []).map(t =>
      `<span class="badge badge-muted">${t}</span>`).join('');

    const ingredients = (meal.ingredients || []).map(ing =>
      `<li class="text-sm">${ing.amount} ${ing.unit} ${ing.item}</li>`).join('');

    const steps = (meal.instructions || []).map((step, i) => `
      <div class="recipe-step">
        <div class="recipe-step-num">${i + 1}</div>
        <div class="text-sm">${step}</div>
      </div>`).join('');

    return `
      <div class="meal-card reveal" data-meal-id="${meal.id}">
        <div class="meal-card-header">
          <div class="meal-emoji">${meal.image}</div>
          <div class="meal-info">
            <div class="meal-name">${meal.name}</div>
            <div class="meal-category">${meal.category}</div>
            <div class="d-flex flex-wrap gap-4 mt-4">${tagBadges}</div>
          </div>
        </div>

        <div class="meal-macros">
          <div class="macro-item">
            <div class="macro-value">${meal.calories}</div>
            <div class="macro-label">Kcal</div>
          </div>
          <div class="macro-item">
            <div class="macro-value" style="color:var(--accent-primary)">${meal.protein}g</div>
            <div class="macro-label">Protein</div>
          </div>
          <div class="macro-item">
            <div class="macro-value" style="color:var(--accent-secondary)">${meal.carbs}g</div>
            <div class="macro-label">Carbs</div>
          </div>
          <div class="macro-item">
            <div class="macro-value" style="color:var(--accent-warning)">${meal.fats}g</div>
            <div class="macro-label">Fats</div>
          </div>
        </div>

        <div class="meal-card-footer">
          <span class="meal-meta-item">⏱ ${meal.prepTime + meal.cookTime} min</span>
          <span class="meal-meta-item">👤 ${meal.servings} serving${meal.servings > 1 ? 's' : ''}</span>
          <span class="meal-meta-item">💰 $${meal.cost.toFixed(2)}</span>
          <button class="btn btn-ghost btn-sm" onclick="this.closest('.meal-card').querySelector('.meal-recipe').classList.toggle('expanded');this.textContent=this.textContent.includes('▼')?'▲ Hide Recipe':'▼ View Recipe'">
            ▼ View Recipe
          </button>
          ${showAddBtn ? `<button class="btn btn-primary btn-sm" onclick="DietManager.addMealToLog('${meal.id}')">+ Add</button>` : ''}
        </div>

        <div class="meal-recipe">
          <div class="mb-8">
            <div class="font-semibold mb-4">Ingredients</div>
            <ul style="padding-left:8px;display:grid;grid-template-columns:1fr 1fr;gap:4px 16px">${ingredients}</ul>
          </div>
          <div>
            <div class="font-semibold mb-8">Instructions</div>
            ${steps}
          </div>
        </div>
      </div>`;
  }

  /* ── Render macro donut chart (Canvas) ───── */
  function renderMacroChart(canvasId, macros) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    const size = canvas.offsetWidth || 200;
    canvas.width  = size;
    canvas.height = size;

    const totalCal = macros.protein * 4 + macros.carbs * 4 + macros.fats * 9;
    if (totalCal === 0) return;

    const slices = [
      { label: 'Protein', value: macros.protein * 4, color: '#00d4aa' },
      { label: 'Carbs',   value: macros.carbs   * 4, color: '#6c63ff' },
      { label: 'Fats',    value: macros.fats     * 9, color: '#ffa502' },
    ];

    const cx = size / 2, cy = size / 2;
    const outerR = size / 2 - 10;
    const innerR = outerR * 0.55;
    let startAngle = -Math.PI / 2;

    slices.forEach(slice => {
      const angle = (slice.value / totalCal) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, outerR, startAngle, startAngle + angle);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();
      startAngle += angle;
    });

    // Donut hole
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim() || '#fff';
    ctx.fill();

    // Center text
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#1a202c';
    ctx.font = `bold ${size * 0.12}px Poppins, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(macros.calories || totalCal, cx, cy - 8);
    ctx.font = `${size * 0.07}px Inter, sans-serif`;
    ctx.fillStyle = '#718096';
    ctx.fillText('kcal', cx, cy + 12);
  }

  /* ── Diet log ────────────────────────────── */
  function _todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function saveDietLog(date, meals) {
    const key  = `${KEYS.LOG}_${date || _todayKey()}`;
    Utils.saveToStorage(key, { date: date || _todayKey(), meals, updatedAt: new Date().toISOString() });
  }

  function getDietLog(date) {
    const key = `${KEYS.LOG}_${date || _todayKey()}`;
    return Utils.getFromStorage(key) || { date: date || _todayKey(), meals: [] };
  }

  function addMealToLog(mealId) {
    const meal = MEALS_DB.find(m => m.id === mealId);
    if (!meal) return;
    const log = getDietLog();
    log.meals.push({ ...meal, loggedAt: new Date().toISOString() });
    saveDietLog(log.date, log.meals);
    Utils.showToast(`${meal.name} added to today's log!`, 'success');
    _refreshLogSummary();
  }

  function removeMealFromLog(index) {
    const log = getDietLog();
    log.meals.splice(index, 1);
    saveDietLog(log.date, log.meals);
    _refreshLogSummary();
  }

  function _refreshLogSummary() {
    const log = getDietLog();
    const total = log.meals.reduce((a, m) => ({
      calories: a.calories + m.calories,
      protein:  a.protein  + m.protein,
      carbs:    a.carbs    + m.carbs,
      fats:     a.fats     + m.fats,
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    ['calories','protein','carbs','fats'].forEach(key => {
      const el = document.querySelector(`#log-${key}`);
      if (el) el.textContent = key === 'calories' ? total[key] : `${total[key]}g`;
    });

    const chartCanvas = document.querySelector('#macro-donut');
    if (chartCanvas) renderMacroChart('macro-donut', total);
  }

  /* ── Init ────────────────────────────────── */
  function init() {
    _refreshLogSummary();
  }

  /* ── Export ──────────────────────────────── */
  window.DietManager = {
    MEALS_DB,
    calculateCalorieNeeds,
    getMealsByCategory,
    getDailyMealPlan,
    renderMealCard,
    renderMacroChart,
    saveDietLog,
    getDietLog,
    addMealToLog,
    removeMealFromLog,
    init,
  };
})();
