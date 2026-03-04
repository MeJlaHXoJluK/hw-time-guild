import { StringUtils, refreshPage } from './utils.js'

export const BASE_URL = 'https://afflpqpdllwiwsrtnuer.supabase.co/functions'

class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnauthorizedError'
    }
}

class _TokenHelper {

    constructor() {
        this.accessKey = 'access_token_key'
        this.refreshKey = 'refresh_token_key'
        this.codeKey = 'code_key'
        this.codeErrorKey = 'code_error_key'
        this._onLogoutListener = null
    }

    /**
     * @returns null, если строки нет или она пуста, иначе значение access-токена.
     */
    getAccessToken() {
        return StringUtils.getStringOrNull(localStorage.getItem(this.accessKey))
    }

    /**
     * @returns null, если строки нет или она пуста, иначе значение refresh-токена.
     */
    getRefreshToken() {
        return StringUtils.getStringOrNull(localStorage.getItem(this.refreshKey))
    }

    /**
     * @returns code полученный в процессе аутентификации по telegram в случае успеха, в остальных случаях null.
     */
    getCode() {
        return StringUtils.getStringOrNull(localStorage.getItem(this.codeKey))
    }

    /**
     * @returns error сообщение полученное в процессе аутентификации по telegram в случае неудачи, в остальных случаях null.
     */
    getCodeError() {
        return StringUtils.getStringOrNull(localStorage.getItem(this.codeErrorKey))
    }

    /**
     * @param token accessToken для авторизации запросов.
     * @throws Error если token null или пуст
     */
    setAccessToken(token) {
        this.#performSetToken(this.accessKey, token, 'Can`t set null or empty access token')
    }

    /**
     * @param token refreshToken для обновления токенов на беке.
     * @throws Error если token null или пуст
     */
    setRefreshToken(token) {
        this.#performSetToken(this.refreshKey, token, 'Can`t set null or empty refresh token')
    }

    /**
     * @param listener срабатывает всякий раз, когда пользователь считается разлогиненным. (сам вышел, протухли токены, ..., etc.)
     */
    setOnLogoutListener(listener = null) {
        this._onLogoutListener = listener
    }

    /**
     * @returns true, если хотя бы какой-то токен существует в LocalStorage, иначе false.
     */
    hasTokens() {
        return this.getAccessToken() != null && this.getRefreshToken() != null
    }

    onLogout(isRefreshPage = false) {
        this.#removeTokens()
        this._onLogoutListener?.()
        if (isRefreshPage) {
            refreshPage()
        }
    }

    removeCode() {
        localStorage.removeItem(this.codeKey)
        localStorage.removeItem(this.codeErrorKey)
    }

    #removeTokens() {
        localStorage.removeItem(this.accessKey)
        localStorage.removeItem(this.refreshKey)
    }

    #performSetToken(key, token, errorMsg) {
        if (StringUtils.isNullOrBlank(token)) {
            throw new Error(errorMsg)
        }
        localStorage.setItem(key, token)
    }
}

export const TokenHelper = new _TokenHelper()

/**
 * Wrapper над запросом, аля AuthInterceptor, который при протухшем access токене пытается их обновить с помощью refresh токена. Затем запрос повторяется.
 * @param _fetch api-функция, возвращающая Promise<Response | Error>.
 * @returns Promise<Response> если токены не протухли и запрос завершился удачно, иначе Promise<Error>
 */
export async function authorizedFetch(_fetch = null) {
    if (!_fetch) {
        throw new Error('Request is Null!')
    }
    if (!TokenHelper.hasTokens()) {
        throw new UnauthorizedError('Credentials not found')
    }
    let response = await _fetch(TokenHelper.getAccessToken())
    if (response.status !== 401) {
        return response
    }
    response = await fetchTokens(TokenHelper.getRefreshToken())
    if (response.status !== 200) {
        TokenHelper.onLogout()
        throw new UnauthorizedError(`Can\`t fetch tokens! ${response}`)
    }
    try {
        const {accessToken, refreshToken} = await response.json()
        TokenHelper.setAccessToken(accessToken)
        TokenHelper.setRefreshToken(refreshToken)
    } catch (e) {
        TokenHelper.onLogout()
        throw new UnauthorizedError('Something when`t wrong on local token update')
    }
    response = await _fetch(TokenHelper.getAccessToken())
    if (response.status !== 200) {
        throw new Error(`Fetch failed! ${response}`)
    }
    return response
}

