import { useCallback, useEffect, useState } from "react";

export type MenuPlannings = Array<{
  challenge: {
    name: string;
    start_date: string;
    week_length: number;
  };
  days: Array<{
    id: number;
    title: string;
    meals: Array<{
      leftover: boolean;
      meal_type: {
        id: number;
        title: string;
      };
      title: string;
      recipe: {} | {
        id: number;
        cook_time_in_minutes: number;
        feature_image: {
          id: number;
          name: string;
          // hash: string;
          url: string;
          ext: string;
        };
        title: string;
        serves: number;
        // published: boolean;
        // skill_level: number;
        // slug: string;
        // thumbnail: null;
      };
    }>;
  }>;
}>;

type Resource<T extends object> = {
  loading: true;
  data: undefined;
} | {
  loading: false;
  data: T;
};

export const useMenuPlannings = () => {
  const url = 'https://strapi.f45training.com/meal-plannings?challenge.id_eq=9&dietary_preference.id_eq=3';
  return useResource<MenuPlannings>(url);
}

export type Recipes = Array<{
  cook_time_in_minutes: number;
  feature_image: {
    id: number;
    name: string;
    url: string;
  };
  id: number;
  recipe_data: Array<{
    country: string;
    gender: string;
    id: number;
    ingredients: Array<{
      amount: number;
      hide_from_shopping_list: boolean | null;
      id: number;
      ingredient: {
        ingredient_display_override: string;
        ingredient_measurement: {
          id: number;
          title: string;
          abbreviation: string; 
        };
        modifier: string;
      }
    }>;
    method: string;
    nutrition: {
      calories_per_serve: number;
      id: number;
      nutritional_information: {
        id: number;
        nutrients: Array<{
          id: 161450;
          title: string;
          qty_per_serving: string;
          avg_qty_per_100g: string
        }>
        serving_size: 200
      };
      show_chart: boolean;
    };
  }>;
  serves: number;
  // similar_recipes: [];
  // skill_level: number;
  title: string;
}>;

export const useRecipesQuery = () => {
  const [resource, setResource] = useState<Resource<Recipes>>({
    loading: true,
    data: undefined,
  });

  const query = useCallback((ids: number[]) => {
    const baseUrl = 'https://strapi.f45training.com/recipes';
    const queryString = ids.map(id => `id_in=${id}`).join('&');
    fetch(`${baseUrl}?${queryString}`)
      .then(response => response.json())
      .then(response => {
        setResource({
          loading: false,
          data: response,
        });
      });
  }, []);

  return {
    query,
    resource,
  };
};

const useResource = <T extends object>(url: string): Resource<T>  => {
  const [resource, setResource] = useState<Resource<T>>({
    loading: true,
    data: undefined,
  });

  useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then(response => {
        setResource({
          loading: false,
          data: response,
        });
      });
  }, []);

  return resource;
}
