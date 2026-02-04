class Color {
    constructor(value, name) {
        this.value = value;
        this.name = name;
    }
}

const blue = new Color('#03a9f4', 'синий');
const green = new Color('#8bc34a', 'зелёный' );
const yellow = new Color('#cddc39', 'жёлтый');
const orange = new Color('#ff9800', 'оранжевый') ;

class Player {
    constructor(path, color, name) {
        this.path = path;
        this.color = color.value;
        this.name = `${name} (${color.name})`;
    }
}

class FirstPlayer extends Player {
    constructor(path, color = blue, name = 'Игрок 1') {
        super(path, color, name);
    }
}

class SecondPlayer extends Player {
    constructor(path, color = green, name = 'Игрок 2') {
        super(path, color, name);
    }
}

class ThirdPlayer extends Player {
    constructor(path, color = yellow, name = 'Игрок 3') {
        super(path, color, name);
    }
}

class Section {
  constructor(title, items = [], paths = []) {
    this.title = String(title);
    this.items = items;
    this.paths = paths;
  }
}

const routeSections = [
    new Section(
        '1',
        [
            { players: 2, imgSrc: 'images/01.2.webp' },
            { players: 1, imgSrc: 'images/01.1.webp' }

        ],
        [
            {
                playerPaths: [
                    new FirstPlayer('1,2,3,5,6'),
                    new SecondPlayer('1,2,4,7,6')
                ]
                
            },
            {
                playerPaths: [
                    new FirstPlayer('1,2,4,7,6', green)
                ]
            }
        ]
    ),
    new Section(
        '2',
        [
            { players: 2, imgSrc: 'images/02.2.webp' },
            { players: 1, imgSrc: 'images/02.1.webp' }
        ],
        [
            {
                playerPaths: [
                    new FirstPlayer('1,3,6,9,8,5'),
                    new SecondPlayer('1,4,7,10,9,11')
                ]
                
            },
            {
                playerPaths: [
                    new FirstPlayer('1,4,7,10,9,11', green)
                ]
            }
        ]
    ),
    new Section(
        '3',
        [
            { players: 3, imgSrc: 'images/03.3.webp' },
            { players: 2, imgSrc: 'images/03.2.webp' },
        ],
        [
            {
                playerPaths: [
                    new FirstPlayer('1,2,3,7,10,11'),
                    new SecondPlayer('1,5,6,9,11'),
                    new ThirdPlayer('1,4,12,13,11')
                ]
                
            },
            {
                playerPaths: [
                    new FirstPlayer('1,4,12,13,11', green),
                    new SecondPlayer('1,5,6,7,10,11', blue)
                ]
            }
        ]
    ),
    new Section(
        '4',
        [
            { players: 3, imgSrc: 'images/04.3.webp' },
            { players: 2, imgSrc: 'images/04.2.webp' },
        ],
        [
            {
                playerPaths: [
                    new FirstPlayer('1,3,6,11,17,10,16,21,22,23'),
                    new SecondPlayer('1,2,4,7,18,8,12,19,22,23'),
                    new ThirdPlayer('1,5,24,25,9,14,13,20,22,23')
                ]
                
            },
            {
                playerPaths: [
                    new FirstPlayer('1,2,4,7,18,8,12,19,22,23', green),
                    new SecondPlayer('1,3,6,11,17,10,16,21,22,23', blue)
                ]
            }
        ]
    ),
    new Section(
        '5',
        [
            { players: 3, imgSrc: 'images/05.3.webp' },
            { players: 1, imgSrc: 'images/05.1.webp' },
        ],
        [
            {
                playerPaths: [
                    new FirstPlayer('1,4,6,10,11,15,19,18,24'),
                    new SecondPlayer('1,5,9,10,14,17,20,27,25,21,24'),
                    new ThirdPlayer('1,2,7,8,12,16,23,26,25,21,24')
                ]
                
            },
            {
                playerPaths: [
                    new FirstPlayer('1,5,9,10,14,17,20,27,25,21,24', green),
                ]
            }
        ]
    ),
    new Section(
        '6',
        [
            { players: 3, imgSrc: 'images/06.3.webp' },
            { players: 2, imgSrc: 'images/06.2.webp' },
        ],
        [
            {
                playerPaths: [
                    new FirstPlayer('1,3,6,9,12,15,18,21,26,25'),
                    new SecondPlayer('1,2,4,7,8,11,14,17,20,22,25'),
                    new ThirdPlayer('1,5,7,10,13,16,19,24,25')
                ]
                
            },
            {
                playerPaths: [
                    new FirstPlayer('1,2,4,7,8,11,14,17,20,22,24', green),
                    new SecondPlayer('1,3,6,9,12,15,18,21,26,25', blue)
                ]
            }
        ]
    ),
    new Section(
        '7',
        [
            { players: 3, imgSrc: 'images/07.3.webp' },
            { players: 2, imgSrc: 'images/07.2.webp' },
        ],
        [
            {
                playerPaths: [
                    new FirstPlayer('1,7,3,4,5,9,16,18,23,22,26,27'),
                    new SecondPlayer('1,11,10,14,17,13,19,20,24,27'),
                    new ThirdPlayer('1,8,1,11,12,15,12,11,21,25,27')
                ]
                
            },
            {
                playerPaths: [
                    new FirstPlayer('1,7,1,11,10,14,17,13,19,20,24', green),
                    new SecondPlayer('1,8,1,11,21,25,27,26,22,23,18,16', blue)
                ]
            }
        ]
    ),
    new Section(
        '8',
        [
            { players: 3, imgSrc: 'images/08.3.webp' },
            { players: 2, imgSrc: 'images/08.2.webp' },
        ],
        [
            {
                playerPaths: [
                    new FirstPlayer('1,3,4,8,7,9,11,15,19,20,22,23,31,22'),
                    new SecondPlayer('1,3,2,6,7,9,10,13,17,16,20,22,21,28,22'),
                    new ThirdPlayer('1,3,5,7,9,11,14,18,20,22,24,25,29,26,30,27')
                ]
                
            },
            {
                playerPaths: [
                    new FirstPlayer('1,3,2,6,7,9,10,13,17,16,20,22,21,28,29,26', green),
                    new SecondPlayer('1,3,4,8,7,9,11,15,19,20,22,23,31,30,26,32', blue)
                ]
            }
        ]
    ),
    new Section(
        '9',
        [
            { players: 3, imgSrc: 'images/09.webp' },
        ],
        [
            {
                playerPaths: [
                    new FirstPlayer('1,3,8,12,11,7,16,21,26,30,31,32,35,37,40,45'),
                    new SecondPlayer('1,2,6,10,15,20,14,24,29,25,36,39,42,44,45'),
                    new ThirdPlayer('1,3,4,13,19,18,23,17,22,38,41,43,46,45')
                ]
                
            },
        ]
    ),
    new Section(
        'A 10',
        [
            { players: 3, imgSrc: 'images/10_alternate.webp' },
            { players: 3, imgSrc: 'images/10_alternate_2.webp' },
        ],
        [
            {
                playerPaths: [
                    new FirstPlayer('1,3,2,6,11,17,25,30,35,34,29,24,21,17,12,7'),
                    new SecondPlayer('1,4,8,13,18,22,26,31,36,40,45,44,43,38,33,28', orange),
                    new ThirdPlayer('1,5,9,14', green)
                ]
            },
            {
                playerPaths: [
                    new FirstPlayer('1,3,2,6,11,17,25,30,35,34,29,24,21,17,12,7'),
                    new SecondPlayer('1,4,8,13,18,22,26,31,36,40,45,44,43,38,33,28', orange),
                    new ThirdPlayer('1,5,9,14,19,23,27,32,37,42,48,51,50,49,46,52', green)
                ]
            },
        ]
    ),
    new Section(
        'B 10',
        [
            { players: 3, imgSrc: 'images/10.webp' },
        ],
        [
            {
                playerPaths: [
                    new FirstPlayer('1,4,8,13,18,22,26,31,36,40,46,45,39,33,28,20'),
                    new SecondPlayer('1,3,2,6,11,17,25,30,35,29,34,33,38,43,44,52'),
                    new ThirdPlayer('1,5,9,14,19,23,27,32,37,42,48,51,50,49,47,41')
                ]
                
            },
        ]
    ),
    new Section(
        'A 11',
        [
            { players: 3, imgSrc: 'images/11.3_alternate.webp' },
        ],
        [
            {
                playerPaths: [
                    new FirstPlayer('1,2,3,6,7,12,11,15,21,27,36,39,40,41,37'),
                    new SecondPlayer('1,2,4,6,8,12,17,18,19,25,31,30,29,28,22,16', orange),
                    new ThirdPlayer('1,2,5,6,9,13,14,20,26,32,38,35,33,34,37', green)
                ]
                
            },
        ]
    ),
    new Section(
        'B 11',
        [
            { players: 3, imgSrc: 'images/11.3.webp' },
            { players: 3, imgSrc: 'images/11.webp' },
        ],
        [
            {
                playerPaths: [
                    new FirstPlayer('1,2,5,6,10,13,14,20,26,32,38,35,33,34,37'),
                    new SecondPlayer('1,2,4,6,9,13,18,19,25,31,30,29,23,17,16,22'),
                    new ThirdPlayer('1,3,6,8,12,11,15,21,27,28,36,39,40,41,37')
                ]
                
            },
            {
                playerPaths: [
                    new FirstPlayer('1,2,4,6,9,13,18,19,25,31,30,29,28,22,16,17', green),
                    new SecondPlayer('1,2,3,6,8,12,11,15,21,27,36,34,33,35,37', blue),
                    new ThirdPlayer('1,2,5,6,10,13,14,20,26,32,38,41,40,39,37')
                ]
            }
        ]
    ),
    new Section(
        'A 12',
        [
            { players: 3, imgSrc: 'images/12.3_alternate.webp' },
        ],
        [
            {
                playerPaths: [
                    new FirstPlayer('1,9,3,6,10,22,31,36,35,29,34,29,30,21,13'),
                    new SecondPlayer('1,5,12,15,28,20,12,14,26,18,19,20,27', orange),
                    new ThirdPlayer('1,8,2,4,7,16,23,32,33,25,24,17,11', green)
                ]
                
            },
        ]
    ),
    new Section(
        'B 12',
        [
            { players: 3, imgSrc: 'images/12.3.webp' },
            { players: 2, imgSrc: 'images/12.2.webp' },
        ],
        [
            {
                playerPaths: [
                    new FirstPlayer('1,5,12,15,28,20,12,14,26,18,19,20,27'),
                    new SecondPlayer('1,8,2,4,7,16,23,32,33,25,34,25,24,17,11'),
                    new ThirdPlayer('1,9,3,6,10,22,31,36,35,29,34,29,30,21,13')
                ]
                
            },
            {
                playerPaths: [
                    new FirstPlayer('1,9,1,8,2,4,7,16,23,32,23,24,14,24,17,11', green),
                    new SecondPlayer('1,5,12,15,28,29,34,25,26,18,19,20,27', blue)
                ]
            }
        ]
    ),
    new Section(
        '13.09',
        [
            { players: 3, imgSrc: 'images/13.09.webp' },
        ],
        [
            {
                playerPaths: [
                    new FirstPlayer('1,3,8,9,13,7,16,21,26,30,31,42,34,36,39,44'),
                    new SecondPlayer('1,2,6,12,15,20,14,24,29,25,35,38,41,43,44'),
                    new ThirdPlayer('1,3,4,10,19,18,23,17,22,37,40,32,45,44')
                ]
                
            },
        ]
    ),
    new Section(
        '13.10',
        [
            { players: 3, imgSrc: 'images/13.10.webp' },
        ],
        [
            // {
            //     playerPaths: [
            //         new FirstPlayer('1,4,8,13,18,22,26,31,36,40,46,45,39,33,28,20'),
            //         new SecondPlayer('1,3,2,6,11,17,25,30,35,29,34,33,38,43,44,52'),
            //         new ThirdPlayer('1,5,9,14,19,23,27,32,37,42,48,51,50,49,47,41')
            //     ]
                
            // },
        ]
    ),
    new Section(
        '13.11',
        [
            { players: 3, imgSrc: 'images/13.11.webp' },
        ],
        [
            // {
            //     playerPaths: [
            //         new FirstPlayer('1,2,3,6,8,12,11,15,21,27,36,34,33,35,37', green),
            //         new SecondPlayer('1,2,4,6,9,13,18,19,25,31,30,29,28,22,16,17', blue),
            //         new ThirdPlayer('1,2,5,6,10,13,14,20,26,32,38,41,40,39,37')
            //     ]
                
            // },
        ]
    ),
    new Section(
        '13.12',
        [
            { players: 3, imgSrc: 'images/13.12.3.webp' },
            { players: 2, imgSrc: 'images/13.12.2.webp' },
        ],
        [
            // {
            //     playerPaths: [
            //         new FirstPlayer('1,5,12,15,28,20,12,14,26,18,19,20,27'),
            //         new SecondPlayer('1,8,2,4,7,16,23,32,33,25,34,25,24,17,11'),
            //         new ThirdPlayer('1,9,3,6,10,22,31,36,35,29,34,29,30,21,13')
            //     ]
                
            // },
            // {
            //     playerPaths: [
            //         new FirstPlayer('1,9,1,8,2,4,7,16,23,32,23,24,14,24,17,11', green),
            //         new SecondPlayer('1,5,12,15,28,29,34,25,26,18,19,20,27', blue),
            //     ]
            // }
        ]
    ),
]

