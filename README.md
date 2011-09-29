# Hook.io Mongodb - Monitor mongodb with hook.io

## Install
git clone git@github.com:bozuko/hook.io-mongodb.git
cd cpu
npm install

## Run
hookio-mongodb

### Hook config.json settings

```js
{
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