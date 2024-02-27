const ErrorName = {
    UNEXPECTED: "UnexpectedError",
    USER_NOT_EXISTS: "UserNotFoundError",
};

export class BalanceError extends Error {
    /**
     * @param {keyof ErrorName} name
     * @param {string} message 
     */
    constructor(name, message) {
        super(message);
        this.name = name;
    }
}
