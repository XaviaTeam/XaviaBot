import type {
    IFCAU_API,
    IFCAU_User,
    IFCAU_Thread,
    IFCAU_Attachment,
    IFCAU_ListenMessage,
    MessageObject,
} from "@xaviabot/fca-unofficial";
import * as _utils from "../core/var/utils.js";
import type { Server } from "http";
import { XDatabase } from "../core/handlers/database.js";
import { Assets as _Assets } from "../core/handlers/assets.js";
import { Balance } from "../core/handlers/balance.js";
import { EffectsGlobal } from "../core/effects/index.js";

import getCUser from "../core/var/controllers/user.js";
import getCThread from "../core/var/controllers/thread.js";

declare global {
    export type xDatabase = XDatabase;
    export type Assets = _Assets;

    namespace NodeJS {
        interface Global {
            mainPath: string;
            corePath: string;
            cachePath: string;
            assetsPath: string;
            tPath: string;
            config: IConfig;
            modules: Map<string, any>;
            getLang: (
                key: string,
                objectData: {
                    [p: string]: any;
                },
                plugin?: string,
                language?: string
            ) => string;
            pluginsPath: string;
            plugins: IPlugins;
            client: {
                cooldowns: Map<
                    string,
                    {
                        [commandName: string]: number;
                    }
                >;
                replies: Map<string, IReplyEventListenerData>;
                reactions: Map<string, IReactEventListenerData>;
            };
            data: {
                users: Map<string, User>;
                threads: Map<string, Thread>;
                langPlugin: {
                    [plugin: string]: {
                        [lang: string]: {
                            [key: string]: string;
                        };
                    };
                };
                langSystem: {
                    [lang: string]: {
                        [key: string]: string;
                    };
                };
                messages: {
                    body: string;
                    messageID: string;
                    attachments: IFCAU_Attachment[];
                }[];
                temps: any[];
            };
            listenMqtt: ReturnType<IFCAU_API["listenMqtt"]>;
            api: IFCAU_API;
            botID: string;
            /**
             * Will be deprecated in the future
             */
            controllers: {
                Threads: ReturnType<typeof getCThread>;
                Users: ReturnType<typeof getCUser>;
            };
            xva_api: string;
            /**
             * ping server api
             */
            xva_ppi: string;
            server: Server;
            refreshState: NodeJS.Timeout;
            refreshMqtt: NodeJS.Timeout;
            restart: () => Promise<void>;
            shutdown: () => Promise<void>;
            maintain: boolean;

            utils: typeof _utils;
        }
    }

    export interface User {
        userID: string;
        banned: boolean;
        createdAt: Date;
        updatedAt: Date;
        info?: IFCAU_User & { id: string; thumbSrc: string };
        data?: Record<string, any>;
    }

    export interface Thread {
        threadID: string;
        banned: boolean;
        createdAt: Date;
        updatedAt: Date;
        info: {
            name: string;
            isGroup: boolean;
            isSubscribed: boolean;
            folder: "INBOX" | "ARCHIVE" | string;
            isArchived: boolean;
            imageSrc: string;
            emoji: string | null;
            color: string | null;
            adminIDs: string[];
            approvalMode: boolean;
            nicknames: Record<string, string>;
            members: {
                userID: string;
                exp?: number;
            }[];
        } & Record<string, any>;
        data: Record<string, any>;
    }

    export interface IConfig {
        APPSTATE_PATH: string;
        APPSTATE_PROTECTION: boolean;
        AUTO_PING_SERVER: boolean;
        ALLOW_INBOX: boolean;
        DATABASE: "JSON" | "MONGO";
        DATABASE_JSON_BEAUTIFY: boolean;
        FCA_OPTIONS: {
            [p: string]: any;
        };
        LANGUAGE: string;
        LOG_LEVEL: number;
        MODERATORS: string[];
        ABSOLUTES: string[];
        NAME: string;
        PREFIX: string;
        timezone: string;
        REFRESH: string;
        MAX_BALANCE_LIMIT: string | number;
        [key: string]: any;
    }

    export type TMessageObject = Pick<
        IFCAU_ListenMessage,
        Extract<keyof IFCAU_ListenMessage, "type">
    > extends infer R
        ? Extract<IFCAU_ListenMessage, { type: "message" | "message_reply" }> extends infer S
            ? R & S
            : never
        : never;

    export type TMessageReplyObject = Pick<
        IFCAU_ListenMessage,
        Extract<keyof IFCAU_ListenMessage, "type">
    > extends infer R
        ? Extract<IFCAU_ListenMessage, { type: "message_reply" }> extends infer S
            ? R & S
            : never
        : never;

    export type TReactionObject = Pick<
        IFCAU_ListenMessage,
        Extract<keyof IFCAU_ListenMessage, "type">
    > extends infer R
        ? Extract<IFCAU_ListenMessage, { type: "message_reaction" }> extends infer S
            ? R & S
            : never
        : never;

    export type TEventObject = Pick<
        IFCAU_ListenMessage,
        Extract<keyof IFCAU_ListenMessage, "type">
    > extends infer R
        ? Extract<IFCAU_ListenMessage, { type: "event" }> extends infer S
            ? R & S
            : never
        : never;

    export type TMessageSendFunc = (
        message: string | MessageObject,
        c_threadID?: string,
        c_messageID?: string
    ) => Promise<{
        threadID: string;
        messageID: string;
        timestamp: number;
        addReplyEvent: TAddReplyEventListener;
        addReactEvent: TAddReactEventListener;
        unsend: (delay?: number) => void;
    }>;

    export type TMessageReplyFunc = (message: string | MessageObject) => Promise<{
        threadID: string;
        messageID: string;
        timestamp: number;
        addReplyEvent: TAddReplyEventListener;
        addReactEvent: TAddReactEventListener;
        unsend: (delay?: number) => void;
    }>;

    export type TMessageReactFunc = (emoji: string) => Promise<void>;

    type BalanceFromMethod = (typeof Balance)["from"];
    type BalanceMakeMethod = (typeof Balance)["make"];
    type BalanceMakeSafeMethod = (typeof Balance)["makeSafe"];

    export type TOnLoadCommand = (props: {
        extra: Record<string, any>;
        assets: ReturnType<Assets["from"]> & { from: Assets["from"] };
        balance: {
            from: BalanceFromMethod;
            make: BalanceMakeMethod;
            makeSafe: BalanceMakeSafeMethod;
        };
    }) => void | Promise<void>;

    // TODO: Update data types
    export type TOnCallCommand = (props: {
        message: TMessageObject & {
            send: TMessageSendFunc;
            reply: TMessageReplyFunc;
            react: TMessageReactFunc;
        };
        args: string[];
        assets: ReturnType<Assets["from"]> & { from: Assets["from"] };
        balance: ReturnType<BalanceFromMethod> & {
            from: BalanceFromMethod;
            make: BalanceMakeMethod;
            makeSafe: BalanceMakeSafeMethod;
        };
        getLang: (key: string, objectData: { [p: string]: any }) => string;
        extra: {
            [p: string]: any;
        };
        data: {
            thread: null | Thread;
            user: null | User;
        };
        xDB: xDatabase;
        userPermissions: number[];
        prefix: string;
    }) => void | Promise<void>;

    export type TOnCallOnMessage = (props: {
        message: TMessageObject & {
            send: TMessageSendFunc;
            reply: TMessageReplyFunc;
            react: TMessageReactFunc;
        };
        assets: { from: Assets["from"] };
        balance: ReturnType<BalanceFromMethod> & {
            from: BalanceFromMethod;
            make: BalanceMakeMethod;
            makeSafe: BalanceMakeSafeMethod;
        };
        getLang: (key: string, objectData: { [p: string]: any }) => string;
        data: {
            thread: null | Thread;
            user: null | User;
        };
        xDB: xDatabase;
    }) => void | Promise<void>;

    export type TOnCallEvents = (props: { event: TEventObject }) => void | Promise<void>;

    export type TOnCallCustom = (props: {
        getLang: (key: string, objectData: { [p: string]: any }) => string;
        xDB: xDatabase;
    }) => void | Promise<void>;

    export interface IBaseEventListenerData {
        threadID: string;
        messageID: string;
        author: string;
        author_only: boolean;
        name: string;
        [prop: string]: any;
    }

    export type TReplyCallback = (props: {
        message: TMessageObject & {
            send: TMessageSendFunc;
            reply: TMessageReplyFunc;
            react: TMessageReactFunc;
        };
        assets: ReturnType<Assets["from"]> & { from: Assets["from"] };
        balance: ReturnType<BalanceFromMethod> & {
            from: BalanceFromMethod;
            make: BalanceMakeMethod;
            makeSafe: BalanceMakeSafeMethod;
        };
        getLang: (key: string, objectData: { [p: string]: any }) => string;
        data: {
            thread: null | Thread;
            user: null | User;
        };
        xDB: xDatabase;
        eventData: IBaseEventListenerData;
    }) => void | Promise<void>;

    export type TReactCallback = (props: {
        message: TReactionObject & {
            send: TMessageSendFunc;
        };
        assets: ReturnType<Assets["from"]> & { from: Assets["from"] };
        balance: ReturnType<BalanceFromMethod> & {
            from: BalanceFromMethod;
            make: BalanceMakeMethod;
            makeSafe: BalanceMakeSafeMethod;
        };
        getLang: (key: string, objectData: { [p: string]: any }) => string;
        data: {
            thread: null | Thread;
            user: null | User;
        };
        xDB: xDatabase;
        eventData: IBaseEventListenerData;
    }) => void | Promise<void>;

    export interface IReplyEventListenerData extends IBaseEventListenerData {
        callback: TReplyCallback;
    }

    export interface IReactEventListenerData extends IBaseEventListenerData {
        callback: TReactCallback;
    }

    export type TAddReplyEventListener = (
        data: IReplyEventListenerData,
        standbyTime?: number
    ) => void;

    export type TAddReactEventListener = (
        data: IReactEventListenerData,
        standbyTime?: number
    ) => void;

    export interface IPlugins {
        commands: Map<string, TOnCallCommand>;
        commandsAliases: Map<string, string[]>;
        commandsConfig: Map<
            string,
            {
                [p: string]: any;
            }
        >;
        customs: Number;
        events: Map<string, TOnCallEvents>;
        onMessage: Map<string, TOnCallOnMessage>;
        effects: EffectsGlobal;
        disabled: {
            commands: {
                byName: string[];
                byFilename: string[];
            };
            customs: string[];
            events: string[];
            onMessage: string[];
        };
    }
}
