# Hook.io Mongodb - Monitor mongodb with hook.io

## Install

    git clone git@github.com:bozuko/hook.io-mongodb.git
    cd cpu
    npm install

## Run

    hookio-mongodb

### Hook config.json settings

```js
"mongodb": {
    "host": "localhost" || ["x.x.x.x", "y.y.y.y"],
    "port": 27017,
    "db_name": "your_db",
    "rs_name": "your_replica_set",
    "poll_time": 30000, 
    "timeout": 10000,
    "threshold": {
        "lock_ratio": 0.1,
        "connections_available": 50,
        "btree_miss_ratio": 0.001,
        "index_size": 1000000000,
        "data_size": 3000000000
    }
}
```
## License

### The MIT License (MIT)

Copyright (c) 2011 Bozuko, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
