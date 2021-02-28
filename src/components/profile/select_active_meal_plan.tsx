import React, { useCallback } from 'react';
import { MealPlan } from '../menu/api';
import { useLocalStorage } from '../../util/use_local_storage';

export type SelectActiveMealPlanProps = {
  mealPlans: MealPlan[];
};

const LOCAL_STORAGE_ACTIVE_MEAL_PLAN = 'activeMealPlan';

export const SelectActiveMealPlan = ({ mealPlans }: SelectActiveMealPlanProps) => {
  const [activeMealPlan, setActiveMealPlan] = useLocalStorage(LOCAL_STORAGE_ACTIVE_MEAL_PLAN, mealPlans[0]?.id);
  const handleChange = useCallback((e) => {
    setActiveMealPlan(e.currentTarget.value);
  }, []);

  return (
    <div>
      <label>Active meal plan:</label>
      <select value={activeMealPlan} onChange={handleChange}>
        {mealPlans.map(mealPlan => (
          <option key={mealPlan.id} value={mealPlan.id}>{mealPlan.name}</option>
        ))}
      </select>
    </div>
  );
};
