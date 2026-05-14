const fs = require("fs/promises");
const path = require("path");
const readline = require("readline/promises");
const pc = require("picocolors");

const DATA_FILE = path.join(__dirname, "..", "data", "tasks.json");
const PRIORITIES = ["low", "medium", "high"];
const STATUSES = ["open", "done"];

class TaskValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "TaskValidationError";
  }
}

// Keep validation in small functions so every command gets the same rules.
function normalizeText(value) {
  return String(value ?? "").trim();
}

function validatePriority(priority) {
  const normalized = normalizeText(priority).toLowerCase();
  if (!PRIORITIES.includes(normalized)) {
    throw new TaskValidationError(`Priority must be one of: ${PRIORITIES.join(", ")}`);
  }
  return normalized;
}

function validateStatus(status) {
  const normalized = normalizeText(status).toLowerCase();
  if (!STATUSES.includes(normalized)) {
    throw new TaskValidationError(`Status must be one of: ${STATUSES.join(", ")}`);
  }
  return normalized;
}

function validateMinutes(minutes) {
  const parsed = Number.parseInt(minutes, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new TaskValidationError("Estimated minutes must be a number greater than or equal to 0.");
  }
  return parsed;
}

function createTask(id, title, priority, minutes) {
  const cleanTitle = normalizeText(title);
  if (cleanTitle.length < 3) {
    throw new TaskValidationError("Task title must contain at least three characters.");
  }

  return {
    id,
    title: cleanTitle,
    status: "open",
    priority: validatePriority(priority || "medium"),
    minutes: validateMinutes(minutes || 0),
    subtasks: [],
  };
}

// JSON storage keeps the project simple while still demonstrating persistence.
async function loadTasks() {
  try {
    const rawTasks = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(rawTasks);
  } catch (error) {
    if (error.code === "ENOENT") {
      await saveTasks([]);
      return [];
    }
    throw error;
  }
}

async function saveTasks(tasks) {
  const folder = path.dirname(DATA_FILE);
  await fs.mkdir(folder, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
}

function getNextId(tasks) {
  return tasks.reduce((largestId, task) => Math.max(largestId, task.id), 0) + 1;
}

function findTask(tasks, id) {
  const task = tasks.find((item) => item.id === Number(id));
  if (!task) {
    throw new TaskValidationError(`No task found with id ${id}.`);
  }
  return task;
}

function addTask(tasks, title, priority, minutes) {
  const task = createTask(getNextId(tasks), title, priority, minutes);
  tasks.push(task);
  return task;
}

function updateTask(tasks, id, field, value) {
  const task = findTask(tasks, id);
  const cleanField = normalizeText(field).toLowerCase();

  if (cleanField === "title") {
    if (normalizeText(value).length < 3) {
      throw new TaskValidationError("Task title must contain at least three characters.");
    }
    task.title = normalizeText(value);
  } else if (cleanField === "priority") {
    task.priority = validatePriority(value);
  } else if (cleanField === "status") {
    task.status = validateStatus(value);
  } else if (cleanField === "minutes") {
    task.minutes = validateMinutes(value);
  } else {
    throw new TaskValidationError("Field must be title, priority, status, or minutes.");
  }

  return task;
}

function deleteTask(tasks, id) {
  const index = tasks.findIndex((task) => task.id === Number(id));
  if (index === -1) {
    throw new TaskValidationError(`No task found with id ${id}.`);
  }
  return tasks.splice(index, 1)[0];
}

function completeTask(tasks, id) {
  return updateTask(tasks, id, "status", "done");
}

function addSubtask(tasks, id, title, minutes) {
  const task = findTask(tasks, id);
  const cleanTitle = normalizeText(title);
  if (cleanTitle.length < 3) {
    throw new TaskValidationError("Subtask title must contain at least three characters.");
  }

  task.subtasks.push({
    title: cleanTitle,
    minutes: validateMinutes(minutes || 0),
    subtasks: [],
  });
  return task;
}

// This recursive function counts subtasks no matter how deeply they are nested.
function totalSubtaskMinutes(subtasks) {
  return subtasks.reduce((sum, subtask) => {
    return sum + subtask.minutes + totalSubtaskMinutes(subtask.subtasks || []);
  }, 0);
}

function totalTaskMinutes(task) {
  return task.minutes + totalSubtaskMinutes(task.subtasks || []);
}

// Rendering is also recursive so the output mirrors the nested task structure.
function renderSubtasks(subtasks, depth = 1) {
  if (!subtasks || subtasks.length === 0) {
    return [];
  }

  return subtasks.flatMap((subtask) => {
    const indent = "  ".repeat(depth);
    const current = `${indent}- ${subtask.title} (${subtask.minutes} min)`;
    return [current, ...renderSubtasks(subtask.subtasks || [], depth + 1)];
  });
}

function formatTask(task) {
  const status = task.status === "done" ? pc.green("done") : pc.yellow("open");
  const priorityColor = task.priority === "high" ? pc.red : task.priority === "medium" ? pc.cyan : pc.gray;
  const totalMinutes = totalTaskMinutes(task);
  const header = `${pc.bold(`#${task.id}`)} ${task.title} | ${status} | ${priorityColor(task.priority)} | ${totalMinutes} min`;
  const subtaskLines = renderSubtasks(task.subtasks);
  return [header, ...subtaskLines].join("\n");
}

function listTasks(tasks) {
  if (tasks.length === 0) {
    return pc.gray("No tasks found. Add one with: add <title> | <priority> | <minutes>");
  }

  return tasks.map(formatTask).join("\n\n");
}

function searchTasks(tasks, query) {
  const needle = normalizeText(query).toLowerCase();
  return tasks.filter((task) => {
    return task.title.toLowerCase().includes(needle) || task.priority.includes(needle) || task.status.includes(needle);
  });
}

function buildStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === "done").length;
  const open = tasks.filter((task) => task.status === "open").length;
  const minutes = tasks.reduce((sum, task) => sum + totalTaskMinutes(task), 0);
  const highPriority = tasks.filter((task) => task.priority === "high").map((task) => task.title);

  return {
    total,
    completed,
    open,
    minutes,
    highPriority,
  };
}

