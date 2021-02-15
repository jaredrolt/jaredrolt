import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { IngredientCategory, RecipeIngredient, useIngredientCategories, useMenuPlannings, useRecipesQuery } from './api';
import { SelectWeek, exists } from './menu';

export const ShoppingList = () => {
  const [week, setWeek] = useState(0);
  const handleWeekChange = useCallback(week => setWeek(week), []);
  // const weeks = Array.from(Array(7));

  const { data } = useMenuPlannings();

  const { query: getRecipes, resource: recipes } = useRecipesQuery();

  const { data: ingredientCategories } = useIngredientCategories();

  useEffect(() => {
    if (!data) return;
    const recipeIds = data[0].days.slice(week * 7, 7).flatMap(day =>
      day.meals.map(meal =>
        'id' in meal.recipe
          ? meal.recipe.id
          : undefined)
      .filter(exists));
    getRecipes(Array.from(new Set(recipeIds)));
  }, [data, week]);

  const ingredients = useMemo(() => {
    if (!recipes.data) return [];

    return recipes.data.reduce((carry: any[], recipe) => {
      if (recipe.recipe_data)
      // let existingIngredient = 
      carry.push(...recipe.recipe_data[0].ingredients)
      return carry;
    }, []);
  }, [recipes]);

  const shoppingCategories = useMemo(() => {
    if (!ingredientCategories) return [];

    const shoppingIngredients = aggregateIngredients(ingredients);

    return groupShoppingIngredients(ingredientCategories, shoppingIngredients);
  }, [ingredientCategories, ingredients]);

  if (!data) {
    return (
      <select>
        <option>Loading...</option>
      </select>
    );
  }

  return (
    <div className="shopping-list">
      <SelectWeek value={week} onChange={handleWeekChange} />
      <h1>Menu - Week {week + 1}</h1>
      {shoppingCategories.map(category => (
        <div key={category.categoryId}>
          <h5>{category.title}</h5>
          <ul>
            {category.ingredients.map(ingredient => (
              <li key={ingredient.ingredientId}>
                <label>
                  <input type="checkbox" />
                  &nbsp;
                  <ShoppingIngredientLabel ingredient={ingredient} />
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

type IngredientAmount = {
  amount: number;
  unit?: string;
}

type ShoppingIngredient = {
  ingredientId: number;
  shoppingCategoryId: number;
  title: string;
  amounts: IngredientAmount[];
}

const aggregateIngredients = (ingredients: RecipeIngredient[]): ShoppingIngredient[] => {
  const ingredientsMap = ingredients.reduce((carry: Map<number, ShoppingIngredient>, ingredient) => {
    const existingIngredient = carry.get(ingredient.ingredient.id);

    if (!existingIngredient) {
      carry.set(ingredient.ingredient.id, {
        amounts: [
          {
            amount: ingredient.amount,
            unit: ingredient.ingredient_measurement?.abbreviation,
          }
        ],
        ingredientId: ingredient.id,
        shoppingCategoryId: ingredient.ingredient.ingredient_category,
        title: ingredient.ingredient.title,
      });
      return carry;
    }

    const existingIngredientAmount = existingIngredient.amounts
      .find(ingredientAmount => ingredientAmount.unit === ingredient.ingredient_measurement?.abbreviation);

    if (!existingIngredientAmount) {
      existingIngredient.amounts.push({
        amount: ingredient.amount,
        unit: ingredient.ingredient_measurement?.abbreviation,
      });
      return carry;
    }

    existingIngredientAmount.amount += ingredient.amount;

    return carry;
  }, new Map());

  return Array.from(ingredientsMap).map(([_, ingredient]) => ingredient);
};

type ShoppingCategory = {
  categoryId: number;
  title: string;
  ingredients: ShoppingIngredient[];
};

const groupShoppingIngredients = (ingredientCategories: IngredientCategory[], ingredients: ShoppingIngredient[]): ShoppingCategory[] => {
  const categoryMap = ingredientCategories.reduce((carry, category) => {
    carry.set(category.id, {
      ...category,
      ingredients: [],
    });
    return carry;
  }, new Map());

  ingredients.forEach(ingredient => {
    const category = categoryMap.get(ingredient.shoppingCategoryId);
    category?.ingredients.push(ingredient);
  });

  return Array.from(categoryMap).map(([_, category]) => category);
}

const ShoppingIngredientLabel = ({ ingredient }: { ingredient: ShoppingIngredient }) => {
  if (ingredient.amounts.length > 1) {
    return (
      <>
        {ingredient.title}
        &nbsp;
        ({ingredient.amounts.map(ingredientAmount => `${ingredientAmount.amount || ''}${ingredientAmount.unit || ''}`).filter(Boolean).join(', ')})
      </>
    )
  }

  return (
    <>
      {ingredient.amounts[0].amount}{ingredient.amounts[0].unit}
      &nbsp;
      {ingredient.title}
    </>
  );
};
