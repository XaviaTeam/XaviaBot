import * as structures from '../app/src/database/structures.js';
import { readFileSync } from 'fs';

let config = JSON.parse(readFileSync('./config/config.main.json', 'utf8'));

config.DATABASE_SETTINGS.structures = structures;

export default config;
