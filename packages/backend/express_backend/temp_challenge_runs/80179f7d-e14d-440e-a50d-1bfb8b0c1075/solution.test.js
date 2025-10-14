import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";

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
});