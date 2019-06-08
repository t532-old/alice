# alice
An lrun-based Informatics Judger in TypeScript. WIP

## Dependency
- Node.js with ES2017 Support (Better if > v12)
- npm
- Linux
- [lrun](https://github.com/quark-zju/lrun) (can run w/o libseccomp)

## Usage

Alice is designed to be used with Koa:
```ts
... Some sample codes
```

Run your server with `sudo`; or alice won't be able to switch uid/gid.
