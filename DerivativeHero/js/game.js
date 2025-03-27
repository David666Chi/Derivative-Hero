class DerivativeGame {
    constructor() {
        this.playerName = '';
        this.score = 0;
        this.currentQuestion = 0;
        this.totalQuestions = 10;
        this.timeLeft = 15;
        this.timer = null;
        this.usedQuestions = new Set();
        this.derivatives = this.initializeDerivatives();
        this.difficulty = 'easy';
        this.setupEventListeners();
        this.createParticles();
    }

    initializeDerivatives() {
        return [
            // Derivadas de primer grado
            { question: 'x', answer: '1' },
            { question: 'x²', answer: '2x' },
            { question: 'x³', answer: '3x²' },
            { question: '2x + 1', answer: '2' },
            { question: 'x² + x', answer: '2x + 1' },
            { question: '3x² - 2x', answer: '6x - 2' },
            { question: 'sin(x)', answer: 'cos(x)' },
            { question: 'cos(x)', answer: '-sin(x)' },
            { question: 'x⁴', answer: '4x³' },
            { question: '2x³ + 3x', answer: '6x² + 3' },
            // Derivadas de segundo grado
            { question: 'x⁵', answer: '5x⁴' },
            { question: 'x⁶', answer: '6x⁵' },
            { question: '2x⁴ - x²', answer: '8x³ - 2x' },
            { question: 'sin²(x)', answer: '2sin(x)cos(x)' },
            { question: 'cos²(x)', answer: '-2sin(x)cos(x)' },
            // Derivadas de tercer grado
            { question: 'x⁷', answer: '7x⁶' },
            { question: 'x⁸', answer: '8x⁷' },
            { question: '3x⁵ - 2x³', answer: '15x⁴ - 6x²' },
            { question: 'sin³(x)', answer: '3sin²(x)cos(x)' },
            { question: 'cos³(x)', answer: '-3cos²(x)sin(x)' }
        ];
    }

    createParticles() {
        const container = document.getElementById('particles');
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.width = Math.random() * 10 + 5 + 'px';
            particle.style.height = particle.style.width;
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            container.appendChild(particle);
        }
    }

    setupEventListeners() {
        const buttons = {
            'play-button': () => this.showNameScreen(),
            'exit-button': () => window.close(),
            'start-game': () => this.showDifficultyScreen(),
            'back-to-name': () => this.switchScreen('difficulty-screen', 'name-screen'),
            'easy-mode': () => this.startGameWithDifficulty('easy'),
            'medium-mode': () => this.startGameWithDifficulty('medium'),
            'hard-mode': () => this.startGameWithDifficulty('hard'),
            'exit-name': () => window.close(),
            'play-again': () => this.restartGame(),
            'exit-results': () => window.close()
        };

        Object.entries(buttons).forEach(([id, handler]) => {
            document.getElementById(id)?.addEventListener('click', handler);
        });
    }

    showNameScreen() {
        this.switchScreen('welcome-screen', 'name-screen');
    }

    showDifficultyScreen() {
        this.playerName = document.getElementById('player-name').value.trim();
        if (!this.playerName) {
            alert('Por favor, ingresa tu nombre');
            return;
        }
        this.switchScreen('name-screen', 'difficulty-screen');
    }

    startGameWithDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.totalQuestions = this.getQuestionCountForDifficulty();
        this.switchScreen('difficulty-screen', 'game-screen');
        this.score = 0;
        this.currentQuestion = 0;
        this.usedQuestions.clear();
        this.showNextQuestion();
    }

    getQuestionCountForDifficulty() {
        switch(this.difficulty) {
            case 'easy': return 10;
            case 'medium': return 15;
            case 'hard': return 20;
            default: return 10;
        }
    }

    switchScreen(from, to) {
        document.getElementById(from).classList.remove('active');
        document.getElementById(to).classList.add('active');
    }

    showNextQuestion() {
        if (this.currentQuestion >= this.totalQuestions) {
            this.endGame();
            return;
        }

        const question = this.getRandomQuestion();
        this.usedQuestions.add(question.question);
        this.currentQuestion++;
        this.timeLeft = 15;

        document.getElementById('derivative').textContent = question.question;
        this.createOptions(question.answer);
        document.getElementById('progress-bar').style.width = `${(this.currentQuestion / this.totalQuestions) * 100}%`;
        this.startTimer();
    }

    getRandomQuestion() {
        const availableQuestions = this.derivatives.filter(q => !this.usedQuestions.has(q.question));
        return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    }

    createOptions(correctAnswer) {
        let options = [correctAnswer, ...this.generateSimilarAnswers(correctAnswer)]
            .sort(() => Math.random() - 0.5);
        
        // Asegurar que siempre tengamos exactamente 4 opciones diferentes
        while (new Set(options).size < 4) {
            const newOption = this.generateAdditionalOption(correctAnswer);
            options.push(newOption);
            options = Array.from(new Set(options)); // Eliminar duplicados
        }
        
        options = options.slice(0, 4); // Tomar exactamente 4 opciones

        const container = document.getElementById('options');
        container.innerHTML = options.map(option => `
            <div class="option" onclick="game.checkAnswer('${option}', '${correctAnswer}')">
                ${option}
            </div>
        `).join('');
    }

    generateSimilarAnswers(correctAnswer) {
        const similarAnswers = new Set();
        
        // Cambiar signos
        similarAnswers.add(correctAnswer.startsWith('-') ? correctAnswer.substring(1) : '-' + correctAnswer);
        
        // Cambiar coeficientes
        const coefMatch = correctAnswer.match(/^-?\d+/);
        if (coefMatch) {
            const coef = parseInt(coefMatch[0]);
            similarAnswers.add(correctAnswer.replace(/^-?\d+/, (coef + 1).toString()));
            similarAnswers.add(correctAnswer.replace(/^-?\d+/, (coef - 1).toString()));
        }
        
        // Cambiar exponentes
        const expMatch = correctAnswer.match(/x(\d+)/);
        if (expMatch) {
            const exp = parseInt(expMatch[1]);
            similarAnswers.add(correctAnswer.replace(/x\d+/, `x${exp + 1}`));
            similarAnswers.add(correctAnswer.replace(/x\d+/, `x${exp - 1}`));
        }
        
        // Mejorar generación de opciones para funciones trigonométricas
        if (correctAnswer.includes('sin') || correctAnswer.includes('cos')) {
            // Para derivadas simples como cos(x) o -sin(x)
            if (correctAnswer === 'cos(x)') {
                similarAnswers.add('-cos(x)');
                similarAnswers.add('sin(x)');
                similarAnswers.add('-sin(x)');
            } else if (correctAnswer === '-sin(x)') {
                similarAnswers.add('sin(x)');
                similarAnswers.add('cos(x)');
                similarAnswers.add('-cos(x)');
            }
            
            // Para derivadas con coeficientes como 2sin(x)cos(x)
            if (correctAnswer.includes('sin') && correctAnswer.includes('cos')) {
                const hasNegative = correctAnswer.startsWith('-');
                const coefMatch = correctAnswer.match(/^-?\d+/);
                const coef = coefMatch ? parseInt(coefMatch[0]) : 1;
                
                // Cambiar coeficiente y mantener estructura
                similarAnswers.add(`${coef + 1}sin(x)cos(x)`);
                similarAnswers.add(`${coef - 1}sin(x)cos(x)`);
                
                // Cambiar orden de funciones
                similarAnswers.add(`${hasNegative ? '-' : ''}${coef}cos(x)sin(x)`);
            }
            
            // Para derivadas con potencias como 3sin²(x)cos(x)
            if (correctAnswer.includes('²') || correctAnswer.includes('³')) {
                const hasNegative = correctAnswer.startsWith('-');
                const coefMatch = correctAnswer.match(/^-?\d+/);
                const coef = coefMatch ? parseInt(coefMatch[0]) : 1;
                
                // Cambiar exponentes y coeficientes
                if (correctAnswer.includes('sin²')) {
                    similarAnswers.add(`${coef}sin³(x)cos(x)`);
                    similarAnswers.add(`${coef}sin(x)cos²(x)`);
                } else if (correctAnswer.includes('cos²')) {
                    similarAnswers.add(`${coef}cos³(x)sin(x)`);
                    similarAnswers.add(`${coef}cos(x)sin²(x)`);
                }
            }
        }

        // Asegurar que tenemos suficientes opciones diferentes
        if (similarAnswers.size < 3) {
            // Agregar opciones adicionales si no hay suficientes
            similarAnswers.add(correctAnswer.includes('x') ? correctAnswer.replace('x', '2x') : correctAnswer.replace('2', '3'));
            similarAnswers.add(correctAnswer.includes('²') ? correctAnswer.replace('²', '³') : correctAnswer + '²');
        }

        return Array.from(similarAnswers);
    }

    generateAdditionalOption(correctAnswer) {
        // Generar una opción adicional si es necesario
        if (correctAnswer.includes('sin') || correctAnswer.includes('cos')) {
            const variations = [
                correctAnswer.replace('sin', 'cos'),
                correctAnswer.replace('cos', 'sin'),
                '-' + correctAnswer,
                correctAnswer.replace(/\d+/, n => (parseInt(n) + 1).toString())
            ];
            return variations[Math.floor(Math.random() * variations.length)];
        }
        
        // Para derivadas no trigonométricas
        if (correctAnswer.includes('x')) {
            const exp = correctAnswer.match(/x(\d+)?/);
            const power = exp && exp[1] ? parseInt(exp[1]) : 1;
            return correctAnswer.replace(/x\d*/, `x${power + 1}`);
        }
        
        return parseInt(correctAnswer) + 1 + '';
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        
        const timerElement = document.getElementById('timer');
        timerElement.textContent = this.timeLeft;
        timerElement.classList.remove('warning');
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            timerElement.textContent = this.timeLeft;
            
            if (this.timeLeft <= 5) {
                timerElement.classList.add('warning');
                timerElement.style.color = 'var(--danger-color)';
            }
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.endGame();
            }
        }, 1000);
    }

    checkAnswer(selectedAnswer, correctAnswer) {
        if (selectedAnswer === correctAnswer) {
            this.score += 100;
            clearInterval(this.timer);
            this.showNextQuestion();
        } else {
            this.endGame();
        }
    }

    endGame() {
        clearInterval(this.timer);
        
        // Aplicar penalización según dificultad si perdió
        if (this.currentQuestion < this.totalQuestions) {
            switch(this.difficulty) {
                case 'medium':
                    this.score = Math.max(0, this.score - 300);
                    break;
                case 'hard':
                    this.score = Math.floor(this.score / 2);
                    break;
            }
        }
        
        this.switchScreen('game-screen', 'results-screen');
        document.getElementById('player-result').textContent = this.playerName;
        document.getElementById('final-score').textContent = this.score;
    }

    restartGame() {
        this.switchScreen('results-screen', 'name-screen');
        document.getElementById('player-name').value = '';
        this.difficulty = 'easy';
        this.totalQuestions = 10;
    }
}

// Iniciar el juego cuando se carga la página
let game;
window.addEventListener('load', () => {
    game = new DerivativeGame();
}); 