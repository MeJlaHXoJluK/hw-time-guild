/**
 * =================================================================
 * ========================= Раздел утилит для строк ===============
 * =================================================================
 */

class _StringUtils {

    constructor() {}

    getStringOrNull(string) {
        if (this.isNullOrBlank(string)) {
            return null
        }
        return String(string)
    }

    isNullOrBlank(...strings) {
        return strings.some(str => {
            return (typeof str) !== "string" || str.trim().length === 0
        })
    }

    stringIncludeSafely(string, subString) {
        if (string == null || (typeof string) !== 'string') {
            return false
        }
        if (subString == null || (typeof subString) !== 'string') {
            return false
        }
        return string.includes(subString)
    }
}

export const StringUtils = new _StringUtils()

/**
 * =================================================================
 * ========================= Раздел утилит для тем =================
 * =================================================================
 */

class _ThemeUtils {

    AUTO = 'auto'
    LIGHT = 'light'
    DARK = 'dark'

    constructor() {}

    /**
     * @returns true если установлена тёмная тема для сайта, иначе false. Учитывает значение выбранное для сайта пользователем. Если пользователь ничего не выбирал, используются настройки системы.
     */
    isDarkTheme() {
        const cachedTheme = localStorage.getItem('theme')
        return cachedTheme != null && cachedTheme !== 'auto' ? cachedTheme === 'dark' : this.isSystemDarkPrefer()
    }

    /**
     * @returns true если в системе установлено для режима день ночь значение 'авто', иначе false. Игнорирует значение выбранное для сайта.
     */
    isSystemDarkPrefer() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
}

export const ThemeUtils = new _ThemeUtils()

/**
 * =================================================================
 * ======================= Раздел тостов ===========================
 * =================================================================
 */

class _NotificationUtils {

    SUCCESS = 'success'
    ERROR = 'error'
    WARNING = 'warning'

    constructor() {}

    showNotification(message, type = this.WARNING) {
        const container = document.querySelector('.notifications-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        let icon = 'ℹ️';
        if (type === this.SUCCESS) icon = '✅';
        if (type === this.ERROR) icon = '❌';
        if (type === this.WARNING) icon = '⚠️';
        notification.innerHTML = `
      <span class="notification-icon">${icon}</span>
      <span class="notification-text">${message}</span>
    `;
        container.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

export const NotificationUtils = new _NotificationUtils()

/**
 * =================================================================
 * ======================= Раздел лоадера ==========================
 * =================================================================
 */

class _LoaderUtils {

    #name = 'loader'

    constructor() {}

    show() {
        this.getLoader().style.display = 'flex'
    }

    hide() {
        this.getLoader().style.display = 'none'
    }

    getLoader() {
        return document.getElementById(this.#name)
    }
}

export const LoaderUtils = new _LoaderUtils()

/**
 * =================================================================
 * ==================== Раздел модального окна =====================
 * =================================================================
 */
class _ModalUtils {

    #container = 'modal'
    #content = 'modal-content'
    #onClick = 'click'

    constructor() {}

    addContent(modal, ...elements) {
        this.#getContent(modal).append(...elements)
    }

    buildModal() {
        const modal = document.createElement('div')
        const modalContent = document.createElement('div')
        modal.className = this.#container
        modalContent.className = this.#content
        modal.appendChild(modalContent)
        modal.style.display = 'flex'

        modalContent.style.display = 'inline-grid'
        modalContent.style.alignItems = 'center'
        modalContent.style.gap = '18px'

        modal.addEventListener(this.#onClick, (e) => {
            if (e.target === modal) {
                this.close(modal)
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                this.close(modal)
            }
        });

        return modal
    }

    buildTitle(text) {
        const h2 = document.createElement('h2')
        h2.textContent = text
        h2.style.userSelect = 'none';
        return h2
    }

    buildClose(clickListener = () => {}) {
        const span = document.createElement('span')
        span.textContent = "\u00D7"
        span.className = 'close'
        span.addEventListener(this.#onClick, () => clickListener())
        return span
    }

    buildButton(text = '', buttonType = null, onClick = () => {}) {
        const button = document.createElement('div')
        button.textContent = text
        button.className = 'button'
        if (!StringUtils.isNullOrBlank(buttonType)) {
            button.classList.add(buttonType)
        }
        button.addEventListener(this.#onClick, () => onClick())
        return button
    }

    show(modal) {
        document.body.appendChild(modal)
    }

    close(modal) {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal)
        }
    }

    #getContent(modal) {
        return modal.firstElementChild
    }
}

export const ModalUtils = new _ModalUtils()

/**
 * =================================================================
 * ============ Раздел кнопок (div элементами сделанные) ===========
 * =================================================================
 */
class _DivButtonUtils {
    #disabledClass = 'disabled'

    constructor() {}

    isDisabled(element) {
        return element.classList.contains(this.#disabledClass)
    }

    setDisable(element, isDisable = true) {
        if (isDisable && !this.isDisabled(element)) {
            element.classList.add(this.#disabledClass)
        } else {
            element.classList.remove(this.#disabledClass)
        }
    }
}

export const DivButtonUtils = new _DivButtonUtils()
