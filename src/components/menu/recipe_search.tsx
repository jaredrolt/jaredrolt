import React, { useCallback, useState } from 'react';
import { Recipes, useRecipeSearch } from './api';
import './recipe_search.scss';

export type RecipeSearchProps = {
  mealTypeId?: number;
  mealTypeName?: string;
  onSelectMeal?: (recipeId: number) => void;
};

export const RecipeSearch = ({ mealTypeId, mealTypeName, onSelectMeal }: RecipeSearchProps) => {
  const { query, resource } = useRecipeSearch();
  const [searchInput, setSearchInput] = useState('');
  const handleSearchInput = useCallback(e => {
    const value = e.currentTarget.value;
    setSearchInput(value);
    value.length && query(value);
  }, []);
  return (
    <div>
      <input className="search-input" placeholder={`Search ${mealTypeName ? `${mealTypeName} ` : ''}recipes...`} value={searchInput} onChange={handleSearchInput} />
      {resource.loading && searchInput.length > 0 && (
        <div>Loading...</div>
      )}
      {resource.data && (
        <div className="search-results">
          {resource.data.filter(mealTypeId ? recipeIncludesMealType(mealTypeId) : () => true).map((recipe, recipeIndex) => (
            <div key={recipeIndex} className="result" onClick={() => onSelectMeal?.(recipe.id)}>
              <img src={recipe.feature_image.url} />
              <h5>{recipe.title}</h5>
            </div>
          ))}
        </div>
      )}
      {resource.data?.length === 0 && (
        <div>No results</div>
      )}
    </div>
  );
}

const recipeIncludesMealType = (mealTypeId: number) => (recipe: Recipes[0]) => {
  return !! recipe.meal_types.find(mealType => mealType.id === mealTypeId);
}
