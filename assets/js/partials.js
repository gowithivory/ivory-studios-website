// Swap "Client Login" for "Dashboard" when there's a live Supabase session.
// Nav and footer markup is baked into each page by scripts/build.mjs.
(function () {
  let signedIn = false;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!/^sb-.+-auth-token$/.test(key)) continue;
      const d = JSON.parse(localStorage.getItem(key));
      const exp = d?.expires_at ?? d?.currentSession?.expires_at;
      if (exp && exp * 1000 > Date.now()) { signedIn = true; break; }
    }
  } catch { /* storage blocked: treat as signed out */ }

  if (!signedIn) return;
  document.querySelectorAll('[data-account]').forEach(a => {
    a.textContent = 'Dashboard';
    a.setAttribute('href', '/dashboard');
  });
})();
