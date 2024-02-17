import fs from "fs";
import axios from "axios";
import canvas from "canvas";
import FormData from "form-data";
import { randomInt } from "crypto";
import { join } from "path";

export function request(url, options = {}, callback = null) {
    if (typeof options === "function") {
        callback = options;
        options = {};
    }
    if (typeof callback !== "function") {
        callback = () => {};
    }
    axios(url, options)
        .then((response) => {
            callback(null, response, response.data);
        })
        .catch((error) => {
            callback(error);
        });
}

export const GET = axios.get;

/**
 *
 * @param {string} input - a stringified JSON object
 * @returns {boolean}
 */
export function isJSON(input) {
    try {
        JSON.parse(input);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 *
 * @param {string} pathToFile - a path to a file
 * @returns {boolean}
 */
export function isJSONFile(pathToFile) {
    if (!isExists(pathToFile)) return false;

    try {
        return isJSON(fs.readFileSync(pathToFile, "utf8"));
    } catch {
        return false;
    }
}

export function fileStats(path) {
    try {
        return fs.statSync(path);
    } catch (e) {
        throw e;
    }
}

/**
 * Checks if a file/directory exists
 * @param {string} path - a path to a file/directory
 * @param {"file" | "dir"} type - "file" or "dir"
 * @returns {boolean}
 */
export function isExists(path, type = "file") {
    try {
        const result = fs.statSync(path);
        return type === "file" ? result.isFile() : result.isDirectory();
    } catch (e) {
        return false;
    }
}

export function reader(path) {
    return fs.createReadStream(path);
}

export function writer(path) {
    return fs.createWriteStream(path);
}

export function writeFile(path, data, encoding = "utf8") {
    return fs.writeFileSync(path, data, encoding);
}

export function readFile(path, encoding = "utf8") {
    return fs.readFileSync(path, encoding);
}

export function createDir(path) {
    return fs.mkdirSync(path, { recursive: true });
}

/**
 * Download a file from an url which could be video, audio, json, etc.
 *
 * @param {string} path - a path to a file
 * @param {string} src - an src to a file
 * @param {Record<string, string>} headers - custom headers (optional)
 * @returns {Promise<string>} path
 */
export function downloadFile(path, src, headers = {}) {
    return new Promise((resolve, reject) => {
        GET(src, { responseType: "stream", headers })
            .then((res) => {
                const _writer = writer(path);

                res.data.pipe(_writer);

                _writer.on("error", (err) => {
                    reject(err);
                });
                _writer.on("close", () => {
                    resolve(path);
                });
            })
            .catch((err) => {
                reject(err);
            });
    });
}

export function deleteFile(path) {
    return fs.unlinkSync(path);
}

export function scanDir(path) {
    return fs.readdirSync(path);
}

export function getStream(input) {
    return new Promise((resolve, reject) => {
        if (isExists(input)) {
            resolve(reader(input));
        } else {
            if (isURL(input)) {
                GET(input, { responseType: "stream" })
                    .then((res) => {
                        resolve(res.data);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            } else {
                reject(new Error("Invalid input"));
            }
        }
    });
}

export function getBase64(input) {
    return new Promise((resolve, reject) => {
        if (isURL(input)) {
            GET(input, { responseType: "text", responseEncoding: "base64" })
                .then((res) => {
                    resolve(res.data);
                })
                .catch((err) => {
                    reject(err);
                });
        } else {
            reject(new Error("Invalid input"));
        }
    });
}

export function isURL(url) {
    return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(
        url
    );
}

export function buildURL(url) {
    try {
        return new URL(url);
    } catch {
        return null;
    }
}

export function random(min, max) {
    min = parseInt(min);
    max = parseInt(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Circle an image
 */
export function circle(image, x, y, radius) {
    const tempCanvas = new canvas.createCanvas(image.width, image.height);
    const ctx = tempCanvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(image, 0, 0);

    return tempCanvas;
}

export async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * for loop minified
 * @param {number} times
 * @param {function} callback
 *
 * @example
 *      // console.log from 0 to 99
 *      loop(100, i => console.log(i));
 */
export function loop(times, callback = () => {}) {
    if (times && !isNaN(times) && times > 0) {
        for (let i = 0; i < times; i++) {
            callback(i);
        }
    }
}

export function getRandomHexColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    loop(6, () => {
        color += letters[Math.floor(Math.random() * letters.length)];
    });
    return color;
}

export function getRandomPassword(length = 8, specialChars = false) {
    const letters =
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" +
        (specialChars ? "!@#$%^&*()_+~`|}{[]:;?><,./-=" : "");
    let password = "";
    loop(length, () => {
        password += letters[randomInt(0, letters.length)];
    });
    return password;
}

export function addCommas(x) {
    if (x === null || x === undefined) return null;
    return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * convert a base64
 * @param {String} file - Path to a file
 */
export function saveToBase64(file) {
    let bitmap = fs.readFileSync(file);
    return Buffer.from(bitmap).toString("base64");
}

/**
 * reverse from Base64
 * @param {String} base64 - Base64 string
 */
export function saveFromBase64(path, base64) {
    return new Promise((resolve, reject) => {
        const bitmap = Buffer.from(base64, "base64");
        const _writer = writer(path);

        _writer.write(bitmap, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(path);
            }

            _writer.destroy();
        });
    });
}

/**
 *
 * @param {string} input base64 string or URL
 * @returns {Promise<string | undefined>}
 */
export async function uploadImgbb(input) {
    try {
        const form = new FormData();
        form.append("key", process.env.IMGBB_KEY);
        form.append("image", input);

        const config = {
            method: "post",
            url: "https://api.imgbb.com/1/upload",
            headers: {
                ...form.getHeaders(),
            },
            data: form,
        };

        const res = await axios(config);
        return res?.data?.data?.url;
    } catch (err) {
        throw err;
    }
}

export function msToHMS(ms) {
    let seconds = parseInt((ms / 1000) % 60),
        minutes = parseInt((ms / (1000 * 60)) % 60),
        hours = parseInt((ms / (1000 * 60 * 60)) % 24);

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return `${hours}:${minutes}:${seconds}`;
}

export function shuffleArray(array) {
    let currentIndex = array.length,
        randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

export function expToLevel(exp) {
    return Math.floor(Math.pow(exp || 1, 1 / 3));
}

export function levelToExp(level) {
    return Math.floor(Math.pow(level, 3));
}

export function getAvatarURL(uid) {
    return `https://graph.facebook.com/${uid}/picture?type=large&width=500&height=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
}

export function isAcceptableNumber(num) {
    return !isNaN(parseInt(num));
}

/**
 *
 * @param {string} path
 * @returns
 */
export function buildCachePath(path) {
    return join(global.cachePath, path);
}

/**
 *
 * @param {string} path
 * @returns
 */
export function buildAssetesPath(path) {
    return join(global.assetsPath, path);
}
