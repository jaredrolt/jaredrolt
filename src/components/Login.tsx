import React, { useCallback, useState } from 'react';
import FacebookLogin, { ReactFacebookFailureResponse, ReactFacebookLoginInfo } from 'react-facebook-login';

export const Login = () => {
  const [user, setUser] = useState('');
  const callback = useCallback(async (response: ReactFacebookLoginInfo|ReactFacebookFailureResponse) => {
    if (!('accessToken' in response)) {
      window.alert('Failed to login with FB');
      return;
    }

    await fetch('/api/sanctum/csrf-cookie');
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: response.accessToken,
      }),
    }).then(response => response.json());

    if (!loginResponse || loginResponse.message !== 'success') {
      window.alert('Failed to login');
      return;
    }

    const userResponse: { name: string } = await fetch('/api/user').then(response => response.json());
    setUser(userResponse.name);
  }, []);

  return (
    <div>
      <h1>This is the login</h1>
      {!user && <FacebookLogin appId={String(process.env.GATSBY_FACEBOOK_APP_ID)} callback={callback}  />}
      {user && (
        <div>
          Welcome, {user} :)
        </div>
      )}
    </div>
  );
};