function renderStats(tasks) {
  const stats = buildStats(tasks);
  return [
    pc.bold("Task Summary"),
    `Total tasks: ${stats.total}`,
    `Open tasks: ${stats.open}`,
    `Completed tasks: ${stats.completed}`,
    `Estimated work: ${stats.minutes} minutes`,
    `High priority: ${stats.highPriority.length ? stats.highPriority.join(", ") : "None"}`,
  ].join("\n");
}

function renderHelp() {
  return [
    pc.bold("Commands"),
    "add <title> | <priority> | <minutes>",
    "list",
    "update <id> | <field> | <value>",
    "delete <id>",
    "complete <id>",
    "subtask <id> | <title> | <minutes>",
    "search <word>",
    "stats",
    "help",
    "exit",
  ].join("\n");
}

function splitCommandParts(input) {
  return input.split("|").map((part) => part.trim());
}

// The command interpreter separates user input from task operations.
async function executeCommand(tasks, input, options = {}) {
  const shouldSave = options.save !== false;
  const trimmed = normalizeText(input);
  const [command, ...rest] = trimmed.split(" ");
  const argumentText = rest.join(" ");

  if (command === "add") {
    const [title, priority, minutes] = splitCommandParts(argumentText);
    const task = addTask(tasks, title, priority, minutes);
    if (shouldSave) await saveTasks(tasks);
    return pc.green(`Added task #${task.id}: ${task.title}`);
  }

  if (command === "list") {
    return listTasks(tasks);
  }

  if (command === "update") {
    const [id, field, value] = splitCommandParts(argumentText);
    const task = updateTask(tasks, id, field, value);
    if (shouldSave) await saveTasks(tasks);
    return pc.green(`Updated task #${task.id}.`);
  }

  if (command === "delete") {
    const deleted = deleteTask(tasks, argumentText);
    if (shouldSave) await saveTasks(tasks);
    return pc.green(`Deleted task #${deleted.id}: ${deleted.title}`);
  }

  if (command === "complete") {
    const task = completeTask(tasks, argumentText);
    if (shouldSave) await saveTasks(tasks);
    return pc.green(`Completed task #${task.id}: ${task.title}`);
  }

  if (command === "subtask") {
    const [id, title, minutes] = splitCommandParts(argumentText);
    const task = addSubtask(tasks, id, title, minutes);
    if (shouldSave) await saveTasks(tasks);
    return pc.green(`Added subtask to #${task.id}.`);
  }

  if (command === "search") {
    return listTasks(searchTasks(tasks, argumentText));
  }

  if (command === "stats") {
    return renderStats(tasks);
  }

  if (command === "help") {
    return renderHelp();
  }

  if (command === "exit") {
    return "exit";
  }

  throw new TaskValidationError(`Unknown command: ${command}. Type help to see available commands.`);
}

async function runInteractive() {
  const tasks = await loadTasks();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(pc.bold("CSE 310 JavaScript Task Manager"));
  console.log(renderHelp());

  while (true) {
    const input = await rl.question(pc.blue("\ntask-manager> "));
    try {
      const output = await executeCommand(tasks, input);
      if (output === "exit") {
        break;
      }
      console.log(output);
    } catch (error) {
      if (error instanceof TaskValidationError) {
        console.log(pc.red(error.message));
      } else {
        console.log(pc.red("Unexpected error:"), error.message);
      }
    }
  }

  rl.close();
}

async function runDemo() {
  const tasks = JSON.parse(JSON.stringify(await loadTasks()));
  const demoCommands = [
    "list",
    "add Study recursion examples | high | 45",
    "subtask 3 | Write recursive minute counter | 20",
    "complete 2",
    "search recursion",
    "stats",
  ];

  console.log(pc.bold("Demo mode"));
  for (const command of demoCommands) {
    console.log(pc.blue(`\n> ${command}`));
    try {
      console.log(await executeCommand(tasks, command, { save: false }));
    } catch (error) {
      console.log(pc.red(error.message));
    }
  }
}

if (process.argv.includes("--demo")) {
  runDemo();
} else {
  runInteractive();
}
