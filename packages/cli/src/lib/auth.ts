import { existsSync,mkdirSync, readFileSync, writeFileSync, unlinkSync} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

type AuthData ={ 
    token: string;
}

const AUTH_DIR = join(homedir(), ".daycode");
const AUTH_FILE = join(AUTH_DIR, "auth.join");

export function getAuth():AuthData | null {
    try {
        const data = readFileSync(AUTH_FILE, "utf-8");
        const parsed = JSON.parse(data) as Partial<AuthData>;
        return typeof parsed.token === "string" ? {token : parsed.token} : null;
    } catch (error) {
        return null;
    }
}

export function saveAuth(data: AuthData) {
    if(!existsSync(AUTH_DIR)){
        // owner only permission (rwx------) so other users on the machine can't read tokens
        mkdirSync(AUTH_DIR, { mode: 0o700 })
    }
    writeFileSync(AUTH_FILE, JSON.stringify(data), {mode:0o600 })
}

export function clearAuth(){
    try {
        unlinkSync(AUTH_FILE);      
    } catch (error) {
        // file doesn't exsist
    }
}