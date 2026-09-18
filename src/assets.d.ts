/** Asset imports resolve to their built (hashed) URL through the bundler. */
declare module "*.png" {
  const url: string;
  export default url;
}

/** Side-effect style imports are bundled, not imported as values. */
declare module "*.css";
