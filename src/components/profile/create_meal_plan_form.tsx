import React, { ChangeEvent, useCallback, useState } from 'react';
import { SelectMenu } from './select_menu';
import { getCookie } from '../Login';

export const CreateMealPlanForm = () => {
  const [name, setName] = useState('');
  const handleNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);
  const [menuId, setMenuId] = useState<string|undefined>(undefined);
  const handleMenuIdChange = useCallback(value => {
    setMenuId(value);
  }, []);
  const [creating, setCreating] = useState(false);
  const handleCreate = useCallback(async () => {
    setCreating(true);
    await fetch('/api/sanctum/csrf-cookie');
    fetch('/api/meal-plans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': String(getCookie('XSRF-TOKEN')),
      },
      body: JSON.stringify({
        menu_id: menuId,
        name,
      }),
    })
    .then(response => response.json())
    .then((response) => {
      if (response.message === 'success') {
        window.location.reload();
      }
    })
    .finally(() => {
      setCreating(false);
    });
  }, [name, menuId]);
  return (
    <div>
      <label>Menu:</label><br />
      <SelectMenu value={menuId} onChange={handleMenuIdChange} />
      <label>Meal plan name</label><br />
      <input value={name} onChange={handleNameChange} /><br />
      <button onClick={handleCreate} disabled={creating}>{creating ? 'Loading...' : 'Create'}</button>
      <pre>
        {JSON.stringify({
          name,
          menuId,
        })}
      </pre>
    </div>
  );
};
