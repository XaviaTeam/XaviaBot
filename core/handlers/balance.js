import { BalanceError } from "./exceptions.js";

export class Balance {
    constructor() {}

    static MAX_BALANCE_LIMIT = -1n; // -1: no limit (not safe)

    /**
     *
     * @param {number | bigint | string} amount
     */
    static setLimit(amount) {
        const parsedAmount = Balance.makeSafe(amount);
        Balance.MAX_BALANCE_LIMIT = parsedAmount == null ? -1n : parsedAmount;
    }

    /**
     * Make balance
     *
     * @param  {...(number | bigint | string)} num
     * @returns {bigint}
     */
    static make(...num) {
        return num.reduce((acc, cur) => acc + BigInt(cur), 0n);
    }

    /**
     * Make balance, return null if error instead
     *
     * @param  {...(number | bigint | string)} num
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
        if (!targetUser)
            throw new BalanceError("USER_NOT_EXISTS", `User "${userID}" not available.`);
        if (!targetUser.data)
            throw new BalanceError(
                "UNEXPECTED",
                "This should not occur. If you encounter this issue, please report it to the creator."
            );

        let newAmount = Balance.make(targetUser.data["money"] ?? 0, ...amount);
        if (Balance.MAX_BALANCE_LIMIT != -1n) {
            newAmount =
                newAmount > Balance.MAX_BALANCE_LIMIT ? Balance.MAX_BALANCE_LIMIT : newAmount;
        }
        targetUser.data["money"] = newAmount < 0 ? 0 : newAmount;
    }

    /**
     *
     * @param {string} userID
     * @param  {...(number | bigint)} amount
     */
    static sub(userID, ...amount) {
        const targetUser = global.data.users.get(userID);
        if (!targetUser)
            throw new BalanceError("USER_NOT_EXISTS", `User "${userID}" not available.`);
        if (!targetUser.data)
            throw new BalanceError(
                "UNEXPECTED",
                "This should not occur. If you encounter this issue, please report it to the creator."
            );

        let newAmount = Balance.make(
            targetUser.data["money"],
            ...amount.map((n) => BigInt(n) * -1n)
        );
        if (Balance.MAX_BALANCE_LIMIT != -1n) {
            newAmount =
                newAmount > Balance.MAX_BALANCE_LIMIT ? Balance.MAX_BALANCE_LIMIT : newAmount;
        }
        targetUser.data["money"] = newAmount < 0 ? 0 : newAmount;
    }

    /**
     *
     * @param {string} userID
     */
    static get(userID) {
        const targetUser = global.data.users.get(userID);
        if (!targetUser)
            throw new BalanceError("USER_NOT_EXISTS", `User "${userID}" not available.`);
        if (!targetUser.data)
            throw new BalanceError(
                "UNEXPECTED",
                "This should not occur. If you encounter this issue, please report it to the creator."
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
        if (!targetUser)
            throw new BalanceError("USER_NOT_EXISTS", `User "${userID}" not available.`);
        if (!targetUser.data)
            throw new BalanceError(
                "UNEXPECTED",
                "This should not occur. If you encounter this issue, please report it to the creator."
            );

        const isLimitExceed =
            Balance.MAX_BALANCE_LIMIT != -1n && amount > Balance.MAX_BALANCE_LIMIT;
        targetUser.data["money"] = Balance.make(isLimitExceed ? Balance.MAX_BALANCE_LIMIT : amount);
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
