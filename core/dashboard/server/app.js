import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import axios from "axios";

import rateLimit from "express-rate-limit";

import { readFileSync } from "fs";

import logger from "../../var/modules/logger.js";
import { isReplit, isGlitch } from "../../var/modules/environments.get.js";

const commands = ["help", "version"];

/**
 *
 * @param {string} serverAdminPassword
 */
function startServer(serverAdminPassword) {
    const app = express();
    const port = process.env.PORT || 3000;

    app.use(express.json());
    app.use(express.static(path.resolve("core/dashboard/public")));

    app.use(cors());
    app.use(helmet());

    app.use(
        rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 100,
        })
    );

    app.get("/", (req, res) => {
        res.sendFile(path.resolve("core/dashboard/public", "index.html"));
    });

    app.use((req, res, next) => {
        if (req.headers["xva-access-token"] != serverAdminPassword)
            return res.status(401).send("Unauthorized");
        next();
    });

    app.put("/commands", (req, res) => {
        const { command } = req.body;
        if (!command) return res.status(400).send("Bad Request");
        if (!commands.includes(command))
            return res.status(400).send("Bad Request");

        const returnData = {};
        switch (command) {
            case "help":
                returnData.commands = commands;
                break;
            case "version":
                returnData.version = JSON.parse(
                    readFileSync(path.resolve("package.json"))
                ).version;
                break;

            default:
                return res.status(400).send("Bad Request");
        }

        return res.status(200).json(returnData);
    });

    global.server = app.listen(port, () => {
        logger.system(
            getLang("build.start.serverStarted", { port, serverAdminPassword })
        );
    });

    if (global.config.AUTO_PING_SERVER && (isReplit || isGlitch)) {
        logger.warn("AUTO PING IS NOT AVAILABLE");
        return;

        // let webURL;
        // if (isReplit) return;
        // if (isGlitch)
        //     webURL = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
        // else return;

        // axios
        //     .post(
        //         `${global.xva_ppi}/add`,
        //         {
        //             url: webURL,
        //         }
        //     )
        //     .catch((e) => console.error(e));
    }
}

export default startServer;
