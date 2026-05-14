# 4-5 Minute Video Outline

## 1. Introduction

Introduce yourself and the project:

"My name is Olakunle Obademi. For my CSE 310 JavaScript module, I created a console-based task manager using Node.js."

## 2. Run the Software

Show the project folder in VS Code or PowerShell.

Run:

```bash
npm install
npm run demo
```

Explain that the demo shows task listing, adding a task, adding a subtask, completing a task, searching, and viewing statistics.

Then run the interactive version:

```bash
npm start
```

Try a few commands:

```text
add Finish Canvas upload | high | 25
list
stats
exit
```

## 3. Code Walkthrough

Open `src/app.js` and point out:

* `loadTasks` and `saveTasks` read and write the JSON data file.
* `addTask`, `updateTask`, `deleteTask`, and `completeTask` are the main task manager functions.
* `searchTasks` and `buildStats` use ES6 array functions such as `filter`, `map`, and `reduce`.
* `totalSubtaskMinutes` and `renderSubtasks` demonstrate recursion.
* `TaskValidationError` and the `try/catch` blocks demonstrate exception handling.
* `picocolors` is the external npm library used for terminal colors.

## 4. README and Repository

Open `README.md` and show:

* Project overview.
* Development environment.
* Useful websites.
* Future work.
* Demo video link placeholder.

After uploading the video, replace `REPLACE_WITH_VIDEO_LINK` in `README.md` and `W02_Submit_Module_1.md`.

## 5. Closing

Close by saying:

"This project helped me practice JavaScript functions, arrays, recursion, npm packages, JSON file storage, and exception handling."
