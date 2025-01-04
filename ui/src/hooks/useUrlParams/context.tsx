/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, ReactNode, useCallback, useEffect, useRef } from "react";

type ParamValue = string | number | boolean | string[] | null;
type ParamValues = Record<string, ParamValue>;

type UrlParamsContextValue<T> = {
  getParam: <K extends keyof T>(key: K) => T[K];
  setParams: (params: Partial<T>, options?: { replace?: boolean }) => void;
  subscribe: (key: keyof T, callback: () => void) => () => void;
};

export const UrlParamsContext = createContext<UrlParamsContextValue<any> | null>(null);

type UrlParamsProviderProps<T extends ParamValues> = {
  children: ReactNode;
  defaultValues: T;
};

function parseUrlParams<T extends ParamValues>(defaultValues: T): T {
  const urlParams = new URLSearchParams(window.location.search);
  const result = { ...defaultValues };

  Object.keys(defaultValues).forEach((key) => {
    const currentValue = defaultValues[key];
    const urlValue = urlParams.get(key);

    if (urlValue === null) return;

    if (Array.isArray(currentValue)) {
      const values = urlValue.split(",").filter(Boolean);
      if (values.length) {
        (result as any)[key] = values;
      }
    } else {
      let parsedValue: any = urlValue;
      if (typeof currentValue === "boolean") {
        parsedValue = urlValue === "true";
      } else if (typeof currentValue === "number") {
        parsedValue = Number(urlValue);
      }
      (result as any)[key] = parsedValue;
    }
  });

  return result;
}

export function UrlParamsProvider<T extends ParamValues>({ children, defaultValues }: UrlParamsProviderProps<T>) {
  const paramsRef = useRef<T>(parseUrlParams(defaultValues));

  const subscribersRef = useRef<Map<keyof T, Set<() => void>>>(new Map());

  const notifySubscribers = useCallback((key: keyof T) => {
    subscribersRef.current.get(key)?.forEach((callback) => callback());
  }, []);

  const setParams = useCallback(
    (newParams: Partial<T>, options: { replace?: boolean } = { replace: true }) => {
      const searchParams = new URLSearchParams(window.location.search);
      const updatedParams = { ...paramsRef.current, ...newParams };

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === undefined || value === defaultValues[key]) {
          searchParams.delete(key);
        } else if (Array.isArray(value)) {
          if (value.length > 0) {
            searchParams.set(key, value.join(","));
          } else {
            searchParams.delete(key);
          }
        } else {
          searchParams.set(key, String(value));
        }
      });

      const newUrl = `${window.location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

      if (options.replace) {
        window.history.replaceState(updatedParams, "", newUrl);
      } else {
        window.history.pushState(updatedParams, "", newUrl);
      }

      paramsRef.current = updatedParams;
      Object.keys(newParams).forEach((key) => notifySubscribers(key as keyof T));
    },
    [defaultValues, notifySubscribers]
  );

  const getParam = useCallback(<K extends keyof T>(key: K): T[K] => paramsRef.current[key], []);

  const subscribe = useCallback((key: keyof T, callback: () => void) => {
    if (!subscribersRef.current.has(key)) {
      subscribersRef.current.set(key, new Set());
    }
    subscribersRef.current.get(key)!.add(callback);
    return () => {
      subscribersRef.current.get(key)?.delete(callback);
      if (subscribersRef.current.get(key)?.size === 0) {
        subscribersRef.current.delete(key);
      }
    };
  }, []);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const newParams = (event.state as T) || parseUrlParams(defaultValues);
      const changedKeys = new Set<keyof T>();

      Object.keys(newParams).forEach((key) => {
        if (newParams[key as keyof T] !== paramsRef.current[key as keyof T]) {
          changedKeys.add(key as keyof T);
        }
      });

      paramsRef.current = newParams;
      changedKeys.forEach((key) => notifySubscribers(key));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [defaultValues, notifySubscribers]);

  return (
    <UrlParamsContext.Provider
      value={{
        getParam: getParam as <K extends string | number | symbol>(key: K) => any,
        setParams,
        subscribe: subscribe as (key: string | number | symbol, callback: () => void) => () => void,
      }}
    >
      {children}
    </UrlParamsContext.Provider>
  );
}
