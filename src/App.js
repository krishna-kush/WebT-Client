import { useRef } from "react";
import Terminal from "./Component/Terminal/Terminal";

function App() {
  const TerminalRef = useRef(null)

  return (
    <div>
      <h1>Web-based Terminal</h1>
      <Terminal ref={TerminalRef}/>
    </div>
  );
}

export default App;
