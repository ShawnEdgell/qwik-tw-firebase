import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

export const Nav = component$(() => {
  return (
    <nav>
      <ul class="flex w-full justify-center space-x-4 p-4">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
        <li>
          <Link href="/contact">Contact</Link>
        </li>
      </ul>
    </nav>
  );
});
