import { NotificationUtils, LoaderUtils, ModalUtils, StringUtils, ThemeUtils } from './utils.js'

const BASE_URL = 'https://afflpqpdllwiwsrtnuer.supabase.co/functions'

class BaseUser {

    constructor() {
    }
}

class UnknownUser extends BaseUser {

    constructor() {
        super();
    }
}

class User extends BaseUser {
    imgUrl = null

    constructor(imgUrl = null) {
        super();
        this.imgUrl = imgUrl
    }
}

class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnauthorizedError'
    }
}

class CodeExchangeError extends Error {
    constructor() {
        super('Ошибка обмена кода');
    }
}

class TokenHelper {

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
            window.location.assign(window.location.href)
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

class ProfileViewHolder {
    constructor() {
        this.container = document.getElementById('profile-container')
        this.text = document.getElementById('profile-text')
        this.icon = document.getElementById('profile-icon')

        this.loadingClass = 'loading'

        this._defaultProfileIconNight = './images/ic_person_night.svg'
        this._defaultProfileIconDay = './images/ic_person_day.svg'

        this._defaultLoginIconNight = './images/ic_login_night.svg'
        this._defaultLoginIconDay = './images/ic_login_day.svg'

        document
            .getElementById('theme-picker')
            .addEventListener('change', (e) => {
                let isDark;
                const theme = e.target.value
                switch (theme) {
                    case ThemeUtils.LIGHT: {
                        isDark = false
                        break
                    }
                    case ThemeUtils.DARK: {
                        isDark = true
                        break
                    }
                    default: {
                        isDark = ThemeUtils.isSystemDarkPrefer()
                        break
                    }
                }
                this.onThemeChange(isDark)
            })
        this._containerClickListener = null
        this.container.addEventListener('click', () => this._containerClickListener?.())
    }

    setLoading(isLoading = false) {
        if (isLoading) {
            this.container.classList.add(this.loadingClass)
        } else {
            this.container.classList.remove(this.loadingClass)
        }
    }

    setText(text) {
        this.text.textContent = text
    }

    setIcon(imgUrl = null, isAuth = false) {
        console.log(`theme change: ${imgUrl}`)
        const skeletonClass = 'skeleton'
        if (!this.icon.classList.contains(skeletonClass)) {
            this.icon.classList.add(skeletonClass)
        }
        this.icon.onload = () => this.icon.classList.remove(skeletonClass)
        this.icon.onerror = () => this.icon.classList.remove(skeletonClass)

        this.icon.src = imgUrl != null ? imgUrl : (isAuth ? this.getDefaultPersonIcon(ThemeUtils.isDarkTheme()) : this.getDefaultLoginIcon(ThemeUtils.isDarkTheme()))
    }

    setProfileClickListener(listener = null) {
        this._containerClickListener = listener
    }

    onThemeChange(isDark) {
        if (this.isDefaultProfileIcon(this.icon.src)) {
            this.setIcon(this.getDefaultPersonIcon(isDark))
        } else if (this.isDefaultLoginIcon(this.icon.src)) {
            this.setIcon(this.getDefaultLoginIcon(isDark))
        }
    }

    getDefaultPersonIcon(isDark) {
        return isDark ? this._defaultProfileIconNight : this._defaultProfileIconDay
    }

    getDefaultLoginIcon(isDark) {
        return isDark ? this._defaultLoginIconNight : this._defaultLoginIconDay
    }

    isDefaultProfileIcon(url) {
        return StringUtils.stringIncludeSafely(url, this._defaultProfileIconNight?.slice(1)) || StringUtils.stringIncludeSafely(url, this._defaultProfileIconDay?.slice(1))
    }

