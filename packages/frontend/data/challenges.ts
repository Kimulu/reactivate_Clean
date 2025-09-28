// challenges.ts
export const challenges = [
  {
    id: "fragments",
    title: "Fragments Challenge",
    instructions: `
      Edit the Summary component so it returns an h1 element and p element wrapped in a React Fragment.
    `,
    files: {
      "/App.js": {
        code: `import Summary from "./Summary";
import "./styles.css";

export default function App() {
  return (
    <div className="App">
      <Summary text="Fragments help you avoid unnecessary HTML elements.">
        Summary
      </Summary>
    </div>
  );
}
`,
        active: true,
      },
      "/Summary.js": {
        // Starter code: WRONG → wrapped in <div>
        code: `export default function Summary({ text, children }) {
  return (
    <div>
      <h1>{children}</h1>
      <p>{text}</p>
    </div>
  );
}`,
      },
      "/styles.css": {
        code: `body {
  font-family: sans-serif;
  background-color: #0f172a;
  color: white;
  padding: 2rem;
}

h1 {
  color: #38bdf8; /* Tailwind cyan-400 */
}

p {
  color: #cbd5e1; /* Tailwind slate-300 */
}`,
        hidden: true,
      },
      "/test/fragments.test.js": {
        code: `import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";

describe("Fragments Challenge", () => {
  it("renders an h1 and p tag without a parent div", () => {
    const { container } = render(<App />);
    
    const h1 = container.querySelector("h1");
    const p = container.querySelector("p");
    
    expect(h1).toBeInTheDocument();
    expect(p).toBeInTheDocument();
    
    const summaryContainer = container.querySelector(".App > div");
    expect(summaryContainer).not.toBeInTheDocument();
  });
});`,
        hidden: true,
      },
    },
  },
  {
    id: "counter",
    title: "Counter Challenge",
    instructions: `
      Fix the <Counter /> component so the "Increment" button increases the count using useState.
    `,
    files: {
      "/App.js": {
        code: `import Counter from "./Counter";
import "./styles.css";

export default function App() {
  return (
    <div className="App">
      <h1>useState Counter</h1>
      <Counter />
    </div>
  );
}
`,
        active: true,
      },
      "/Counter.js": {
        // Starter code: WRONG → missing onClick handler
        code: `import { useState } from "react";
export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      {/* BUG: button doesn’t increment */}
      <button>Increment</button>
    </div>
  );
}`,
      },
      "/styles.css": {
        code: `body {
  font-family: sans-serif;
  background-color: #0f172a;
  color: white;
  padding: 2rem;
}

button {
  background: #38bdf8;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  color: black;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}

button:hover {
  background: #0ea5e9; /* darker cyan */
}`,
        hidden: true,
      },
      "/test/counter.test.js": {
        code: `import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";

describe("Counter Challenge", () => {
  it("increments the count when the button is clicked", () => {
    render(<App />);
    const countText = screen.getByText(/Count: 0/i);
    const incrementButton = screen.getByText(/Increment/i);

    expect(countText).toBeInTheDocument();
    expect(screen.getByText("Count: 0")).toBeInTheDocument();

    fireEvent.click(incrementButton);
    expect(screen.getByText("Count: 1")).toBeInTheDocument();

    fireEvent.click(incrementButton);
    expect(screen.getByText("Count: 2")).toBeInTheDocument();
  });
});`,
        hidden: true,
      },
    },
  },
  {
    id: "button-style",
    title: "Styled Button Challenge",
    instructions: `
      Create a reusable Button component styled with CSS. 
      It should accept a "label" prop and render a blue button.
    `,
    files: {
      "/App.js": {
        code: `import Button from "./Button";
import "./styles.css";

export default function App() {
  return (
    <div className="App">
      <h1>Reusable Button</h1>
      <Button label="Click Me!" />
      <Button label="Submit" />
    </div>
  );
}
`,
        active: true,
      },
      "/Button.js": {
        // Starter code: WRONG → missing className
        code: `export default function Button({ label }) {
  return <button>{label}</button>;
}`,
      },
      "/styles.css": {
        code: `body {
  font-family: sans-serif;
  background-color: #0f172a;
  color: white;
  padding: 2rem;
}

h1 {
  color: #38bdf8;
}

.btn {
  background: #3b82f6; /* Tailwind blue-500 */
  color: white;
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}

.btn:hover {
  background: #2563eb; /* Tailwind blue-600 */
}`,
        hidden: true,
      },
      "/test/button.test.js": {
        code: `import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";

describe("Styled Button Challenge", () => {
  it("renders both buttons with the correct labels", () => {
    render(<App />);
    const clickMeButton = screen.getByText(/Click Me!/i);
    const submitButton = screen.getByText(/Submit/i);
    expect(clickMeButton).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it("applies the 'btn' class to the buttons for styling", () => {
    render(<App />);
    const clickMeButton = screen.getByText(/Click Me!/i);
    const submitButton = screen.getByText(/Submit/i);
    
    expect(clickMeButton).toHaveClass("btn");
    expect(submitButton).toHaveClass("btn");
  });
});`,
        hidden: true,
      },
    },
  },
];
