import React from 'react';
import { useMealPlans, useMenus } from '../menu/api';
import { CreateMealPlanForm } from './create_meal_plan_form';

export const Profile = () => {
  const { data: mealPlans } = useMealPlans();

  return (
    <div>
      <div>A profile page</div>
      <h2>My meal plans</h2>
      <div>
        {mealPlans && mealPlans.map(mealPlan => (
          <div key={mealPlan.id}>{mealPlan.name}</div>
        ))}
      </div>
      <hr />
      <CreateMealPlanForm />
    </div>
  );
};
