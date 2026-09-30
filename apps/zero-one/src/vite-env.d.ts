/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Zero-one backend origin for split deployments. Unset = same-origin. */
  readonly VITE_ZERO_ONE_API_URL?: string;
  /** Main API origin for shared-auth validation. */
  readonly VITE_MAIN_API_URL?: string;
  /** Main web origin for sign-in redirects. */
  readonly VITE_MAIN_SITE_URL?: string;
  /** Venue super-admin email override (mirrors BOOTSTRAP_SUPERADMIN_EMAIL). */
  readonly VITE_BOOTSTRAP_SUPERADMIN_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