    isDefaultLoginIcon(url) {
        return StringUtils.stringIncludeSafely(url, this._defaultLoginIconNight?.slice(1)) || StringUtils.stringIncludeSafely(url, this._defaultLoginIconDay?.slice(1))
    }
}

/**
 * Wrapper над запросом, аля AuthInterceptor, который при протухшем access токене пытается их обновить с помощью refresh токена. Затем запрос повторяется.
 * @param _fetch api-функция, возвращающая Promise<Response | Error>.
 * @returns Promise<Response> если токены не протухли и запрос завершился удачно, иначе Promise<Error>
 */
async function authorizedFetch(_fetch = null) {
    if (!_fetch) {
        throw new Error('Request is Null!')
    }
    if (!authHelper.hasTokens()) {
        throw new UnauthorizedError('Credentials not found')
    }
    let response = await _fetch(authHelper.getAccessToken())
    if (response.status !== 401) {
        return response
    }
    response = await fetchTokens(authHelper.getRefreshToken())
    if (response.status !== 200) {
        authHelper.onLogout()
        throw new UnauthorizedError(`Can\`t fetch tokens! ${response}`)
    }
    try {
        const { accessToken, refreshToken } = await response.json()
        authHelper.setAccessToken(accessToken)
        authHelper.setRefreshToken(refreshToken)
    } catch (e) {
        authHelper.onLogout()
        throw new UnauthorizedError('Something when`t wrong on local token update')
    }
    response = await _fetch(authHelper.getAccessToken())
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

/**
 * Получение профиля пользователя
 * @param token access токен
 * @returns Promise<Response> в теле которого объект с полями name и imgUrl.
 */
async function fetchProfile(token = '') {
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
async function deleteProfile(token = '') {
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
async function fetchTokensByCode(code) {
    return fetch(`${BASE_URL}/v1/codeExchange`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: code })
    })
}

/**
 * @param token accessToken
 * @returns Bearer + пробел + accessToken
 */
function getBearerToken(token) {
    return `Bearer ${token}`
}

/**
 * Обновляет внешний вид плашки профиля и устанавливает логику в зависимости от статуса аутентификации.
 * @param viewHolder класс свящывающий view и данные
 * @param user данные профиля пользователя.
 */
function updateUI(viewHolder, user) {
    let text = 'Войти';
    let icon = viewHolder.getDefaultLoginIcon(ThemeUtils.isDarkTheme());
    let clickListener = () => {
        const loginModal = ModalUtils.buildModal()
        ModalUtils.addContent(
            loginModal,
            ModalUtils.buildClose(() => ModalUtils.close(loginModal)),
            ModalUtils.buildTitle('Доступные способы входа:'),
            buildTelegram(),
        )
        ModalUtils.show(loginModal)
    };
    const isAuth = user instanceof User
    if (isAuth) {
        // User авторизован, надо переопределить внешний вид и поведение с анонимного
        text = 'Выйти'
        icon = user.imgUrl
        clickListener = () => {
            const logoutModal = ModalUtils.buildModal()
            const closeLogout = () => ModalUtils.close(logoutModal)
            ModalUtils.addContent(
                logoutModal,
                ModalUtils.buildClose(() => ModalUtils.close(logoutModal)),
                ModalUtils.buildTitle('Действия над профилем:'),
                ModalUtils.buildButton('Выйти', 'button--primary', () => {
                    authHelper.onLogout(true)
                    closeLogout()
                }),
                ModalUtils.buildButton('Удалить аккаунт', 'delete-btn', () => {
                    closeLogout()
                    const confirmModal = ModalUtils.buildModal()
                    const closeConfirm = () => ModalUtils.close(confirmModal)
                    ModalUtils.addContent(
                        confirmModal,
                        ModalUtils.buildClose(() => closeConfirm()),
                        ModalUtils.buildTitle('Удалить аккаунт?'),
                        ModalUtils.buildButton('Да', 'delete-btn', () => {
                            LoaderUtils.show()
                            authorizedFetch(deleteProfile)
                                .then(response => {
                                    if (response.status === 200) {
                                        setProfileDeletedNotificationNeed(true)
                                        authHelper.onLogout(true)
                                    } else {
                                        NotificationUtils.showNotification('Ошибка! Возможно проблема на сервере', NotificationUtils.ERROR)
                                        console.log(response)
                                    }
                                })
                                .catch(e => {
                                    NotificationUtils.showNotification('Ошибка во время удаления аккаунта', NotificationUtils.ERROR)
                                    console.log(e)
                                })
                                .finally(() => {
                                    closeConfirm()
                                    LoaderUtils.hide()
                                })
                        }),
                        ModalUtils.buildButton('Нет', 'button--primary', () => {
                            closeConfirm()
                        }),
                    )
                    ModalUtils.show(confirmModal)
                })
            )
            ModalUtils.show(logoutModal)
        }
    }
    viewHolder.setText(text)
    viewHolder.setIcon(icon, isAuth)
    viewHolder.setProfileClickListener(clickListener)
}

export const authHelper = new TokenHelper()

/**
 * Точка входа. Срабатывает на каждую перезагрузку страницы и либо получает профиль, либо устанавливает состояние разлогина.
 */
export function initAuth() {
    console.log("Begin auth ...")

    const viewHolder = new ProfileViewHolder()

    authHelper.setOnLogoutListener(() => updateUI(viewHolder, new UnknownUser()))

    const onError = (e) => {
        updateUI(viewHolder, new UnknownUser())
        showProfileDeletedNotificationIfNeed()
        console.error(e.message)
    }

    processCodeExchange()
        .then(isShowAuthSuccessNotification => {
            viewHolder.setLoading(true)

            authorizedFetch(fetchProfile)
                .then(response => {
                    response.json()
                        .then(profile => {
                            if (isShowAuthSuccessNotification) {
                                NotificationUtils.showNotification('Вход выполнен успешно', NotificationUtils.SUCCESS)
                            }
                            updateUI(viewHolder, new User(profile.imgUrl))
                        })
                        .catch(e => {
                            // Если вдруг запрос профиля или сеть икнул[а], то с одной стороны у нас в localStorage валидные токены, а с другой, пользователь на UI не понимает авторизован ли он
                            // Для простоты разлогиниваю его, чтобы ui и логика были консистентными.
                            // Альтернативно можно было бы конечно просто дефолтную иконку профиля рисовать, НО, по мере увеличения профиля всё сломается.
                            // Не откуда будет взять никнейм и т.д. Поэтому проще разлогинивать.
                            authHelper.onLogout()
                            showProfileDeletedNotificationIfNeed()
                            console.error(e)
                        })
                })
                .catch(e => onError(e))
                .finally(() => {
                    viewHolder.setLoading(false)
                    console.log("End auth.")
                })
        })
        .catch(e => {
            if (e instanceof CodeExchangeError) {
                NotificationUtils.showNotification('Ошибка при входе', NotificationUtils.ERROR)
            }
            onError(e)
        })
}

/**
 * @returns widget телеграма для входа.
 */
function buildTelegram() {
    const script = document.createElement('script');

    LoaderUtils.show()
    script.onload = () => LoaderUtils.hide()
    script.onerror = () => LoaderUtils.hide()

    script.async = true;
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute("data-telegram-login", "hw_time_guild_auth_bot");
    script.setAttribute("data-size", "medium");
    script.setAttribute("data-auth-url", `${BASE_URL}/v1/tg_auth`);
    return script
}

/**
 * @param isNeed флаг, сохраняемый в localStorage при true, иначе удаляется из него. Определяет нужно ли показывать нотификашку об удалении аккаунта.
 */
function setProfileDeletedNotificationNeed(isNeed = false) {
    const key = 'isProfileDeletedNotification'
    if (isNeed) {
        localStorage.setItem(key, 'true')
    } else {
        localStorage.removeItem(key)
    }
}

/**
 * Единожды показывает нотификашку о том, что аккаунт удалён.
 */
function showProfileDeletedNotificationIfNeed() {
    if (localStorage.getItem('isProfileDeletedNotification') === 'true') {
        NotificationUtils.showNotification('Аккаунт удалён', NotificationUtils.SUCCESS)
        setProfileDeletedNotificationNeed(false)
    }
}

/**
 * @returns true, если нужно показать нотификацию об успешной аутентификации, иначе false.
 */
async function processCodeExchange() {
    const error = authHelper.getCodeError()
    if (error) {
        authHelper.removeCode()
        throw new CodeExchangeError()
    }
    const code = authHelper.getCode()
    if (!code) {
        authHelper.removeCode()
        return false
    }
    try {
        LoaderUtils.show()
        const response = await fetchTokensByCode(code)
        const { accessToken, refreshToken } = await response.json()
        authHelper.setAccessToken(accessToken)
        authHelper.setRefreshToken(refreshToken)
        return true
    } catch (e) {
        console.error(`on exchange code was error: ${e}`)
        throw new CodeExchangeError()
    } finally {
        LoaderUtils.hide()
        authHelper.removeCode()
    }
}
