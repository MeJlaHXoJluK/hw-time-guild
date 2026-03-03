import { NotificationUtils, LoaderUtils, ModalUtils, DivButtonUtils, StringUtils, ThemeUtils, refreshPage } from './utils.js'
import { TokenHelper, BASE_URL } from './api.js'
import {
    UserRepository,
    UnknownUser,
    User,
    LogoutError,
    CodeExchangeError,
    ProfileUnavailable
} from './data.js'

const authState = {
    user: null
}

class ProfileViewHolder {

    static _defaultProfileIconNight = './images/ic_person_night.svg'
    static _defaultProfileIconDay = './images/ic_person_day.svg'

    constructor() {
        this.container = document.getElementById('profile-container')
        this.text = document.getElementById('profile-text')
        this.icon = document.getElementById('profile-icon')

        this.loadingClass = 'loading'

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

        this.icon.src = imgUrl != null ? imgUrl : (isAuth ? ProfileViewHolder.getDefaultPersonIcon(ThemeUtils.isDarkTheme()) : this.getDefaultLoginIcon(ThemeUtils.isDarkTheme()))
    }

    setProfileClickListener(listener = null) {
        this._containerClickListener = listener
    }

    onThemeChange(isDark) {
        if (this.isDefaultProfileIcon(this.icon.src)) {
            this.setIcon(ProfileViewHolder.getDefaultPersonIcon(isDark))
        } else if (this.isDefaultLoginIcon(this.icon.src)) {
            this.setIcon(this.getDefaultLoginIcon(isDark))
        }
    }

    static getDefaultPersonIcon(isDark) {
        return isDark ? this._defaultProfileIconNight : this._defaultProfileIconDay
    }

    getDefaultLoginIcon(isDark) {
        return isDark ? this._defaultLoginIconNight : this._defaultLoginIconDay
    }

    isDefaultProfileIcon(url) {
        return StringUtils.stringIncludeSafely(url, ProfileViewHolder._defaultProfileIconNight?.slice(1)) || StringUtils.stringIncludeSafely(url, ProfileViewHolder._defaultProfileIconDay?.slice(1))
    }

    isDefaultLoginIcon(url) {
        return StringUtils.stringIncludeSafely(url, this._defaultLoginIconNight?.slice(1)) || StringUtils.stringIncludeSafely(url, this._defaultLoginIconDay?.slice(1))
    }
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
                buildAvatar(),
                ModalUtils.buildTitle(`Действия над профилем ${user.name}:`),
                ModalUtils.buildButton('Выйти', 'button--primary', () => {
                    TokenHelper.onLogout(true)
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
                            UserRepository.deleteProfile()
                                .then(() => {
                                    setProfileDeletedNotificationNeed(true)
                                    TokenHelper.onLogout(true)
                                })
                                .catch(e => {
                                    NotificationUtils.showNotification(e.message, NotificationUtils.ERROR)
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
                }),
                buildUploadAvatarBtn(),
            )
            ModalUtils.show(logoutModal)
        }
    }
    viewHolder.setText(text)
    viewHolder.setIcon(icon, isAuth)
    viewHolder.setProfileClickListener(clickListener)
}

/**
 * Точка входа. Срабатывает на каждую перезагрузку страницы и либо получает профиль, либо устанавливает состояние разлогина.
 */
export function initAuth(onLogin) {
    console.log("Begin auth ...")

    const viewHolder = new ProfileViewHolder()

    TokenHelper.setOnLogoutListener(() => updateUI(viewHolder, new UnknownUser()))

    runAuthentication(viewHolder, onLogin)
        .then(() => console.log("Auth end success"))
        .catch(e => console.error(`Auth end with error: ${e}`))
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
 * @param onUserCheck колбек, принимающий выбранный name неиспользуемого профиля.
 * @returns Виджет с подсказками неиспользуемых профилей, доступных к выбору при создании профиля. Если подсказок нет - null.
 */
async function buildUnusedProfilesRow(onUserCheck) {
    const profiles = await UserRepository.getUnusedProfiles()
    if (!profiles) {
        return null
    }

    const row = document.createElement('div')

    let isDown = false;
    let startX;
    let scrollLeft;

    row.addEventListener("mousedown", (e) => {
        isDown = true;
        row.style.cursor = "auto";
        startX = e.pageX - row.offsetLeft;
        scrollLeft = row.scrollLeft;
    });

    row.addEventListener("mouseleave", () => {
        isDown = false;
        row.style.cursor = "auto";
    });

    row.addEventListener("mouseup", () => {
        isDown = false;
        row.style.cursor = "auto";
    });

    row.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();

        const x = e.pageX - row.offsetLeft;
        const speed = (x - startX) * 1.5;
        row.scrollLeft = scrollLeft - speed;
    });

    row.className = 'profiles-row'

    const chips = profiles.map(profile => {
        const profileChip = document.createElement('div')
        profileChip.className = 'profile-chip'
        profileChip.textContent = profile.name
        profileChip.addEventListener('click', () => {
            chips.forEach(chip => {
                setActiveClass(chip, chip.textContent === profile.name)
            })
            row.prepend(profileChip)
            row.scrollTo({ left: 0, behavior: 'smooth' })
            onUserCheck(profile.name)
        })
        return profileChip
    })
    row.append(...chips)
    return row
}

