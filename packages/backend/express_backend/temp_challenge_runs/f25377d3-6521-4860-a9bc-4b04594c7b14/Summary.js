export default function Summary({ text, children }) {
  return (
    <div>
      <h1>{children}</h1>
      <p>{text}</p>
    </div>
  );
}