function createSectionItem(itemObj) {
    const item = document.createElement('div');
    item.className = 'item';

    // Число игроков добавляем
    const playerCount = document.createElement('div');
    playerCount.textContent = 'Число игроков: ' + itemObj.players;
    item.appendChild(playerCount);

    // Создание картинки
    const image = document.createElement('img');
    image.src = itemObj.imgSrc;
    image.alt = playerCount.textContent;
    item.appendChild(image);

    return item;
}

function createPath(pathObj) {
    const section = document.createElement('div');
    section.className = 'list-item';
    const list = document.createElement('ul');
    section.appendChild(list);

    pathObj.playerPaths.forEach(playerPath => {
        const li = document.createElement('li');
        li.textContent = playerPath.name;
        li.setAttribute('data-value', playerPath.path);
        li.style.background = playerPath.color;

        // создаём span для иконки копирования
        const span = document.createElement('span');
        span.className = 'copy-icon';
        span.textContent = '📋';

        // вставляем span внутрь li
        li.appendChild(span);

        list.appendChild(li);
    });

    return section;
}

function createSection(sectionObj) {
    const section = document.createElement('div');
    section.className = 'section';

    // Создаём картинки
    sectionObj.items.forEach(itemObj => {
        section.appendChild(createSectionItem(itemObj));
    });

    return section;
}

