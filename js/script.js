/// Вкладки
const tabs = document.querySelectorAll('.tab[data-target]');
const sections = document.querySelectorAll('.content-section');

// Модалка
const playersModal = document.getElementById('playersModal');
const closePlayersBtn = playersModal.querySelector('.close');

// Функция для активации вкладки по id
function activateTab(tabId) {
    tabs.forEach(t => t.classList.remove('active'));
    const tab = document.querySelector(`.tab[data-target="${tabId}"]`);
    if (tab) tab.classList.add('active');

    sections.forEach(sec => sec.classList.remove('active'));
    const section = document.getElementById(tabId);
    if (section) section.classList.add('active');
}

// Переключение вкладок по клику
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.target;

        if (target === 'players') {
            // Открываем модалку вместо показа контента
            playersModal.style.display = 'flex';
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        } else {
            // Обычное переключение на схемы
            activateTab(target);
        }
    });
});

// Закрытие модалки с возвратом на "Схемы"
function closePlayersModal() {
    playersModal.style.display = 'none';
    activateTab('schemes'); // переключаем на схемы
}

// Обработчики закрытия модалки
closePlayersBtn.addEventListener('click', closePlayersModal);
playersModal.addEventListener('click', e => {
    if(e.target === playersModal) closePlayersModal();
});
document.addEventListener('keydown', e => {
    if(e.key === 'Escape') closePlayersModal();
});
