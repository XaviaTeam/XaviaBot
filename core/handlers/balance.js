export class Balance {
    constructor() {}

    /**
     * Make balance
     *
     * @param  {...(number | bigint)} num
     * @returns {bigint}
     */
    static make(...num) {
        return num.reduce((acc, cur) => acc + BigInt(cur), 0n);
    }

    /**
     * Make balance, return null if error instead
     *
     * @param  {...(number | bigint)} num
     * @returns {bigint | null}
     */
    static makeSafe(...num) {
        try {
            return Balance.make(...num);
        } catch {
            return null;
        }
    }

    /**
     *
     * @param {string} userID
     * @param  {...(number | bigint)} amount
     */
    static add(userID, ...amount) {
        const targetUser = global.data.users.get(userID);
        if (!targetUser) throw new Error("User not exists");
        if (!targetUser.data)
            throw new Error(
                "This should not happen, if you see this, please report to the creator."
            );

        const newAmount = Balance.make(targetUser.data["money"], ...amount);
        targetUser.data["money"] = newAmount;
    }

    /**
     *
     * @param {string} userID
     * @param  {...(number | bigint)} amount
     */
    static sub(userID, ...amount) {
        const targetUser = global.data.users.get(userID);
        if (!targetUser) throw new Error("User not exists");
        if (!targetUser.data)
            throw new Error(
                "This should not happen, if you see this, please report to the creator."
            );

        const newAmount = Balance.make(
            targetUser.data["money"],
            ...amount.map((n) => BigInt(n) * -1n)
        );

        targetUser.data["money"] = newAmount < 0 ? 0 : newAmount;
    }

    /**
     *
     * @param {string} userID
     */
    static get(userID) {
        const targetUser = global.data.users.get(userID);
        if (!targetUser) throw new Error("User not exists");
        if (!targetUser.data)
            throw new Error(
                "This should not happen, if you see this, please report to the creator."
            );

        return BigInt(targetUser.data["money"] ?? 0);
    }

    /**
     *
     * @param {string} userID
     * @param {number | bigint} amount
     */
    static set(userID, amount) {
        const targetUser = global.data.users.get(userID);
        if (!targetUser) throw new Error("User not exists");
        if (!targetUser.data)
            throw new Error(
                "This should not happen, if you see this, please report to the creator."
            );

        if (amount < 0) throw new Error("Balance must not be lower than 0");
        targetUser.data["money"] = Balance.make(amount);
    }

    /**
     *
     * @param {string} userID
     * @returns
     */
    static from(userID) {
        if (!global.data.users.has(userID)) return null;

        return {
            /**
             * @param  {...(number | bigint)} amount
             */
            add: (...amount) => Balance.add(userID, ...amount),
            /**
             * @param  {...(number | bigint)} amount
             */
            sub: (...amount) => Balance.sub(userID, ...amount),
            get: () => Balance.get(userID),
            /**
             * @param  {number | bigint} amount
             */
            set: (amount) => Balance.set(userID, amount),
        };
    }
}
