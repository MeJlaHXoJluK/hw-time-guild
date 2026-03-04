
/**
 * =============================================================
 * ================== Базовый инструментарий ===================
 * =============================================================
 */

class FeatureToggle {

    constructor() {
        this._key = null;
    }

    invoke() {
        throw new Error("Не задано действие")
    }

    /**
     * Метод приводит к перезагрузке страницы!
     * В случае, когда тогл не включен, то хранить его не нужно, поэтому при isEnabled=false удаляется значение из localStorage.
     * @param isEnabled true включает фичу и сохраняет флаг в localStorage, иначе - выключает.
     */
    enable(isEnabled = false) {
        if (isEnabled === false) {
            localStorage.removeItem(this._key)
        } else {
            localStorage.setItem(this._key, `${isEnabled}`)
        }
        window.location.assign(window.location.href)
    }

    /**
     * @returns true, если тогл включен, иначе false.
     */
    isEnabled() {
        return localStorage.getItem(this._key) === 'true'
    }
}

/**
 * =============================================================
 * ================== Секция экспорта из модуля ================
 * =============================================================
 */

export const featureToggles = [];
