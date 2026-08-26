import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Catalog } from '../types/catalog';

// A3 fix: the catalog is fetched at runtime from the static asset at
// `${BASE_URL}data/catalog.json` instead of being bundled as a JS import.
// `import.meta.env.BASE_URL` resolves to `/` in dev and `/skillz/` in the
// production GitHub Pages build (see vite.config.ts), so this works in both
// environments without hardcoding a path.
const CATALOG_URL = `${import.meta.env.BASE_URL}data/catalog.json`;

interface CatalogContextValue {
  catalog: Catalog | null;
  loading: boolean;
  error: string | null;
}

const CatalogContext = createContext<CatalogContextValue>({ catalog: null, loading: true, error: null });

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(CATALOG_URL)
      .then(res => {
        if (!res.ok) throw new Error(`Catalog fetch failed: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data: Catalog) => {
        if (!cancelled) { setCatalog(data); setLoading(false); }
      })
      .catch((err: Error) => {
        if (!cancelled) { setError(err.message); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <CatalogContext.Provider value={{ catalog, loading, error }}>
      {children}
    </CatalogContext.Provider>
  );
}

/** Returns the loaded catalog, or throws if called before it's ready. Use inside
 *  a page that is only rendered once `useCatalogState().catalog` is non-null
 *  (see `<CatalogGate>` in App.tsx), so pages don't each need null-checks. */
export function useCatalog(): Catalog {
  const { catalog } = useContext(CatalogContext);
  if (!catalog) {
    throw new Error('useCatalog() called before the catalog finished loading — render inside <CatalogGate>.');
  }
  return catalog;
}

/** Raw loading/error state, for the top-level gate only. */
export function useCatalogState(): CatalogContextValue {
  return useContext(CatalogContext);
}
