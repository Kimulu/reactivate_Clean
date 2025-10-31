// models/seedChallenges.ts

export const challenges = [
  // === Existing 3 challenges above ===

  // 🟢 EASY
  {
    id: "greeting-component",
    title: "Greeting Component",
    difficulty: "easy",
    instructions: `
      Create a Greeting component that accepts a 'name' prop and renders "Hello, {name}!".
    `,
    files: {
      "/App.js": {
        code: `import Greeting from "./Greeting";
import "./styles.css";

export default function App() {
  return (
    <div className="App">
      <Greeting name="React Developer" />
    </div>
  );
}`,
        active: true,
      },
      "/Greeting.js": {
        code: `export default function Greeting() {
  return <h1>Hello!</h1>;
}`,
      },
      "/styles.css": {
        code: `body {
  background: #0f172a;
  color: #f8fafc;
  font-family: sans-serif;
  padding: 2rem;
}`,
        hidden: false,
      },
    },
    testCode: `import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";

test("renders personalized greeting", () => {
  render(<App />);
  expect(screen.getByText("Hello, React Developer!")).toBeInTheDocument();
});`,
    points: 10,
  },

  {
    id: "conditional-render",
    title: "Conditional Rendering Challenge",
    difficulty: "easy",
    instructions: `
      Fix the Message component so it shows "Welcome back!" if isLoggedIn is true, otherwise "Please log in".
    `,
    files: {
      "/App.js": {
        code: `import Message from "./Message";
import "./styles.css";

export default function App() {
  return <Message isLoggedIn={true} />;
}`,
        active: true,
      },
      "/Message.js": {
        code: `export default function Message({ isLoggedIn }) {
  return <p>Message goes here</p>;
}`,
      },
      "/styles.css": {
        code: `p {
  color: #38bdf8;
}`,
        hidden: false,
      },
    },
    testCode: `import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";

test("renders 'Welcome back!' when logged in", () => {
  render(<App />);
  expect(screen.getByText("Welcome back!")).toBeInTheDocument();
});`,
    points: 10,
  },

  {
    id: "list-rendering",
    title: "List Rendering Challenge",
    difficulty: "easy",
    instructions: `
      Render a list of fruits from the provided array using the map() function.
    `,
    files: {
      "/App.js": {
        code: `import FruitList from "./FruitList";
import "./styles.css";

export default function App() {
  return <FruitList />;
}`,
        active: true,
      },
      "/FruitList.js": {
        code: `export default function FruitList() {
  const fruits = ["Apple", "Banana", "Orange"];
  return <div>TODO</div>;
}`,
      },
      "/styles.css": {
        code: `li { color: #facc15; }`,
        hidden: false,
      },
    },
    testCode: `import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";

test("renders all fruit names", () => {
  render(<App />);
  expect(screen.getByText("Apple")).toBeInTheDocument();
  expect(screen.getByText("Banana")).toBeInTheDocument();
  expect(screen.getByText("Orange")).toBeInTheDocument();
});`,
    points: 10,
  },

  {
    id: "button-click-event",
    title: "Button Click Event",
    difficulty: "easy",
    instructions: `
      Add an onClick handler to the button that shows an alert with "Button clicked!".
    `,
    files: {
      "/App.js": {
        code: `export default function App() {
  return (
    <div className="App">
      <button>Click Me</button>
    </div>
  );
}`,
        active: true,
      },
      "/styles.css": {
        code: `button {
  background: #22d3ee;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 0.375rem;
}`,
        hidden: false,
      },
    },
    testCode: `import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

test("button triggers alert on click", () => {
  window.alert = jest.fn();
  render(<App />);
  fireEvent.click(screen.getByText(/Click Me/i));
  expect(window.alert).toHaveBeenCalledWith("Button clicked!");
});`,
    points: 10,
  },

  // 🟡 MEDIUM
  {
    id: "useeffect-fetch",
    title: "useEffect Fetch Challenge",
    difficulty: "medium",
    instructions: `
      Use useEffect to fetch data from "https://jsonplaceholder.typicode.com/todos/1"
      and display the title inside a paragraph.
    `,
    files: {
      "/App.js": {
        code: `import { useState } from "react";

export default function App() {
  const [title, setTitle] = useState("");
  return <p>{title}</p>;
}`,
        active: true,
      },
    },
    testCode: `import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";

global.fetch = jest.fn(() =>
  Promise.resolve({ json: () => Promise.resolve({ title: "delectus aut autem" }) })
);

test("fetches and displays title", async () => {
  render(<App />);
  await waitFor(() =>
    expect(screen.getByText("delectus aut autem")).toBeInTheDocument()
  );
});`,
    points: 20,
  },

  {
    id: "controlled-input",
    title: "Controlled Input Challenge",
    difficulty: "medium",
    instructions: `
      Fix the input field so that typing updates the displayed text below.
    `,
    files: {
      "/App.js": {
        code: `import { useState } from "react";

export default function App() {
  const [text, setText] = useState("");
  return (
    <div>
      <input />
      <p>You typed: {text}</p>
    </div>
  );
}`,
        active: true,
      },
    },
    testCode: `import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";

test("updates text on typing", () => {
  render(<App />);
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "React" } });
  expect(screen.getByText("You typed: React")).toBeInTheDocument();
});`,
    points: 20,
  },

  {
    id: "component-props",
    title: "Component Props Challenge",
    difficulty: "medium",
    instructions: `
      Pass the message prop from App to DisplayMessage and render it correctly.
    `,
    files: {
      "/App.js": {
        code: `import DisplayMessage from "./DisplayMessage";
import "./styles.css";

export default function App() {
  const message = "Props are awesome!";
  return <DisplayMessage />;
}`,
        active: true,
      },
      "/DisplayMessage.js": {
        code: `export default function DisplayMessage() {
  return <p>No message</p>;
}`,
      },
      "/styles.css": {
        code: `p { color: #f472b6; }`,
        hidden: false,
      },
    },
    testCode: `import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";

test("renders message from props", () => {
  render(<App />);
  expect(screen.getByText("Props are awesome!")).toBeInTheDocument();
});`,
    points: 20,
  },

  // 🔴 HARD
  {
    id: "todo-list",
    title: "Todo List Challenge",
    difficulty: "hard",
    instructions: `
      Implement add functionality: clicking "Add" adds the text from input to the list.
    `,
    files: {
      "/App.js": {
        code: `import { useState } from "react";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");

  return (
    <div>
      <input />
      <button>Add</button>
      <ul></ul>
    </div>
  );
}`,
        active: true,
      },
    },
    testCode: `import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";

test("adds new todo when Add button clicked", () => {
  render(<App />);
  const input = screen.getByRole("textbox");
  const button = screen.getByText("Add");
  fireEvent.change(input, { target: { value: "Learn React" } });
  fireEvent.click(button);
  expect(screen.getByText("Learn React")).toBeInTheDocument();
});`,
    points: 30,
  },

  {
    id: "useeffect-cleanup",
    title: "useEffect Cleanup Challenge",
    difficulty: "hard",
    instructions: `
      Use useEffect to log "Mounted" on mount and "Unmounted" on cleanup.
    `,
    files: {
      "/App.js": {
        code: `import { useEffect } from "react";

export default function App() {
  return <p>Check console</p>;
}`,
        active: true,
      },
    },
    testCode: `import { render } from "@testing-library/react";
import App from "../App";

test("logs on mount and unmount", () => {
  const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  const { unmount } = render(<App />);
  expect(logSpy).toHaveBeenCalledWith("Mounted");
  unmount();
  expect(logSpy).toHaveBeenCalledWith("Unmounted");
  logSpy.mockRestore();
});`,
    points: 30,
  },

  {
    id: "context-api",
    title: "Context API Challenge",
    difficulty: "hard",
    instructions: `
      Use React Context to provide a theme ('dark') and consume it in the ThemedText component.
    `,
    files: {
      "/App.js": {
        code: `import { createContext } from "react";
import ThemedText from "./ThemedText";

export const ThemeContext = createContext();

export default function App() {
  return (
    <div className="App">
      <ThemedText />
    </div>
  );
}`,
        active: true,
      },
      "/ThemedText.js": {
        code: `export default function ThemedText() {
  return <p>Theme: none</p>;
}`,
      },
      "/styles.css": {
        code: `p { color: #38bdf8; }`,
        hidden: false,
      },
    },
    testCode: `import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App, { ThemeContext } from "../App";

test("uses dark theme from context", () => {
  render(
    <ThemeContext.Provider value="dark">
      <App />
    </ThemeContext.Provider>
  );
  expect(screen.getByText("Theme: dark")).toBeInTheDocument();
});`,
    points: 30,
  },
];
