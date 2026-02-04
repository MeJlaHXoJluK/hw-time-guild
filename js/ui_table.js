/*
todo: Надо было добавить ключи API в таблицу, что бы как только игрок прошел приклу уровнем выше. Информация в таблице изменилась)))))
Автор: ЦАРЬ
*/


// Табличку из кода создаём
class PlayerRow {
    constructor(nick, maxLevel, withGreat) {
        this.nick = String(nick);
        this.maxLevel = String(maxLevel);
        this.withGreat = String(withGreat);
    }
}

const players = [
    new PlayerRow('ЦАРЬ', '12', '+'),
    new PlayerRow('Марс', 'от 9?', '?'),
    new PlayerRow('AND-XXX', 'от 11?', '?'),
    new PlayerRow('Respect J.J.', '12', '-'),
    new PlayerRow('Тупо Бот', '10', '-'),
    new PlayerRow('Kring12', '13.12', '+'),
    new PlayerRow('юра', '10?', '?'),
    new PlayerRow('Integra', '11?', '?'),
    new PlayerRow('ABAKAN', '11?', '?'),
    new PlayerRow('ALEX', '11?', '?'),
    new PlayerRow('Tausida', '13.12', '+'),
    new PlayerRow('Гала', '10?', '?'),
    new PlayerRow('Neomaster', '12?', '-'),
    new PlayerRow('Январь', '13.12', '+'),
    new PlayerRow('Team Raymond', '?', '?'),
    new PlayerRow('Team A', '13.12', '+'),
    new PlayerRow('Галахад', '13.12', '+?'),
    new PlayerRow('DaHyHax', '13.12', '+'),
    new PlayerRow('Kagakora', '13.12', '+'),
    new PlayerRow('FamilyWarriors', '?', '?'),
    new PlayerRow('Перфекционист', '13.12', '+'),
    new PlayerRow('Blagodatnyj', '?', '?'),
    new PlayerRow('Олег', '10?', '?'),
    new PlayerRow('тан сан', '?', '?'),
    new PlayerRow('Pulpo', '?', '?'),
    new PlayerRow('Skit Skit Bang', '?', '?'),
    new PlayerRow('Team HICHBLACK', '?', '?'),
];

function createPlayersTable(players) {
    const table = document.createElement('table');

    // Заголовок
    const headerRow = document.createElement('tr');
    ['Ник', 'Максимальный номер приклы', 'С Великим']
        .forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });

    table.appendChild(headerRow);

    // Данные
    players.forEach(player => {
        const tr = document.createElement('tr');

        const tdNick = document.createElement('td');
        tdNick.textContent = player.nick;

        const tdMax = document.createElement('td');
        tdMax.textContent = player.maxLevel;

        const tdGreat = document.createElement('td');
        tdGreat.textContent = player.withGreat;

        tr.append(tdNick, tdMax, tdGreat);
        table.appendChild(tr);
    });

    return table;
}

function createPlayersModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'playersModal';

    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.width = '90%';
    content.style.height = '90%';
    content.style.overflow = 'auto';

    const close = document.createElement('span');
    close.className = 'close';
    close.textContent = '×';

    const title = document.createElement('h2');
    title.textContent =
        'Кого звать в приклу? (Если видите в номере только знак вопроса — лучше через лс)';

    const table = createPlayersTable(players);

    content.append(close, title, table);
    modal.appendChild(content);
    document.body.appendChild(modal);
}

createPlayersModal(); // рисуем табличку

