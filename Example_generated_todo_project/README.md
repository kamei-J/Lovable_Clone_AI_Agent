# SimpleTodoApp

**SimpleTodoApp** is a lightweight, client‑side todo list application built with plain HTML, CSS, and JavaScript. It runs entirely in the browser, storing tasks in `localStorage` so your list persists across sessions without any backend.

---

## Tech Stack
- **HTML** – Structure of the application.
- **CSS** – Styling and responsive layout.
- **JavaScript** – Core functionality, event handling, and `localStorage` persistence.

---

## Features
- Add new tasks via the input field or **Enter** key.
- Edit existing tasks inline.
- Mark tasks as completed with a checkbox.
- Delete tasks with a delete button.
- Filter tasks: **All**, **Active**, **Completed**.
- Keyboard shortcuts:
  - **Enter** – Add a new task.
  - **Esc** – Cancel editing.
  - **Ctrl + Enter** – Save edited task.
- Responsive design that works on mobile, tablet, and desktop.
- Persistent storage using `localStorage` – your tasks are saved between page reloads.

---

## Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/simpletodoapp.git
   cd simpletodoapp
   ```
2. **Open the app**
   - Simply open `index.html` in any modern web browser (no build step, server, or package manager required).
   - You can double‑click the file or use:
     ```bash
     open index.html   # macOS
     start index.html  # Windows
     ```

---

## Usage Guide
1. **Add a task**
   - Type your task into the input at the top and press **Enter** (or click the **Add** button).
2. **Edit a task**
   - Click the task text to turn it into an editable field.
   - Press **Ctrl + Enter** to save, or **Esc** to cancel.
3. **Delete a task**
   - Click the trash‑can icon next to the task.
4. **Complete a task**
   - Click the checkbox on the left of a task. Completed tasks are styled with a strikethrough.
5. **Filter tasks**
   - Use the **All**, **Active**, and **Completed** buttons at the bottom to view subsets of your list.
6. **Keyboard shortcuts**
   - **Enter** – Add a new task when the input field is focused.
   - **Esc** – Cancel an ongoing edit.
   - **Ctrl + Enter** – Save an edited task.

---

## Responsive Design
The layout adapts to various screen sizes using flexible CSS grid and media queries. The app looks great on:
- Mobile phones
- Tablets
- Desktop monitors

**Screenshots** (replace with actual images):

![Desktop view](./screenshots/desktop.png)
![Mobile view](./screenshots/mobile.png)

---

## LocalStorage Persistence
All tasks are stored in the browser's `localStorage` under the key `todos`. When the page loads, the script reads this data and reconstructs the list, ensuring that your tasks survive page reloads and browser restarts.

---

## Contributing
Contributions are welcome! Feel free to open issues or submit pull requests to improve the app, fix bugs, or add new features.

---

## License
This project is licensed under the **MIT License** – see the `LICENSE` file for details.
