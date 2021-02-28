module.exports = {
  stories: ['../src/**/*.stories.@(js|tsx)'],
  addons: [
   'storybook-css-modules-preset',
   '@storybook/addon-actions/register',
   '@storybook/addon-links/register',
  ],
}
