---
title: How Suspense Works in React, Vue
date: 2026-01-17
---

## Introduction to Suspense

Suspense is a powerful mechanism for managing asynchronous operations like data fetching or code splitting. It lets components declaratively "wait" for something to load without adding complex `if/else` logic and `isLoading` states to your code.

In this post, we'll explore how to use Suspense to solve two common problems. First, we'll see how it cleans up client-side rendering by replacing manual loading states. Then, we'll dive into its most powerful feature: how Suspense enables modern frameworks like Next.js and Nuxt to stream server-rendered content, eliminating the blank page problem during slow data loads and dramatically improving user experience.

### Replacing `if/else` with Suspense

Traditionally, developers have managed loading states using boolean flags (e.g., `isLoading`, `isFetching`) and conditional rendering logic. This often looks like this:

```jsx
if (isLoading) {
  return <Spinner />;
}
if (error) {
  return <ErrorMessage />;
}
return <MyComponent data={data} />;
```

This approach clutters components with boilerplate logic and forces parent components to be aware of the loading state of their children.

Suspense inverts this pattern. Instead of the parent checking if the child is ready, the child component can "suspend" rendering if its data is not available yet. React catches this suspended state and looks up the component tree for the nearest `<Suspense>` boundary, rendering its `fallback` UI. This lets you co-locate the data fetching logic with the component that uses it, while the loading UI is handled declaratively by a parent. Your components become cleaner, with no need for `isLoading` state or `if/else` checks for loading.

## Suspense in React

React was the first major framework to introduce the concept of Suspense. It is a built-in feature of React that allows you to gracefully handle loading states in your components. With Suspense, you can wrap a component that fetches data in a `<Suspense>` boundary and provide a `fallback` prop to specify what to render while the data is loading.

Here is an example of how to use Suspense in React to fetch data when a user clicks a button:

<SandpackWrapper template="react" files={{
'/App.js': `
import React, { Suspense, useState } from 'react';
import { fetchData } from './fetchData';
import MyComponent from './MyComponent';

export default function App() {
const [dataPromise, setDataPromise] = useState(null);

function startFetching() {
setDataPromise(fetchData());
}

if (dataPromise) {
return (
<Suspense fallback={<div>Loading...</div>}>
<MyComponent dataPromise={dataPromise} />
</Suspense>
);
} else {
return <button onClick={startFetching}>Fetch Data</button>;
}
};
`,
  '/MyComponent.js': `
import React, { use } from 'react';

export default function MyComponent({ dataPromise }) {
// The 'use' hook unwraps the promise.
// If the promise is pending, it suspends rendering.
// If the promise resolves, it returns the value.
// If the promise rejects, it throws the error.
const data = use(dataPromise);
return (
<div>
{data.map(item => (
<div key={item.id}>{item.name}</div>
))}
</div>
);
};
`,
  '/fetchData.js': `
export function fetchData() {
console.log('Fetching data...');
return new Promise(resolve => {
setTimeout(() => {
console.log('Data fetched!');
resolve([
{ id: 1, name: 'Item 1' },
{ id: 2, name: 'Item 2' },
{ id: 3, name: 'Item 3' },
]);
}, 2000);
});
}
`
}} />

In this "fetch-on-interaction" pattern, clicking the button sets the `dataPromise` state. This triggers a re-render, and React begins rendering the `MyComponent`. Inside `MyComponent`, the `use(dataPromise)` hook suspends rendering until the data is available, causing the `Suspense` fallback to be displayed.

## Suspense in Vue

Vue also provides a `<Suspense>` component that works in a similar way to React's. It allows you to display a fallback content while waiting for an asynchronous component to resolve. Here is how you can achieve the same "fetch-on-interaction" pattern:

<SandpackWrapper template="vue" files={{
'/src/App.vue': `
<template>
<button v-if="!show" @click="startFetching">Fetch Data</button>
<Suspense v-if="show">
<template #default>
<MyComponent />
</template>
<template #fallback>
<div>Loading...</div>
</template>
</Suspense>
</template>

<script>
import { defineAsyncComponent, ref } from 'vue';

export default {
  setup() {
    const show = ref(false);
    // MyComponent will be downloaded only when it's needed
    const MyComponent = defineAsyncComponent(() => import('./MyComponent.vue'));

    function startFetching() {
      show.value = true;
    }

    return {
      show,
      MyComponent,
      startFetching
    };
  }
};
</script>

`,
  '/src/MyComponent.vue': `
<template>

  <div>
    <div v-for="item in data" :key="item.id">{{ item.name }}</div>
  </div>
</template>

<script>
export default {
  async setup() {
    const data = await fetchData();
    return { data };
  },
};

function fetchData() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ]);
    }, 2000);
  });
}
</script>

`
}} />