/**
 * @param onTextChanged слушатель ввода.
 * @returns виджет поля ввода.
 */
function buildUserInput(onTextChanged) {
    const input = document.createElement('input')
    input.type = 'text'
    input.placeholder = 'Введите игровой никнейм'
    input.className = 'profile-input'
    input.style.marginTop = '16px'

    input.addEventListener('input', e => {
        onTextChanged(e.target.value)
    })
    input.addEventListener('focus', () => setErrorClass(input, false))
    return input
}

/**
 * @return view с аватаром пользователя
 */
function buildAvatar() {
    const container = document.createElement('div')
    container.className = 'container-avatar'
    const imageContainer = document.createElement('div')
    imageContainer.className = 'avatar'
    imageContainer.style.display = 'none'
    const image = document.createElement('img')

    const skeletonClass = 'skeleton'
    image.classList.add(skeletonClass)
    image.onload = () => {
        image.classList.remove(skeletonClass)
        imageContainer.style.display = 'block'
    }
    image.onerror = () => image.classList.remove(skeletonClass)

    image.src = authState.user?.imgUrl ? authState.user.imgUrl : ProfileViewHolder.getDefaultPersonIcon(ThemeUtils.isDarkTheme())
    image.alt = 'Аватар пользователя'
    imageContainer.appendChild(image)
    container.appendChild(imageContainer)
    return container
}

/**
 * @return Кнопку загрузки аватара.
 */
function buildUploadAvatarBtn() {
    const button = document.createElement('div')
    button.classList.add('button--primary', 'button')
    button.textContent = 'Загрузить аватар'

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg, image/png'
    input.hidden = true

    input.addEventListener('change', () => {
        const file = input.files[0]
        if (file) {
            LoaderUtils.show()
            UserRepository.uploadAvatar(file)
                .then(() => refreshPage())
                .catch(e => {
                    console.error(e)
                    NotificationUtils.showNotification(e.message, NotificationUtils.ERROR)
                })
                .finally(() => LoaderUtils.hide())
        }
    })

    button.addEventListener('click', () => {
        input.click()
    })

    button.appendChild(input)
    return button
}

/**
 * Окно создания профиля нового пользователя
 * @param onProfileReceived колбек принимающий User в случае успешного создания профиля.
 */
