import { useState } from "react";
export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      {/* BUG: button doesn’t increment */}
      <button>Increment</button>
    </div>
  );
}