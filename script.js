let selectedQuestions = [];
let currentQuestion = 0;
let unanswered = [];
let timeLeft = 2 * 60 * 60;
let timer;
let questions = [];
let mistakeCounts = createEmptyMistakeCounts();

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
    elements.startContainer = document.getElementById("start-container");
    elements.testContainer = document.getElementById("test-container");
    elements.results = document.getElementById("results");
    elements.checkbox = document.getElementById("accept-disclaimer");
    elements.startButton = document.getElementById("start-test-btn");
    elements.loadingStatus = document.getElementById("loading-status");
    elements.timerValue = document.getElementById("timer-value");
    elements.questionProgress = document.getElementById("question-progress");
    elements.progressBar = document.getElementById("progress-bar");
    elements.questionHeading = document.getElementById("question-heading");
    elements.options = document.getElementById("options");
    elements.feedback = document.getElementById("feedback");
    elements.nextButton = document.getElementById("next-question-btn");
    elements.submitButton = document.getElementById("submit-test-btn");

    elements.checkbox.addEventListener("change", updateStartButton);
    elements.startButton.addEventListener("click", startTest);
    elements.nextButton.addEventListener("click", goToNextQuestion);
    elements.submitButton.addEventListener("click", endTest);

    loadQuestions();
});

function createEmptyMistakeCounts() {
    return { disabilities: 0, accessibility: 0, standards: 0 };
}

async function loadQuestions() {
    try {
        const response = await fetch("questions.json");
        if (!response.ok) throw new Error(`Question bank returned ${response.status}`);
        questions = await response.json();
        elements.loadingStatus.textContent = `${questions.length} practice questions ready.`;
        updateStartButton();
    } catch (error) {
        console.error("Unable to load questions:", error);
        elements.loadingStatus.textContent = "The question bank could not be loaded. Refresh the page to try again.";
    }
}

function updateStartButton() {
    elements.startButton.disabled = !elements.checkbox.checked || questions.length === 0;
}

