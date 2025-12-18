// lib/globalFoods.ts
// Data structure to simulate a large, public food database (macros per 100g)

export interface GlobalFoodItem {
    name: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
}

export const GlobalFoods: GlobalFoodItem[] = [
    // Poultry & Meats
    { name: 'Chicken Breast (Cooked)', calories: 165, proteinG: 31.0, carbsG: 0.0, fatG: 3.6 },
    { name: 'Chicken Thigh (Cooked)', calories: 209, proteinG: 26.0, carbsG: 0.0, fatG: 10.9 },
    { name: 'Turkey Breast (Cooked)', calories: 135, proteinG: 30.0, carbsG: 0.0, fatG: 0.7 },
    { name: 'Ground Beef (90% lean, cooked)', calories: 176, proteinG: 25.0, carbsG: 0.0, fatG: 8.0 },
    { name: 'Ground Beef (80% lean, cooked)', calories: 254, proteinG: 25.8, carbsG: 0.0, fatG: 16.4 },
    { name: 'Pork Chop (Lean, cooked)', calories: 206, proteinG: 28.3, carbsG: 0.0, fatG: 9.7 },
    { name: 'Bacon (Cooked)', calories: 541, proteinG: 37.0, carbsG: 1.4, fatG: 42.0 },
    { name: 'Steak (Sirloin, cooked)', calories: 271, proteinG: 25.8, carbsG: 0.0, fatG: 18.0 },

    // Fish & Seafood
    { name: 'Salmon (Wild, Cooked)', calories: 208, proteinG: 20.4, carbsG: 0.0, fatG: 13.4 },
    { name: 'Salmon (Atlantic, farmed)', calories: 206, proteinG: 22.0, carbsG: 0.0, fatG: 12.4 },
    { name: 'Tuna (in water, drained)', calories: 116, proteinG: 25.5, carbsG: 0.0, fatG: 0.8 },
    { name: 'Tuna (in oil, drained)', calories: 198, proteinG: 29.1, carbsG: 0.0, fatG: 8.2 },
    { name: 'Cod (Cooked)', calories: 105, proteinG: 23.0, carbsG: 0.0, fatG: 0.9 },
    { name: 'Tilapia (Cooked)', calories: 128, proteinG: 26.0, carbsG: 0.0, fatG: 2.7 },
    { name: 'Shrimp (Cooked)', calories: 99, proteinG: 24.0, carbsG: 0.2, fatG: 0.3 },

    // Eggs & Dairy
    { name: 'Egg (Large, Hard-Boiled)', calories: 155, proteinG: 12.6, carbsG: 1.1, fatG: 10.6 },
    { name: 'Egg White', calories: 52, proteinG: 10.9, carbsG: 0.7, fatG: 0.2 },
    { name: 'Egg Yolk', calories: 322, proteinG: 15.9, carbsG: 3.6, fatG: 26.5 },
    { name: 'Milk (Whole, 3.25% fat)', calories: 61, proteinG: 3.3, carbsG: 4.8, fatG: 3.3 },
    { name: 'Milk (2% fat)', calories: 50, proteinG: 3.3, carbsG: 4.8, fatG: 2.0 },
    { name: 'Milk (Skim)', calories: 34, proteinG: 3.4, carbsG: 5.0, fatG: 0.1 },
    { name: 'Greek Yogurt (Plain, nonfat)', calories: 59, proteinG: 10.0, carbsG: 3.6, fatG: 0.4 },
    { name: 'Greek Yogurt (Plain, whole milk)', calories: 97, proteinG: 9.0, carbsG: 3.9, fatG: 5.0 },
    { name: 'Cottage Cheese (Low-fat)', calories: 72, proteinG: 12.4, carbsG: 2.7, fatG: 1.0 },
    { name: 'Cheddar Cheese', calories: 403, proteinG: 24.9, carbsG: 1.3, fatG: 33.1 },
    { name: 'Mozzarella Cheese', calories: 280, proteinG: 27.5, carbsG: 2.2, fatG: 17.1 },
    { name: 'Feta Cheese', calories: 264, proteinG: 14.2, carbsG: 4.1, fatG: 21.3 },

    // Grains & Carbs
    { name: 'Brown Rice (Cooked)', calories: 123, proteinG: 2.7, carbsG: 25.6, fatG: 0.9 },
    { name: 'White Rice (Cooked)', calories: 130, proteinG: 2.7, carbsG: 28.2, fatG: 0.3 },
    { name: 'Quinoa (Cooked)', calories: 120, proteinG: 4.4, carbsG: 21.3, fatG: 1.9 },
    { name: 'Pasta (Cooked)', calories: 131, proteinG: 5.0, carbsG: 25.0, fatG: 1.1 },
    { name: 'Whole Wheat Pasta (Cooked)', calories: 124, proteinG: 5.3, carbsG: 26.5, fatG: 0.5 },
    { name: 'Oatmeal (Dry)', calories: 389, proteinG: 16.9, carbsG: 66.3, fatG: 6.9 },
    { name: 'Oatmeal (Cooked)', calories: 71, proteinG: 2.5, carbsG: 12.0, fatG: 1.4 },
    { name: 'Whole Wheat Bread', calories: 247, proteinG: 13.0, carbsG: 41.0, fatG: 3.5 },
    { name: 'White Bread', calories: 265, proteinG: 9.0, carbsG: 49.0, fatG: 3.2 },
    { name: 'Bagel (Plain)', calories: 257, proteinG: 10.0, carbsG: 50.0, fatG: 1.5 },
    { name: 'Tortilla (Flour)', calories: 304, proteinG: 8.2, carbsG: 50.5, fatG: 7.3 },

    // Legumes & Plant Proteins
    { name: 'Black Beans (Cooked)', calories: 132, proteinG: 8.9, carbsG: 23.7, fatG: 0.5 },
    { name: 'Chickpeas (Cooked)', calories: 164, proteinG: 8.9, carbsG: 27.4, fatG: 2.6 },
    { name: 'Lentils (Cooked)', calories: 116, proteinG: 9.0, carbsG: 20.1, fatG: 0.4 },
    { name: 'Kidney Beans (Cooked)', calories: 127, proteinG: 8.7, carbsG: 22.8, fatG: 0.5 },
    { name: 'Tofu (Firm)', calories: 144, proteinG: 17.3, carbsG: 2.8, fatG: 8.7 },
    { name: 'Tofu (Silken)', calories: 61, proteinG: 6.9, carbsG: 2.0, fatG: 3.5 },
    { name: 'Tempeh', calories: 193, proteinG: 20.3, carbsG: 7.6, fatG: 10.8 },
    { name: 'Edamame (Cooked)', calories: 122, proteinG: 11.9, carbsG: 8.9, fatG: 5.2 },

    // Vegetables
    { name: 'Broccoli (Steamed)', calories: 35, proteinG: 2.4, carbsG: 7.1, fatG: 0.4 },
    { name: 'Broccoli (Raw)', calories: 34, proteinG: 2.8, carbsG: 6.6, fatG: 0.4 },
    { name: 'Spinach', calories: 23, proteinG: 2.9, carbsG: 3.6, fatG: 0.4 },
    { name: 'Kale', calories: 35, proteinG: 2.9, carbsG: 4.4, fatG: 1.5 },
    { name: 'Carrots', calories: 41, proteinG: 0.9, carbsG: 9.6, fatG: 0.2 },
    { name: 'Bell Pepper (Red)', calories: 31, proteinG: 1.0, carbsG: 6.0, fatG: 0.3 },
    { name: 'Tomato', calories: 18, proteinG: 0.9, carbsG: 3.9, fatG: 0.2 },
    { name: 'Cucumber', calories: 16, proteinG: 0.7, carbsG: 3.6, fatG: 0.1 },
    { name: 'Lettuce (Romaine)', calories: 17, proteinG: 1.2, carbsG: 3.3, fatG: 0.3 },
    { name: 'Cauliflower', calories: 25, proteinG: 1.9, carbsG: 5.0, fatG: 0.3 },
    { name: 'Zucchini', calories: 17, proteinG: 1.2, carbsG: 3.1, fatG: 0.3 },
    { name: 'Asparagus', calories: 20, proteinG: 2.2, carbsG: 3.9, fatG: 0.1 },
    { name: 'Green Beans', calories: 31, proteinG: 1.8, carbsG: 7.0, fatG: 0.2 },
    { name: 'Sweet Potato (Baked)', calories: 90, proteinG: 2.0, carbsG: 20.7, fatG: 0.1 },
    { name: 'Potato (Baked)', calories: 93, proteinG: 2.5, carbsG: 21.2, fatG: 0.1 },
    { name: 'Onion', calories: 40, proteinG: 1.1, carbsG: 9.3, fatG: 0.1 },
    { name: 'Garlic', calories: 149, proteinG: 6.4, carbsG: 33.1, fatG: 0.5 },
    { name: 'Mushrooms', calories: 22, proteinG: 3.1, carbsG: 3.3, fatG: 0.3 },

    // Fruits
    { name: 'Apple', calories: 52, proteinG: 0.3, carbsG: 13.8, fatG: 0.2 },
    { name: 'Banana', calories: 89, proteinG: 1.1, carbsG: 22.8, fatG: 0.3 },
    { name: 'Orange', calories: 47, proteinG: 0.9, carbsG: 11.8, fatG: 0.1 },
    { name: 'Strawberries', calories: 32, proteinG: 0.7, carbsG: 7.7, fatG: 0.3 },
    { name: 'Blueberries', calories: 57, proteinG: 0.7, carbsG: 14.5, fatG: 0.3 },
    { name: 'Raspberries', calories: 52, proteinG: 1.2, carbsG: 11.9, fatG: 0.7 },
    { name: 'Blackberries', calories: 43, proteinG: 1.4, carbsG: 9.6, fatG: 0.5 },
    { name: 'Grapes', calories: 69, proteinG: 0.7, carbsG: 18.1, fatG: 0.2 },
    { name: 'Watermelon', calories: 30, proteinG: 0.6, carbsG: 7.6, fatG: 0.2 },
    { name: 'Pineapple', calories: 50, proteinG: 0.5, carbsG: 13.1, fatG: 0.1 },
    { name: 'Mango', calories: 60, proteinG: 0.8, carbsG: 15.0, fatG: 0.4 },
    { name: 'Pear', calories: 57, proteinG: 0.4, carbsG: 15.2, fatG: 0.1 },
    { name: 'Peach', calories: 39, proteinG: 0.9, carbsG: 9.5, fatG: 0.3 },
    { name: 'Avocado', calories: 160, proteinG: 2.0, carbsG: 8.5, fatG: 14.7 },

    // Nuts & Seeds
    { name: 'Almonds', calories: 579, proteinG: 21.2, carbsG: 21.6, fatG: 49.9 },
    { name: 'Walnuts', calories: 654, proteinG: 15.2, carbsG: 13.7, fatG: 65.2 },
    { name: 'Cashews', calories: 553, proteinG: 18.2, carbsG: 30.2, fatG: 43.8 },
    { name: 'Peanuts', calories: 567, proteinG: 25.8, carbsG: 16.1, fatG: 49.2 },
    { name: 'Peanut Butter', calories: 588, proteinG: 25.0, carbsG: 20.0, fatG: 50.0 },
    { name: 'Almond Butter', calories: 614, proteinG: 20.9, carbsG: 18.8, fatG: 55.5 },
    { name: 'Pecans', calories: 691, proteinG: 9.2, carbsG: 13.9, fatG: 72.0 },
    { name: 'Pistachios', calories: 560, proteinG: 20.2, carbsG: 27.2, fatG: 45.3 },
    { name: 'Sunflower Seeds', calories: 584, proteinG: 20.8, carbsG: 20.0, fatG: 51.5 },
    { name: 'Pumpkin Seeds', calories: 559, proteinG: 30.2, carbsG: 10.7, fatG: 49.0 },
    { name: 'Chia Seeds', calories: 486, proteinG: 16.5, carbsG: 42.1, fatG: 30.7 },
    { name: 'Flax Seeds', calories: 534, proteinG: 18.3, carbsG: 28.9, fatG: 42.2 },

    // Protein Supplements
    { name: 'Whey Protein Powder', calories: 400, proteinG: 80.0, carbsG: 8.0, fatG: 5.0 },
    { name: 'Casein Protein Powder', calories: 380, proteinG: 78.0, carbsG: 10.0, fatG: 2.0 },
    { name: 'Plant Protein Powder', calories: 390, proteinG: 75.0, carbsG: 12.0, fatG: 6.0 },

    // Oils & Fats
    { name: 'Olive Oil (Extra Virgin)', calories: 884, proteinG: 0.0, carbsG: 0.0, fatG: 100.0 },
    { name: 'Coconut Oil', calories: 862, proteinG: 0.0, carbsG: 0.0, fatG: 100.0 },
    { name: 'Butter (Salted)', calories: 717, proteinG: 0.9, carbsG: 0.1, fatG: 81.1 },
    { name: 'Butter (Unsalted)', calories: 717, proteinG: 0.9, carbsG: 0.1, fatG: 81.1 },
    { name: 'Ghee (Clarified Butter)', calories: 876, proteinG: 0.3, carbsG: 0.0, fatG: 99.5 },
    { name: 'Avocado Oil', calories: 884, proteinG: 0.0, carbsG: 0.0, fatG: 100.0 },
    { name: 'Canola Oil', calories: 884, proteinG: 0.0, carbsG: 0.0, fatG: 100.0 },
    { name: 'Sesame Oil', calories: 884, proteinG: 0.0, carbsG: 0.0, fatG: 100.0 },

    // Condiments & Sauces
    { name: 'Ketchup', calories: 101, proteinG: 1.0, carbsG: 25.0, fatG: 0.1 },
    { name: 'Mustard', calories: 66, proteinG: 4.0, carbsG: 6.0, fatG: 3.5 },
    { name: 'Mayonnaise', calories: 680, proteinG: 1.0, carbsG: 0.6, fatG: 75.0 },
    { name: 'BBQ Sauce', calories: 172, proteinG: 1.0, carbsG: 41.0, fatG: 0.5 },
    { name: 'Soy Sauce', calories: 53, proteinG: 5.6, carbsG: 4.9, fatG: 0.1 },
    { name: 'Hot Sauce', calories: 12, proteinG: 0.8, carbsG: 1.3, fatG: 0.5 },
    { name: 'Ranch Dressing', calories: 458, proteinG: 1.4, carbsG: 6.7, fatG: 48.0 },
    { name: 'Italian Dressing', calories: 296, proteinG: 0.2, carbsG: 11.0, fatG: 28.0 },
    { name: 'Balsamic Vinegar', calories: 88, proteinG: 0.5, carbsG: 17.0, fatG: 0.0 },
    { name: 'Salsa', calories: 36, proteinG: 1.5, carbsG: 7.0, fatG: 0.2 },
    { name: 'Hummus', calories: 166, proteinG: 8.0, carbsG: 14.3, fatG: 9.6 },
    { name: 'Guacamole', calories: 150, proteinG: 2.0, carbsG: 9.0, fatG: 13.0 },

    // Sweeteners & Baking
    { name: 'Honey', calories: 304, proteinG: 0.3, carbsG: 82.4, fatG: 0.0 },
    { name: 'Maple Syrup', calories: 260, proteinG: 0.0, carbsG: 67.0, fatG: 0.2 },
    { name: 'White Sugar', calories: 387, proteinG: 0.0, carbsG: 100.0, fatG: 0.0 },
    { name: 'Brown Sugar', calories: 380, proteinG: 0.0, carbsG: 98.0, fatG: 0.0 },
    { name: 'Agave Syrup', calories: 310, proteinG: 0.1, carbsG: 76.0, fatG: 0.5 },
    { name: 'All-Purpose Flour', calories: 364, proteinG: 10.3, carbsG: 76.3, fatG: 1.0 },
    { name: 'Whole Wheat Flour', calories: 340, proteinG: 13.2, carbsG: 72.0, fatG: 1.9 },
    { name: 'Cocoa Powder (Unsweetened)', calories: 228, proteinG: 19.6, carbsG: 57.9, fatG: 13.7 },

    // Processed Meats
    { name: 'Ham (Lean)', calories: 145, proteinG: 21.0, carbsG: 1.5, fatG: 5.5 },
    { name: 'Salami', calories: 336, proteinG: 22.6, carbsG: 1.6, fatG: 26.7 },
    { name: 'Pepperoni', calories: 504, proteinG: 20.4, carbsG: 4.0, fatG: 44.0 },
    { name: 'Turkey Deli Meat', calories: 104, proteinG: 17.1, carbsG: 4.2, fatG: 1.7 },
    { name: 'Chicken Deli Meat', calories: 100, proteinG: 18.0, carbsG: 2.5, fatG: 2.0 },
    { name: 'Sausage (Pork)', calories: 301, proteinG: 12.0, carbsG: 3.0, fatG: 27.0 },
    { name: 'Hot Dog (Beef)', calories: 290, proteinG: 10.4, carbsG: 3.8, fatG: 26.0 },

    // More Seafood
    { name: 'Crab (Cooked)', calories: 97, proteinG: 19.4, carbsG: 0.0, fatG: 1.8 },
    { name: 'Lobster (Cooked)', calories: 89, proteinG: 19.0, carbsG: 0.0, fatG: 0.9 },
    { name: 'Scallops (Cooked)', calories: 111, proteinG: 20.5, carbsG: 5.4, fatG: 1.4 },
    { name: 'Mussels (Cooked)', calories: 172, proteinG: 23.8, carbsG: 7.4, fatG: 4.5 },
    { name: 'Oysters (Raw)', calories: 68, proteinG: 7.1, carbsG: 3.9, fatG: 2.5 },
    { name: 'Sardines (in oil, drained)', calories: 208, proteinG: 24.6, carbsG: 0.0, fatG: 11.5 },
    { name: 'Anchovies', calories: 210, proteinG: 28.9, carbsG: 0.0, fatG: 9.7 },

    // More Vegetables
    { name: 'Brussels Sprouts', calories: 43, proteinG: 3.4, carbsG: 9.0, fatG: 0.3 },
    { name: 'Eggplant', calories: 25, proteinG: 1.0, carbsG: 5.9, fatG: 0.2 },
    { name: 'Cabbage', calories: 25, proteinG: 1.3, carbsG: 5.8, fatG: 0.1 },
    { name: 'Celery', calories: 16, proteinG: 0.7, carbsG: 3.0, fatG: 0.2 },
    { name: 'Radish', calories: 16, proteinG: 0.7, carbsG: 3.4, fatG: 0.1 },
    { name: 'Beets', calories: 43, proteinG: 1.6, carbsG: 9.6, fatG: 0.2 },
    { name: 'Corn (Sweet, cooked)', calories: 96, proteinG: 3.4, carbsG: 21.0, fatG: 1.5 },
    { name: 'Peas (Green, cooked)', calories: 84, proteinG: 5.4, carbsG: 15.6, fatG: 0.2 },
    { name: 'Squash (Winter)', calories: 34, proteinG: 0.8, carbsG: 9.0, fatG: 0.1 },
    { name: 'Pumpkin', calories: 26, proteinG: 1.0, carbsG: 6.5, fatG: 0.1 },

    // Dried Fruits
    { name: 'Raisins', calories: 299, proteinG: 3.1, carbsG: 79.2, fatG: 0.5 },
    { name: 'Dates (Medjool)', calories: 277, proteinG: 1.8, carbsG: 75.0, fatG: 0.2 },
    { name: 'Dried Apricots', calories: 241, proteinG: 3.4, carbsG: 62.6, fatG: 0.5 },
    { name: 'Dried Cranberries', calories: 308, proteinG: 0.1, carbsG: 82.4, fatG: 1.4 },
    { name: 'Prunes', calories: 240, proteinG: 2.2, carbsG: 63.9, fatG: 0.4 },
    { name: 'Dried Figs', calories: 249, proteinG: 3.3, carbsG: 63.9, fatG: 0.9 },

    // More Cheese
    { name: 'Parmesan Cheese', calories: 431, proteinG: 38.5, carbsG: 4.1, fatG: 28.6 },
    { name: 'Swiss Cheese', calories: 380, proteinG: 26.9, carbsG: 5.4, fatG: 27.8 },
    { name: 'Brie Cheese', calories: 334, proteinG: 20.8, carbsG: 0.5, fatG: 27.7 },
    { name: 'Goat Cheese', calories: 364, proteinG: 21.6, carbsG: 2.5, fatG: 29.8 },
    { name: 'Cream Cheese', calories: 342, proteinG: 5.9, carbsG: 5.5, fatG: 34.2 },
    { name: 'Ricotta Cheese (Whole milk)', calories: 174, proteinG: 11.3, carbsG: 3.0, fatG: 13.0 },

    // Snacks
    { name: 'Potato Chips', calories: 536, proteinG: 6.6, carbsG: 52.9, fatG: 34.6 },
    { name: 'Tortilla Chips', calories: 489, proteinG: 7.0, carbsG: 62.0, fatG: 23.0 },
    { name: 'Popcorn (Air-popped)', calories: 387, proteinG: 12.9, carbsG: 77.8, fatG: 4.5 },
    { name: 'Popcorn (Oil-popped)', calories: 500, proteinG: 9.0, carbsG: 57.2, fatG: 28.1 },
    { name: 'Pretzels', calories: 380, proteinG: 10.0, carbsG: 80.0, fatG: 3.0 },
    { name: 'Crackers (Saltine)', calories: 421, proteinG: 9.0, carbsG: 71.5, fatG: 10.2 },
    { name: 'Graham Crackers', calories: 423, proteinG: 6.5, carbsG: 77.9, fatG: 10.1 },
    { name: 'Granola Bar', calories: 471, proteinG: 9.7, carbsG: 64.4, fatG: 20.6 },
    { name: 'Dark Chocolate (70-85% cacao)', calories: 598, proteinG: 7.8, carbsG: 45.8, fatG: 42.6 },
    { name: 'Milk Chocolate', calories: 535, proteinG: 7.6, carbsG: 59.4, fatG: 29.7 },
    { name: 'Cookies (Chocolate Chip)', calories: 488, proteinG: 5.0, carbsG: 68.0, fatG: 22.0 },

    // More Grains & Starches
    { name: 'Couscous (Cooked)', calories: 112, proteinG: 3.8, carbsG: 23.2, fatG: 0.2 },
    { name: 'Barley (Cooked)', calories: 123, proteinG: 2.3, carbsG: 28.2, fatG: 0.4 },
    { name: 'Farro (Cooked)', calories: 170, proteinG: 6.5, carbsG: 36.0, fatG: 1.0 },
    { name: 'Buckwheat (Cooked)', calories: 92, proteinG: 3.4, carbsG: 19.9, fatG: 0.6 },
    { name: 'Millet (Cooked)', calories: 119, proteinG: 3.5, carbsG: 23.7, fatG: 1.0 },
    { name: 'Wild Rice (Cooked)', calories: 101, proteinG: 4.0, carbsG: 21.3, fatG: 0.3 },
    { name: 'Sushi Rice (Cooked)', calories: 130, proteinG: 2.4, carbsG: 29.0, fatG: 0.2 },

    // Prepared & Fast Foods
    { name: 'Pizza (Cheese, thin crust)', calories: 239, proteinG: 10.1, carbsG: 26.6, fatG: 10.4 },
    { name: 'Pizza (Pepperoni)', calories: 298, proteinG: 12.2, carbsG: 33.5, fatG: 12.8 },
    { name: 'French Fries', calories: 312, proteinG: 3.4, carbsG: 41.4, fatG: 15.0 },
    { name: 'Hamburger (Fast food)', calories: 254, proteinG: 12.9, carbsG: 31.0, fatG: 9.4 },
    { name: 'Cheeseburger (Fast food)', calories: 303, proteinG: 15.4, carbsG: 32.0, fatG: 13.5 },
    { name: 'Fried Chicken', calories: 246, proteinG: 18.3, carbsG: 12.2, fatG: 14.7 },
    { name: 'Chicken Nuggets', calories: 296, proteinG: 15.3, carbsG: 18.1, fatG: 18.6 },
    { name: 'Tacos (Beef)', calories: 226, proteinG: 9.4, carbsG: 18.5, fatG: 13.2 },
    { name: 'Burrito (Bean & cheese)', calories: 151, proteinG: 5.9, carbsG: 19.8, fatG: 5.5 },
    { name: 'Sushi (Salmon roll)', calories: 179, proteinG: 8.5, carbsG: 20.5, fatG: 6.8 },
    { name: 'Ramen Noodles (Instant)', calories: 436, proteinG: 8.8, carbsG: 62.5, fatG: 16.3 },

    // Specialty & Ethnic Foods
    { name: 'Falafel', calories: 333, proteinG: 13.3, carbsG: 31.8, fatG: 17.8 },
    { name: 'Naan Bread', calories: 262, proteinG: 8.7, carbsG: 45.1, fatG: 5.1 },
    { name: 'Kimchi', calories: 15, proteinG: 1.1, carbsG: 2.4, fatG: 0.5 },
    { name: 'Sauerkraut', calories: 19, proteinG: 0.9, carbsG: 4.3, fatG: 0.1 },
    { name: 'Seaweed (Nori)', calories: 35, proteinG: 5.8, carbsG: 5.1, fatG: 0.3 },
    { name: 'Miso Paste', calories: 199, proteinG: 12.8, carbsG: 25.9, fatG: 6.0 },

    // BEVERAGES - Coffee & Tea
    { name: 'Coffee (Black)', calories: 2, proteinG: 0.3, carbsG: 0.0, fatG: 0.0 },
    { name: 'Coffee (with milk)', calories: 15, proteinG: 0.8, carbsG: 1.4, fatG: 0.8 },
    { name: 'Latte (Whole milk)', calories: 61, proteinG: 3.3, carbsG: 4.8, fatG: 3.3 },
    { name: 'Cappuccino', calories: 46, proteinG: 2.5, carbsG: 3.6, fatG: 2.5 },
    { name: 'Espresso', calories: 9, proteinG: 0.5, carbsG: 1.6, fatG: 0.2 },
    { name: 'Americano', calories: 3, proteinG: 0.3, carbsG: 0.5, fatG: 0.0 },
    { name: 'Mocha (with whipped cream)', calories: 175, proteinG: 2.3, carbsG: 26.5, fatG: 7.0 },
    { name: 'Frappuccino', calories: 240, proteinG: 4.0, carbsG: 50.0, fatG: 3.0 },
    { name: 'Iced Coffee (Black)', calories: 2, proteinG: 0.3, carbsG: 0.0, fatG: 0.0 },
    { name: 'Cold Brew Coffee', calories: 5, proteinG: 0.3, carbsG: 0.8, fatG: 0.0 },
    { name: 'Tea (Green, unsweetened)', calories: 1, proteinG: 0.0, carbsG: 0.0, fatG: 0.0 },
    { name: 'Tea (Black, unsweetened)', calories: 2, proteinG: 0.0, carbsG: 0.7, fatG: 0.0 },
    { name: 'Tea (Herbal)', calories: 2, proteinG: 0.0, carbsG: 0.4, fatG: 0.0 },
    { name: 'Chai Tea Latte', calories: 120, proteinG: 4.0, carbsG: 21.0, fatG: 2.5 },
    { name: 'Matcha Latte', calories: 70, proteinG: 1.0, carbsG: 8.0, fatG: 3.5 },
    { name: 'Bubble Tea (with tapioca)', calories: 160, proteinG: 0.5, carbsG: 38.0, fatG: 1.5 },
    { name: 'Sweet Tea (Sweetened)', calories: 35, proteinG: 0.0, carbsG: 8.9, fatG: 0.0 },
    { name: 'Iced Tea (Unsweetened)', calories: 2, proteinG: 0.0, carbsG: 0.7, fatG: 0.0 },

    // BEVERAGES - Juices
    { name: 'Orange Juice (100%)', calories: 45, proteinG: 0.7, carbsG: 10.4, fatG: 0.2 },
    { name: 'Apple Juice (100%)', calories: 46, proteinG: 0.1, carbsG: 11.3, fatG: 0.1 },
    { name: 'Grape Juice (100%)', calories: 60, proteinG: 0.4, carbsG: 14.8, fatG: 0.1 },
    { name: 'Cranberry Juice', calories: 46, proteinG: 0.0, carbsG: 12.2, fatG: 0.1 },
    { name: 'Pineapple Juice', calories: 53, proteinG: 0.4, carbsG: 12.9, fatG: 0.1 },
    { name: 'Grapefruit Juice', calories: 39, proteinG: 0.5, carbsG: 9.2, fatG: 0.1 },
    { name: 'Tomato Juice', calories: 17, proteinG: 0.8, carbsG: 3.9, fatG: 0.1 },
    { name: 'Vegetable Juice (V8)', calories: 18, proteinG: 0.8, carbsG: 3.6, fatG: 0.1 },
    { name: 'Lemon Juice (Fresh)', calories: 22, proteinG: 0.4, carbsG: 6.9, fatG: 0.2 },
    { name: 'Lime Juice (Fresh)', calories: 25, proteinG: 0.4, carbsG: 8.4, fatG: 0.1 },

    // BEVERAGES - Soft Drinks & Sodas
    { name: 'Cola (Regular)', calories: 41, proteinG: 0.0, carbsG: 10.6, fatG: 0.0 },
    { name: 'Cola (Diet/Zero)', calories: 0, proteinG: 0.0, carbsG: 0.0, fatG: 0.0 },
    { name: 'Sprite/Lemon-Lime Soda', calories: 38, proteinG: 0.0, carbsG: 10.0, fatG: 0.0 },
    { name: 'Root Beer', calories: 41, proteinG: 0.0, carbsG: 10.6, fatG: 0.0 },
    { name: 'Ginger Ale', calories: 34, proteinG: 0.0, carbsG: 8.8, fatG: 0.0 },
    { name: 'Mountain Dew', calories: 46, proteinG: 0.0, carbsG: 12.4, fatG: 0.0 },
    { name: 'Dr Pepper', calories: 40, proteinG: 0.0, carbsG: 10.6, fatG: 0.0 },
    { name: 'Tonic Water', calories: 34, proteinG: 0.0, carbsG: 8.8, fatG: 0.0 },
    { name: 'Club Soda/Sparkling Water', calories: 0, proteinG: 0.0, carbsG: 0.0, fatG: 0.0 },
    { name: 'Flavored Sparkling Water', calories: 0, proteinG: 0.0, carbsG: 0.0, fatG: 0.0 },

    // BEVERAGES - Energy & Sports Drinks
    { name: 'Red Bull (Regular)', calories: 45, proteinG: 0.4, carbsG: 11.0, fatG: 0.0 },
    { name: 'Red Bull (Sugar-free)', calories: 3, proteinG: 0.4, carbsG: 0.0, fatG: 0.0 },
    { name: 'Monster Energy Drink', calories: 54, proteinG: 0.5, carbsG: 14.0, fatG: 0.0 },
    { name: 'Gatorade', calories: 25, proteinG: 0.0, carbsG: 6.3, fatG: 0.0 },
    { name: 'Powerade', calories: 27, proteinG: 0.0, carbsG: 7.0, fatG: 0.0 },
    { name: 'Coconut Water', calories: 19, proteinG: 0.7, carbsG: 3.7, fatG: 0.2 },
    { name: 'Electrolyte Water', calories: 0, proteinG: 0.0, carbsG: 0.0, fatG: 0.0 },

    // BEVERAGES - Milk Alternatives
    { name: 'Almond Milk (Unsweetened)', calories: 13, proteinG: 0.4, carbsG: 0.3, fatG: 1.1 },
    { name: 'Almond Milk (Sweetened)', calories: 37, proteinG: 0.4, carbsG: 6.7, fatG: 1.0 },
    { name: 'Soy Milk (Unsweetened)', calories: 33, proteinG: 3.3, carbsG: 1.7, fatG: 2.0 },
    { name: 'Soy Milk (Sweetened)', calories: 54, proteinG: 3.3, carbsG: 6.7, fatG: 2.0 },
    { name: 'Oat Milk', calories: 47, proteinG: 1.0, carbsG: 7.7, fatG: 1.5 },
    { name: 'Coconut Milk (Beverage)', calories: 17, proteinG: 0.2, carbsG: 1.8, fatG: 1.3 },
    { name: 'Rice Milk', calories: 47, proteinG: 0.3, carbsG: 9.3, fatG: 1.0 },
    { name: 'Cashew Milk (Unsweetened)', calories: 10, proteinG: 0.3, carbsG: 0.3, fatG: 0.8 },

    // BEVERAGES - Smoothies & Shakes
    { name: 'Green Smoothie (Spinach, banana, almond milk)', calories: 63, proteinG: 1.5, carbsG: 13.0, fatG: 1.2 },
    { name: 'Berry Smoothie', calories: 70, proteinG: 1.0, carbsG: 16.0, fatG: 0.5 },
    { name: 'Protein Shake (with milk)', calories: 110, proteinG: 20.0, carbsG: 6.0, fatG: 1.5 },
    { name: 'Chocolate Milkshake', calories: 223, proteinG: 5.9, carbsG: 35.5, fatG: 6.9 },
    { name: 'Vanilla Milkshake', calories: 210, proteinG: 5.5, carbsG: 33.0, fatG: 6.2 },
    { name: 'Strawberry Milkshake', calories: 215, proteinG: 5.3, carbsG: 34.0, fatG: 6.5 },

    // BEVERAGES - Alcoholic Drinks
    { name: 'Beer (Regular, 12 oz)', calories: 43, proteinG: 0.5, carbsG: 3.6, fatG: 0.0 },
    { name: 'Light Beer (12 oz)', calories: 29, proteinG: 0.2, carbsG: 1.6, fatG: 0.0 },
    { name: 'IPA Beer (12 oz)', calories: 50, proteinG: 0.6, carbsG: 4.3, fatG: 0.0 },
    { name: 'Red Wine (5 oz)', calories: 85, proteinG: 0.1, carbsG: 2.5, fatG: 0.0 },
    { name: 'White Wine (5 oz)', calories: 82, proteinG: 0.1, carbsG: 2.1, fatG: 0.0 },
    { name: 'Champagne (5 oz)', calories: 78, proteinG: 0.2, carbsG: 1.5, fatG: 0.0 },
    { name: 'Vodka (1.5 oz shot)', calories: 97, proteinG: 0.0, carbsG: 0.0, fatG: 0.0 },
    { name: 'Whiskey (1.5 oz shot)', calories: 97, proteinG: 0.0, carbsG: 0.0, fatG: 0.0 },
    { name: 'Rum (1.5 oz shot)', calories: 97, proteinG: 0.0, carbsG: 0.0, fatG: 0.0 },
    { name: 'Tequila (1.5 oz shot)', calories: 97, proteinG: 0.0, carbsG: 0.0, fatG: 0.0 },
    { name: 'Gin (1.5 oz shot)', calories: 97, proteinG: 0.0, carbsG: 0.0, fatG: 0.0 },
    { name: 'Margarita', calories: 168, proteinG: 0.1, carbsG: 13.0, fatG: 0.1 },
    { name: 'Mojito', calories: 143, proteinG: 0.1, carbsG: 13.7, fatG: 0.1 },
    { name: 'Piña Colada', calories: 245, proteinG: 0.7, carbsG: 31.9, fatG: 3.0 },
    { name: 'Bloody Mary', calories: 120, proteinG: 1.5, carbsG: 5.0, fatG: 0.2 },
    { name: 'Long Island Iced Tea', calories: 276, proteinG: 0.0, carbsG: 33.0, fatG: 0.0 },

    // BEVERAGES - Other
    { name: 'Hot Chocolate (with whole milk)', calories: 77, proteinG: 3.2, carbsG: 10.7, fatG: 2.3 },
    { name: 'Hot Chocolate (with water)', calories: 71, proteinG: 2.3, carbsG: 11.7, fatG: 2.3 },
    { name: 'Chocolate Milk (Whole milk)', calories: 83, proteinG: 3.2, carbsG: 10.3, fatG: 3.3 },
    { name: 'Chocolate Milk (Low-fat)', calories: 63, proteinG: 3.2, carbsG: 10.3, fatG: 1.0 },
    { name: 'Eggnog', calories: 135, proteinG: 3.8, carbsG: 13.5, fatG: 7.5 },
    { name: 'Horchata', calories: 103, proteinG: 0.5, carbsG: 20.0, fatG: 2.5 },
    { name: 'Lemonade (Sweetened)', calories: 40, proteinG: 0.1, carbsG: 10.6, fatG: 0.0 },
    { name: 'Lemonade (Sugar-free)', calories: 5, proteinG: 0.0, carbsG: 1.3, fatG: 0.0 },
    { name: 'Vitamin Water', calories: 20, proteinG: 0.0, carbsG: 5.0, fatG: 0.0 },
    { name: 'Kombucha', calories: 30, proteinG: 0.0, carbsG: 7.0, fatG: 0.0 },
    { name: 'Apple Cider (Hot)', calories: 47, proteinG: 0.1, carbsG: 11.7, fatG: 0.1 },

    // Additional Popular Foods
    { name: 'Ice Cream (Vanilla)', calories: 207, proteinG: 3.5, carbsG: 23.6, fatG: 11.0 },
    { name: 'Ice Cream (Chocolate)', calories: 216, proteinG: 3.8, carbsG: 28.2, fatG: 11.0 },
    { name: 'Frozen Yogurt', calories: 127, proteinG: 3.5, carbsG: 22.0, fatG: 4.0 },
    { name: 'Gelato', calories: 160, proteinG: 3.0, carbsG: 25.0, fatG: 6.0 },
    { name: 'Sorbet', calories: 130, proteinG: 0.3, carbsG: 34.0, fatG: 0.0 },
    { name: 'Pancakes (Plain)', calories: 227, proteinG: 6.4, carbsG: 28.3, fatG: 9.7 },
    { name: 'Waffles', calories: 291, proteinG: 7.9, carbsG: 33.0, fatG: 14.1 },
    { name: 'French Toast', calories: 166, proteinG: 6.2, carbsG: 17.0, fatG: 7.3 },
    { name: 'Donut (Glazed)', calories: 452, proteinG: 4.9, carbsG: 51.3, fatG: 25.5 },
    { name: 'Muffin (Blueberry)', calories: 313, proteinG: 6.0, carbsG: 54.0, fatG: 7.4 },
    { name: 'Croissant', calories: 406, proteinG: 8.2, carbsG: 45.8, fatG: 21.0 },
    { name: 'Cinnamon Roll', calories: 310, proteinG: 4.7, carbsG: 49.7, fatG: 10.8 },
    { name: 'Brownie', calories: 466, proteinG: 6.0, carbsG: 63.0, fatG: 23.0 },
    { name: 'Cheesecake', calories: 321, proteinG: 5.5, carbsG: 25.5, fatG: 22.5 },
    { name: 'Tiramisu', calories: 240, proteinG: 4.5, carbsG: 28.0, fatG: 12.0 },
    { name: 'Apple Pie', calories: 237, proteinG: 2.0, carbsG: 34.0, fatG: 11.0 },
    { name: 'Pumpkin Pie', calories: 229, proteinG: 4.0, carbsG: 30.5, fatG: 10.0 },
];

/**
 * Searches the GlobalFoods array for matches based on the search term.
 */
export function searchGlobalFoods(query: string): GlobalFoodItem[] {
    if (query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    
    return GlobalFoods
        .filter(food => food.name.toLowerCase().includes(lowerQuery))
        .slice(0, 5); // Limit suggestions to 5
}