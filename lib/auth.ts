export type LoginResponse = {
  user: any;
  token: string;
};

const LOCAL_STORAGE_KEY = 'gn_auth';

export function saveAuthPayload(payload: LoginResponse) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    console.log('Auth data saved to localStorage:', payload);
  } catch (e) {
    console.error('Error saving auth data to localStorage:', e);
    // ignore localStorage errors
  }

  // set axios default header lazily to avoid circular imports
  if (payload?.token) {
    try {
      // dynamic import prevents circular module initialization issues
      import('@/lib/axios').then((mod) => {
        try {
          mod.default.defaults.headers.common['Authorization'] = `Bearer ${payload.token}`;
          console.log('Authorization header set');
        } catch (e) {
          console.error('Error setting Authorization header:', e);
          // ignore
        }
      });
    } catch (e) {
      console.error('Error importing axios:', e);
      // ignore
    }
  }
}

export function getAuthPayload(): LoginResponse | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      console.log('No auth data in localStorage');
      return null;
    }
    const parsed = JSON.parse(raw);
    console.log('Auth data retrieved:', parsed);
    return parsed;
  } catch (e) {
    console.error('Error parsing auth data:', e);
    return null;
  }
}

export function clearAuth() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
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

  console.log('getModuleAccess called with path:', path, 'moduleId:', moduleId);
  console.log('module_access list:', list);

  function findModule(modules: any[], searchPath?: string, searchModuleId?: number): any | null {
    for (const mod of modules) {
      console.log('Checking module:', mod.pk_module_id, mod.url, mod.name);
      if (searchModuleId != null && Number(mod.pk_module_id) === Number(searchModuleId)) {
        console.log('Found by moduleId:', mod);
        return mod;
      }
      if (searchPath && mod.url) {
        const normalizedSearchPath = searchPath.replace(/\/$/, ''); // remove trailing slash
        const normalizedModUrl = mod.url.replace(/\/$/, '');
        if (normalizedModUrl === normalizedSearchPath || normalizedSearchPath.startsWith(normalizedModUrl + '/')) {
          console.log('Found by path:', mod);
          return mod;
        }
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
      console.log('Returning permissions:', mod.permissions[0]);
      return mod.permissions[0];
    } else {
      console.log('Module not found or no permissions, returning default');
      // Return default permissions if not found
      return {
        is_view: true,
        is_add: false,
        is_update: false,
        is_delete: false,
        is_detail: false,
        is_activation: false,
        is_approval: false,
      };
    }
  }

  console.log('No path or moduleId provided');
  return null;
}
