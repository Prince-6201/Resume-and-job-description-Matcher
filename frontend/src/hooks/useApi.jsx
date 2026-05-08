import { useState, useCallback } from "react";
import axios from "axios";
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const request = useCallback(async (method, url, data = null, config = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios({ method, url, data, ...config });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);
  return {
    loading,
    error,
    setError,
    get: (url, cfg) => request("get", url, null, cfg),
    post: (url, data, cfg) => request("post", url, data, cfg),
    put: (url, data, cfg) => request("put", url, data, cfg),
    del: (url, cfg) => request("delete", url, null, cfg),
  };
}
