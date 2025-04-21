# Towers

A tower defense game in the browser:

https://towers.oleherman.com

## Running locally

For development purposes, you can run the app locally using `docker`:

```bash
docker build --tag towers . && docker run -it -p 3000:3000 --name towers --rm towers
```

Or podman:

```bash
docker build --tag towers . && docker run -it -p 3000:3000 --name towers --rm towers
```

http://127.0.0.1:3000
