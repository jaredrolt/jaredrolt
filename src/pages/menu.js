import React from "react"
import SEO from "../components/seo"
import "../components/menu/menu.scss"
import { Menu } from '../components/menu/menu';

const MenuPage = () => (
  <>
    <SEO title="Menu" meta={[{ name: 'robots', content: 'noindex, nofollow' }]} />
    <Menu />
  </>
);

export default MenuPage;
