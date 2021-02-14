import React, { useCallback, useState, MouseEvent, useEffect, useMemo } from 'react';
import { MenuPlannings, useMenuPlannings, useRecipesQuery } from './api';

type WeekDay = MenuPlannings[0]['days'][0];
type MealType = WeekDay['meals'][0];

const exists = <T,>(x: T | undefined): x is T => x !== undefined;

export const Menu = () => {
  const [week, setWeek] = useState(0);
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

  useEffect(() => {
    if (!data) return;
    const recipeIds = data[0].days.flatMap(day =>
      day.meals.map(meal =>
        'id' in meal.recipe
          ? meal.recipe.id
          : undefined)
      .filter(exists));
    getRecipes(recipeIds);
  }, [data]);

  const selectedRecipeData = useMemo(() => {
    if (!selectedMeal || !('id' in selectedMeal.recipe)) return;
    return recipes?.data?.find(recipe => 'id' in selectedMeal.recipe && recipe.id === selectedMeal.recipe.id);
  }, [recipes, selectedMeal]);

  if (!data) {
    return (
      <select>
        <option>Loading...</option>
      </select>
    );
  }

  return (
    <div className="menu">
      <SelectWeek value={week} onChange={handleWeekChange} />
      <h1>Recipe - Week {week + 1}</h1>
      {weeks.map((_, weekIndex) => (
        <Day key={weekIndex} day={data[0].days[(week * 7) + weekIndex]} onSelectMeal={handleSelectMeal}  />
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
              <div dangerouslySetInnerHTML={{ __html: selectedRecipeData.recipe_data[0].method }} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

const Day = ({ day, onSelectMeal }: { day: WeekDay, onSelectMeal?: (day: WeekDay, meal: MealType) => void }) => {
  return (
    <div>
      {day.title}
      <div className="meals">
        {day.meals.map((meal, mealIndex) => (
          <Meal key={mealIndex} meal={meal} onClick={() => onSelectMeal?.(day, meal)} />
        ))}
      </div>
    </div>
  );
};

const Meal = ({ meal, onClick }: { meal: MealType, onClick?: () => void }) => {
  if (!('id' in meal.recipe)) {
    return null;
  }

  return (
    <div className="meal" onClick={onClick}>
      <h6>{meal.title}</h6>
      <img src={meal.recipe.feature_image.url} />
      <h6>{meal.recipe.title}</h6>
    </div>
  );
}

const SelectWeek = ({ value, onChange }: { value: number, onChange: (index: number) => void }) => {
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
