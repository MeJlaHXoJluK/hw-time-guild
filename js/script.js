import { featureToggles } from './feature_toggles.js';
import { NotificationUtils } from './utils.js'

class App {
    constructor() {
        this.state = {
            activeTab: 'schemes',
            isEditMode: false,
            players: [],
            sortBy: {field: null, direction: 'asc'},
            currentEditIndex: -1
        };
        this.init();
    }

    init() {
        this.initTabs();
        this.initPlayersTable();
        this.initLightbox();
        this.initModal();
        this.initNotifications();
        this.loadPlayersData();
        featureToggles.forEach(toggle => toggle.invoke());
    }

    // ===== TABS =====
    initTabs() {
        const tabs = document.querySelectorAll('.tab[data-target]');
        const sections = document.querySelectorAll('.content-section');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.target;
                if (target === this.state.activeTab) return;
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                sections.forEach(sec => {
                    sec.classList.remove('active');
                    if (sec.id === target) {
                        sec.classList.add('active');
                    }
                });
                this.state.activeTab = target;
            });
        });
    }

    // ===== PLAYERS TABLE =====
    initPlayersTable() {
        this.initSorting();
        this.initEditMode();
        this.initAddPlayer();
        this.initFormSubmit();
    }

    initSorting() {
        const headers = document.querySelectorAll('#playersTable th[data-sort]');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const field = header.dataset.sort;
                if (this.state.sortBy.field === field) {
                    this.state.sortBy.direction = this.state.sortBy.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    this.state.sortBy.field = field;
                    this.state.sortBy.direction = 'asc';
                }
                this.sortPlayers();
                this.renderPlayersTable();
            });
        });
    }

    sortPlayers() {
        if (!this.state.sortBy.field) return;
        this.state.players.sort((a, b) => {
            const aValue = a[this.state.sortBy.field] || '';
            const bValue = b[this.state.sortBy.field] || '';
            let result = 0;
            if (this.state.sortBy.field === 'maxLevel') {
                result = this.compareLevels(aValue, bValue);
            } else {
                result = aValue.toString().localeCompare(bValue.toString());
            }
            return this.state.sortBy.direction === 'asc' ? result : -result;
        });
    }

    compareLevels(a, b) {
        const getNumericValue = (level) => {
            if (!level || level === '?') return -1;
            const match = level.match(/(\d+(?:\.\d+)?)/);
            return match ? parseFloat(match[1]) : -1;
        };
        return getNumericValue(a) - getNumericValue(b);
    }

    initEditMode() {
        const editBtn = document.getElementById('editModeBtn');
        const addBtn = document.getElementById('addPlayerBtn');
        const actionsColumn = document.querySelector('.actions-column');
        editBtn.addEventListener('click', () => {
            this.state.isEditMode = !this.state.isEditMode;
            if (this.state.isEditMode) {
                editBtn.textContent = '❌ Выйти из режима редактирования';
                editBtn.classList.remove('button--secondary');
                addBtn.style.display = 'inline-flex';
                actionsColumn.style.display = 'table-cell';
                document.querySelectorAll('.actions-column').forEach(cell => {
                    cell.style.display = 'table-cell';
                });
            } else {
                editBtn.textContent = '✏️ Режим редактирования';
                editBtn.classList.add('button--secondary');
                addBtn.style.display = 'none';
                actionsColumn.style.display = 'none';
                document.querySelectorAll('.actions-column').forEach(cell => {
                    cell.style.display = 'none';
                });
            }
        });
    }

    initAddPlayer() {
        const addBtn = document.getElementById('addPlayerBtn');
        const modal = document.getElementById('playerModal');
        const cancelBtn = document.getElementById('cancelBtn');
        addBtn.addEventListener('click', () => {
            this.state.currentEditIndex = -1;
            document.getElementById('modalTitle').textContent = 'Добавить игрока';
            document.getElementById('playerForm').reset();
            modal.style.display = 'flex';
        });
        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    initFormSubmit() {
        const form = document.getElementById('playerForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nick = document.getElementById('nick').value.trim();
            const maxLevel = document.getElementById('maxLevel').value.trim() || '?';
            const withGreat = document.getElementById('withGreat').value;
            const role = document.getElementById('role').value.trim() || 'Участник';
            const status = document.getElementById('status').value.trim() || 'Активен';
            const timezone = document.getElementById('timezone').value.trim() || '';
            const activeHours = document.getElementById('activeHours').value.trim() || '';
            const classField = document.getElementById('class').value.trim() || '';
            const telegram = document.getElementById('telegram').value.trim() || '';
            const comment = document.getElementById('comment').value.trim() || '';
            if (!nick) {
                NotificationUtils.showNotification('Ник не может быть пустым', NotificationUtils.ERROR);
                return;
            }
            const player = {
                nick,
                maxLevel,
                withGreat,
                role,
                status,
                timezone,
                activeHours,
                class: classField,
                telegram,
                comment
            };
            if (this.state.currentEditIndex === -1) {
                this.state.players.push(player);
                NotificationUtils.showNotification('Игрок добавлен', NotificationUtils.SUCCESS);
            } else {
                this.state.players[this.state.currentEditIndex] = player;
                NotificationUtils.showNotification('Данные игрока обновлены', NotificationUtils.SUCCESS);
            }
            this.savePlayersData();
            this.renderPlayersTable();
            document.getElementById('playerModal').style.display = 'none';
            form.reset();
        });
    }

    editPlayer(index) {
        this.state.currentEditIndex = index;
        const player = this.state.players[index];
        document.getElementById('modalTitle').textContent = 'Редактировать игрока';
        document.getElementById('nick').value = player.nick || '';
        document.getElementById('maxLevel').value = player.maxLevel || '?';
        document.getElementById('withGreat').value = player.withGreat || '?';
        document.getElementById('role').value = player.role || 'Участник';
        document.getElementById('status').value = player.status || 'Активен';
        document.getElementById('timezone').value = player.timezone || '';
        document.getElementById('activeHours').value = player.activeHours || '';
        document.getElementById('class').value = player.class || '';
        document.getElementById('telegram').value = player.telegram || '';
        document.getElementById('comment').value = player.comment || '';
        document.getElementById('playerModal').style.display = 'flex';
    }

    deletePlayer(index) {
        if (confirm('Удалить этого игрока?')) {
            this.state.players.splice(index, 1);
            this.savePlayersData();
            this.renderPlayersTable();
            NotificationUtils.showNotification('Игрок удален', NotificationUtils.SUCCESS);
        }
    }

    getLevelClass(level) {
        if (!level || level === '?') return 'level-unknown';
        if (level.includes('13.12')) return 'level-13-12';
        if (level.includes('13') || level.includes('12')) return 'level-12-13';
        return 'level-low';
    }

    getStatusClass(status) {
        if (!status) return 'status-unknown';
        const statusLower = status.toLowerCase();
        if (statusLower.includes('актив')) return 'status-active';
        if (statusLower.includes('отпуск')) return 'status-vacation';
        if (statusLower.includes('неактив')) return 'status-inactive';
        if (statusLower.includes('недоступ')) return 'status-inactive';
        return 'status-unknown';
    }

    renderPlayersTable() {
        const tbody = document.getElementById('playersTableBody');
        tbody.innerHTML = '';
        this.state.players.forEach((player, index) => {
            const row = document.createElement('tr');
            // Номер
            const tdNumber = document.createElement('td');
            tdNumber.textContent = index + 1;
            tdNumber.className = 'table-number';
            row.appendChild(tdNumber);
            // Ник
            const tdNick = document.createElement('td');
            tdNick.textContent = player.nick || '-';
            row.appendChild(tdNick);
            // Макс. уровень
            const tdLevel = document.createElement('td');
            tdLevel.textContent = player.maxLevel || '?';
            tdLevel.className = this.getLevelClass(player.maxLevel);
            row.appendChild(tdLevel);
            // С Великим
            const tdGreat = document.createElement('td');
            let greatText = '❓';
            if (player.withGreat === '+') greatText = '✅';
            if (player.withGreat === '-') greatText = '❌';
            tdGreat.textContent = greatText;
            row.appendChild(tdGreat);
            // Роль
            const tdRole = document.createElement('td');
            tdRole.textContent = player.role || 'Участник';
            row.appendChild(tdRole);
            // Статус
            const tdStatus = document.createElement('td');
            const statusValue = player.status || 'Активен';
            tdStatus.textContent = statusValue;
            tdStatus.className = this.getStatusClass(statusValue);
            row.appendChild(tdStatus);
            // Часовой пояс
            const tdTimezone = document.createElement('td');
            tdTimezone.textContent = player.timezone || '-';
            row.appendChild(tdTimezone);
            // Время активности
            const tdActiveHours = document.createElement('td');
            tdActiveHours.textContent = player.activeHours || '-';
            row.appendChild(tdActiveHours);
            // Класс
            const tdClass = document.createElement('td');
            tdClass.textContent = player.class || '-';
            row.appendChild(tdClass);
            // Telegram
            const tdTelegram = document.createElement('td');
            if (player.telegram) {
                const telegramLink = document.createElement('a');
                telegramLink.href = player.telegram.startsWith('http') ? player.telegram : `https://t.me/${player.telegram.replace('@', '')}`;
                telegramLink.target = '_blank';
                telegramLink.rel = 'noopener noreferrer';
                telegramLink.textContent = player.telegram;
                telegramLink.className = 'telegram-link';
                tdTelegram.appendChild(telegramLink);
            } else {
                tdTelegram.textContent = '-';
            }
            row.appendChild(tdTelegram);
            // Комментарий
            const tdComment = document.createElement('td');
            const commentText = player.comment || '-';
            tdComment.textContent = commentText.length > 30 ? commentText.substring(0, 27) + '...' : commentText;
            tdComment.title = commentText;
            tdComment.className = 'table-comment';
            row.appendChild(tdComment);
            // Действия
            const tdActions = document.createElement('td');
            tdActions.className = 'actions-column';
            tdActions.style.display = this.state.isEditMode ? 'table-cell' : 'none';
            const editBtn = document.createElement('button');
            editBtn.textContent = '✏️';
            editBtn.className = 'action-btn edit-btn';
            editBtn.title = 'Редактировать';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editPlayer(index);
            });
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️';
            deleteBtn.className = 'action-btn delete-btn';
            deleteBtn.title = 'Удалить';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deletePlayer(index);
            });
            tdActions.appendChild(editBtn);
            tdActions.appendChild(deleteBtn);
            row.appendChild(tdActions);
            tbody.appendChild(row);
        });
    }

    // ===== DATA PERSISTENCE =====
    savePlayersData() {
        try {
            const data = {
                players: this.state.players,
                lastUpdate: new Date().toISOString()
            };
            localStorage.setItem('hw_guild_players', JSON.stringify(data));
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
            NotificationUtils.showNotification('Ошибка сохранения данных', NotificationUtils.ERROR);
        }
    }

    loadPlayersData() {
        try {
            const saved = localStorage.getItem('hw_guild_players');
            if (saved) {
                const data = JSON.parse(saved);
                this.state.players = data.players || [];
            } else {
                this.state.players = window.initialPlayers || [];
                this.savePlayersData();
            }
            this.renderPlayersTable();
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            NotificationUtils.showNotification('Ошибка загрузки данных', NotificationUtils.ERROR);
        }
    }

    // ===== LIGHTBOX =====
    initLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImage = lightbox.querySelector('img');
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG' && e.target.closest('.item')) {
                lightboxImage.src = e.target.src;
                lightbox.style.display = 'flex';
                this.resetZoom();
            }
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.style.display === 'flex') {
                lightbox.style.display = 'none';
            }
        });
        let scale = 1;
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let translateX = 0;
        let translateY = 0;

        function applyTransform() {
            lightboxImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        }

        this.resetZoom = function () {
            scale = 1;
            translateX = 0;
            translateY = 0;
            applyTransform();
            lightboxImage.style.cursor = 'zoom-in';
        };
        lightboxImage.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 0.1;
            const direction = e.deltaY > 0 ? -1 : 1;
            scale += direction * zoomSpeed;
            scale = Math.max(1, Math.min(5, scale));
            if (scale === 1) {
                translateX = 0;
                translateY = 0;
                lightboxImage.style.cursor = 'zoom-in';
            } else {
                lightboxImage.style.cursor = 'grab';
            }
            applyTransform();
        }, {passive: false});
        lightboxImage.addEventListener('mousedown', (e) => {
            if (scale === 1) return;
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            lightboxImage.style.cursor = 'grabbing';
            e.preventDefault();
        });
        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            applyTransform();
        });
        window.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            if (scale > 1) {
                lightboxImage.style.cursor = 'grab';
            }
        });
    }

    // ===== MODAL =====
    initModal() {
        const modal = document.getElementById('playerModal');
        const closeBtn = modal.querySelector('.close');
        const cancelBtn = document.getElementById('cancelBtn');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                modal.style.display = 'none';
            }
        });
    }

    // ===== NOTIFICATIONS =====
    initNotifications() {
        if (!document.querySelector('.notifications-container')) {
            const container = document.createElement('div');
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }
    }

    /**
     * Нужен, чтобы из консоли разраба включать фичи.
     * @returns список фича тогглов. Доступ к тоглу по индексу в списке.
     */
    getFeatureToggles() {
        return featureToggles
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});