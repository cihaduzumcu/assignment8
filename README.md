# Assignment 8 – Express 5 Information Server

A small Node.js server built with Express 5. It serves a static page from `public/`
and a JSON API under `/api`. All data is stored as constants in `server.js`.

Author: Cihad Ahmed Üzümcü

## How to install and run

Requirements: Node.js 18 or newer.

```bash
npm install      # installs Express 5 from package-lock.json
npm start        # node server.js
npm run dev      # node --watch server.js (restarts when a file changes)
```

The server prints its address when it starts:

```text
Server running at http://localhost:3000
```

The port comes from the `PORT` environment variable; if it is not set, 3000 is used.

```bash
PORT=4000 npm start            # macOS / Linux / Git Bash
$env:PORT=4000; npm start      # Windows PowerShell
```

The server can be started from any folder (for example `node assignment8/server.js`
from the parent folder), because the path to `public/` is built from the location of
`server.js`, not from the terminal's current folder.

## File organization
- index.html: static page with one button per API route
- styles.css: page layout and colours
- app.js: fetch() calls, shows status code and body in a `<pre>`
- server.js: Express app: data, middleware, routes, 404 fallback
- package.json: ES modules ("type": "module"), scripts, Express 5 dependency
- package-lock.json: exact dependency versions (committed)
- .gitignore: ignores node_modules/ and .env
- README.md


Order inside `server.js`:

1. constants (port, data, request counter)
2. logger and counter middleware
3. `express.static` for `public/`
4. text routes (`/hello`, `/robots.txt`, `/old-page`)
5. JSON routes under `/api`
6. 404 fallback (last)

## Routes

| Method | Path | Response |
| --- | --- | --- |
| GET | `/` | `public/index.html` |
| GET | `/hello` | text with my name |
| GET | `/robots.txt` | `text/plain` robots rules |
| GET | `/old-page` | 302 redirect to `/hello` |
| GET | `/api/courses` | array of courses (`id`, `title`, `credits`) |
| GET | `/api/status` | `{ status, nodeVersion, uptimeSeconds }` |
| GET | `/api/headers` | the request's `User-Agent` and `Accept` headers |
| POST | `/api/subscribe` | 201 `{ subscribed: true }` |
| GET | `/api/admin` | 403 `{ error: "Forbidden" }` |
| GET | `/api/stats` | `{ requestsServed }` |
| any | other `/api/...` path | 404 JSON `{ error: "Not found" }` |
| any | any other path | 404 plain text |

## curl evidence

Each block is the real output of the command on my machine while the server was running.

### 1. Successful JSON – `GET /api/courses`

```bash
curl --include http://localhost:3000/api/courses
```

```text
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 215
ETag: W/"d7-U1JTCWj2yPxFWpuu9SG2+CZnUQE"
Date: Tue, 17 Nov 2026 21:21:58 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":1,"title":"Introduction to Programming","credits":6},{"id":2,"title":"Web Programming","credits":5},{"id":3,"title":"Database Management Systems","credits":5},{"id":4,"title":"Operating Systems","credits":6}]
```

### 2. 201 Created – `POST /api/subscribe`

```bash
curl --include -X POST http://localhost:3000/api/subscribe
```

```text
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 19
ETag: W/"13-oWAPIqDXuocNexKhPYW9ayyk98c"
Date: Tue, 17 Nov 2026 21:21:58 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"subscribed":true}
```

### 3. 403 Forbidden – `GET /api/admin`

```bash
curl --include http://localhost:3000/api/admin
```

```text
HTTP/1.1 403 Forbidden
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-TLNzmZqKxaTuFdX/dVWWPBu44/c"
Date: Tue, 17 Nov 2026 21:21:58 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Forbidden"}
```

### 4. Redirect – `GET /old-page`

```bash
curl --include http://localhost:3000/old-page
```

```text
HTTP/1.1 302 Found
X-Powered-By: Express
Location: /hello
Vary: Accept
Content-Type: text/plain; charset=utf-8
Content-Length: 28
Date: Tue, 17 Nov 2026 21:21:58 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Found. Redirecting to /hello
```

### 5. 404 on an API path – `GET /api/does-not-exist`

```bash
curl --include http://localhost:3000/api/does-not-exist
```

```text
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-bm7tJgu8FHlq5QU+Y6gDxOGPfRc"
Date: Tue, 17 Nov 2026 21:21:58 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Not found"}
```

### 6. 404 on a non-API path – `GET /does-not-exist`

```bash
curl --include http://localhost:3000/does-not-exist
```

```text
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: text/plain; charset=utf-8
Content-Length: 31
ETag: W/"1f-k0TCbjVa+pfRfed7TWNOJ0tisV0"
Date: Tue, 17 Nov 2026 21:21:58 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Page not found: /does-not-exist
```

### 7. Plain text – `GET /robots.txt`

```bash
curl --include http://localhost:3000/robots.txt
```

```text
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/plain; charset=utf-8
Content-Length: 38
ETag: W/"26-3RBjeZ29oRDtKS0QZQpF9bMLztA"
Date: Tue, 17 Nov 2026 21:21:58 GMT
Connection: keep-alive
Keep-Alive: timeout=5

User-agent: *
Disallow: /api/
Allow: /
```

## Reasoning questions

### 1. Why is the 404 fallback registered last? (experiment: moving it to the top)

