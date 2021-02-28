import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useMenus } from '../menu/api';

export type SelectMenuProps = {
  value: string | undefined;
  onChange?: (value: string | undefined) => void; 
}

export const SelectMenu = ({ onChange }: SelectMenuProps) => {
  const { data: menus } = useMenus();

  const [menuId, setMenuId] = useState<string|undefined>(undefined);
  const handleMenuIdChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setMenuId(e.target.value);
  }, []);

  useEffect(() => {
    if (menus?.length) {
      setMenuId(menus[0].id);
    }
  }, [menus]);

  useEffect(() => {
    onChange?.(menuId);
  }, [menuId]);

  return (
    <div>
      <select value={menuId} onChange={handleMenuIdChange}>
        {menus && menus.map(menu => (
          <option key={menu.id} value={menu.id}>{menu.name}</option>
        ))}
      </select>
    </div>
  );
};
