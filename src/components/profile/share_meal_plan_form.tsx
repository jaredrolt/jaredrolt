import React, { useCallback, useState, ChangeEvent} from 'react';
import { getCookie } from '../login/login';

export type ShareMealPlanFormProps = {
  mealPlanId: string;
};

export const ShareMealPlanForm = ({ mealPlanId }: ShareMealPlanFormProps) => {
  const [emailAddress, setEmailAddress] = useState('');
  const handleEmailAddressChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setEmailAddress(e.currentTarget.value);
  }, []);
  const [sending, setSending] = useState(false);
  const handleSendInvite = useCallback(async () => {
    setSending(true);
    await fetch('/api/sanctum/csrf-cookie');
    fetch('/api/meal-plans/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': String(getCookie('XSRF-TOKEN')),
      },
      body: JSON.stringify({
        meal_plan_id: mealPlanId,
        email_address: emailAddress,
      }),
    })
    .then(response => response.json())
    .then((response) => {
      if (response.message === 'success') {
        window.location.reload();
      }
    })
    .finally(() => {
      setSending(false);
    });
  }, [emailAddress, mealPlanId]);
  return (
    <div>
      <input value={emailAddress} onChange={handleEmailAddressChange} placeholder="Email address" />
      <button onClick={handleSendInvite} disabled={sending}>{sending ? 'Sending...' : 'Send invite'}</button>
    </div>
  );
};
