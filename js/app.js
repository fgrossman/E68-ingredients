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