In this example, clicking the button sets `show` to true, which makes the `<Suspense>` component visible. Vue then attempts to render `MyComponent`. Because `MyComponent` is an async component (its `setup` function is `async`), Vue waits for it to resolve. While waiting, it displays the content of the `#fallback` slot.

## Real-World Examples: Streaming Data with Next.js and Nuxt

In a traditional Server-Side Rendering (SSR) model, the server must resolve all data dependencies for a page before it can render and send the complete HTML document. If a data fetch on the server takes 10 seconds, the user's browser is stuck waiting for 10 seconds, looking at a blank white screen. This blocking behavior is a poor user experience.

Streaming SSR, enabled by Suspense, solves this problem by breaking the HTML response into chunks sent over a single HTTP request.

Here is the mechanism:

1.  **Initial Response (The Shell):** The server does not wait for slow data fetches. It immediately renders the parts of your component tree that are ready and sends this HTML "shell" to the browser. When it encounters a `<Suspense>` boundary around a component that is fetching data, it sends the HTML for your `fallback` UI (e.g., a skeleton loader) in its place.
2.  **Server Continues Work:** While the browser is rendering this initial shell, the server keeps the HTTP connection open and continues to wait for the slow data fetch to complete.
3.  **Streaming Content:** Once the data is ready, the server renders the final component to an HTML string. It then "streams" this HTML down the same connection to the browser, typically with an inline `<script>` that knows how to find the correct fallback UI and replace it with the new content.

The result is a fast Time To First Byte (TTFB), giving the user an interactive page shell almost instantly, while the data-heavy parts of the page populate as they become ready.

### React with Next.js

Next.js uses this pattern with React Server Components. An `async` component will "suspend" the render, allowing a parent `<Suspense>` boundary to take over.

```jsx
// app/dashboard/page.js
import { Suspense } from 'react';
import UserProfile from '@/components/UserProfile';
import UserProfileSkeleton from '@/components/UserProfileSkeleton';
import PostFeed from '@/components/PostFeed';
import PostFeedSkeleton from '@/components/PostFeedSkeleton';

export default function DashboardPage() {
  return (
    <main>
      <Suspense fallback={<UserProfileSkeleton />}>
        <UserProfile />
      </Suspense>
      <Suspense fallback={<PostFeedSkeleton />}>
        <PostFeed />
      </Suspense>
    </main>
  );
}

// components/PostFeed.js
export default async function PostFeed() {
  // Let's pretend this fetch takes a few seconds
  const res = await fetch('https://api.example.com/posts?slow=true');
  const posts = await res.json();
  return (
    <ul>
      {posts.map((post) => <li key={post.id}>{post.title}</li>)}
    </ul>
  );
}
```

In this example, `UserProfile` and `PostFeed` might fetch data at different speeds. The server doesn't wait for the slowest one. It sends the shell immediately, potentially with the rendered `UserProfile` and the `PostFeedSkeleton`. When the slow `PostFeed` fetch finally completes on the server, its HTML is streamed to the client to replace the `PostFeedSkeleton`.

### Vue with Nuxt

Nuxt achieves the same result by treating components with a top-level `await` in their `<script setup>` as "suspensible."

```vue
<!-- pages/dashboard.vue -->
<template>
  <main>
    <Suspense>
      <UserProfile />
      <template #fallback>
        <p>Loading profile...</p>
      </template>
    </Suspense>
    <Suspense>
      <PostFeed />
      <template #fallback>
        <p>Loading feed...</p>
      </template>
    </Suspense>
  </main>
</template>

<!-- components/PostFeed.vue -->
<template>
  <ul>
    <li v-for="post in posts" :key="post.id">
      {{ post.title }}
    </li>
  </ul>
</template>

<script setup>
// The top-level await makes this component suspensible.
// Let's pretend this is a slow API endpoint.
const { data: posts } = await useFetch(
  "https://api.example.com/posts?slow=true",
);
</script>
```

When the Nuxt server renders this page, it doesn't wait for the `PostFeed` component's `useFetch`. It immediately sends the HTML for the page, rendering the `<p>Loading feed...</p>` fallback in place of the feed. Once the `useFetch` completes on the server, the final HTML for the `PostFeed` component is rendered and streamed to the client, where it replaces the fallback message.
