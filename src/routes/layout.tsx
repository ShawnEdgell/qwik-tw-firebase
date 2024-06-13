// src/routes/layout.tsx
import { component$, Slot } from "@builder.io/qwik";
import { Nav } from "../components/nav/nav";
import { Footer } from "../components/footer/footer";
import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};

export default component$(() => {
  return (
    <div>
      <div class="flex min-h-screen flex-col items-center overscroll-none">
        <header class="fixed top-0 z-10 w-full">
          <Nav />
        </header>
        <main class="mt-[4.5rem] flex w-full flex-1 flex-col items-center justify-center px-4 py-16">
          <Slot />
        </main>
      </div>
      <footer>
        <Footer />
      </footer>
    </div>
  );
});
