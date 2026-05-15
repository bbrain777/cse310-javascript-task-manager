# JavaScript Task Manager

## Overview

This software is a console-based task manager written in JavaScript for the CSE 310 JavaScript language module. I created it to practice building a complete Node.js program with functions, arrays, recursion, file storage, exception handling, and an external JavaScript library.

The program lets a user add, update, delete, complete, search, and list tasks. It also stores tasks in a JSON file so task data remains available after the program closes.

[Software Demo Video](https://youtu.be/CFHrzUj_0lg)

## Development Environment

* Visual Studio Code
* Node.js
* JavaScript
* Git and GitHub
* Windows PowerShell

The external library used in this project is `picocolors`, which adds readable terminal colors to the command line output.

## Useful Websites

* [JavaScript Documentation - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
* [Node.js Documentation](https://nodejs.org/docs/latest/api/)
* [picocolors on npm](https://www.npmjs.com/package/picocolors)
* [Markdown Guide](https://www.markdownguide.org/)

## Future Work

* Add due dates and sort tasks by deadline.
* Add a command to create nested subtasks from the terminal.
* Add automated tests for command parsing and validation.

## Running the Program

Install dependencies:

```bash
npm install
```

Start the interactive program:

```bash
npm start
```

Run the scripted demo:

```bash
npm run demo
```

Example commands:

```text
add Finish README | high | 30
list
update 1 | priority | medium
subtask 1 | Record code walkthrough | 20
complete 1
search readme
stats
exit
```

## Module Requirements Demonstrated

* Displays output to the terminal with Node.js.
* Uses ES6 array functions such as `map`, `filter`, `reduce`, `find`, `findIndex`, and `flatMap`.
* Uses recursion to calculate nested subtask minutes and render nested subtask lists.
* Uses `picocolors`, an external npm package written by someone else.
* Demonstrates throwing and handling exceptions with custom validation errors.
* Reads and writes task data using a JSON file.
