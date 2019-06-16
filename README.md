# alice
An lrun-based Informatics Judger in TypeScript. WIP

## Dependency
- Node.js with ES2017 Support (Better if > v12)
- npm
- Linux
- [lrun](https://github.com/quark-zju/lrun) (can run w/o libseccomp)

## Configure
Alice is designed to be used with Koa:
```ts
import { init, use } from '@whojudge/alice'
init({
    path: './cache/', // Cache path, Where codes and executables are stored (with trailing slash)
    language: { // Language info
        cpp: {
            compiler: 'g++ -Wall -Wextra -std=c++98 {infile} -o {outfile}'.split(' '), // Compiler must be an array
            runner: '{outfile}'.split(' '), // Runner muse be an array
            extension: '.cpp', // Extension (with dot)
            mirror: [],
        },
        cpp11: {
            compiler: 'g++ -Wall -Wextra -std=c++11 {infile} -o {outfile}'.split(' '),
            runner: '{outfile}'.split(' '),
            extension: '.cpp',
            mirror: [],
        },
        python3: {
            compiler: null, // Compiler can be null if no compiler
            runner: 'python3 {infile}'.split(' '),
            extension: '.py',
            mirror: ['/usr/bin/python3'], // Extra executables / dependencies for runner
        },
        ...
    },
    mirror: ['/lib/', '/lib64/', '/usr/lib/', ...], // General extra executables / dependencies
    lrun: {
        uid: 1001, // The lrun user's uid
        gid: 1001, // The lrun user's gid
        compilerTime: 20 * 1000, // Max time for compilers (ms)
        compilerMemory: 256 * 1024 * 1024, // Max memory for compilers (Bytes)
    },
    concurrent: 4, // How many compile & run tasks can be run concurrently
    token: 'testToken', // The token for accessing the API as well as calling the webhook, by specifying X-Access-Token HTTP header
    webhook: 'http://localhost:5000/_webhook', // The webhook, used to notify that a compile / run task is finished
})
use(app)
```

## Run
- Run the server with `sudo`; or alice won't be able to switch uid/gid.
- `chown` the cache path to the lrun user.
- Copy [`testlib.h`](https://github.com/MikeMirzayanov/testlib) to `${cachePath}/spj/source`.

## Default SpecialJudge
Use this code as a default SpecialJudge:
```cpp
#include "testlib.h"
using namespace std;

int main(int argc, char *argv[]) {
    setName("token-by-token comparing, ignoring trailing space and endl");
    registerTestlibCmd(argc, argv);

    while (!ans.seekEof() && !ouf.seekEof()) {
        string ja = ans.readToken();
        string pa = ouf.readToken();
        if (ja != pa) quitf(_wa, "");
    }

    bool ansEnded = ans.seekEof(),
         oufEnded = ouf.seekEof();

    if (ansEnded && oufEnded)
        quitf(_ok, "");
    else if (ansEnded)
        quitf(_fail, "answer too short");
    else if (oufEnded)
        quitf(_fail, "answer too long");
    
    return 0;
}
```
