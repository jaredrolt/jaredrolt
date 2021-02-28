import Link from 'gatsby-link';
import React, { useCallback, useState, MouseEvent, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../../util/use_local_storage';
import { MenuPlannings, useMenuPlannings, useRecipesQuery } from './api';
import { RecipeSearch } from './recipe_search';

const LOCAL_STORAGE_WEEK = 'week';
const LOCAL_STORAGE_SELECTED_RECIPES = 'selectedRecipes';
const LOCAL_STORAGE_RECIPE_OVERRIDES = 'recipeOverrides';

export const useRecipeOverrides = () => useLocalStorage<Record<number, number>>(LOCAL_STORAGE_RECIPE_OVERRIDES, {});
export const useSelectedRecipeIds = () => useLocalStorage<{[key:number]:number[]}>(LOCAL_STORAGE_SELECTED_RECIPES, {});
export const useWeek = () => useLocalStorage<number>(LOCAL_STORAGE_WEEK, 0);

export type WeekDay = MenuPlannings[0]['days'][0];
export type MealType = WeekDay['meals'][0];

export type MealTypeWithOverrides = MealType & {
  recipeOverride?: MealType['recipe'];
};

export type WeekDayWithOverrides = Omit<WeekDay, 'meals'> & {
  meals: Array<MealTypeWithOverrides>;
};

export const exists = <T,>(x: T | undefined): x is T => x !== undefined;

export const Menu = () => {
  const [week, setWeek] = useWeek();
  const handleWeekChange = useCallback(week => setWeek(week), []);
  const [selectedMeal, setSelectedMeal] = useState<MealTypeWithOverrides|undefined>();
  const handleSelectMeal = useCallback((_, meal: MealTypeWithOverrides) => setSelectedMeal(meal), []);
  const handleCloseModal = useCallback((e: MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    setSelectedMeal(undefined);
  }, []);

  const { data } = useMenuPlannings();

  const { query: getRecipes, resource: recipes } = useRecipesQuery();

  const days = useMemo(() => {
    if (!data) return [];
    return data[0].days.slice(week * 7, (1 + week) * 7);
  }, [data, week]);

  
  const [recipeOverrides, setRecipeOverrides] = useRecipeOverrides();

  const daysWithOverrides = useMemo(() => {
    return days.map(day => ({
      ...day,
      meals: day.meals.map(meal => ({
        ...meal,
        ...('id' in meal.recipe && recipeOverrides[meal.recipe.id] ? {
          recipeOverride: recipes.data?.find(recipe => 'id' in meal.recipe && recipe.id === recipeOverrides[meal.recipe.id]),
        } : {}),
      })),
    }));
  }, [days, recipeOverrides, recipes]);

  const recipeIds = useMemo(() => {
    const fromDays = days.flatMap(day =>
      day.meals.map(meal =>
        'id' in meal.recipe
          ? meal.recipe.id
          : undefined)
      .filter(exists));
    const fromOverrides = Object.keys(recipeOverrides)
        .map(id => recipeOverrides[Number(id)]);
    return Array.from(new Set([
      ...fromDays,
      ...fromOverrides,
    ]));
  }, [days, recipeOverrides]);

  useEffect(() => {
    if (!recipeIds.length) return;
    getRecipes(recipeIds);
  }, [recipeIds]);

  const selectedRecipeData = useMemo(() => {
    const selectedRecipeId = selectedMeal && selectedMeal.recipeOverride
    ? ('id' in selectedMeal.recipeOverride ? selectedMeal.recipeOverride.id : undefined)
    : (selectedMeal && 'id' in selectedMeal.recipe ? selectedMeal.recipe.id : undefined);

    return recipes?.data?.find(recipe => recipe.id === selectedRecipeId);
  }, [recipes, selectedMeal]);

  const [selectedRecipes, setSelectedRecipes] = useSelectedRecipeIds();

  const [showRecipeSearch, setShowRecipeSearch] = useState(false);
  const handleOpenRecipeSearch = useCallback(() => setShowRecipeSearch(true), []);
  const handleCloseRecipeSearch = useCallback(() => setShowRecipeSearch(false), []);

  const handleSelectOverride = useCallback((recipeId: number) => {
    if (!selectedMeal?.recipe || !('id' in selectedMeal.recipe)) return;
    const originalRecipeId = selectedMeal.recipe.id;
    if (!window.confirm(`Confirm replace with recipe ${recipeId}`)) return;
    setRecipeOverrides(existing => ({
      ...existing,
      [originalRecipeId]: recipeId,
    }));
    setShowRecipeSearch(false);
  }, [recipeOverrides, selectedMeal]);

  const handleToggleMeal = useCallback((meal: MealType) => {
    if (!('id' in meal.recipe)) return;

    const selectedRecipesForWeek = selectedRecipes[week];
    const recipeId = meal.recipe.id;

    if (!selectedRecipesForWeek) {
      setSelectedRecipes(selectedRecipes => ({
        ...selectedRecipes,
        [week]: [recipeId],
      }));
      return;
    }
    const shouldToggleOff = selectedRecipesForWeek.indexOf(recipeId) > -1;
    setSelectedRecipes(selectedRecipes => ({
      ...selectedRecipes,
      [week]: shouldToggleOff
        ? selectedRecipesForWeek.filter((id: number) => id !== recipeId)
        : [...selectedRecipesForWeek, recipeId],
    }));
  }, [selectedRecipes, week]);

  const handleToggleIncludes = useCallback(() => {
    setSelectedRecipes(selectedRecipes => ({
      ...selectedRecipes,
      [week]: (selectedRecipes[week] || []).length > 0
        ? []
        : [...recipeIds],
    }));
  }, [week, recipeIds]);

  if (!data) {
    return (
      <select>
        <option>Loading...</option>
      </select>
    );
  }

  const nutrition = selectedRecipeData?.recipe_data[0].nutrition;

  return (
    <div className="menu">
      <div className="header">
        <SelectWeek value={week} onChange={handleWeekChange} />
        <Link to="/profile">Profile</Link>
        <Link to="/shopping-list">Shopping List</Link>
      </div>
      <h1>Menu - Week {week + 1}</h1>
      <button className="link-button" onClick={handleToggleIncludes}>Toggle includes</button>
      {daysWithOverrides.map((day, dayIndex) => (
        <Day key={dayIndex} day={day} onSelectMeal={handleSelectMeal} selectedRecipes={selectedRecipes[week] || []} onIncludeMealToggle={handleToggleMeal}  />
      ))}
      {selectedMeal && 'id' in selectedMeal.recipe && (
        <>
          <style dangerouslySetInnerHTML={{ __html: 'body { overflow: hidden; }' }} />
          <div className="modal-bg" onClick={handleCloseModal} />
          <div className="modalx">
            <div className="modal-header">
              <h3>{selectedMeal.title}</h3>
              <button onClick={handleOpenRecipeSearch}>Replace</button>
            </div>
            {selectedMeal.recipeOverride && 'id' in selectedMeal.recipeOverride && (
              <img height={213} src={selectedMeal.recipeOverride.feature_image.url} alt={selectedMeal.recipeOverride.feature_image.name} />
            )}
            {!selectedMeal.recipeOverride && (
              <img height={213} src={selectedMeal.recipe.feature_image.url} alt={selectedMeal.recipe.feature_image.name} />
            )}
            <h2>{selectedMeal.recipeOverride && 'id' in selectedMeal.recipeOverride ? selectedMeal.recipeOverride.title : selectedMeal.recipe.title}</h2>
            {selectedRecipeData && (
              <div className="ingredients">
                <h4>Ingredients</h4>
                {selectedRecipeData.recipe_data[0].ingredients.map((ingredient, ingredientIndex) => (
                  <div key={ingredientIndex} className="ingredient">
                    {ingredient.ingredient_display_override || `${ingredient.amount} ${ingredient.ingredient_measurement ? `${ingredient.ingredient_measurement.abbreviation}.` : ''} ${ingredient.ingredient.title} ${ingredient.modifier ? `(${ingredient.modifier})` : ''}`}
                  </div>
                ))}
              </div>
            )}
            {selectedRecipeData && (
              <>
                <h4>Method</h4>
                <div dangerouslySetInnerHTML={{ __html: selectedRecipeData.recipe_data[0].method }} />
              </>
            )}
            {nutrition && (
              <>
                <h4>Nutrition</h4>
                <table className="nutrition-table">
                  <thead>
                    <tr>
                      <th colSpan={2}>Per serve ({nutrition.nutritional_information.serving_size})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nutrition.nutritional_information.nutrients.map((nutrient, nutrientIndex) => (
                      <tr key={nutrientIndex}>
                        <td>{nutrient.title}</td>
                        <td>{nutrient.qty_per_serving}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
          {showRecipeSearch && (
            <>
              <style dangerouslySetInnerHTML={{ __html: 'body { overflow: hidden; }' }} />
              <div className="modal-bg" onClick={handleCloseRecipeSearch} />
              <div className="modalx">
                <RecipeSearch
                  mealTypeName={selectedMeal.meal_type.title}
                  mealTypeId={selectedMeal.meal_type.id}
                  onSelectMeal={handleSelectOverride}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

const Day = ({ day, onSelectMeal, onIncludeMealToggle, selectedRecipes }: { day: WeekDayWithOverrides, selectedRecipes: number[], onSelectMeal?: (day: WeekDay, meal: MealType) => void, onIncludeMealToggle?: (meal: MealType) => void }) => {
  return (
    <div className="day">
      <h5 className="day-title">{day.title}</h5>
      <div className="meals-wrapper">
        <div className="meals">
          {day.meals.map((meal, mealIndex) => (
            <Meal key={mealIndex} meal={meal} included={'id' in meal.recipe && selectedRecipes.indexOf(meal.recipe.id) > -1} onClick={() => onSelectMeal?.(day, meal)} onIncludeToggle={() => onIncludeMealToggle?.(meal)} />
          ))}
        </div>
      </div>
    </div>
  );
};

const Meal = ({ meal, included, onClick, onIncludeToggle }: { meal: MealTypeWithOverrides, included: boolean, onClick?: () => void, onIncludeToggle?: () => void }) => {
  const recipe = (meal.recipeOverride && 'id' in meal.recipeOverride)
    ? meal.recipeOverride
    : (meal.recipe && 'id' in meal.recipe ? meal.recipe : undefined);

  if (!recipe) {
    return null;
  }

  return (
    <div className="meal" onClick={onClick}>
      <div className="meal-header">
        <h6>{meal.title}</h6>
        <label onClick={e => e.stopPropagation()}>Incl. <input type="checkbox" checked={included} onChange={onIncludeToggle} /></label>
      </div>
      <img src={recipe.feature_image.url} />
      <h6 className="recipe-title">{recipe.title}</h6>
    </div>
  );
}

export const SelectWeek = ({ value, onChange }: { value: number, onChange: (index: number) => void }) => {
  const { loading, data } = useMenuPlannings();

  if (!data) {
    return (
      <select>
        <option>Loading...</option>
      </select>
    );
  }

  return (
    <select value={value} onChange={e => onChange(Number(e.target.value))}>
      {loading && (
        <option>Loading...</option>
      )}
      {!loading && (
        <>
          {Array.from(Array(data[0].challenge.week_length)).map((_, index) => (
            <option key={index} value={index}>{data[0].challenge.name} - Week {index + 1}</option>
          ))}
        </>
      )}
    </select>
  )
}

const DAYS: {[key: number]: string} = {
  1: 'Mon',
  2: 'Tues',
  3: 'Weds',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
  7: 'Sun',
};
