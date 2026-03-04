# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.
docs/
 ├ intro.md
 ├ architecture/
 │    system-design.md
 │    db-schema.md
 │    api.md
 ├ frontend/
 │    routing.md
 │    ui-system.md
 ├ backend/
 │    auth-flow.md
 │    payments.md
 │    tickets.md
 ├ devops/
 │    deploy.md
 │    env.md
 └ product/
      roadmap.md
      user-stories.md

01-product/
   vision.md
   roadmap.md
   user-stories.md

02-architecture/
   system-design.md
   db-schema.md
   api-structure.md

03-backend/
   modules.md
   auth-flow.md
   payments.md

04-frontend/
   ui-system.md
   routing.md
   state-management.md

05-devops/
   deploy.md
   ci-cd.md
   env-vars.md

## Installation

```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
