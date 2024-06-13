import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <>
      <h1>About Us</h1>
      <div>
        <p>Welcome to the About page!</p>
        <p>Here you can learn more about our app.</p>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "About Us",
  meta: [
    {
      name: "description",
      content: "Learn more about us on this page.",
    },
  ],
};
