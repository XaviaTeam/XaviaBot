class EffectsBase {
    /**
     * @type {{userID: string, name: string, value: number}[]}
     */
    #effects;

    constructor() {
        this.#effects = [];
    }

    /**
     * @returns {{userID: string, effects: {name: string, value: number}[]}[]}
     */
    all() {
        const returnValues = [];

        for (const effect of this.#effects) {
            const userEffects = returnValues.find((e) => e.userID == effect.userID);

            if (userEffects) {
                userEffects.effects.push({
                    name: effect.name,
                    value: effect.value,
                });
            } else {
                returnValues.push({
                    userID: effect.userID,
                    effects: [
                        {
                            name: effect.name,
                            value: effect.value,
                        },
                    ],
                });
            }
        }

        return returnValues;
    }

    /**
     * @param {string} userID
     * @param {string} name
     * @param {number} value
     */
    add(userID, name, value) {
        this.#effects.push({
            userID,
            name,
            value,
        });
    }

    /**
     * @param {string} userID
     * @param {string} name
     * @returns {boolean}
     */
    remove(userID, name) {
        const effectIndex = this.#effects.findIndex((e) => e.userID == userID && e.name == name);

        if (effectIndex == -1) return false;
        this.#effects.splice(effectIndex, 1);

        return true;
    }

    /**
     * @param {string} userID
     * @param {string} name
     * @returns {object | null}
     */
    get(userID, name) {
        return this.#effects.find((e) => e.userID == userID && e.name == name) || null;
    }

    /**
     * @param {string} userID
     * @param {string} name
     */
    has(userID, name) {
        return this.#effects.some((e) => e.userID == userID && e.name == name);
    }

    /**
     * @param {string} userID
     */
    getAll(userID) {
        return this.#effects.filter((e) => e.userID == userID);
    }

    empty() {
        this.#effects = [];
    }
}

class EffectsPlugin {
    exp;
    money;

    constructor() {
        this.exp = new EffectsBase();
        this.money = new EffectsBase();
    }

    all() {
        return {
            exp: this.exp.all(),
            money: this.money.all(),
        };
    }
}

class EffectsGlobal {
    /**
     * @type {Map<string, EffectsPlugin>}
     */
    #effects;

    constructor() {
        this.#effects = new Map();
    }

    /**
     * @param {string} pluginName
     */
    register(pluginName) {
        this.#effects.set(pluginName, new EffectsPlugin());
    }

    /**
     *
     * @param {string} pluginName
     * @returns {EffectsPlugin | null}
     */
    get(pluginName) {
        return this.#effects.get(pluginName) || null;
    }

    /**
     * @param {string} pluginName
     */
    has(pluginName) {
        return this.#effects.has(pluginName);
    }

    values() {
        const returnValues = [];

        for (const [k, v] of this.#effects.entries()) {
            const pluginEffects = v.all();

            returnValues.push({
                pluginName: k,
                exp: pluginEffects.exp,
                money: pluginEffects.money,
            });
        }

        return returnValues;
    }

    /**
     * 
     * @param {string} userID 
     * @returns 
     */
    getCalculated(userID) {
        if (!userID) throw new Error("Missing userID");

        let calculated = {
            money: 0,
            exp: 0,
        };
        this.#effects.forEach((v, k) => {
            calculated.money += v.money.getAll(userID).reduce((acc, cur) => acc + cur.value, 0);
            calculated.exp += v.exp.getAll(userID).reduce((acc, cur) => acc + cur.value, 0);
        });

        return calculated;
    }
}

export { EffectsBase, EffectsPlugin, EffectsGlobal };
