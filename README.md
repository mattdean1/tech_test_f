# Posts Feed

## Setup

```
pnpm i
pnpm exec prisma generate
pnpm run dev

sqlite3 prisma/dev.db
```

## Discussion

### Design choices

Based on the bullet "For each post, show a button with a counter of the comments, or nothing if there are no comments."
I chose to show a small text instead of nothing if there no existing comments, allowing the user to expand the section and add a comment.

UI could definitely be improved a lot but didn't spend too much time there as directed. A couple of easy updates:

- margin around page
- button color and visibility
- icon showing comments expanded/collapsed

Something else not implemented but would be a good next step is showing post authors and adding authorship to comments.

### Scalability

Added cursor-based pagination on both posts and comments. Based on existing data there are not that many comments per post, but in general for a viral post there could be many. Added config for 3 comments per page just to show how it works in the UI but should be higher in real life.

SSR not implemented here but could be useful, see discussion below.

See database and infra section for scaling concerns there.

React-Query built into TRPC gives some nice client-side caching built in (see invalidation in `handleCommentAdded`). UI side seems to work when hiding comments and reopening, previously loaded comments are still visible, but API request is still fired so may not be set up fully, although not sure if it using SWR.

### Performance

I haven't had time to benchmark client or server side performance but would check that out via flamegraphs and backend metrics (see monitoring for more detail)

Another potential thought for later is keeping total number of loaded pages down (see react-query docs here https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries#what-if-i-want-to-limit-the-number-of-pages). In fact this issue is visible when scrolling LinkedIn too far - probably we should eject super old pages from memory (would have to add some UX behaviour or refetch in the case the user scrolls back to the top).

I would assume Prisma is optimised when fetching count of relations as done in `getPosts`, have run into issues before using `distinct_on` where a manual SQLquery was better using `group by` so would investigate the generated query.

### Database

Here we have right now a simple schema, in real life it could be a lot more complex. Since we have an SQL database already, makes sense to continue with that - in production something like Postgres would be suitable (compared to memory-based SQLLite). With that said I've definitely heard some people using SQLLite successfully for an MVP. NoSQL does not seem particularly helpful without knowing scaling requirements - for now default to relational to keep the links between entities.

I'd deploy that Postgres on e.g. RDS for reliability, availability, backups etc.

### SSR and SSG

In general SSG is not a good fit here since the post feed and comments would be dynamic (probably different per user) and tend to change often. However, I would look to use it for pages that don't change often or show static content, for example "About Us" or T&C pages.
If posts became their own page when clicked (like e.g. LinkedIn, Facebook), then it could be a good idea to generate the posts page and hydrate comments on the client. If posts are editable then that's a less good idea, although still possible to regenerate on update.

SSR on the other hand, could be quite suitable here for the initial render of posts with # comments. The tradeoff here is naturally more server resources to generate a page vs delegating that to the client.
The usual benefits are SEO and faster load (due to less network requests from client). Probably for the personalised feed we don't care about SEO but to load the page with posts already populated (not waiting for the extra api requests) seems good here.

### Monitoring and logging

Backend: set up logging with e.g. winston, push into something like OpenSearch

Frontend: less recent experience here but would use Sentry in the first instance - ideally can push those into the same OpenSearch instance so we have one place to search aggregated logs.

Nice to have a smoke test for uptime, e.g. a lambda to ping the important endpoints or visit the site every so often.

### Infrastructure

Vercel is the easiest but v expensive at any scale, so would aim to use something like https://opennext.js.org/aws to deploy on cheaper hardware. Maybe we would move away from Next to allow more flexibility tuning the backend.

Additions for scale could include:

- queue into background jobs on lambda or server for personlised feed generation
- redis cache in front of api (particularly for post comments as they are fetched on expand)
- read-replica of db
- SSG pages on edge e.g. cloudflare

### Extensions

Tests!

- storybook
- RTL
- jest / tool of choice for unit tests
- playwright for e2e

#### Error handling

Not set up yet, a few things to be done:

- nextjs error page - added a basic version
- error boundaries around the app to fallback when it is really broken
- query retries built in a bit to react-query but fallback UI could definitely be improved
- would add a button when loading fails to retry
- log to monitoring solutions above when failing

# Fanvue's Fullstack challenge

Setup the project:

Make sure you install all the dependencies (currently pnpm, but you can opt-out) and start the solution in dev mode.

There is a simple homepage that will display a typical "feed" page.

Requirements:

- Use trpc for data fetching and mutations (https://trpc.io/) this is already setup for you.
- Custom styling is not required, you should use MUI5 components out-of-the box, check the docs here https://mui.com/material-ui/
- Fetch the data from the sqlite file that sits in the "prisma" folder, with the prisma library, more info here https://www.prisma.io/docs/orm/overview/databases/sqlite

Note:

- The database is already seeded, but you can add more data if you want to.

Please complete the following tasks:

- Show a centered column of posts which are simple boxes with at least title and content properties, you can aggregate more data where it makes sense.
- For each post, show a button with a counter of the comments, or nothing if there are no comments.
- When clicking on the comment counter, the comments appear below it, you can choose what component to use.
- Although there is no authentication, user can add a comment to a post.

Consider the following, for instance leaving comments close to where this is relevant:

- Scalability of the solution
- Performance
- What Database type would be fit
- How monitoring and logging could be implemented
- SSR and SSG
- Possible infrastructure setup to help with the above
