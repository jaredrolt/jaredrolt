import React from "react"
import SEO from "../components/seo"
import { Profile } from '../components/profile/profile';

const ProfilePage = () => (
  <>
    <SEO title="Profile" meta={[{ name: 'robots', content: 'noindex, nofollow' }]} />
    <Profile />
  </>
);

export default ProfilePage;
