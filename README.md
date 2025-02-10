# CPACC Quiz 🏆

This project is a **Certified Professional in Accessibility Core Competencies (CPACC) Quiz** designed to help users practice for the CPACC exam. It features **randomized multiple-choice questions**, a **timer**, **immediate feedback**, and **category-based performance analysis**.

## 📜 **Project Overview**
This simulator presents **100 randomly selected questions** from a **large question bank** while ensuring a **balanced distribution of topics**:
- **Disabilities, Challenges & Assistive Technologies (40%)**
- **Accessibility & Universal Design (40%)**
- **Standards, Laws & Management Strategies (20%)**

The test runs for **2 hours**, and users receive **detailed performance statistics at the end**, including:
✅ **Score percentage**  
✅ **Review of incorrect answers**  
✅ **Breakdown of mistakes by category**  

---

## 🎯 **Features**
✔ **Randomized question selection** (keeping category weight distribution)  
✔ **Fully accessible UI** (keyboard navigation, high contrast, ARIA labels)  
✔ **Screen reader support**  
✔ **Immediate feedback per question** (correct/incorrect answers)  
✔ **Final score with mistake breakdown per category**  
✔ **Restart button for multiple attempts**  
✔ **Scenario-based judgment questions included**  

---
## 🚀 **Getting Started**
### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/SigmaMee/cpacc-quiz.git
cd cpacc-test-simulator
```
### **2️⃣ Start a Local Server**
To avoid CORS issues when loading questions.json, start a simple HTTP server:
Using Python
```sh
python3 -m http.server 5500
```
Using Node.js
```sh
npx http-server -p 5500
```
Now, open your browser and go to http://localhost:5500/
---
## 📂 **Project Structure**
/cpacc-quiz
│── index.html        # Main HTML file
│── style.css         # CSS styles for UI
│── script.js         # Core JavaScript logic
│── questions.json    # Question bank (loaded dynamically)
│── README.md         # Project documentation
---
## 🏆 **Question Types**
This simulator includes:
- Multiple-choice questions (1 correct answer out of 4 options)
- Scenario-based decision questions (real-world accessibility challenges)
- Best-solution selection questions (choosing the most effective approach)
- Judgment-based questions (applying accessibility best practices)
---
## 🛠** Customization**
You can modify `questions.json` to:
- Add new questions
- Change category distribution
- Adjust diffuculty levels

To edit tile limits, modify `script.js`:
```javascript
let timeLeft = 2 * 60 * 60; // 2 hours in seconds
```
---
## 🙌 **Contributing**
Want to improve the simulator?

1. Fork the repository
2. Create a new branch (feature/improve-ui)
3. Commit your changes
4. Submit a Pull Request!



