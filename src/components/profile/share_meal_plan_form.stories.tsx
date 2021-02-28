import React from 'react';
import { Story } from '@storybook/react';
import { ShareMealPlanForm, ShareMealPlanFormProps } from './share_meal_plan_form';

export default {
  title: 'ShareMealPlanForm',
  component: ShareMealPlanForm,
};

const Template: Story<ShareMealPlanFormProps> = (args) => <ShareMealPlanForm {...args} />;

export const Normal = Template.bind({});

Normal.args = {
  mealPlanId: '123',
};
