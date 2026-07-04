/* ============================================================
   E68 Ingredients - Shared helpers (Supabase client + images)
   ============================================================ */

// Create a single shared Supabase client (supabase-js is loaded from CDN).
function getClient() {
  if (
    !CONFIG.SUPABASE_URL ||
    CONFIG.SUPABASE_URL.startsWith("PASTE_") ||
    CONFIG.SUPABASE_ANON_KEY.startsWith("PASTE_")
  ) {
    document.body.innerHTML =
      '<div style="padding:24px;font-family:sans-serif;max-width:640px;margin:40px auto;line-height:1.5">' +
      "<h2>Setup needed</h2><p>This app is not connected to Supabase yet. " +
      "Open <code>js/config.js</code> and paste in your Supabase URL and anon key " +
      "(see <code>README.md</code>, Step 2).</p></div>";
    throw new Error("Supabase config missing");
  }
  if (!window.__sb) {
    window.__sb = window.supabase.createClient(
      CONFIG.SUPABASE_URL,
      CONFIG.SUPABASE_ANON_KEY
    );
  }
  return window.__sb;
}

// Public URL for a stored file path.
function publicUrl(path) {
  return getClient().storage.from(CONFIG.BUCKET).getPublicUrl(path).data
    .publicUrl;
}

// Resize/compress an image File into a JPEG Blob before upload.
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const max = CONFIG.MAX_IMAGE_DIMENSION;
        let { width, height } = img;
        if (width > height && width > max) {
          height = Math.round((height * max) / width);
          width = max;
        } else if (height > max) {
          width = Math.round((width * max) / height);
          height = max;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("compress failed"))),
          "image/jpeg",
          CONFIG.IMAGE_QUALITY
        );
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Simple unique id (works on all browsers).
function uid() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

/* ============================================================
   Authentication & roles
   ============================================================ */

// Returns { id, email, role } for the signed-in user, or null if not signed in.
// role is 'admin', 'photographer', or null (signed in but no access assigned).
async function currentProfile() {
  const sb = getClient();
  const { data: s } = await sb.auth.getSession();
  if (!s || !s.session) return null;
  const user = s.session.user;
  const { data, error } = await sb
    .from("profiles")
    .select("id,email,role")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data) return { id: user.id, email: user.email, role: null };
  return data;
}

// Guard a page: redirect to sign-in unless the user has one of `allowedRoles`.
// Returns the profile if allowed. Use at the top of protected pages.
async function requireRole(allowedRoles) {
  const p = await currentProfile();
  if (!p || !p.role || (allowedRoles && !allowedRoles.includes(p.role))) {
    window.location.replace("signin.html");
    return null;
  }
  return p;
}

async function signOut(dest) {
  await getClient().auth.signOut();
  window.location.replace(dest || "index.html");
}

// Create a new staff user WITHOUT disturbing the current admin's session.
// Uses a throwaway Supabase client so signUp doesn't replace the admin login.
// Requires "Confirm email" to be OFF in Supabase (see README).
// Returns the new user's id.
async function createStaffUser(email, password, role) {
  const temp = window.supabase.createClient(
    CONFIG.SUPABASE_URL,
    CONFIG.SUPABASE_ANON_KEY,
    { auth: { persistSession: false, storageKey: "e68-temp-signup" } }
  );
  const { data, error } = await temp.auth.signUp({ email, password });
  if (error) throw error;
  const newId = data.user && data.user.id;
  if (!newId) throw new Error("User was created but no id was returned.");
  // Insert the profile with the chosen role, using the admin's own session.
  const ins = await getClient()
    .from("profiles")
    .insert({ id: newId, email, role });
  if (ins.error) throw ins.error;
  return newId;
}
