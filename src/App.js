import { useRef } from "react";
import Terminal from "./Component/Terminal/Terminal";

const options = {
  code: "echo 'Hello World'",

  user: "guest",
  host: "WebT.com",
}

const config = {

  // should only put elements in one of the options, not both, from allowed and exempted. Put a check for that.
  allowed: [],
  exempted: [],

  connection: 'default', // ws
  ip: '',
  port: '',


}

const theme = {
  mode: 'light', // light/dark

  background: 'transparent',
  
  border: 'yellow',
  user: 'yellow',
  host: 'green',
  else: 'grey',
  input: 'white',
}

const App = () => {
  const TerminalRef = useRef(null)

  return (
    <div>
      <h1>Web-based Terminal</h1>
      <Terminal ref={TerminalRef} user={options.user} host={options.host} config={config} theme={theme}/>
    </div>
  );
}

export default App;
