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

/**
 * Cari module_access berdasarkan path atau module id.
 * - Jika path diberikan, cocokkan dengan beberapa field url di object module
 * - Jika moduleId diberikan, cocokkan fk_module_id
 */
export function getModuleAccess({ path, moduleId }: { path?: string; moduleId?: number }) {
  const auth = getAuthPayload();
  const list: any[] = (auth && auth.user && auth.user.module_access) || [];

  if (moduleId != null) {
    return list.find((m) => Number(m.fk_module_id) === Number(moduleId)) ?? null;
  }

  if (path) {
    const p = path.split('?')[0];
    for (const ma of list) {
      const mod = ma.module || {};
      const urls: (string | undefined)[] = [
        mod.url,
        mod.url_view,
        mod.url_create,
        mod.url_update,
        mod.url_detail,
        mod.url_delete,
        mod.url_approval,
        mod.url_activation,
      ].filter(Boolean) as string[];

      console.log(urls, p)

      if (
        urls.some((u) => {
          try {
            return u === p || p.startsWith(u);
          } catch (e) {
            return false;
          }
        })
      ) {
        return ma;
      }
    }
  }

  return null;
}
