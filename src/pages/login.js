import React from 'react';
import { Login } from '../components/login/login';
import SEO from '../components/seo';

const LoginPage = () => (
  <>
    <SEO title="Login" meta={[{ name: 'robots', content: 'noindex, nofollow' }]} />
    <Login />
  </>
);

export default LoginPage;