function updateTimer() {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    elements.timerValue.textContent = `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    if (timeLeft <= 0) {
        clearInterval(timer);
        endTest();
        return;
    }
    timeLeft -= 1;
}

function getRandomSubset(array, count) {
    return [...array].sort(() => 0.5 - Math.random()).slice(0, count);
}

function startTest() {
    const disabilitiesQuestions = questions.filter(question => question.theme === "disabilities");
    const accessibilityQuestions = questions.filter(question => question.theme === "accessibility");
    const standardsQuestions = questions.filter(question => question.theme === "standards");

    selectedQuestions = [
        ...getRandomSubset(disabilitiesQuestions, 40),
        ...getRandomSubset(accessibilityQuestions, 40),
        ...getRandomSubset(standardsQuestions, 20)
    ].sort(() => 0.5 - Math.random());

    currentQuestion = 0;
    unanswered = [];
    mistakeCounts = createEmptyMistakeCounts();
    timeLeft = 2 * 60 * 60;

    elements.startContainer.hidden = true;
    elements.results.hidden = true;
    elements.testContainer.hidden = false;

    clearInterval(timer);
    updateTimer();
    timer = setInterval(updateTimer, 1000);
    showQuestion();
}

function showQuestion() {
    if (currentQuestion >= selectedQuestions.length) {
        endTest();
        return;
    }

    const question = selectedQuestions[currentQuestion];
    const optionIndexes = question.options.map((_, index) => index).sort(() => Math.random() - 0.5);
    question.shuffledCorrect = optionIndexes.indexOf(question.correct);

    elements.questionProgress.textContent = `Question ${currentQuestion + 1} of ${selectedQuestions.length}`;
    elements.progressBar.style.inlineSize = `${((currentQuestion + 1) / selectedQuestions.length) * 100}%`;
    elements.questionHeading.textContent = question.question;
    elements.options.replaceChildren();
    elements.feedback.replaceChildren();
    elements.nextButton.hidden = true;

    optionIndexes.forEach((originalIndex, newIndex) => {
        const button = document.createElement("button");
        const marker = document.createElement("span");
        const label = document.createElement("span");

        button.type = "button";
        button.className = "option-btn";
        marker.className = "option-marker";
        marker.setAttribute("aria-hidden", "true");
        marker.textContent = String.fromCharCode(65 + newIndex);
        label.textContent = question.options[originalIndex];
        button.append(marker, label);
        button.addEventListener("click", () => checkAnswer(newIndex));
        elements.options.appendChild(button);
    });

    requestAnimationFrame(() => elements.questionHeading.focus());
}

function checkAnswer(selected) {
    const question = selectedQuestions[currentQuestion];
    const correct = question.shuffledCorrect;
    const buttons = [...elements.options.querySelectorAll(".option-btn")];
    const isCorrect = selected === correct;

    buttons.forEach(button => {
        button.disabled = true;
    });
    buttons[correct].classList.add("correct");

    const message = document.createElement("p");
    message.className = `feedback-message ${isCorrect ? "correct" : "incorrect"}`;

    if (isCorrect) {
        buttons[correct].setAttribute("aria-label", `Correct answer: ${buttons[correct].innerText}`);
        message.textContent = "Correct — well done.";
    } else {
        buttons[selected].classList.add("incorrect");
        buttons[selected].setAttribute("aria-label", `Your answer, incorrect: ${buttons[selected].innerText}`);
        buttons[correct].setAttribute("aria-label", `Correct answer: ${buttons[correct].innerText}`);
        message.textContent = `Incorrect. The correct answer is: ${question.options[question.correct]}`;
        mistakeCounts[question.theme] += 1;
        unanswered.push({
            question: question.question,
            correctAnswer: question.options[question.correct],
            category: question.theme
        });
    }

    elements.feedback.appendChild(message);
    elements.nextButton.textContent = currentQuestion === selectedQuestions.length - 1 ? "View results" : "Next question →";
    elements.nextButton.hidden = false;
    elements.nextButton.focus();
}

function goToNextQuestion() {
    currentQuestion += 1;
    showQuestion();
}

function endTest() {
    clearInterval(timer);
    elements.testContainer.hidden = true;
    elements.results.hidden = false;

    const answeredCount = Math.min(currentQuestion + (elements.nextButton.hidden ? 0 : 1), selectedQuestions.length);
    const skippedCount = selectedQuestions.length - answeredCount;
    const finalScore = Math.max(0, answeredCount - unanswered.length);
    const percentage = selectedQuestions.length ? Math.round((finalScore / selectedQuestions.length) * 100) : 0;

    elements.results.replaceChildren();
    const eyebrow = createElement("p", "eyebrow", "Practice complete");
    const heading = createElement("h1", "", "Your results");
    heading.id = "results-heading";
    heading.tabIndex = -1;
    const scoreCard = createElement("div", "score-card");
    scoreCard.append(
        createElement("span", "score-value", `${percentage}%`),
        createElement("span", "", `${finalScore} correct out of ${selectedQuestions.length}${skippedCount ? ` · ${skippedCount} not answered` : ""}`)
    );

    const breakdownHeading = createElement("h2", "", "Category breakdown");
    const breakdown = createElement("ul", "breakdown-list");
    [
        ["Disabilities and assistive technologies", mistakeCounts.disabilities],
        ["Accessibility and universal design", mistakeCounts.accessibility],
        ["Standards, laws and strategies", mistakeCounts.standards]
    ].forEach(([label, count]) => {
        const item = document.createElement("li");
        item.append(createElement("span", "", label), createElement("strong", "", `${count} ${count === 1 ? "mistake" : "mistakes"}`));
        breakdown.appendChild(item);
    });

    elements.results.append(eyebrow, heading, scoreCard, breakdownHeading, breakdown);

    if (unanswered.length > 0) {
        elements.results.appendChild(createElement("h2", "", "Review incorrect answers"));
        const review = createElement("ol", "review-list");
        unanswered.forEach(item => {
            const listItem = document.createElement("li");
            listItem.append(
                createElement("p", "", item.question),
                createElement("strong", "", `Correct answer: ${item.correctAnswer}`)
            );
            review.appendChild(listItem);
        });
        elements.results.appendChild(review);
    }

    const restartButton = createElement("button", "button button-primary", "Restart quiz");
    restartButton.type = "button";
    restartButton.addEventListener("click", () => window.location.reload());
    elements.results.appendChild(restartButton);
    requestAnimationFrame(() => heading.focus());
}

function createElement(tagName, className, text = "") {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
}