/**
 * Запрос на обновление протухшего аксес токена.
 * @param token refresh токен.
 * @returns Promise<Response>, где объект в теле содержит поля accessToken, refreshToken.
 */
async function fetchTokens(token) {
    return fetch(`${BASE_URL}/v1/authRefresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            token: token
        })
    })
}

export class UserApi {
    constructor() {}

    /**
     * Получение профиля пользователя
     * @param token access токен
     * @returns Promise<Response> в теле которого объект с полями name и imgUrl.
     */
    static async fetchProfile(token = '') {
        return fetch(`${BASE_URL}/v1/profile`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": getBearerToken(token)
            },
        })
    }

    /**
     * Удаление профиля пользователя с hw-guild-time сайта.
     * @param token access токен определяющий пользователя.
     * @returns Promise<Response> результат работы. Если status 200 - профиль удалён, иначе - ошибка.
     */
    static async deleteProfile(token = '') {
        return fetch(`${BASE_URL}/v1/profileDelete`, {
            method: 'POST',
            headers: {
                "Authorization": getBearerToken(token),
                "Content-Type": "application/json"
            }
        })
    }

    /**
     * @param code код, который сайт получил редиректом от telegram при авторизации.
     * @returns Promise<Response> пара access и refresh токенов в случае успеха, иначе запрос с ошибкой.
     */
    static async fetchTokensByCode(code) {
        return fetch(`${BASE_URL}/v1/codeExchange`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({code: code})
        })
    }

    /**
     * @param token accessToken для авторизованного получения данных.
     * @returns Promise<Response> список профилей из которых можно выбрать профиль для сайта, иначе ошибка.
     */
    static async fetchUnusedProfiles(token) {
        return fetch(`${BASE_URL}/v1/unusedProfiles`, {
            method: 'POST',
            headers: {
                "Authorization": getBearerToken(token),
                "Content-Type": "application/json",
            }
        })
    }

    /**
     * @param token accessToken для авторизованного получения данных или null, если пользователь ещё не авторизован.
     * @param controller AbortController для принудительной отмены запроса
     * @returns список всех профилей.
     */
    static async fetchAllProfiles(token, controller) {
        return fetch(`${BASE_URL}/v1/getAllProfiiles`, {
            method: 'POST',
            headers: {
                "Authorization": token ? getBearerToken(token) : null,
                "Content-Type": "application/json",
            },
            signal: controller.signal
        })
    }

    /**
     * @param token accessToken для авторизации запроса
     * @param profileName имя профиля который регистрируется и будет связан с аккаунтом в ТГ.
     * @returns {Promise<Response>} Ответ с ушибкой в случае ошибки, иначе успешный ответ с кодом 200. Успешный ответ с кодом 200 может быть в 2-ч состояниях: пришёл профиль или профиль уже занят (такой кейс теоретически возможен если кто-то по ошибке раньше отправил запрос на создание профиля).
     * Поэтому успешный ответ с кодом 200 всегда содержит в теле isSuccess, который если false - значит аккаунт занял другой пользователь, в случае успешного создания профиля - true.
     * Покрывает только случай, когда 2 пользователя параллельно пытаются создать пользователя с одним именем.
     */
    static async createProfile(token, profileName) {
        return fetch(`${BASE_URL}/v1/createProfile`, {
            method: 'POST',
            headers: {
                "Authorization": getBearerToken(token),
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: profileName,
            })
        })
    }

    /**
     * @param token accessToken для авторизации запроса
     * @param avatar file картинка формата jpg/png для аватара
     * @return успешный ответ если аватарка для профиля установлена, иначе ошибка или status !== 200.
     */
    static async uploadAvatar(token, avatar) {
        const formData = new FormData()
        formData.append('file', avatar)
        return fetch(`${BASE_URL}/v1/uploadProfileImage`, {
            method: 'POST',
            headers: {
                "Authorization": getBearerToken(token),
            },
            body: formData
        })
    }

    /**
     * @param token accessToken для авторизации запроса
     * @param profile обновлённый профиль пользователя
     */
    static async updateProfile(token, profile) {
        return fetch(`${BASE_URL}/v1/updateProfile`, {
            method: 'POST',
            headers: {
                "Authorization": getBearerToken(token),
                "Content-Type": "application/json",
            },
            body: JSON.stringify(
          {
                    profile: profile
                }
            )
        })
    }
}

/**
 * @param token accessToken
 * @returns Bearer + пробел + accessToken
 */
function getBearerToken(token) {
    return `Bearer ${token}`
}
