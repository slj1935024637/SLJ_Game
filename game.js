class LinkGame {
    constructor() {
        this.board = [];
        this.size = 8; // 8x8的游戏板
        this.selectedTile = null;
        this.remainingPairs = 0;
        this.timeLeft = 120;
        this.timer = null;
        this.gameBoard = document.getElementById('game-board');
        this.timerDisplay = document.getElementById('timer');
        this.remainingDisplay = document.getElementById('remaining');
        this.score = 0;
        
        // 特殊配对规则
        this.specialPairs = {
            '磊': ['基'],
            '基': ['磊'],
            '秀': ['昆'],
            '昆': ['秀'],
            '英': ['锦'],
            '锦': ['英'],
            '兴': ['文'],
            '文': ['兴']
        };

        document.getElementById('new-game').addEventListener('click', () => this.startNewGame());
    }

    // 初始化游戏
    startNewGame() {
        this.clearBoard();
        this.initializeBoard();
        this.renderBoard();
        this.startTimer();
    }

    // 清理游戏板
    clearBoard() {
        this.board = [];
        this.gameBoard.innerHTML = '';
        this.selectedTile = null;
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.timeLeft = 120;
        this.timerDisplay.textContent = this.timeLeft;
    }

    // 初始化游戏数据
    initializeBoard() {
        // 定义可用的文字
        const tiles = ['磊', '基', '秀', '昆', '英', '锦', '兴', '文'];
        // 创建配对数组
        let pairs = [];
        for (let i = 0; i < (this.size * this.size) / 2; i++) {
            const tile = tiles[i % tiles.length];
            pairs.push(tile, tile);
        }
        
        // 随机打乱数组
        for (let i = pairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
        }

        // 填充棋盘
        let pairIndex = 0;
        for (let row = 0; row < this.size; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.size; col++) {
                this.board[row][col] = {
                    value: pairs[pairIndex++],
                    matched: false
                };
            }
        }

        this.remainingPairs = (this.size * this.size) / 2;
        this.remainingDisplay.textContent = this.remainingPairs;
    }

    // 渲染游戏板
    renderBoard() {
        this.gameBoard.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const tile = this.createTile(i, j, this.board[i][j].value);
                if (!this.board[i][j].matched) {
                    tile.addEventListener('click', () => this.handleTileClick(i, j, tile));
                } else {
                    tile.classList.add('matched');
                }
                this.gameBoard.appendChild(tile);
            }
        }
    }

    // 创建方块元素
    createTile(row, col, value) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.textContent = value;
        tile.dataset.row = row;
        tile.dataset.col = col;

        // 根据不同的字符添加不同的颜色类
        if (value === '磊' || value === '基') {
            tile.classList.add('yellow-pair');
        } else if (value === '秀' || value === '昆') {
            tile.classList.add('black-pair');
        } else if (value === '英' || value === '锦') {
            tile.classList.add('green-pair');
        } else if (value === '兴' || value === '文') {
            tile.classList.add('blue-pair');
        }

        return tile;
    }

    // 处理方块点击
    handleTileClick(row, col, tile) {
        if (this.board[row][col].matched) return;

        if (!this.selectedTile) {
            // 第一次选择
            this.selectedTile = {row, col, element: tile};
            tile.classList.add('selected');
        } else {
            // 第二次选择
            if (this.selectedTile.row === row && this.selectedTile.col === col) {
                // 点击同一个方块
                this.selectedTile.element.classList.remove('selected');
                this.selectedTile = null;
                return;
            }

            const firstValue = this.board[this.selectedTile.row][this.selectedTile.col].value;
            const secondValue = this.board[row][col].value;

            if (this.isMatch(firstValue, secondValue)) {
                const path = this.findPath(this.selectedTile.row, this.selectedTile.col, row, col);
                if (path) {
                    // 匹配成功
                    this.board[this.selectedTile.row][this.selectedTile.col].matched = true;
                    this.board[row][col].matched = true;
                    
                    this.selectedTile.element.classList.add('matched');
                    tile.classList.add('matched');
                    
                    this.remainingPairs--;
                    this.remainingDisplay.textContent = this.remainingPairs;

                    // 显示连线
                    this.drawPath(path);

                    // 显示得分动画
                    this.showScoreAnimation(firstValue, secondValue);

                    if (this.remainingPairs === 0) {
                        clearInterval(this.timer);
                        alert('恭喜你赢了！');
                    }
                }
            }

            // 清除选择
            this.selectedTile.element.classList.remove('selected');
            this.selectedTile = null;
        }
    }

    // 检查两个值是否匹配
    isMatch(value1, value2) {
        if (value1 === value2) return true;
        return this.specialPairs[value1]?.includes(value2) || false;
    }

    // 显示得分动画
    showScoreAnimation(value1, value2) {
        let text = 'giao';
        let colorClass = 'default';

        // 检查特殊配对组合
        if ((value1 === '磊' && value2 === '基') || (value1 === '基' && value2 === '磊')) {
            text = '王';
            colorClass = 'yellow';
        } else if ((value1 === '秀' && value2 === '昆') || (value1 === '昆' && value2 === '秀')) {
            text = '黑子';
            colorClass = 'black';
        } else if ((value1 === '英' && value2 === '锦') || (value1 === '锦' && value2 === '英')) {
            text = '沙雕';
            colorClass = 'green';
        } else if ((value1 === '兴' && value2 === '文') || (value1 === '文' && value2 === '兴')) {
            text = '女人的狗';
            colorClass = 'blue';
        }

        const animation = document.createElement('div');
        animation.className = `score-animation ${colorClass}`;
        animation.textContent = text;
        document.body.appendChild(animation);

        // 添加动画结束监听器
        animation.addEventListener('animationend', () => {
            animation.remove();
        });
    }

    // 寻找可行路径
    findPath(row1, col1, row2, col2) {
        // 如果是相邻的相同方块，直接返回路径
        if (this.isAdjacent(row1, col1, row2, col2)) {
            return [
                {row: row1, col: col1},
                {row: row2, col: col2}
            ];
        }

        // 检查是否可以直线连接
        if (this.checkStraightLine(row1, col1, row2, col2)) {
            return [
                {row: row1, col: col1},
                {row: row2, col: col2}
            ];
        }

        // 检查一个拐角的连接
        const oneCornerPath = this.checkOneCorner(row1, col1, row2, col2);
        if (oneCornerPath) {
            return oneCornerPath;
        }

        // 检查两个拐角的连接
        const twoCornerPath = this.checkTwoCorners(row1, col1, row2, col2);
        if (twoCornerPath) {
            return twoCornerPath;
        }

        return null;
    }

    // 检查两个方块是否相邻
    isAdjacent(row1, col1, row2, col2) {
        return (Math.abs(row1 - row2) === 1 && col1 === col2) ||
               (Math.abs(col1 - col2) === 1 && row1 === row2);
    }

    // 检查是否可以直线连接
    checkStraightLine(row1, col1, row2, col2) {
        // 检查水平线
        if (row1 === row2) {
            const minCol = Math.min(col1, col2);
            const maxCol = Math.max(col1, col2);
            for (let col = minCol + 1; col < maxCol; col++) {
                if (!this.board[row1][col].matched) {
                    return false;
                }
            }
            return true;
        }
        // 检查垂直线
        if (col1 === col2) {
            const minRow = Math.min(row1, row2);
            const maxRow = Math.max(row1, row2);
            for (let row = minRow + 1; row < maxRow; row++) {
                if (!this.board[row][col1].matched) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    // 检查一个拐角的连接
    checkOneCorner(row1, col1, row2, col2) {
        // 尝试通过(row1,col2)拐角
        if (this.isPathClear(row1, col1, row1, col2) && 
            this.isPathClear(row1, col2, row2, col2)) {
            return [
                {row: row1, col: col1},
                {row: row1, col: col2},
                {row: row2, col: col2}
            ];
        }
        // 尝试通过(row2,col1)拐角
        if (this.isPathClear(row1, col1, row2, col1) && 
            this.isPathClear(row2, col1, row2, col2)) {
            return [
                {row: row1, col: col1},
                {row: row2, col: col1},
                {row: row2, col: col2}
            ];
        }
        return null;
    }

    // 检查两个拐角的连接
    checkTwoCorners(row1, col1, row2, col2) {
        // 检查所有可能的中间点
        for (let row = -1; row <= this.size; row++) {
            if (this.isPathClear(row1, col1, row, col1) && 
                this.isPathClear(row, col1, row, col2) && 
                this.isPathClear(row, col2, row2, col2)) {
                return [
                    {row: row1, col: col1},
                    {row: row, col: col1},
                    {row: row, col: col2},
                    {row: row2, col: col2}
                ];
            }
        }
        for (let col = -1; col <= this.size; col++) {
            if (this.isPathClear(row1, col1, row1, col) && 
                this.isPathClear(row1, col, row2, col) && 
                this.isPathClear(row2, col, row2, col2)) {
                return [
                    {row: row1, col: col1},
                    {row: row1, col: col},
                    {row: row2, col: col},
                    {row: row2, col: col2}
                ];
            }
        }
        return null;
    }

    // 检查两点之间的路径是否通畅（只能是水平或垂直线）
    isPathClear(row1, col1, row2, col2) {
        // 如果不是水平或垂直线，返回false
        if (row1 !== row2 && col1 !== col2) {
            return false;
        }

        // 检查水平线
        if (row1 === row2) {
            const minCol = Math.min(col1, col2);
            const maxCol = Math.max(col1, col2);
            for (let col = minCol + 1; col < maxCol; col++) {
                // 检查点是否在棋盘内
                if (col >= 0 && col < this.size && row1 >= 0 && row1 < this.size) {
                    if (!this.board[row1][col].matched) {
                        return false;
                    }
                }
            }
            return true;
        }

        // 检查垂直线
        if (col1 === col2) {
            const minRow = Math.min(row1, row2);
            const maxRow = Math.max(row1, row2);
            for (let row = minRow + 1; row < maxRow; row++) {
                // 检查点是否在棋盘内
                if (row >= 0 && row < this.size && col1 >= 0 && col1 < this.size) {
                    if (!this.board[row][col1].matched) {
                        return false;
                    }
                }
            }
            return true;
        }

        return false;
    }

    // 绘制连线路径
    drawPath(path) {
        if (!path || path.length < 2) return;

        for (let i = 0; i < path.length - 1; i++) {
            const start = path[i];
            const end = path[i + 1];
            const startPixel = this.getPixelPosition(start.row, start.col);
            const endPixel = this.getPixelPosition(end.row, end.col);

            const line = document.createElement('div');
            line.className = 'line temp';

            // 设置线条位置和尺寸
            if (start.row === end.row) {
                // 水平线
                line.style.width = `${Math.abs(endPixel.x - startPixel.x)}px`;
                line.style.left = `${Math.min(startPixel.x, endPixel.x)}px`;
                line.style.top = `${startPixel.y}px`;
            } else {
                // 垂直线
                line.style.height = `${Math.abs(endPixel.y - startPixel.y)}px`;
                line.style.left = `${startPixel.x}px`;
                line.style.top = `${Math.min(startPixel.y, endPixel.y)}px`;
                line.style.width = '6px';  // 保持与水平线一致的粗细
            }

            this.gameBoard.appendChild(line);
            setTimeout(() => line.remove(), 800);
        }
    }

    // 获取方块的像素位置（居中）
    getPixelPosition(row, col) {
        const tileSize = 60; // 方块大小
        const gap = 2; // 方块间隔
        return {
            x: col * (tileSize + gap) + tileSize / 2 + 10,
            y: row * (tileSize + gap) + tileSize / 2 + 10
        };
    }

    // 开始计时器
    startTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.timerDisplay.textContent = this.timeLeft;
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                alert('游戏结束！时间到了！');
                this.startNewGame();
            }
        }, 1000);
    }
}

// 创建游戏实例并开始新游戏
const game = new LinkGame();
game.startNewGame();
