import { render } from "@testing-library/react";
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
});