async function showProfileCreate(onProfileReceived, onProfileFailed) {
    // todo: какая-то дизайн-система простенькая нужна.
    const onModalClose = () => {
        if (!authState.user) {
            TokenHelper.onLogout(true)
        }
    }
    const modal = ModalUtils.buildModal(onModalClose)
    const closeModal = () => ModalUtils.close(modal, onModalClose)

    try {
        LoaderUtils.show()

        let profileDraft = null

        let usersRow
        let userInput
        let profileCreateBtn

        const onDocumentEnterClick = (e) => {
            if (profileCreateBtn && e.key === "Enter" && !DivButtonUtils.isDisabled(profileCreateBtn)) {
                e.preventDefault()
                onProfileCreateClick()
            }
        }

        const onProfileCreateFailed = () => {
            NotificationUtils.showNotification('Не удалось создать профиль', NotificationUtils.ERROR)
            onProfileFailed()
            closeModal()
        }

        const onProfileCreateClick = () => {
            if (profileCreateBtn && userInput && StringUtils.isNullOrBlank(userInput.value)) {
                DivButtonUtils.setDisable(profileCreateBtn, true) // так как ввод слушается с задержкой, то можно наткнуться на этот кейс. Удалять debounce НИЗЯ! Так оптимизированее малёха :)
                return
            }
            LoaderUtils.show()
            userInput?.blur()
            DivButtonUtils.setDisable(profileCreateBtn, true) // Чтобы единожды выполнилось
            UserRepository.createProfile(profileDraft)
                .then(user => {
                    LoaderUtils.hide()
                    document.removeEventListener('keypress', onDocumentEnterClick)
                    onProfileReceived(user)
                    closeModal()
                })
                .catch(e => {
                    console.error(e)
                    LoaderUtils.hide()
                    if (e instanceof ProfileUnavailable) {
                        NotificationUtils.showNotification('Профиль занят', NotificationUtils.ERROR)
                        setErrorClass(userInput)
                        DivButtonUtils.setDisable(profileCreateBtn, StringUtils.isNullOrBlank(profileDraft))
                    } else {
                        onProfileCreateFailed()
                    }
                })
        }

        const onProfileDraftChange = name => {
            profileDraft = name
            if (profileCreateBtn) {
                DivButtonUtils.setDisable(profileCreateBtn, StringUtils.isNullOrBlank(profileDraft))
            }
        }

        profileCreateBtn = ModalUtils.buildButton('Войти', 'button--primary', onProfileCreateClick)
        DivButtonUtils.setDisable(profileCreateBtn, true)

        usersRow = await buildUnusedProfilesRow(name => {
            onProfileDraftChange(name)
            if (userInput) {
                userInput.value = name
            }
        })
        userInput = buildUserInput(debounce(name => {
            onProfileDraftChange(name)
            if (usersRow) {
                Array.from(usersRow.children).forEach(child => {
                    const isActive = child.textContent === name
                    setActiveClass(child, isActive)
                    if (isActive) {
                        usersRow.prepend(child)
                        usersRow.scrollTo({ left: 0, behavior: 'smooth' })
                    }
                })
            }
        }))

        document.addEventListener("keypress", onDocumentEnterClick);

        const elements = [
            ModalUtils.buildClose(() => closeModal()),
            ModalUtils.buildTitle('Пожалуйста назовитесь'),
            usersRow,
            userInput,
            profileCreateBtn,
        ].filter(item => item != null)

        ModalUtils.addContent(
            modal,
            ...elements
        )
        ModalUtils.show(modal)
    } catch (e) {
        closeModal()
    } finally {
        LoaderUtils.hide()
    }
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
 * Сценарий аутентификации.
 * @param viewHolder сущность для управления UI частью профиля.
 */
async function runAuthentication(viewHolder, onLogin) {
    try {
        viewHolder.setLoading(true) // со старта сценария аутентификации показать скелетоны на профиле
        const code = UserRepository.getCodeFromLocalStorage()

        let isShowAuthSuccessNotification = false
        let isNewUser = false

        if (code) {
            LoaderUtils.show()
            isNewUser = await UserRepository.processCodeExchange(code)
            isShowAuthSuccessNotification = true
        }

        const onProfileReceived = profile => {
            updateUI(viewHolder, profile)
            if (isShowAuthSuccessNotification) {
                NotificationUtils.showNotification('Вход выполнен успешно', NotificationUtils.SUCCESS)
            }
            onLogin()
        }

        let profile = null
        if (!isNewUser) {
            profile = await UserRepository.getProfile()
            isNewUser = !profile.hasProfile
        }

        if (isNewUser) {
            LoaderUtils.hide()
            await showProfileCreate(
                user => {
                    authState.user = user
                    onProfileReceived(user)
                },
                () => {
                TokenHelper.onLogout()
                viewHolder.setLoading(false)
            })
        } else {
            authState.user = new User(profile.imgUrl, profile.name)
            onProfileReceived(authState.user)
        }
    } catch (e) {
        if (e instanceof CodeExchangeError) {
            NotificationUtils.showNotification('Ошибка при входе', NotificationUtils.ERROR)
        }
        if (e instanceof LogoutError) {
            // Если вдруг запрос профиля или сеть икнул[а], то с одной стороны у нас в localStorage валидные токены, а с другой, пользователь на UI не понимает авторизован ли он
            // Для простоты разлогиниваю его, чтобы ui и логика были консистентными.
            // Альтернативно можно было бы конечно просто дефолтную иконку профиля рисовать, НО, по мере увеличения профиля всё сломается.
            // Не откуда будет взять никнейм и т.д. Поэтому проще разлогинивать.
            TokenHelper.onLogout()
            throw e // нет смысла обновлять UI ниже, он на logout итак обновится
        }
        updateUI(viewHolder, new UnknownUser())
        throw e
    } finally {
        TokenHelper.removeCode()
        LoaderUtils.hide()
        viewHolder.setLoading(false)
        showProfileDeletedNotificationIfNeed()
    }
}

function debounce(fn, delay = 300) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    }
}

function setActiveClass(element, isActive = true) {
    const activeClass = 'active'
    if (isActive) {
        if (!element.classList.contains(activeClass)) {
            element.classList.add(activeClass)
        }
    } else {
        element.classList.remove(activeClass)
    }
}

function setErrorClass(element, isError = true) {
    const errorClass = 'error'
    if (isError && !element.classList.contains(errorClass)) {
        element.classList.add(errorClass)
    } else {
        element.classList.remove(errorClass)
    }
}
