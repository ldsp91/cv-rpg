/** Asset imports resolve to their built (hashed) URL through the bundler. */
declare module "*.png" {
  const url: string;
  export default url;
}
