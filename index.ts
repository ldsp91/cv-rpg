import index from "./index.html";

Bun.serve({
  routes: {
    "/": index,
  },
});
