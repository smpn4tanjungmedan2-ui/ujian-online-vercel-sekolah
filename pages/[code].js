const LICENSE_URL = process.env.LICENSE_SERVER_URL;
const cache = {};

export async function getServerSideProps({ params }) {
  const code = String(params.code || '');
  if (!/^[A-Za-z0-9_]{3,40}$/.test(code) || !LICENSE_URL) return { notFound: true };

  const key = code.toLowerCase();
  const hit = cache[key];
  let target = hit && Date.now() - hit.t < 60000 ? hit.u : null;

  if (!target) {
    try {
      const api = LICENSE_URL + (LICENSE_URL.includes('?') ? '&' : '?') +
        'action=resolve&code=' + encodeURIComponent(code);
      const r = await fetch(api, { redirect: 'follow' });
      const j = await r.json();
      if (j && j.url) {
        target = j.url;
        cache[key] = { u: target, t: Date.now() };
      }
    } catch (e) { /* abaikan */ }
  }

  if (!target) return { notFound: true };
  return { redirect: { destination: target, permanent: false } };
}

export default function Short() { return null; }
