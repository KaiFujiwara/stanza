import { useState, useEffect, useRef } from 'react';

/**
 * 初回のみ初期化される状態を管理するカスタムフック
 * データフェッチ完了時に一度だけ状態を設定し、その後の再フェッチでは状態を保持する
 */
export function useInitializedState<T>(
  data: T | undefined | null,
  initializer: (data: T) => void,
  deps: unknown[] = []
) {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (data && !initializedRef.current) {
      initializer(data);
      initializedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, ...deps]);

  const reset = () => {
    initializedRef.current = false;
  };

  return { reset };
}
