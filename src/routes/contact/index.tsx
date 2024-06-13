import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <>
      <h1>Contact Us</h1>
      <div>
        <p>If you have any questions, feel free to reach out to us!</p>
        <p>Email: contact@ourapp.com</p>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Contact Us",
  meta: [
    {
      name: "description",
      content: "Get in touch with us through this page.",
    },
  ],
};
