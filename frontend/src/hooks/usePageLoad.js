import { useState, useEffect } from 'react';

export const usePageLoad = (minLoadTime = 500) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadStartTime] = useState(Date.now());

  useEffect(() => {
    const handleLoad = () => {
      const loadTime = Date.now() - loadStartTime;
      const remainingTime = Math.max(0, minLoadTime - loadTime);
      
      setTimeout(() => {
        setIsLoading(false);
      }, remainingTime);
    };

    // If document is already loaded
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [loadStartTime, minLoadTime]);

  return isLoading;
};

export const useAsyncLoad = (asyncFunction, dependencies = []) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFunction();
        
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { loading, data, error };
};