// Fallback type declarations for bcryptjs.
// This keeps `next build` / TypeScript happy even if @types/bcryptjs isn't resolved in some environments.
// It does NOT change runtime behavior.

declare module "bcryptjs" {
  const bcrypt: any;
  export default bcrypt;
  export = bcrypt;
}
