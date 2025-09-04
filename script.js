// Quiz App JavaScript - Simplified Version

// DOM Elements - Using an object for better organization
const elements = {
  screens: {
    start: document.getElementById('start-screen'),
    question: document.getElementById('question-screen'),
    results: document.getElementById('results-screen')
  },
  buttons: {
    start: document.getElementById('start-btn'),
    prev: document.getElementById('prev-btn'),
    next: document.getElementById('next-btn'),
    submit: document.getElementById('submit-btn'),
    restart: document.getElementById('restart-btn')
  },
  question: {
    text: document.getElementById('question-text'),
    options: document.getElementById('options-container'),
    current: document.getElementById('current-question'),
    total: document.getElementById('total-questions')
  },
  progress: {
    fill: document.getElementById('progress-fill'),
    percent: document.getElementById('progress-percent')
  },
  timer: {
    value: document.getElementById('time-value'),
    bar: document.getElementById('timer-bar')
  },
  results: {
    score: document.getElementById('score-value'),
    maxScore: document.getElementById('max-score'),
    percentage: document.getElementById('score-percentage'),
    container: document.getElementById('results-container')
  }
};

// Quiz State - All quiz data in one object
let quiz = {
  questions: [],
  currentIndex: 0,
  userAnswers: [],
  score: 0,
  timer: null,
  timeLeft: 30
};

// Initialize Quiz - Combined loading questions and setup
async function initQuiz() {
    try {
        // Load questions
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Failed to load questions');
        
        quiz.questions = await response.json();
        quiz.userAnswers = Array(quiz.questions.length).fill(null);
        
        // Update UI elements
        elements.question.total.textContent = quiz.questions.length;
        elements.results.maxScore.textContent = quiz.questions.length;
        
        // Set up event listeners
        elements.buttons.start.addEventListener('click', startQuiz);
        elements.buttons.prev.addEventListener('click', prevQuestion);
        elements.buttons.next.addEventListener('click', nextQuestion);
        elements.buttons.submit.addEventListener('click', submitQuiz);
        elements.buttons.restart.addEventListener('click', restartQuiz);
        
        // Show start screen
        showScreen('start');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load quiz. Please refresh the page.');
    }
}

// Show specific screen
function showScreen(screenName) {
    // Hide all screens
    Object.values(elements.screens).forEach(screen => screen.classList.remove('active'));
    
    // Show requested screen
    elements.screens[screenName].classList.add('active');
    
    // Stop timer if not on question screen
    if (screenName !== 'question' && quiz.timer) {
        clearInterval(quiz.timer);
    }
}

// Start Quiz
function startQuiz() {
    quiz.currentIndex = 0;
    quiz.userAnswers = Array(quiz.questions.length).fill(null);
    quiz.score = 0;
    
    showScreen('question');
    loadQuestion();
}

// Load Current Question
function loadQuestion() {
    const question = quiz.questions[quiz.currentIndex];
    const optionLetters = ['A', 'B', 'C', 'D'];
    
    // Update question text and number
    elements.question.text.textContent = question.question;
    elements.question.current.textContent = quiz.currentIndex + 1;
    
    // Update progress bar
    const progress = ((quiz.currentIndex + 1) / quiz.questions.length) * 100;
    elements.progress.fill.style.width = `${progress}%`;
    if (elements.progress.percent) {
        elements.progress.percent.textContent = `${Math.round(progress)}%`;
    }
    
    // Clear and create options
    elements.question.options.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionEl = document.createElement('div');
        optionEl.classList.add('option');
        optionEl.setAttribute('role', 'button');
        optionEl.setAttribute('tabindex', '0');
        
        // Mark if previously selected
        if (quiz.userAnswers[quiz.currentIndex] === option) {
            optionEl.classList.add('selected');
        }
        
        // Add content
        optionEl.innerHTML = `
            <span class="option-prefix">${optionLetters[index]}</span>
            <span class="option-text">${option}</span>
        `;
        
        // Add events (click and keyboard)
        optionEl.addEventListener('click', () => selectOption(option, optionEl));
        optionEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectOption(option, optionEl);
            }
        });
        
        elements.question.options.appendChild(optionEl);
    });
    
    // Update navigation and start timer
    updateNavigation();
    startTimer();
}

// Select an option
function selectOption(option, selectedElement) {
    // Save answer and update UI
    quiz.userAnswers[quiz.currentIndex] = option;
    
    document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
    selectedElement.classList.add('selected');
    
    // Enable next button
    elements.buttons.next.disabled = false;
}

// Navigation functions
function prevQuestion() {
    if (quiz.currentIndex > 0) {
        quiz.currentIndex--;
        loadQuestion();
    }
}

