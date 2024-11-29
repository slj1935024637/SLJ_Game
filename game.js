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

        // 绑定按钮事件
        document.getElementById('start-game1').addEventListener('click', () => this.showGame1());
        document.getElementById('start-game2').addEventListener('click', () => this.showGame2());
        document.getElementById('new-game').addEventListener('click', () => this.startNewGame());
        document.getElementById('back-to-menu').addEventListener('click', () => this.backToMenu());
    }

    // 显示游戏1界面
    showGame1() {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game1-screen').classList.remove('hidden');
        document.getElementById('game2-screen').classList.add('hidden');
        this.startNewGame();
    }

    // 显示游戏2界面
    showGame2() {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game1-screen').classList.add('hidden');
        document.getElementById('game2-screen').classList.remove('hidden');
        rollingGame.init();
    }

    // 返回主菜单
    backToMenu() {
        // 清理当前游戏状态
        this.clearBoard();
        if (this.timer) {
            clearInterval(this.timer);
        }
        // 显示开始界面
        document.getElementById('start-screen').classList.remove('hidden');
        document.getElementById('game1-screen').classList.add('hidden');
        document.getElementById('game2-screen').classList.add('hidden');
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

// 游戏2：称呼生成器
class RollingGame {
    constructor() {
        // 基础称呼列表
        this.normalTitles = [
            '勇士', '智者', '英雄', '冒险家',
            '艺术家', '梦想家', '领袖', '创造者', '探索者',
            '战士', '诗人', '音乐家', '科学家', '思想家',
            '建筑师', '工程师', '医生', '教师', '作家',
            '运动员', '演员', '画家', '舞者', '摄影师',
            '程序员', '设计师', '厨师', '园丁', '宇航员',
            '魔法师', '侦探', '发明家', '哲学家', '考古学家',
            '驯兽师', '飞行员', '船长', '指挥家', '雕塑家',
            '旅行家', '收藏家', '鉴赏家', '守护者', '传承者',
            '先驱者', '实践者', '追梦人', '开拓者', '引路人'
        ];

        // 特殊称呼及其权重
        this.specialTitles = [
            { title: '沙雕', weight: 30 },   // 最高概率
            { title: '黑子', weight: 15 },
            { title: '妻奴', weight: 15 },
            { title: '天才', weight: 15 }
        ];

        // 计算总权重（普通称呼每个权重0.5）
        this.totalWeight = this.specialTitles.reduce((sum, item) => sum + item.weight, 0) + this.normalTitles.length * 0.5;

        this.rollingInterval = null;
        this.currentIndex = 0;
        this.isRolling = false;
        this.fireworksContainer = document.querySelector('.fireworks-container');

        // 绑定按钮事件
        const stopButton = document.getElementById('game2-stop');
        stopButton.addEventListener('click', () => this.toggleRolling());
        document.getElementById('game2-back').addEventListener('click', () => game.backToMenu());
    }

    // 获取随机称呼
    getRandomTitle() {
        const rand = Math.random() * this.totalWeight;
        let accumWeight = 0;

        // 先检查特殊称呼
        for (const special of this.specialTitles) {
            accumWeight += special.weight;
            if (rand < accumWeight) {
                return special.title;
            }
        }

        // 如果没有命中特殊称呼，则从普通称呼中随机选择（概率降低）
        if (Math.random() < 0.5) {  // 进一步降低普通称呼概率
            return this.normalTitles[Math.floor(Math.random() * this.normalTitles.length)];
        } else {
            // 未选中普通称呼时，重新从特殊称呼中选择
            const specialIndex = Math.floor(Math.random() * this.specialTitles.length);
            return this.specialTitles[specialIndex].title;
        }
    }

    // 开始滚动
    startRolling() {
        if (this.isRolling) return;
        this.isRolling = true;
        
        const rollingText = document.getElementById('rolling-text');
        this.rollingInterval = setInterval(() => {
            // 使用新的随机称呼方法
            const randomTitle = this.getRandomTitle();
            const colorClass = 'color-' + (Math.floor(Math.random() * 6) + 1);
            
            // 更新显示
            rollingText.className = 'rolling-text ' + colorClass;
            rollingText.textContent = randomTitle;
        }, 50);
    }

    // 创建烟花效果
    createFirework(x, y, color) {
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.left = x + 'px';
        firework.style.top = y + 'px';
        firework.style.backgroundColor = color;
        this.fireworksContainer.appendChild(firework);

        // 创建粒子
        for (let i = 0; i < 30; i++) {  
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.backgroundColor = color;
            
            // 随机方向
            const angle = (Math.PI * 2 * i) / 30;
            const velocity = 30 + Math.random() * 70;  
            particle.style.setProperty('--dx', Math.cos(angle) * velocity + 'px');
            particle.style.setProperty('--dy', Math.sin(angle) * velocity + 'px');
            
            this.fireworksContainer.appendChild(particle);
        }

        // 清理动画元素
        setTimeout(() => {
            firework.remove();
            const particles = document.querySelectorAll('.particle');
            particles.forEach(p => p.remove());
        }, 1000);
    }

    // 创建多个烟花
    createFireworks() {
        const colors = ['#f44336', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4'];
        const text = document.getElementById('rolling-text');
        const rect = text.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // 创建20个烟花
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                let x, y;
                
                if (i < 5) {  
                    x = rect.left - 50 + Math.random() * (rect.width + 100);  
                    y = rect.top - 50 + Math.random() * (rect.height + 100);
                } else {
                    // 其他的在屏幕范围内随机分布，但更集中在中心区域
                    x = screenWidth * 0.2 + Math.random() * (screenWidth * 0.6);  
                    y = screenHeight * 0.1 + Math.random() * (screenHeight * 0.6);  
                }
                
                const color = colors[Math.floor(Math.random() * colors.length)];
                this.createFirework(x, y, color);
            }, i * 80);  
        }

        // 0.5秒后再来一波烟花
        setTimeout(() => {
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    const x = screenWidth * 0.1 + Math.random() * (screenWidth * 0.8);
                    const y = screenHeight * 0.1 + Math.random() * (screenHeight * 0.6);
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    this.createFirework(x, y, color);
                }, i * 80);
            }
        }, 500);
    }

    // 切换滚动状态
    toggleRolling() {
        const stopButton = document.getElementById('game2-stop');
        if (this.isRolling) {
            this.stopRolling();
            stopButton.textContent = '继续';
            this.createFireworks();
        } else {
            this.startRolling();
            stopButton.textContent = '停止';
        }
    }

    // 停止滚动
    stopRolling() {
        if (!this.isRolling) return;
        clearInterval(this.rollingInterval);
        this.isRolling = false;
    }

    // 初始化游戏
    init() {
        const stopButton = document.getElementById('game2-stop');
        stopButton.textContent = '停止';
        this.stopRolling();
        this.startRolling();
    }
}

// 创建游戏实例
const game = new LinkGame();
const rollingGame = new RollingGame();
