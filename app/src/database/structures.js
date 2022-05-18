class Users {
    constructor(id, name, info, data) {
        if (typeof id != 'number') throw new Error('id must be a number');
        if (typeof name != 'string') throw new Error('name must be a string');
        if (typeof info != 'object') throw new Error('info must be a object');
        if (typeof data != 'object') throw new Error('data must be an object');
        this.id = id;
        this.name = name;
        this.money = 0;
        this.data = {};
    }
}

class Threads {
    constructor(id, name, prefix, owner, info, data) {
        if (typeof id != 'number') throw new Error('id must be a number');
        if (typeof name != 'string' && name != null) throw new Error('name must be a string or null');
        if (typeof prefix != 'string') throw new Error('prefix must be a string');
        if (typeof owner != 'number') throw new Error('owner must be a number');
        if (typeof info != 'object') throw new Error('info must be a object');
        if (typeof data != 'object') throw new Error('data must be an object');
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
        if (typeof monitorServerPerThread != 'object' || Array.isArray(monitorServerPerThread)) throw new Error('monitorServerPerThread must be an object');
        if (typeof monitorServers != 'object' || !Array.isArray(monitorServers)) throw new Error('monitorServers must be an array');
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
