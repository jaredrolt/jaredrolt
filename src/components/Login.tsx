import React, { useCallback, useEffect, useState } from 'react';
import FacebookLogin, { ReactFacebookFailureResponse, ReactFacebookLoginInfo } from 'react-facebook-login';

function getCookie(name: string) {
  if (!document.cookie) {
    return null;
  }

  const xsrfCookies = document.cookie.split(';')
    .map(c => c.trim())
    .filter(c => c.startsWith(name + '='));

  if (xsrfCookies.length === 0) {
    return null;
  }
  return decodeURIComponent(xsrfCookies[0].split('=')[1]);
}

export const Login = () => {
  console.log('render Login');
  const [user, setUser] = useState('');
  const callback = useCallback(async (response: ReactFacebookLoginInfo|ReactFacebookFailureResponse) => {
    console.log('login callback');
    if (!('accessToken' in response)) {
      window.alert('Failed to login with FB');
      return;
    }

    console.log('getting cookie');
    await fetch('/api/sanctum/csrf-cookie');
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': String(getCookie('XSRF-TOKEN')),
      },
      body: JSON.stringify({
        access_token: response.accessToken,
      }),
    }).then(response => response.json());

    console.log(loginResponse);

    if (!loginResponse || loginResponse.message !== 'success') {
      window.alert('Failed to login');
      return;
    }

    const userResponse: { name: string } = await fetch('/api/user').then(response => response.json());
    setUser(userResponse.name);
  }, []);

  // useEffect(() => {
  //   const cookie = getCookie('XSRF-TOKEN');
  //   if (cookie) {
  //     fetch('/api/user').then(response => response.json()).then(response => {
  //       setUser(response.name);
  //     }).catch(() => {
  //       console.log('Found cookie but unable to login');
  //     })
  //   }
  // }, []);

  return (
    <div>
      <h1>This is the login</h1>
      {!user && <FacebookLogin appId={String(process.env.GATSBY_FACEBOOK_APP_ID)} callback={callback} disableMobileRedirect={true} />}
      {user && (
        <div>
          Welcome, {user} :)
        </div>
      )}
    </div>
  );
};
