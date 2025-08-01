import { useCallback, useEffect, useState } from 'react';

export const useKeyPress = (targetKey: KeyboardEvent['key'], useShift?: boolean, callback?: () => void) => {
  const [keyPressed, setKeyPressed] = useState(false);

  const downHandler = useCallback(
    ({ key, shiftKey }: KeyboardEvent) => {
      if (useShift && !shiftKey) return;
      if (key == targetKey) {
        setKeyPressed(true);
        callback?.();
      }
    },
    [targetKey, useShift]
  );

  const upHandler = useCallback(
    ({ key, shiftKey }: KeyboardEvent) => {
      if (useShift && !shiftKey) return;
      if (key == targetKey) {
        setKeyPressed(false);
      }
    },
    [targetKey, useShift]
  );

  useEffect(() => {
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [downHandler, upHandler]);

  return keyPressed;
};

export default useKeyPress;
