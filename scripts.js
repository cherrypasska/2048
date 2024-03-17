document.addEventListener('DOMContentLoaded', () =>{ //полная загрузка DOM
    // Получаем доступ к элементу с классом 'grid'
    const grid = document.querySelector('.grid');
    // Устанавливаем размер игрового поля (4x4)
    const size = 4;
    // Инициализируем пустой массив для представления игрового поля
    let board = [];
    // Проверка на количесво раз возобновления игры
    let check = 0;
    // Инициализируем текущий счет игры
    let currentScore = 0;
    // Получаем элемент текущего счета
    const currentScoreElement = document.getElementById('current-score');
    // Получаем сохраненный высший счет из локального хранилища или устанавливаем в 0
    let highScore = localStorage.getItem('2048-highScore') || 0;
    // Получаем элемент для отображения высшего счета
    const highScoreElement = document.getElementById('high-score');
    // Устанавливаем текст элемента высшего счета
    highScoreElement.textContent = highScore;
    // Получаем элемент для отображения сообщения о конце игры и победы
    const gameOverElement = document.getElementById('game-over');
    const gameWinElement = document.getElementById('Win-game');
    // Функция для обновления текущего счета
    function upScore(value){
        // увеличение текущего счёта
        currentScore += value;
        currentScoreElement.textContent = currentScore;
        // Если текущий счет превышает высший счет, обновляем высший счет
        if (currentScore > highScore){
            highScore = currentScore;
            highScoreElement.textContent = highScore;
            localStorage.setItem('2048-highScore', highScore);
        }
    }
    // Функция для перезапуска игры
    function restart(){
        //обнуляет текущий счёт
        currentScore = 0;
        currentScoreElement.textContent = '0';
        gameOverElement.style.display = 'none'; //закрывает окно о проигрыше
        gameWinElement.style.display = 'none'; //закрывает окно о победе
        check = 0; //обнуляет количество продолжения игры в этой игре
        initializeGame();
    }
    // Функция для продолжения игры после победы
    function resume(){
        gameWinElement.style.display = 'none';
    }
    // Функция для инициализации игры
    function initializeGame(){
        // Создаем пустое игровое поле размером 4x4
        board = [...Array(size)].map(e => Array(size).fill(0));
        // Добавляем две случайные плитки на игровое поле
        randompl();
        randompl();
        // Отображаем игровое поле
        rendering();
    }
    // Функция для отображения игрового поля
    function rendering(){
        //берёт все поля
        for (let i = 0; i < size; i++){
            for (let j = 0; j < size; j++){
                const cap = document.querySelector(`[data-rows="${i}"][data-columns="${j}"]`);
                const prValue = cap.dataset.value;
                const currValue = board[i][j];
                if (currValue !== 0){
                    cap.dataset.value = currValue;
                    cap.textContent = currValue;
                    if(currValue !== parseInt(prValue) && !cap.classList.contains('new-cap')){ //проверяет, отличается ли текущее значение на игровом поле (currValue) от предыдущего значения атрибутa
                        cap.classList.add('merged-cap');
                    }
                } 
                else{
                    cap.textContent = '';
                    delete cap.dataset.value;
                    cap.classList.remove('merged-cap', 'new-cap');
                }
            }
        }
        // Через 300 миллисекунд убираем классы 'merged-cap' и 'new-cap'
        setTimeout(() =>{
            const capacits = document.querySelectorAll('.grid-cap');
            capacits.forEach(cap =>{
                cap.classList.remove('merged-cap', 'new-cap');
            });
        }, 300);
    }
    // Функция для добавления случайной плитки на игровое поле
    function randompl(){
        const available = [];
        // Ищем все свободные ячейки на игровом поле
        for (let i = 0; i < size; i++){
            for (let j = 0; j < size; j++){
                if (board[i][j] === 0){
                available.push({ x: i, y: j });
                }
            }
        }
        // Если есть свободные ячейки, выбираем случайную и устанавливаем значение 2 или 4
        if (available.length > 0){
            const randomCap = available[Math.floor(Math.random() * available.length)];
            board[randomCap.x][randomCap.y] = Math.random() < 0.9 ? 2 : 4;
            const cap = document.querySelector(`[data-rows="${randomCap.x}"][data-columns="${randomCap.y}"]`);
            cap.classList.add('new-cap');
        }
    }
    // Функция для выполнения движения в указанном направлении
    function move(direction){
        // Флаг для отслеживания изменений на игровом поле после движения
        let hasChanged = false;
        // Двигаем все значения в одну из четырех сторон (вверх, вниз, влево, вправо)
        if (direction === 'ArrowUp' || direction === 'ArrowDown'){
            for (let j = 0; j < size; j++){
                // Создаем массив-столбец, выбирая элементы из каждой строки для данной колонки
                const column = [...Array(size)].map((_, i) => board[i][j]);
                // Применяем преобразование для данного столбца и получаем новый столбец
                const newCol = transform(column, direction === 'ArrowUp');
                // Обновляем значения в исходном массиве данных (игровое поле) на основе нового столбца
                for (let i = 0; i < size; i++){
                    if (board[i][j] !== newCol[i]){
                        hasChanged = true;
                        board[i][j] = newCol[i];
                    }
                }
            }
        } 
        else if (direction === 'ArrowLeft' || direction === 'ArrowRight'){
            for (let i = 0; i < size; i++){
                // Создаем массив-строку, выбирая элементы из каждой колонки для данной строки
                const row = board[i];
                // Применяем преобразование для данной строки и получаем новую строку
                const newRow = transform(row, direction === 'ArrowLeft');
                // Обновляем значения в исходном массиве данных (игровое поле) на основе новой строки
                if (row.join(',') !== newRow.join(',')){
                    hasChanged = true;
                    board[i] = newRow;
                }
            }
        }
        // Если произошли изменения, добавляем новую плитку, отображаем поле и проверяем конец игры
        if (hasChanged){
            randompl();   // Добавление новой плитки
            rendering();   // Отображение изменений на игровом поле
            checkGameOver();  // Проверка условий завершения игры
        }
    }
    // Функция для преобразования строки или столбца в зависимости от направления движения
    function transform(line, moveToSt){
        // Создаем новый массив, исключая все нулевые значения
        let newline = line.filter(cap => cap !== 0);
        // Если нужно двигаться в сторону начала строки/столбца, инвертируем массив
        if (!moveToSt){
            newline.reverse();
        }
        // Итерируемся по массиву и объединяем соседние равные значения, удваивая их
        for(let i = 0; i < newline.length - 1; i++){
            if(newline[i] === newline[i + 1]){
                newline[i] *= 2;   // Удваиваем значение
                upScore(newline[i]);  // Обновляем текущий счет
                newline.splice(i + 1, 1);  // Удаляем следующий элемент, так как он был объединен
            }
        }
        // Добавляем нули до нужной длины строки или столбца
        while (newline.length < size){
            newline.push(0);
        }
        // Если нужно двигаться в сторону начала строки/столбца, инвертируем массив обратно
        if (!moveToSt){
            newline.reverse();
        }
        // Возвращаем новую строку после всех преобразований
        return newline;
    }
    // Функция для проверки конца игры
    function checkGameOver(){
        for (let i = 0; i < size; i++){
            for (let j = 0; j < size; j++){
                if(board[i][j] === 2048 && check === 0){
                    gameWinElement.style.display = 'flex';
                    check++;
                }
            }
        }
        for (let i = 0; i < size; i++){
            for (let j = 0; j < size; j++){
                if (board[i][j] === 0){
                    return;
                }
                if (j < size - 1 && board[i][j] == board[i][j + 1]){
                    return;
                }
                if (i < size - 1 && board[i][j] === board[i + 1][j]){
                    return;
                }
            }
        }
        // Если нет свободных клеток и нет возможности объединить плитки, отображаем сообщение о конце игры
        gameOverElement.style.display = 'flex';
    }
    // Добавляем обработчик события для клавиш клавиатуры
    document.addEventListener('keydown', event =>{
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)){
            move(event.key);
        }
    });
    // Добавляем обработчик события для кнопки перезапуска и продолжения игры
    document.getElementById('restart-btn').addEventListener('click', restart);
    document.getElementById('restart-btn_').addEventListener('click', restart);
    document.getElementById('restart').addEventListener('click', restart);
    document.getElementById('resume-btn').addEventListener('click', resume);
    // Инициализируем игру при загрузке страницы
    initializeGame();
});