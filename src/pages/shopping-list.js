import React from "react"
import SEO from "../components/seo"
import "../components/menu/shopping_list.scss"
import { ShoppingList } from '../components/menu/shopping_list';

const ShoppingListPage = () => (
  <>
    <SEO title="Shopping List" meta={[{ name: 'robots', content: 'noindex, nofollow' }]} />
    <ShoppingList />
  </>
);

export default ShoppingListPage;
