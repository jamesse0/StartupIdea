# CS 260 Notes

This file represents what I have learned about web programming.

- [My startup](https://startup.cs260.click)
- [My simon](https://simon.cs260.click)

## Helpful links

- [Course instruction](https://github.com/webprogramming260)
- [Canvas](https://byu.instructure.com)
- [MDN](https://developer.mozilla.org)

## AWS

Interesting things I have learned about AWS:
- AWS has a lot of different available servies
- AWS is not as expensive as expected

## HTML

Interesting things I have learned about HTML
- A lot of websites I grew up seeing probably were mostly html because they never had any styling
- Be careful when deploying
- providing detailed instructions to an llm can speed up the development process

## React

Interesting things I have learned about React
- Vite bundles the `.jsx` into `dist/`, so deploying needs a build step
- JSX is almost HTML (`className`, `htmlFor`, every tag closes)
- React Router uses `<Link>` instead of `<a href>` to switch pages without reloading
- Imported CSS is global, so I prefixed each page's rules to avoid clashes

## React Part 2

Stuff I picked up making it reactive
- Anything that changes on screen goes in `useState`, and calling the setter re-renders it
- Lifting state up to App lets every page share the logged-in user
- `useEffect` with `[]` runs once on load; returning a cleanup function stops timers and listeners from piling up
- Use `setX(prev => ...)` when updates come from outside React (like the fake WebSocket) so nothing gets lost
- Hiding a button isn't security. The real check has to happen in the service (and later the server)
- localStorage only holds ~5MB, so photos get shrunk before saving
- Keeping all storage in `eventService.js` means the DB deliverable only touches one file
