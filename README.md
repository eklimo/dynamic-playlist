# Dynamic Playlist

WIP

## Requirements

* Docker

## Building

1. Build `app-server`

```shell
$ cd app-server
$ ./mvnw package
```

2. Build `web-client`

```shell
$ cd web-client
$ npm install
$ npm run build
```

## Running

```shell
docker compose up
```
