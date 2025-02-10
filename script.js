let selectedQuestions = []; // ✅ Declared once, assigned later
let currentQuestion = 0;
let score = 0;
let unanswered = [];
let timeLeft = 2 * 60 * 60; // 2 hours in seconds
let timer;
let questions = [];

document.addEventListener("DOMContentLoaded", function() {
    const checkbox = document.getElementById("accept-disclaimer");
    const startButton = document.getElementById("start-test-btn");

    checkbox.addEventListener("change", function() {
        startButton.disabled = !checkbox.checked;
    });
});


// ✅ Load questions from JSON file
fetch("questions.json")
    .then(response => response.json())
    .then(data => {
        questions = data;
        console.log("✅ Questions loaded successfully!", questions);
    })
    .catch(error => console.error("❌ Error loading questions:", error));

// ✅ Timer function (MUST be defined before it's used)
function updateTimer() {
    const timerElement = document.getElementById("timer");

    if (!timerElement) {
        console.error("❌ ERROR: Timer element not found!");
        return;
    }

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    timerElement.innerText = `Time Left: ${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    timeLeft--;

    if (timeLeft < 0) {
        clearInterval(timer);
        endTest();
    }
}

// ✅ Function to get a random subset
function getRandomSubset(array, count) {
    let shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// ✅ Start the test (Now `selectedQuestions` is assigned here)
function startTest() {
    document.getElementById("start-container").style.display = "none";
    document.getElementById("test-container").style.display = "block";
    document.getElementById("timer").style.display = "block";

    currentQuestion = 0;
    score = 0;
    unanswered = [];
    timeLeft = 2 * 60 * 60;
    clearInterval(timer);

    // ❗ Ensure questions are loaded before proceeding
    if (!questions || questions.length === 0) {
        console.error("❌ ERROR: No questions loaded! Check JSON file.");
        return;
    }

    // ✅ Separate questions by category
    const disabilitiesQuestions = questions.filter(q => q.theme === "disabilities");
    const accessibilityQuestions = questions.filter(q => q.theme === "accessibility");
    const standardsQuestions = questions.filter(q => q.theme === "standards");

    // ✅ Assign to selectedQuestions (WITHOUT redeclaring it)
    selectedQuestions = [
        ...getRandomSubset(disabilitiesQuestions, 40),
        ...getRandomSubset(accessibilityQuestions, 40),
        ...getRandomSubset(standardsQuestions, 20)
    ].sort(() => 0.5 - Math.random()); // Shuffle the final selection

    console.log("✅ Selected questions:", selectedQuestions);

    updateTimer();
    timer = setInterval(updateTimer, 1000);
    showQuestion();
}

// ✅ Function to show a question
function showQuestion() {
    if (currentQuestion < selectedQuestions.length) {
        const questionObj = selectedQuestions[currentQuestion];

        console.log(`📝 Displaying Question ${currentQuestion + 1} of ${selectedQuestions.length}:`, questionObj);

        document.getElementById("question-text").innerHTML = 
            `<strong>Question ${currentQuestion + 1} of ${selectedQuestions.length}</strong><br><br> ${questionObj.question}`;

        const options = document.getElementById("options");
        options.innerHTML = ''; // Clear previous buttons

        // Create a shuffled copy of options with their original indexes
        let optionIndexes = questionObj.options.map((_, index) => index);
        optionIndexes.sort(() => Math.random() - 0.5); // Shuffle the indexes

        // Find the new correct answer index after shuffling
        let newCorrectIndex = optionIndexes.indexOf(questionObj.correct);

        // Store new correct answer index in the question object
        questionObj.shuffledCorrect = newCorrectIndex;

        // Display shuffled options
        optionIndexes.forEach((originalIndex, newIndex) => {
            const button = document.createElement("button");
            button.innerText = questionObj.options[originalIndex]; // Assign shuffled text
            button.classList.add("option-btn");
            button.onclick = () => checkAnswer(newIndex); // Pass shuffled index
            options.appendChild(button);
        });

        document.getElementById("feedback").innerHTML = "";
    } else {
        endTest();
    }
}


// ✅ Function to check the answer
// Object to store mistake counts per category
let mistakeCounts = {
    disabilities: 0,
    accessibility: 0,
    standards: 0
};

function checkAnswer(selected) {
    const questionObj = selectedQuestions[currentQuestion];
    const correct = questionObj.shuffledCorrect;
    const feedback = document.getElementById("feedback");
    feedback.innerHTML = ""; // Clear previous feedback

    const buttons = document.querySelectorAll(".option-btn");

    if (selected === correct) {
        buttons[selected].style.backgroundColor = "#28a745"; // Green for correct
        feedback.innerHTML = "<p style='color: #28a745; font-weight: bold;'>✔ Correct!</p>";
    } else {
        buttons[selected].style.backgroundColor = "#dc3545"; // Red for incorrect
        buttons[correct].style.backgroundColor = "#28a745"; // Highlight the correct answer

        feedback.innerHTML = `<p style='color: #dc3545; font-weight: bold;'>❌ Incorrect! The correct answer was: ${questionObj.options[questionObj.correct]}</p>`;

        // Track incorrect answers by category
        mistakeCounts[questionObj.theme]++;

        unanswered.push({
            question: questionObj.question,
            correctAnswer: questionObj.options[questionObj.correct],
            category: questionObj.theme
        });
    }

    // Disable buttons after selection
    buttons.forEach(btn => btn.disabled = true);

    // Move to next question after a delay
    setTimeout(() => {
        currentQuestion++;
        showQuestion();
    }, 1500);
}




// ✅ Function to end the test
function endTest() {
    clearInterval(timer);
    document.getElementById("test-container").style.display = "none";
    const results = document.getElementById("results");
    results.style.display = "block";

    let finalScore = selectedQuestions.length - unanswered.length;
    let percentage = ((finalScore / selectedQuestions.length) * 100).toFixed(2);

    results.innerHTML = `<p>You scored <strong>${finalScore} out of ${selectedQuestions.length}</strong> (${percentage}%).</p>`;

      // ✅ Add mistake statistics
      results.innerHTML += `
      <h3>Category Breakdown:</h3>
      <p>Disabilities & Assistive Technologies Mistakes: <strong>${mistakeCounts.disabilities}</strong></p>
      <p>Accessibility & Universal Design Mistakes: <strong>${mistakeCounts.accessibility}</strong></p>
      <p>Standards, Laws & Strategies Mistakes: <strong>${mistakeCounts.standards}</strong></p>
  `;
    if (unanswered.length > 0) {
        results.innerHTML += "<h3>Questions you answered incorrectly:</h3><ul>";
        unanswered.forEach(item => {
            results.innerHTML += `<li>${item.question}<br><strong>Correct Answer:</strong> ${item.correctAnswer}</li>`;
        });
        results.innerHTML += "</ul>";
    }

  

    // ✅ Restart button
    results.innerHTML += `<button class="restart-btn" onclick="location.reload()">Restart Test</button>`;
}

