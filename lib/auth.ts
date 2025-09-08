import Cookies from 'js-cookie';

export type LoginResponse = {
  user: any;
  token: string;
};

const COOKIE_KEY = 'gn_auth';

export function saveAuthPayload(payload: LoginResponse) {
  try {
    Cookies.set(COOKIE_KEY, JSON.stringify(payload), { expires: 7, sameSite: 'Lax' });
  } catch (e) {
    // ignore cookie serialization errors
  }

  // set axios default header lazily to avoid circular imports
  if (payload?.token) {
    try {
      // dynamic import prevents circular module initialization issues
      import('@/lib/axios').then((mod) => {
        try {
          mod.default.defaults.headers.common['Authorization'] = `Bearer ${payload.token}`;
        } catch (e) {
          // ignore
        }
      });
    } catch (e) {
      // ignore
    }
  }
}

export function getAuthPayload(): LoginResponse | null {
  if (typeof window === 'undefined') return null;
  const raw = Cookies.get(COOKIE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function clearAuth() {
  try {
    Cookies.remove(COOKIE_KEY);
  } catch (e) {
    // ignore
  }
  // clear axios default header lazily
  try {
    import('@/lib/axios').then((mod) => {
      try {
        delete mod.default.defaults.headers.common['Authorization'];
      } catch (e) {
        // ignore
      }
    });
  } catch (e) {
    // ignore
  }
}

export async function apiLogout() {
  try {
    const mod = await import('@/lib/axios');
    const axios = mod.default;
    await axios.post('/v1/auth/logout');
  } catch (e) {
    // ignore network errors - still clear client state
  }
}

/**
 * Cari module_access berdasarkan path atau module id.
 * - Jika path diberikan, cocokkan dengan url di object module
 * - Jika moduleId diberikan, cocokkan pk_module_id
 */
export function getModuleAccess({ path, moduleId }: { path?: string; moduleId?: number }) {
  const auth = getAuthPayload();
  const list: any[] = (auth && auth.user && auth.user.module_access) || [];

  function findModule(modules: any[], searchPath?: string, searchModuleId?: number): any | null {
    for (const mod of modules) {
      if (searchModuleId != null && Number(mod.pk_module_id) === Number(searchModuleId)) {
        return mod;
      }
      if (searchPath && mod.url && (mod.url === searchPath || searchPath.startsWith(mod.url))) {
        return mod;
      }
      if (mod.children) {
        const found = findModule(mod.children, searchPath, searchModuleId);
        if (found) return found;
      }
    }
    return null;
  }

  if (moduleId != null || path) {
    const p = path ? path.split('?')[0] : undefined;
    const mod = findModule(list, p, moduleId);
    if (mod && mod.permissions && mod.permissions.length > 0) {
      return mod.permissions[0];
    }
  }

  return null;
}
