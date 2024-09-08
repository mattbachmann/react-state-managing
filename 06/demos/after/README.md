## Quick Start

### Get the required Nodejs Version, install and start app

Install `nvm` and then exec `nvm install 10` and `nvm use 10`.

Then run the following commands:

```
node -v
npm install
npm start
```

### Fix SSL-error for http://localhost:3000

In chrome type: `chrome://net-internals/#hsts`

Click on `Domain Security Policy` on the Sidebar. 

Under "Delete domain security policies" enter domain `localhost` and hit "Delete".

Now can open http://localhost:3000 to test app.:-)


This will install dependencies, then start the app and mock API.

## Starter Project Overview

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

I made the following enhancements:

1. Added mock API using [json-server](https://github.com/typicode/json-server) and configured `npm start` to run the app and mock API at the same time. See [Building Applications with React and Flux](https://app.pluralsight.com/library/courses/react-flux-building-applications/table-of-contents) for details on how to set this up from scratch.
1. Added some React components to help us get started.
1. Added App.css with basic styles
1. Added some images to `/public`.
1. Added functions for fetching data in `/src/services`.