function createSchemesContainer() {
    const container = document.createElement('div');
    container.id = 'schemes';
    container.className = 'content-section active';

    routeSections.forEach(section => {
        // Заголовок секции
        const h2 = document.createElement('h2');
        h2.textContent = section.title;
        container.appendChild(h2);
        container.appendChild(createSection(section));

        if (section.paths.length > 0) {
            const pathTitle = document.createElement('h2');
            pathTitle.textContent = 'Пути для Goodwin';
            container.appendChild(pathTitle);
            const pathSection = document.createElement('div');
            pathSection.className = 'section-list';
            container.appendChild(pathSection);
            section.paths.forEach(path => {
                pathSection.appendChild(createPath(path));
            });
        }
    });

    return container;
}

function addSchemesContainer() {
    // Вставляем в конец body
    document.body.appendChild(createSchemesContainer());
}

addSchemesContainer();


/*
 ====================================================================================================
 ======================================= Для работы повидения =======================================
 ====================================================================================================
 */

const lightbox = document.getElementById('lightbox');
const lightboxImage = lightbox.querySelector('img');

document.querySelectorAll('.item img').forEach(img => {
    img.addEventListener('click', () => {
        lightboxImage.src = img.src;
        lightbox.style.display = 'flex';
        resetZoom(); // <-- ВАЖНО
    });
});

