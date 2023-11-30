import { useRef } from "react";
import Terminal from "./Component/Terminal/Terminal";

const options = {
  code: "echo 'Hello World'",

  user: "guest",
  host: "WebT.com",
}

const config = {
  allowed: [],
  // exempted: ['execute'],
}

const App = () => {
  const TerminalRef = useRef(null)

  return (
    <div>
      <h1>Web-based Terminal</h1>
      <Terminal ref={TerminalRef} user={options.user} host={options.host} config={config}/>
    </div>
  );
}

export default App;
