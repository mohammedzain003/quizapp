// Quiz App JavaScript

class QuizApp {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.timer = null;
        this.timeLeft = 30;
        this.correctAnswers = 0;
        this.isAnswered = false;

        // DOM elements
        this.loadingScreen = document.getElementById('loading-screen');
        this.quizContainer = document.getElementById('quiz-container');
        this.resultsContainer = document.getElementById('results-container');
        this.questionText = document.getElementById('question-text');
        this.optionsContainer = document.getElementById('options-container');
        this.feedbackContainer = document.getElementById('feedback-container');
        this.feedbackMessage = document.getElementById('feedback-message');
        this.nextBtn = document.getElementById('next-btn');
        this.scoreDisplay = document.getElementById('score');
        this.progressBar = document.getElementById('progress-bar');
        this.questionCounter = document.getElementById('question-counter');
        this.timerDisplay = document.getElementById('timer');
        this.themeToggle = document.getElementById('theme-toggle');
        this.restartBtn = document.getElementById('restart-btn');
        this.finalScore = document.getElementById('final-score');
        this.percentage = document.getElementById('percentage');
        this.correctAnswersDisplay = document.getElementById('correct-answers');
        this.feedbackTitle = document.getElementById('feedback-title');
        this.feedbackText = document.getElementById('feedback-text');

        this.init();
    }

    init() {
        this.loadQuestions();
        this.setupEventListeners();
        this.loadTheme();
    }

    async loadQuestions() {
        try {
            const response = await fetch('questions.json');
            this.questions = await response.json();
            this.hideLoading();
            this.showQuiz();
            this.displayQuestion();
        } catch (error) {
            console.error('Error loading questions:', error);
            this.showError('Failed to load questions. Please refresh the page.');
        }
    }

    hideLoading() {
        this.loadingScreen.classList.add('d-none');
    }

    showQuiz() {
        this.quizContainer.classList.remove('d-none');
    }

    displayQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        this.questionText.textContent = question.question;
        this.optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'option-btn btn';
            optionBtn.textContent = option;
            optionBtn.dataset.index = index;
            optionBtn.addEventListener('click', () => this.selectAnswer(index));
            this.optionsContainer.appendChild(optionBtn);
        });

        this.updateUI();
        this.startTimer();
        this.isAnswered = false;
    }

    updateUI() {
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        this.progressBar.style.width = `${progress}%`;
        this.questionCounter.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`;
        this.scoreDisplay.textContent = `Score: ${this.score}`;
    }

    startTimer() {
        this.timeLeft = 30;
        this.updateTimerDisplay();

        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        this.timerDisplay.textContent = `Time: ${this.timeLeft}s`;
        this.timerDisplay.style.color = this.timeLeft <= 10 ? '#ef4444' : '#6b7280';
    }

    timeUp() {
        clearInterval(this.timer);
        this.showFeedback(false, 'Time\'s up!');
        this.disableOptions();
        this.nextBtn.classList.remove('d-none');
    }

    selectAnswer(selectedIndex) {
        if (this.isAnswered) return;

        clearInterval(this.timer);
        this.isAnswered = true;

        const correctIndex = this.questions[this.currentQuestionIndex].correct;
        const isCorrect = selectedIndex === correctIndex;

        if (isCorrect) {
            this.score += 10;
            this.correctAnswers++;
            this.playSound('correct');
        } else {
            this.playSound('incorrect');
        }

        this.showFeedback(isCorrect, isCorrect ? 'Correct!' : 'Incorrect!');
        this.highlightAnswers(selectedIndex, correctIndex);
        this.disableOptions();
        this.nextBtn.classList.remove('d-none');
        this.updateUI();
        this.saveProgress();
    }

    showFeedback(isCorrect, message) {
        this.feedbackContainer.classList.remove('d-none');
        this.feedbackMessage.className = `alert ${isCorrect ? 'alert-success' : 'alert-danger'}`;
        this.feedbackMessage.textContent = message;
    }

    highlightAnswers(selectedIndex, correctIndex) {
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns[selectedIndex].classList.add(selectedIndex === correctIndex ? 'correct' : 'incorrect');
        if (selectedIndex !== correctIndex) {
            optionBtns[correctIndex].classList.add('correct');
        }
    }

    disableOptions() {
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => btn.classList.add('disabled'));
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        this.feedbackContainer.classList.add('d-none');
        this.nextBtn.classList.add('d-none');

        if (this.currentQuestionIndex < this.questions.length) {
            this.displayQuestion();
        } else {
            this.showResults();
        }
    }

    showResults() {
        this.quizContainer.classList.add('d-none');
        this.resultsContainer.classList.remove('d-none');

        const percentage = Math.round((this.correctAnswers / this.questions.length) * 100);

        this.finalScore.textContent = this.score;
        this.percentage.textContent = `${percentage}%`;
        this.correctAnswersDisplay.textContent = this.correctAnswers;

        this.setPerformanceFeedback(percentage);
    }

    setPerformanceFeedback(percentage) {
        let title, text;

        if (percentage >= 90) {
            title = 'Excellent!';
            text = 'You\'re a quiz master! Keep up the great work.';
        } else if (percentage >= 70) {
            title = 'Good Job!';
            text = 'Well done! You have a solid understanding.';
        } else if (percentage >= 50) {
            title = 'Not Bad!';
            text = 'You\'re on the right track. Keep practicing!';
        } else {
            title = 'Keep Trying!';
            text = 'Don\'t give up! Review the material and try again.';
        }

        this.feedbackTitle.textContent = title;
        this.feedbackText.textContent = text;
    }

    restartQuiz() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.resultsContainer.classList.add('d-none');
        this.showQuiz();
        this.displayQuestion();
        this.clearProgress();
    }

    setupEventListeners() {
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.restartBtn.addEventListener('click', () => this.restartQuiz());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    toggleTheme() {
        const body = document.body;
        const isDark = body.dataset.theme === 'dark';
        body.dataset.theme = isDark ? '' : 'dark';
        this.themeToggle.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', body.dataset.theme || 'light');
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.dataset.theme = 'dark';
            this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    playSound(type) {
        // Optional: Add sound effects
        // const audio = new Audio(`sounds/${type}.mp3`);
        // audio.play();
    }

    saveProgress() {
        const progress = {
            currentQuestionIndex: this.currentQuestionIndex,
            score: this.score,
            correctAnswers: this.correctAnswers
        };
        localStorage.setItem('quizProgress', JSON.stringify(progress));
    }

    loadProgress() {
        const saved = localStorage.getItem('quizProgress');
        if (saved) {
            const progress = JSON.parse(saved);
            this.currentQuestionIndex = progress.currentQuestionIndex;
            this.score = progress.score;
            this.correctAnswers = progress.correctAnswers;
        }
    }

    clearProgress() {
        localStorage.removeItem('quizProgress');
    }


    showError(message) {
        // Simple error display
        alert(message);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});