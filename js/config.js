/* ============================================================
   E68 Ingredients - Configuration
   ------------------------------------------------------------
   EDIT THE TWO VALUES BELOW after you create your free Supabase
   project (see README.md, Step 2). Nothing else in this file
   needs to change.
   ============================================================ */

const CONFIG = {
  // From Supabase: Project Settings -> API -> Project URL
  SUPABASE_URL: "https://jrlkepgyigwkwxasarha.supabase.co",

  // From Supabase: Project Settings -> API -> Project API keys -> "anon public"
  SUPABASE_ANON_KEY: "sb_publishable_ftxG0faWtjxK4NcQxk7Q7g_awFEVNUK",

  // Name of the Storage bucket (created by setup.sql / dashboard). Leave as-is.
  BUCKET: "ingredients",

  // Max pixel dimension photos are resized to before upload (keeps storage small).
  MAX_IMAGE_DIMENSION: 1600,

  // JPEG quality for uploaded photos (0-1).
  IMAGE_QUALITY: 0.82,
};