// Клик по фону закрывает lightbox
lightbox.addEventListener('click', e => {
    if (e.target !== lightboxImage) {
        lightbox.style.display = 'none';
        resetZoom();
    }
});

// ESC закрывает lightbox
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        lightbox.style.display = 'none';
        resetZoom();
    }
});


let scale = 1;
let translateX = 0;
let translateY = 0;

function applyTransform() {
    lightboxImage.style.transform =
        `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

function resetZoom() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    applyTransform();
    lightboxImage.style.cursor = 'zoom-in';
}

lightboxImage.addEventListener('wheel', e => {
    e.preventDefault();

    const zoomSpeed = 0.2;
    const direction = e.deltaY > 0 ? -1 : 1;

    scale += direction * zoomSpeed;
    scale = Math.min(Math.max(scale, 1), 5);

    if (scale === 1) {
        translateX = 0;
        translateY = 0;
        lightboxImage.style.cursor = 'zoom-in';
    } else {
        lightboxImage.style.cursor = 'grab';
    }

    applyTransform();
}, { passive: false });
let isDragging = false;
let startX = 0;
let startY = 0;

lightboxImage.addEventListener('mousedown', e => {
    if (scale === 1 || e.button !== 0) return; // только ЛКМ

    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;

    lightboxImage.style.cursor = 'grabbing';

    e.preventDefault(); // важно!
});

window.addEventListener('mousemove', e => {
    if (!isDragging) return;

    translateX = e.clientX - startX;
    translateY = e.clientY - startY;

    applyTransform();
});

window.addEventListener('mouseup', e => {
    if (!isDragging || e.button !== 0) return;

    isDragging = false;
    lightboxImage.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
});

/*
=================================================
============== Copy =============================
=================================================
*/

document.querySelectorAll('.list-item li').forEach(li => {
  li.addEventListener('click', () => {
    const value = li.dataset.value;
    navigator.clipboard.writeText(value)
      .then(() => {
        li.classList.add('copied');
        setTimeout(() => li.classList.remove('copied'), 1500);
      });
  });
});
