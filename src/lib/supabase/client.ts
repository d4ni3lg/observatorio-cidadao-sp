/**
 * OBSERVATÓRIO CIDADÃO DE SÃO PAULO
 * Cliente de Conexão com o Supabase (PostgreSQL em Nuvem)
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;
  return { url: url.trim(), anonKey: anonKey.trim() };
}

export async function querySupabase<T>(
  table: string,
  params: Record<string, string> = {}
): Promise<T[] | null> {
  const config = getSupabaseConfig();
  if (!config) return null;

  try {
    const url = new URL(`${config.url}/rest/v1/${table}`);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.append(k, v);
    }

    const res = await fetch(url.toString(), {
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.warn(`[Supabase] Erro ao consultar ${table} (${res.status})`);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.warn(`[Supabase] Falha de conexão:`, err);
    return null;
  }
}

export async function insertSupabase<T>(
  table: string,
  row: Record<string, any>
): Promise<T | null> {
  const config = getSupabaseConfig();
  if (!config) return null;

  try {
    const res = await fetch(`${config.url}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation, resolution=merge-duplicates",
      },
      body: JSON.stringify(row),
    });

    if (!res.ok) {
      console.warn(`[Supabase] Erro ao inserir em ${table} (${res.status})`);
      return null;
    }

    const result = await res.json();
    return Array.isArray(result) ? result[0] : result;
  } catch (err) {
    console.warn(`[Supabase] Falha ao gravar:`, err);
    return null;
  }
}
