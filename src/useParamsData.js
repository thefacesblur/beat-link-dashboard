import { useEffect, useState } from 'react';
import { useSettings } from './SettingsContext';

export default function useParamsData() {
  const { pollingInterval } = useSettings();
  const effectiveInterval = pollingInterval || 2000;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let timer;

    const fetchData = async () => {
      try {
        const res = await fetch('/params.json');
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        if (isMounted) setData(json);
      } catch (err) {
        if (isMounted) setError(err);
      }
      timer = setTimeout(fetchData, effectiveInterval);
    };

    fetchData();
    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [effectiveInterval]);

  return { data, error };
}