Express checks middleware and routes in the order they are registered. The fallback is
`app.use((req, res) => ...)` without a path, so it matches every method and every URL,
and it sends a response without calling `next()`.

**Experiment:** I moved the fallback block directly under `const app = express();` and
restarted the server. Result: every request returned 404, including `/hello`,
`/api/courses` and even `/`, and the logger printed nothing, because the fallback ended
each request before Express reached the logger or the real routes. After moving it back
to the end, the real routes worked again. Registered last, the fallback only runs when
nothing above it sent a response, so it can never hide a real route.

### 2. What happens if the logger does not call `next()`? (experiment)

**Experiment:** I removed the `next();` line from `requestLogger` and requested
`/api/courses` with curl and with the browser. Result: the log line still appeared in the
terminal, but no response came back. curl kept waiting and the browser tab kept loading.
The counter did not increase and no route ran.

A middleware has to do one of two things: send a response or call `next()`. If it does
neither, the request stays open forever because Express does not move on by itself.

### 3. Which requests does the counter count, and why does the order matter?

The counter is registered after the logger and before `express.static`, the routes and
the 404 fallback. Because of that it counts **every** request that reaches the server:

- the page itself (`/`) and its files (`styles.css`, `app.js`),
- the browser's automatic `/favicon.ico` request (which ends in a 404),
- every API call, including errors such as 403 and 404,
- the `/api/stats` request itself, so the number includes the current request.

Opening the page once therefore adds several requests, not one.

The order matters because a middleware only sees requests that are still moving through
the chain. `express.static` ends the request when it finds a file, so if the counter
were placed after it, page, CSS and JS requests would not be counted. If it were placed
after the routes, it would only count requests that no route answered.

### 4. Why `app.use()` for the 404 fallback and not `app.get('*')`?

- In Express 5 the path syntax changed: a bare `*` is not a valid path anymore (a
  wildcard must have a name, like `/*splat`), so `app.get('*', ...)` throws an error
  when the server starts.
- `app.get` only matches GET requests. A `POST /unknown` request would not reach it.
  `app.use` without a path matches every method and URL.
- The fallback checks `req.path` to choose the format: paths that are `/api` or start
  with `/api/` get JSON, everything else gets plain text.

### 5. How does the server work from any folder, and why does the page use relative URLs?

`express.static("public")` would resolve `public` against the folder the terminal is in
(`process.cwd()`). Starting the server with `node assignment8/server.js` from the parent
folder would then look for a `public` folder in the wrong place. I build an absolute path
from the location of `server.js` instead:

```js
const SERVER_DIR = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(SERVER_DIR, "public");
```

In `app.js`, `fetch("/api/courses")` uses a relative URL. The browser sends it to the
same host and port that served the page, so the page keeps working on another port
(`PORT=4000`) or another host, and no CORS setup is needed.

### 6. Why does `fetch()` not throw on 403 or 404, and how does the page handle failures?

`fetch()` only rejects when the request cannot be completed at all (server stopped,
no network). A 403 or 404 is still a valid HTTP response, so the promise resolves and
`response.ok` is `false`. The page:

- shows `response.status` and `response.statusText` for every response, colouring
  2xx green and everything else red,
- reads the body with `response.text()` and only formats it as JSON when the
  `Content-Type` is JSON, so a text or HTML body does not crash `JSON.parse`,
- wraps the call in `try/catch`, so a network error shows "Network error" in the `<pre>`
  instead of breaking the page. (Tested by stopping the server and clicking a button.)

## Self-study notes

### `process.version` and `process.uptime()`

- `process.version` is a string with the Node.js version that runs the server, for
  example `"v22.11.0"`. It comes from the running process, so it is always the real value.
- `process.uptime()` returns the number of seconds since the Node process started, as a
  decimal number (for example `12.483`). I use `Math.floor` to send whole seconds. It
  goes back to 0 every time the server restarts, including restarts by `node --watch`.

### Content types

- `res.send("text")` sets `Content-Type: text/html; charset=utf-8` by default.
- `res.json(value)` sets `application/json; charset=utf-8` and turns the value into a
  JSON string.
- `res.type("text/plain")` sets the type before sending, which is why `/robots.txt` is
  `text/plain` and not HTML.
- `express.static` chooses the type from the file extension (`.html`, `.css`, `.js`).
- The browser and `fetch()` use this header to decide how to treat the body; that is
  why `app.js` checks it before calling `JSON.parse`.

### Pretty-printing JSON

- The server sends compact JSON (one line), which is smaller to transfer.
- The page formats it with `JSON.stringify(value, null, 2)`: the second argument is an
  optional replacer (`null` = keep everything) and the third is the indentation (2 spaces).
- Express can also pretty-print on the server with `app.set("json spaces", 2)`; I kept the
  formatting in the browser so the API stays compact.

## Challenges

- Running the server and curl at the same time: I had trouble keeping two terminals open, so I started the server in the background in the same PowerShell window (`Start-Process node`), ran the curl commands, saved their output to a file and stopped the server afterwards.
- `npm init -y` wrote `"type": "commonjs"` into `package.json`, so `import express from "express"` failed. Changing it to `"type": "module"` fixed it.
- In Express 5 a bare `app.get('*')` is not a valid path anymore. I used `app.use((req, res) => ...)` at the end of the file as the 404 fallback, which also catches non-GET requests.