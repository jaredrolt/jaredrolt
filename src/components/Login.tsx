import React, { useCallback } from 'react';
import FacebookLogin, { ReactFacebookFailureResponse, ReactFacebookLoginInfo } from 'react-facebook-login';

export const Login = () => {
  const callback = useCallback((response: ReactFacebookLoginInfo|ReactFacebookFailureResponse) => {
    console.log(response);
  }, [])
  return (
    <div>
      <h1>This is the login</h1>
      <FacebookLogin appId={String(process.env.GATSBY_FACEBOOK_APP_ID)} callback={callback}  />
    </div>
  );
};
