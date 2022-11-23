function isArray(obj) {
    return Array.isArray(obj);
}

function isObject(obj) {
    return obj === Object(obj) && !isArray(obj);
}

class Users {
    constructor(id, name, info, data) {
        if (typeof id != 'number') throw new Error('id must be a number');
        if (typeof name != 'string') throw new Error('name must be a string');
        if (!isObject(info)) throw new Error('info must be a object');
        if (!isObject(data)) throw new Error('data must be an object');
        this.id = id;
        this.name = name;
        this.info = info;
        this.data = data;
    }
}

class Threads {
    constructor(id, name, prefix, owner, info, data) {
        if (typeof id != 'number') throw new Error('id must be a number');
        if (typeof name != 'string' && name != null) throw new Error('name must be a string or null');
        if (typeof prefix != 'string') throw new Error('prefix must be a string');
        if (typeof owner != 'number') throw new Error('owner must be a number');
        if (!isObject(info)) throw new Error('info must be a object');
        if (!isObject(data)) throw new Error('data must be an object');
        this.id = id;
        this.name = name;
        this.prefix = prefix;
        this.owner = owner;
        this.info = info;
        this.data = data;
    }
}

class Moderator {
    constructor(monitorServerPerThread, monitorServers, maintenance) {
        if (!isObject(monitorServerPerThread)) throw new Error('monitorServerPerThread must be an object');
        if (!isArray(monitorServers)) throw new Error('monitorServers must be an array');
        if (typeof maintenance != 'boolean') throw new Error('maintenance must be a boolean');
        this.monitorServerPerThread = monitorServerPerThread;
        this.monitorServers = monitorServers;
        this.maintenance = maintenance;
    }
}

export {
    Users,
    Threads,
    Moderator
}
