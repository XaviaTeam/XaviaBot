import { readdirSync, statSync, unlinkSync, rmSync } from "fs";

[
    "./plugins/cache/",
    "./core/var/data/cache/",
]
    .forEach(path => {
        const files = readdirSync(path);
        files.forEach(file => {
            const filePath = `${path}${file}`;
            if (statSync(filePath).isFile() && file != "README.txt") {
                unlinkSync(filePath);
            }
        });
    });

rmSync("./backup/", { recursive: true, force: true });
