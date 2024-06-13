import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Button } from "../components/button/button";

export default component$(() => {
  return (
    <>
      <div class="flex h-full items-center justify-center">
        <div class="prose lg:prose-xl text-center">
          <div class="max-w-md">
            <h1 class="text-5xl font-bold">Hello there</h1>
            <p class="py-6">
              Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
              excepturi exercitationem quasi. In deleniti eaque aut repudiandae
              et a id nisi.
            </p>
            <Button look="primary">Primary</Button>
          </div>
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
