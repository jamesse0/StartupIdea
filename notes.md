# CS 260 Notes

This file represents what I have learned about web programming.

- [My startup](https://startup.cougargrub.click)
- [My simon](https://simon.cougargrub.click)

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

## Service

Stuff I learned adding the backend
- There are two apps in the repo now, frontend in the main folder and backend in service. Backend packages have to be installed inside service or the deploy breaks (502)
- The vite proxy lets the frontend just fetch /api/whatever and it works locally and on the real site
- Got rid of the fake students and mock data from React part 2 since the listings come from the server now
- Don't trust what the browser sends. The server decides who posted and who's allowed to delete or report
- bcrypt hashes passwords so they're never stored in plain text
- The login token goes in a cookie JavaScript can't read, which is safer than localStorage
- Anything in the browser is public, including API keys. The geocoding key stays on the server in a gitignored config file. The maps embed key is fine in the frontend since it's free and only works on my site
- Lock down API keys: limit the APIs, where they work from, add a daily cap, and set a budget alert
- Everything resets when the server restarts since it's all in memory. That's what the database is for next
