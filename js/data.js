import { UserApi, authorizedFetch, TokenHelper } from './api.js'

export class BaseUser {

    constructor() {
    }
}

export class UnknownUser extends BaseUser {

    constructor() {
        super();
    }
}

export class User extends BaseUser {
    imgUrl = null
    name = null

    constructor(imgUrl = null, name = null) {
        super();
        this.imgUrl = imgUrl
        this.name = name
    }
}

export class LogoutError extends Error {
    constructor() {
        super('Сценарий аутентификации не может быть продолжен');
    }
}

export class ProfileUnavailable extends Error {
    constructor(message = 'Профиль недоступен') {
        super(message);
    }
}

export class CodeExchangeError extends Error {
    constructor() {
        super('Ошибка обмена кода');
    }
}

export class UserRepository {
    constructor() {}

    /**
     * @return code из localStorage
     * @throws CodeExchangeError если вместо кода записана ошибка от бекенда в localStorage
     */
    static getCodeFromLocalStorage() {
        const error = TokenHelper.getCodeError()
        if (error) {
            throw new CodeExchangeError()
        }
        return TokenHelper.getCode()
    }

    /**
     * @returns профиль пользователя.
     * @throws LogoutError при ошибке получения профиля.
     */
    static async getProfile() {
        try {
            const response = await authorizedFetch(UserApi.fetchProfile)
            if (response.status !== 200) {
                throw new LogoutError()
            }
            return await response.json()
        } catch (e) {
            console.error(e)
            throw new LogoutError()
        }
    }

    /**
     * @returns Список свободных профилей, если удалось получить, иначе null. "Свободных" - это значит известных бекенду и не связанных с каким-то тг аккаунтом.
     * Используется как список подсказок никнейма при создании профиля.
     */
    static async getUnusedProfiles() {
        try {
            const response = await authorizedFetch(UserApi.fetchUnusedProfiles)
            const body = await response.json()
            if (response.status !== 200) {
                throw new Error(body.message)
            }
            if (!body.profiles || body.profiles.length === 0) {
                throw new Error('Список профилей пуст')
            }
            return body.profiles
        } catch (e) {
            console.error(e)
            return null
        }
    }

    /**
     * @returns Список всех профилей для таблицы, иначе null.
     */
    static async getAllProfiles(controller) {
        try {
            const response = await authorizedFetch(async token => {
                return await UserApi.fetchAllProfiles(token, controller)
            })
            if (response.status !== 200) {
                throw new Error(`Ошибка с сервера при получении всех профилей: ${response.status}`)
            }
            const body = await response.json()
            if (!body.profiles || body.profiles.length === 0) {
                throw new Error('Профилей не пришли или их нет')
            }
            return body.profiles
        } catch (e) {
            console.error(e)
            return null
        }
    }

    /**
     * @param profileDraft имя профиля.
     * @return User, если профиль создан успешно.
     * @throws Error | ProfileUnavailable
     */
    static async createProfile(profileDraft) {
        try {
            const response = await authorizedFetch(async token => {
                return await UserApi.createProfile(token, profileDraft)
            })
            if (response.status !== 200) {
                throw new Error(`Профиль ${profileDraft} не создан! Код ответа api: ${response.status}`)
            }
            const body = await response.json()
            if (!body.isSuccess) {
                throw new ProfileUnavailable('Профиль занят другим пользователем')
            }
            return new User(body.imgUrl, body.name)
        } catch (e) {
            console.error(e)
            throw e
        }
    }

    /**
     * @throws Error если не удалось удалить профиль
     */
    static async deleteProfile() {
        try {
            const response = await authorizedFetch(UserApi.deleteProfile)
            if (response.status !== 200) {
                throw new Error('Ошибка! Возможно проблема на сервере')
            }
        } catch (e) {
            console.error(e)
            throw e
        }
    }

    /**
     * @param file аватар профиля в формате jpeg/png.
     * @throws Error если не удалось загрузить аватар профиля.
     */
    static async uploadAvatar(file) {
        try {
            const response = await authorizedFetch(async token => {
                return await UserApi.uploadAvatar(token, file)
            })
            if (response.status !== 200) {
                throw new Error('Что-то не так на сервере после отправки файла')
            }
        } catch (e) {
            console.error(e)
            throw e
        }
    }

    /**
     * @param code код для обмена на токены. Бекенд присылает при авторизации через телеграм с redirect-ом.
     * @returns true если пользователь новый, иначе false.
     * @throws CodeExchangeError в случае ошибки бека | Error при записи токенов.
     */
    static async processCodeExchange(code) {
        try {
            const response = await UserApi.fetchTokensByCode(code)
            const { accessToken, refreshToken, isNew } = await response.json()
            TokenHelper.setAccessToken(accessToken)
            TokenHelper.setRefreshToken(refreshToken)
            return isNew
        } catch (e) {
            console.error(`on exchange code was error: ${e}`)
            throw new CodeExchangeError()
        }
    }
}
