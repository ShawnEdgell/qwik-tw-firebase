import { component$, useTask$ } from "@builder.io/qwik";
import { app } from "../firebase";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  useTask$(() => {
    if (typeof window !== "undefined") {
      // Firebase is only available on the client-side
      import("firebase/analytics").then(({ getAnalytics, isSupported }) => {
        isSupported().then((supported) => {
          if (supported) {
            const analytics = getAnalytics(app);
            console.log("Firebase analytics:", analytics);
          }
        });
      });
    }
  });

  return (
    <>
      <article class="prose lg:prose-xl">
        <h1>Hi 👋</h1>
        <p>Can't wait to see what you build with Qwik!</p>
        <br />
        <p>Happy coding.</p>
      </article>
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
