import ApiCallerService, { USER_NAME_SESSION_ATTRIBUTE_NAME, USER_NAME_TEMP_SESSION_ATTRIBUTE_NAME} from "./ApiCallerService";

export default class AuthService {
    static login(username, password) {
        return ApiCallerService.postNoAuth('authuser/login', {'username': username, 'password': password})
            .then(res => res.json())
            .then(res=> {sessionStorage.setItem(USER_NAME_SESSION_ATTRIBUTE_NAME, JSON.stringify(res))})
            .then(res => {
                //side affect, should maybe not have here.
                window.location.href = "/game/setup";
                return res;
            })
    }
    static createUser(username, password) {
        return ApiCallerService.postNoAuth('authuser/join', {'username': username, 'password': password})
            .then(res => res.json())
            .then(res=> {sessionStorage.setItem(USER_NAME_SESSION_ATTRIBUTE_NAME, JSON.stringify(res))})
            .then(res => {
                return res;
            })
    }
    static createGame() {
        return ApiCallerService.post('authuser/game/create')
            .then(res => res.json())
            .then(res=> {sessionStorage.setItem(USER_NAME_TEMP_SESSION_ATTRIBUTE_NAME, JSON.stringify(res))})
            .then(res => {
                return res;
            })
    }
    static authGame(gameCode, username) {
        return ApiCallerService.postNoAuth('gameuser/game/auth', {username: username, code: gameCode})
            .then(res => res.json())
            .then(res => {sessionStorage.setItem(USER_NAME_TEMP_SESSION_ATTRIBUTE_NAME, JSON.stringify(res))})
            .then(res => {
                return res;
            })
    }
    static authGameFull(gameCode) {
        
        return ApiCallerService.post('authuser/game/join', {code: gameCode})
            .then(res => res.json())
            .then(res => {sessionStorage.setItem(USER_NAME_TEMP_SESSION_ATTRIBUTE_NAME, JSON.stringify(res))})
            .then(res => {
                return res;
            })
    }
    static logout() {
        sessionStorage.removeItem(USER_NAME_SESSION_ATTRIBUTE_NAME);
        sessionStorage.removeItem(USER_NAME_TEMP_SESSION_ATTRIBUTE_NAME);
        //side affect, should maybe not have here.
        window.location.href = "/login"
    }
    static isLoggedIn() {
        return !!sessionStorage.getItem(USER_NAME_SESSION_ATTRIBUTE_NAME);
    }
    static isGameAuth() {
        return !!sessionStorage.getItem(USER_NAME_TEMP_SESSION_ATTRIBUTE_NAME);
    }
    static getGameAuth() {
        return sessionStorage.getItem(USER_NAME_TEMP_SESSION_ATTRIBUTE_NAME);
    }
    static testCanAccess() {
        ApiCallerService.post('debug/authcheck');
    }
}