function nextQuestion() {
    if (quiz.userAnswers[quiz.currentIndex] !== null) {
        if (quiz.currentIndex < quiz.questions.length - 1) {
            quiz.currentIndex++;
            loadQuestion();
        }
    } else {
        alert('Please select an answer before proceeding.');
    }
}

// Update navigation buttons visibility
function updateNavigation() {
    // Update previous button
    elements.buttons.prev.disabled = quiz.currentIndex === 0;
    
    // Show submit on last question
    const isLastQuestion = quiz.currentIndex === quiz.questions.length - 1;
    elements.buttons.next.style.display = isLastQuestion ? 'none' : 'block';
    elements.buttons.submit.style.display = isLastQuestion ? 'block' : 'none';
    
    // Disable next if no answer
    elements.buttons.next.disabled = quiz.userAnswers[quiz.currentIndex] === null;
}

// Submit Quiz
function submitQuiz() {
    clearInterval(quiz.timer);
    
    // Calculate score
    quiz.score = 0;
    quiz.userAnswers.forEach((answer, index) => {
        if (answer === quiz.questions[index].correctAnswer) {
            quiz.score++;
        }
    });
    
    // Update score display
    elements.results.score.textContent = quiz.score;
    elements.results.percentage.textContent = 
        Math.round((quiz.score / quiz.questions.length) * 100);
    
    // Display results and switch screen
    displayResults();
    showScreen('results');
    
    // Save score
    saveHighScore();
}

// Display Results - Simplified with template literals
function displayResults() {
    elements.results.container.innerHTML = '';
    
    quiz.questions.forEach((question, index) => {
        const userAnswer = quiz.userAnswers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        
        // Create result item with template literals for cleaner code
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <h3>
                <span class="result-status ${isCorrect ? 'correct' : 'incorrect'}"></span>
                Question ${index + 1}
            </h3>
            <p>${question.question}</p>
            <div class="result-answers">
                <div class="answer-item correct ${userAnswer === question.correctAnswer ? 'user' : ''}">
                    <strong>Correct Answer:</strong> ${question.correctAnswer}
                </div>
                ${userAnswer !== question.correctAnswer ? 
                    `<div class="answer-item incorrect user">
                        <strong>Your Answer:</strong> ${userAnswer || 'No answer'}
                    </div>` : ''}
            </div>
        `;
        
        elements.results.container.appendChild(resultItem);
    });
}

// Restart Quiz
function restartQuiz() {
    quiz.userAnswers = Array(quiz.questions.length).fill(null);
    quiz.currentIndex = 0;
    quiz.score = 0;
    
    showScreen('question');
    loadQuestion();
}

// Start Timer - Simplified
function startTimer() {
    clearInterval(quiz.timer);
    quiz.timeLeft = 30;
    elements.timer.value.textContent = quiz.timeLeft;
    
    // Reset animation
    elements.timer.bar.style.animation = 'none';
    elements.timer.bar.offsetHeight; // Force reflow
    
    requestAnimationFrame(() => {
        elements.timer.bar.style.animation = 'timer 30s linear forwards';
    });
    
    quiz.timer = setInterval(() => {
        quiz.timeLeft--;
        elements.timer.value.textContent = quiz.timeLeft;
        
        // Handle warning state
        elements.timer.value.classList.toggle('time-warning', quiz.timeLeft <= 10);
        
        // Handle time up
        if (quiz.timeLeft <= 0) {
            clearInterval(quiz.timer);
            elements.timer.value.classList.remove('time-warning');
            
            showTimeUpNotification();
        }
    }, 1000);
}

// Show time up notification
function showTimeUpNotification() {
    const notification = document.createElement('div');
    notification.className = 'time-up-notification';
    notification.textContent = 'Time\'s up!';
    document.body.appendChild(notification);
    
    // Remove notification and proceed after delay
    setTimeout(() => {
        document.body.removeChild(notification);
        
        if (quiz.currentIndex === quiz.questions.length - 1) {
            submitQuiz();
        } else {
            quiz.currentIndex++;
            loadQuestion();
        }
    }, 1500);
}

// Save high score to localStorage - Simplified
function saveHighScore() {
    const highScores = JSON.parse(localStorage.getItem('quizHighScores')) || [];
    
    // Add new score
    highScores.push({
        score: quiz.score,
        date: new Date().toISOString()
    });
    
    // Sort and limit to top 5
    highScores
        .sort((a, b) => b.score - a.score)
        .splice(5);
    
    localStorage.setItem('quizHighScores', JSON.stringify(highScores));
}

// Handle page visibility - For better UX when tab is inactive
document.addEventListener('visibilitychange', () => {
    if (document.hidden && quiz.timer) {
        clearInterval(quiz.timer);
    } else if (!document.hidden && elements.screens.question.classList.contains('active')) {
        startTimer();
    }
});

// Initialize the quiz when page loads
document.addEventListener('DOMContentLoaded', initQuiz);
