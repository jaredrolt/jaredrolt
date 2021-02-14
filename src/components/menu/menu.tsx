import React, { useEffect, useState } from 'react';

export const Menu = () => {
  const [recipe, setRecipe] = useState('');

  useEffect(() => {
    fetch('https://strapi.f45training.com/recipes/67')
      .then(response => response.json())
      .then(response => {
        setRecipe(response);
      });
  }, []);

  return (
    <div>
      <h1>Recipe</h1>
      <pre>
        {JSON.stringify(recipe, null, '  ')}
      </pre>
    </div>
  );
};
