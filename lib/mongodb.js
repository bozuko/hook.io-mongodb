var Hook = require('hook.io').Hook,
    util = require('util'),
    os = require('os'),
    mongo = require('mongodb'),
    Db = mongo.Db,
    Server = mongo.Server,
    ReplSetServers = mongo.ReplSetServers,
    async = require('async')
;

var defaults = {
    host: 'localhost',
    port: 27017,
    db_name: 'test',
    poll_time: 30000,
    timeout: 10000,
    threshold: {
        lock_ratio: .1,
        connections_available: 50,
        btree_miss_ratio: .001,
        index_size: 1000000000, // bytes
        data_size: 3000000000 // bytes
    }
};

var emit;

var Mongodb = module.exports = function (options) {

  Hook.call(this, options);

  var self = this;

  var config = self.config.get('mongodb');

  self.host = config.host || defaults.host;
  self.port = config.port || defaults.load_threshold;
  self.db_name = config.db_name || defaults.db_name;
  self.rs_name = config.rs_name;
  self.poll_time = config.poll_time || defaults.poll_time;
  self.timeout = config.timeout || defaults.timeout;
  self.threshold = merge(defaults.threshold, config.threshold || {});
  self.setup();

  emit = function(type, data) {
      if (!data.name) data.name = self.name;
      self.emit(type, data);
  };
 
  this.on('hook::ready', function () {
      self.monitor();
  });
};

//
// Inherit from `hookio.Hook`
//
util.inherits(Mongodb, Hook);

Mongodb.prototype.setup = function() {
    var self = this;
    if (this.host instanceof Array) {
        this.is_replSet = true;
        var servers = [];
        for (var i = 0; i < this.host.length; i++) {
            servers.push(new Server(this.host[i], this.port, {auto_reconnect: true}));
        };
        this.replSet = new ReplSetServers(servers, {rs_name: this.rs_name});
        this.db = new Db(this.db_name, this.replSet);
    } else {
        this.db = new Db(
            this.db_name,
            new Server(this.host, this.port, {auto_reconnect: true})
        );
    };

    this.db.on('error', function(err) {
        emit('alert', {error: err, db: self.db_name, rs: self.rs_name});
    });

    this.db.on('close', function(conn) {
        emit('alert', {msg: 'connection closed', host: conn.host, port: conn.port});
    });
};

Mongodb.prototype.monitor = function() {
    var self = this;
    this.db.open(function(err, client) {
        if (err) {
            emit('alert', {msg: 'failed to connect', db: self.db_name, rs: self.rs_name, error: err});
            return setTimeout(function() {
                self.monitor();
            }, self.poll_time);
        }

        self.timer = setInterval(function() {
            self.collect_data();
        }, self.poll_time);
    });
};

Mongodb.prototype.startTimer = function(cmd) {
    var self = this;
    var timer = setTimeout(function() {
        emit('alert', {msg: 'timeout', cmd: cmd, db: self.db_name, rs: self.rs_name});
    }, self.timeout);
    return timer;
};

Mongodb.prototype.runCommand = function(cmd, cb) {
    var self = this;
    var timer = this.startTimer(cmd);
    var query = {};
    query[cmd] = 1;
    self.db.executeDbCommand(query, function(err, result) {
        clearTimeout(timer);
        if (err) {
            emit('alert', {cmd: cmd, error: err, db: self.db_name, rs: self.rs_name});
            return cb(err);
        }
        var doc = result.documents[0];
        if (!doc.ok) {
            emit('alert', {cmd: cmd, error: doc, db: self.db_name, rs: self.rs_name});
            return cb(err);
        }
        self[cmd] = doc;
        return cb();
    });
};

Mongodb.prototype.collect_data = function() {
    var self = this;
    async.forEach(['serverStatus', 'dbStats'], function(cmd, cb) {
        self.runCommand(cmd, cb);
    }, function(err) {
        if (!err) {
            self.analyze();
        }
    });
};

Mongodb.prototype.analyze = function() {
    if (this.serverStatus.globalLock.ratio > this.threshold.lock_ratio) {
        emit('alert', {
            msg: 'lock ratio = '+this.serverStatus.globalLock.ratio,
            db: this.db_name, 
            rs: this.rs_name
        });
    }

    if (this.serverStatus.connections.available <= this.threshold.connections_available) {
        emit('alert', {
            msg: 'connections available = '+this.serverStatus.connections.available,
            db: this.db_name, 
            rs: this.rs_name
        });
    }

    if (this.serverStatus.indexCounters.btree.missRatio > this.threshold.btree_miss_ratio) {
        emit('alert', {
            msg: 'btree miss ratio = '+this.serverStatus.indexCounters.btree.missRatio,
            db: this.db_name, 
            rs: this.rs_name
        });
    }

    if (this.dbStats.indexSize > this.threshold.index_size) {
        emit('alert', {
            msg: 'index size = '+this.dbStats.indexSize,
            db: this.db_name, 
            rs: this.rs_name
        });
    }

    if (this.dbStats.dataSize > this.threshold.data_size) {
        emit('alert', {
            msg: 'data size = '+this.dbStats.dataSize,
            db: this.db_name, 
            rs: this.rs_name
        });
    }
};

// merge object b into object a (no recursion)
// return a new object
function merge(a, b) {
    var c = {};
    var keys = Object.keys(a);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (b[key]) {
            c[key] = b[key];
        } else {
            c[key] = a[key];
        }
    }
    return c;
};
