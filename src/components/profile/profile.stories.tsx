import React from 'react';
import { Story } from '@storybook/react';
import { Profile } from './profile';

export default {
  title: 'Profile',
  component: Profile,
};

const Template: Story<{}> = (args) => <Profile {...args} />;

export const Normal = Template.bind({});

Normal.args = {
};
