import React, { useState, useCallback } from 'react';
import { useMealPlans, MealPlan } from '../menu/api';
import { CreateMealPlanForm } from './create_meal_plan_form';
import styles from './profile.module.css';
import { ShareMealPlanForm } from './share_meal_plan_form';

export const Profile = () => {
  const { data: mealPlans } = useMealPlans();
  // const mealPlans = [{id: '123', name: 'Cool story'}];

  return (
    <div>
      <div>A profile page</div>
      <h2>My meal plans</h2>
      <div>
        {mealPlans && mealPlans.map(mealPlan => (
          <MealPlanRow key={mealPlan.id} mealPlan={mealPlan} />
        ))}
      </div>
      <hr />
      <CreateMealPlanForm />
    </div>
  );
};

type MealPlanRowProps = {
  mealPlan: MealPlan;
};

const MealPlanRow = ({ mealPlan }: MealPlanRowProps) => {
  const [showShareFlyout, setShowShareFlyout] = useState(false);
  const handleToggleShareFlyout = useCallback(() => {
    setShowShareFlyout(on => !on);
  }, []);
  return (
    <div className={styles.mealPlan}>
      <h3 className={styles.mealPlanTitle}>{mealPlan.name}</h3>
      <button onClick={handleToggleShareFlyout}>Share</button>
      {showShareFlyout && (
        <div className={styles.shareFlyout}>
          <ShareMealPlanForm mealPlanId={mealPlan.id} />
        </div>
      )}
    </div>
  );
};
