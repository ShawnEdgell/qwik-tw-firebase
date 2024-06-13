import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <div>
      <h1>Contact Us</h1>
      <p>This is the contact page.</p>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Contact Us",
  meta: [
    {
      name: "description",
      content: "Contact us page description",
    },
  ],
};
