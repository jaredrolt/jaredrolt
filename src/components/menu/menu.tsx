import { Link } from 'gatsby';
import React, { useCallback, useState, MouseEvent, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../../util/use_local_storage';
import { MenuPlannings, useMenuPlannings, useRecipesQuery } from './api';

const LOCAL_STORAGE_WEEK = 'week';
const LOCAL_STORAGE_SELECTED_RECIPES = 'selectedRecipes';

export const useSelectedRecipeIds = () => useLocalStorage<{[key:number]:number[]}>(LOCAL_STORAGE_SELECTED_RECIPES, {});
export const useWeek = () => useLocalStorage<number>(LOCAL_STORAGE_WEEK, 0);

export type WeekDay = MenuPlannings[0]['days'][0];
export type MealType = WeekDay['meals'][0];

export const exists = <T,>(x: T | undefined): x is T => x !== undefined;

export const Menu = () => {
  const [week, setWeek] = useWeek();
  const handleWeekChange = useCallback(week => setWeek(week), []);
  const weeks = Array.from(Array(7));
  const [selectedMeal, setSelectedMeal] = useState<MealType|undefined>();
  const handleSelectMeal = useCallback((_, meal: MealType) => setSelectedMeal(meal), []);
  const handleCloseModal = useCallback((e: MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    setSelectedMeal(undefined);
  }, []);

  const { data } = useMenuPlannings();

  const { query: getRecipes, resource: recipes } = useRecipesQuery();

  const recipeIds = useMemo(() => {
    if (!data) return [];
    return data[0].days.slice(week * 7, (1 + week) * 7).flatMap(day =>
      day.meals.map(meal =>
        'id' in meal.recipe
          ? meal.recipe.id
          : undefined)
      .filter(exists));
  }, [data, week]);

  useEffect(() => {
    if (!recipeIds.length) return;
    getRecipes(recipeIds);
  }, [recipeIds]);

  const selectedRecipeData = useMemo(() => {
    if (!selectedMeal || !('id' in selectedMeal.recipe)) return;
    return recipes?.data?.find(recipe => 'id' in selectedMeal.recipe && recipe.id === selectedMeal.recipe.id);
  }, [recipes, selectedMeal]);

  const [selectedRecipes, setSelectedRecipes] = useSelectedRecipeIds();

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

  return (
    <div className="menu">
      <div className="header">
        <SelectWeek value={week} onChange={handleWeekChange} />
        <Link to="/shopping-list">Shopping List</Link>
      </div>
      <h1>Menu - Week {week + 1}</h1>
      <button className="link-button" onClick={handleToggleIncludes}>Toggle includes</button>
      {weeks.map((_, weekIndex) => (
        <Day key={weekIndex} day={data[0].days[(week * 7) + weekIndex]} onSelectMeal={handleSelectMeal} selectedRecipes={selectedRecipes[week] || []} onIncludeMealToggle={handleToggleMeal}  />
      ))}
      {selectedMeal && 'id' in selectedMeal.recipe && (
        <>
          <style dangerouslySetInnerHTML={{ __html: 'body { overflow: hidden; }' }} />
          <div className="modal-bg" onClick={handleCloseModal} />
          <div className="modalx">
            <h3>{selectedMeal.title}</h3>
            <img src={selectedMeal.recipe.feature_image.url} alt={selectedMeal.recipe.feature_image.name} />
            <h2>{selectedMeal.recipe.title}</h2>
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
          </div>
        </>
      )}
    </div>
  );
};

const Day = ({ day, onSelectMeal, onIncludeMealToggle, selectedRecipes }: { day: WeekDay, selectedRecipes: number[], onSelectMeal?: (day: WeekDay, meal: MealType) => void, onIncludeMealToggle?: (meal: MealType) => void }) => {
  return (
    <div>
      <h5>{day.title}</h5>
      <div className="meals">
        {day.meals.map((meal, mealIndex) => (
          <Meal key={mealIndex} meal={meal} included={'id' in meal.recipe && selectedRecipes.indexOf(meal.recipe.id) > -1} onClick={() => onSelectMeal?.(day, meal)} onIncludeToggle={() => onIncludeMealToggle?.(meal)} />
        ))}
      </div>
    </div>
  );
};

const Meal = ({ meal, included, onClick, onIncludeToggle }: { meal: MealType, included: boolean, onClick?: () => void, onIncludeToggle?: () => void }) => {
  if (!('id' in meal.recipe)) {
    return null;
  }

  return (
    <div className="meal" onClick={onClick}>
      <div className="meal-header">
        <h6>{meal.title}</h6>
        <label onClick={e => e.stopPropagation()}>Include <input type="checkbox" checked={included} onChange={onIncludeToggle} /></label>
      </div>
      <img src={meal.recipe.feature_image.url} />
      <h6>{meal.recipe.title}</h6>
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
