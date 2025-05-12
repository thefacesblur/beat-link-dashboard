import { useEffect, useState } from 'react';

export default function useParamsData(pollInterval = 500) {
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
      timer = setTimeout(fetchData, pollInterval);
    };

    fetchData();
    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [pollInterval]);

  return { data, error };
}