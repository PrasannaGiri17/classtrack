import { useState, useEffect } from 'react';
import api from './axiosInstance';
import { useAuth } from '../context/AuthContext';

export const useSchoolFetch = (url, dependencies = []) => {
  const { schoolId } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      // SAFE FETCH RULE: IF schoolId is missing -> DO NOT FETCH
      if (!schoolId) {
        setLoading(false);
        setError("No data available: missing school context.");
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get(url);
        if (isMounted) setData(response.data);
      } catch (err) {
        console.error(`Error fetching ${url}:`, err);
        if (isMounted) setError(err.response?.data?.message || err.message || "Fetch failed");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [url, schoolId, ...dependencies]);

  return { data, loading, error, setData };
};
