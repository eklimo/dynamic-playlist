# Dynamic Playlist

WIP

## Requirements

- [npm](https://www.npmjs.com)
- [Docker](https://www.docker.com)

## Building

1. Build `web-client`

```shell
$ cd web-client
$ npm install
$ npm run build
```

2. Build `rest-server`

```shell
$ cd rest-server
$ ./mvnw package
```

## Running

```shell
docker compose up
```

Once `web-server` is `Started`, connect to the application at `localhost:8081`.
