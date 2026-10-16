# Masapo Campus Student Management

An interactive student management dashboard for the DIWA2110 Web Application Development assignment. The application is built with React and JavaScript and is designed for the Faculty of Information and Communication Technology in Maseru, Lesotho.

## Features

- View student records, summary statistics, course counts, and enrollment status.
- Search by student name, ID, email, or course; filter by enrollment status.
- Add and edit students in a validated modal form.
- Delete students only after confirming in a separate dialog.
- See updates immediately without refreshing the page.
- Keep records between visits with browser `localStorage`.
- Use the dashboard on desktop, tablet, or mobile.

The dashboard starts with sample student records. Added, edited, and deleted records are saved in the current browser; they are not shared with other users or devices.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To create and preview a production build:

```sh
npm run build
npm run preview
```

Run the project linter with `npm run lint`.

## JavaScript and React concepts

- A student is a JavaScript object containing string values (`id`, `fullName`, `email`, and `course`), a number (`age`), and a boolean (`isEnrolled`). Students are held in an array.
- `const` is used for bindings that are not reassigned, including constants, derived values, component functions, and React state setters. `let` is used for `ageError` in the form validator because its value is assigned as the conditional checks run. `var` is intentionally not used: block-scoped declarations avoid its function-scoping and redeclaration behavior.
- Reusable functions handle loading, ID generation, input validation, saving, deleting, filtering, and rendering. They demonstrate parameters, return values, conditionals, regular expressions, and array methods such as `map`, `filter`, `some`, and `reduce`.
- Functional React components divide the interface into the dashboard, student rows, student form modal, and deletion-confirmation modal. Props share student data and actions; `useState`, `useEffect`, and `useMemo` manage the interface and browser persistence.
- Form inputs are controlled by React state. Student ID, full name, age (16–100), email format, and course are validated before saving. Enrollment is a checkbox-backed boolean.

## Manual test checklist

1. Open the dashboard and check the initial sample records, statistics, and statuses.
2. Add a student with valid details; verify the row and statistics update immediately.
3. Submit the add form with missing fields, an invalid email, an age below 16, or a duplicate ID; verify the form shows errors and does not save.
4. Edit a student and save; verify the updated details and enrollment status appear.
5. Open edit and cancel or close the modal; verify the original record is unchanged.
6. Delete a student, cancel the confirmation once, then confirm deletion; verify only the confirmed deletion removes the row.
7. Search by name, ID, email, and course; change the enrollment filter and check the empty-result message.
8. Delete all records; verify the empty state and its Add student action.
9. Refresh the page; verify saved records remain in the same browser.
10. Resize to a narrow mobile viewport; verify the page remains usable and the table can scroll horizontally.

## Deploy

The project is a standard Vite static site. Push the project to a GitHub repository (excluding `node_modules` and `dist`), then import it into Netlify or Vercel. Use the build command `npm run build` and publish the `dist` directory. After deployment, open the public URL and check the CRUD actions and persistence in the deployed browser.

## Course details

- **Course:** DIWA2110 — Web Application Development
- **Location:** Maseru, Lesotho
- **Faculty:** Information and Communication Technology
- **Programmes:** Diploma in Information Technology; Diploma in Business Information Technology
- **Semester:** 3
- **Lecturer:** Mr Hlabeli Batloung
