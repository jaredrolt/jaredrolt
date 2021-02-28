import React, { useState, useCallback, useEffect } from 'react';
import { useMealPlans, MealPlan } from '../menu/api';
import { CreateMealPlanForm } from './create_meal_plan_form';
import styles from './profile.module.css';
import { ShareMealPlanForm } from './share_meal_plan_form';
import { SelectActiveMealPlan } from './select_active_meal_plan';

const fakeMealPlan: MealPlan = {
  id: '123',
  name: 'Jareds Fake Plan',
  menu_id: '234',
  menu: {
    id: '234',
    name: 'C30 Maint',
    source: 'f45_challenge',
    source_id: '9',
  },
  recipe_overrides: [],
}

export const Profile = () => {
  const { data: mealPlans, loading } = useMealPlans();
  // const mealPlans = [fakeMealPlan, {
  //   ...fakeMealPlan,
  //   id: '456',
  //   name: 'Plan B',
  // }];

  useEffect(() => {
    if (!loading && mealPlans === undefined) {
      window.location.href = '/login?redirect=profile';
    }
  }, [loading, mealPlans]);

  return (
    <div>
      <div>A profile page</div>
      <h2>My meal plans</h2>
      {mealPlans && <SelectActiveMealPlan mealPlans={mealPlans} />}
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
