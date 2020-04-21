# Phaser Game

Game to try out using Phaser

## Setup

Run the following to build the files for the UI project in `./src`. This will watch the development files and automatically rebuild when needed.
```
npm start:ui
```

Run the following to start the web server. This will watch the development files and automatically restart when needed. The web server currently does not have any build step.
```
npm start:api
```

To actually build the ui package, which creates a `public` folder that houses the files that can then be statically hosted:

```
npm build
```
