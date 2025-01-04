/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useRef, useState } from "react";
import { UrlParamsContext } from "./context";

type ParamValue = string | number | boolean | string[] | null;
type ParamValues = Record<string, ParamValue>;

export function useUrlParams<T extends ParamValues>(): {
    [K in keyof T]: T[K];
} & {
    setParams: (params: Partial<T>, options?: { replace?: boolean }) => void;
} {
    const context = useContext(UrlParamsContext);
    if (!context) {
        throw new Error("useUrlParams must be used within a UrlParamsProvider");
    }

    const [, forceUpdate] = useState({});
    const accessedKeysRef = useRef<Set<keyof T>>(new Set());

    const params = new Proxy({} as T, {
        get(_, prop: string) {
            if (prop === 'setParams') return context.setParams;

            if (prop === Symbol.toStringTag) return undefined;

            accessedKeysRef.current.add(prop as keyof T);
            return context.getParam(prop as keyof T);
        }
    });

    useEffect(() => {
        const unsubscribers = Array.from(accessedKeysRef.current).map(key => {
            return context.subscribe(key, () => {
                forceUpdate({});
            });
        });

        return () => unsubscribers.forEach(unsub => unsub());
    }, [context]);

    return params as any;
} 