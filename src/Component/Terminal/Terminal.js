import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';

import './terminal.scss';
import Message from './Message/Message.js';
import Input from './Input/Input';

const Terminal = forwardRef((params, ref) => {
  const dataRef = useRef({
    code: `print("Hello World!");
print('hi from python')

a = input('what is your name? ')
print('hello', a)
b = input('how old are you? ')
print('you are', b, 'years old')
c = input('how old are you? 2 ')
print('goodbye', c, a)`,

    ext: 'py',
  });

  const state = useRef(false);
  const socketRef = useRef(null);

  // const dataRef = useRef({
  //   code: `print("Hello World!")\nprint("I'm a Python program.")`,
  //   ext: 'py',
  // });

  useImperativeHandle(ref, () => ({
    setCode: (val) => {dataRef.current.code = val},
    setExt: (val) => {dataRef.current.ext = val},
  }));

  const inputRef = useRef(null);
  
  const [cmdCount, setCmdCount] = useState(0);
  const [showInput, setShowInput] = useState(true);
  const init = useRef(true)

  const [log, setLog] = useState([]);
  const logRef = useRef(log);
  /* 
  Example {
    cmd: string,
    output: string,
    new: boolean,
  }
  */
  
  const id = <>
    <div style={{display: "inline"}}>
      <span style={{ color: 'rgb(215, 153, 33)' }}>{params.user}</span>
      <span style={{ color: 'rgb(168, 153, 132)' }}>@</span>
      <span style={{ color: 'rgb(152, 151, 26)' }}>{params.host}</span>
      <span style={{ color: 'rgb(168, 153, 132)', marginRight: '0.5rem' }}>:~ $ </span>
    </div>
  </>

  // console.log('TERMINAL', log);

  // for updating log data, Why I used two variables?
  // for normal cases only log with useState is enough, but I'm calling it from, socket.message, which is showing the initial value of log(my take is, when it is initializing it's capturing the entire state of app, and stick with it). So for resolving that, We need to use useRef, which will be updated with the current value of log with useState and we can access it from anywhere.
  const AppendLog = (newData) => {
    const updatedHistory = [...logRef.current, newData];
    logRef.current = updatedHistory;
    setLog(updatedHistory);
  }

  const UpdateLog = (current=false, options) => {
    options = options || {msg:'wait'};
    options = options.msg? options : {...options, msg: 'wait'}


    // console.log('in update options', options);
    if (current) { // in the current msg(last msg in log)
      // console.log('in update if', logRef.current, options);
      const updatedHistory = logRef.current.map((item, index) => {
        // index === logRef.current.length - 1
        //   ? item.output === 'wait' // if first message, this wait need to be a unique key message
        //     ? {
        //       ...item,
        //       output: `${msg}`,
        //       new: true,
        //     }
        //     : {
        //       ...item,
        //       output: `${item.output}\n${msg}`,
        //       new: false,
        //     }
        //   : item

        if (index === logRef.current.length - 1) {
          // console.log(item);
          if (init.current) {
            console.log('in wait');
            return {
              ...item,
              ...options,

              // output: `${options.msg}`,
              new: true,
            }
          } else {
            return {
              ...item,
              ...options,

              output: `${item.output} ${options.msg}\n`,
              // cmd: options.msg,
              // msg: options.msg,
              new: false,
            }
          }
        } else { return item }
      });
      console.log('updatedHistory', updatedHistory);

      logRef.current = updatedHistory;
      setLog(updatedHistory);
    } else {
      console.log('in update else');
      // console.log(log, inputRef);
      AppendLog({
        ...options,

        cmd: inputRef.current.get,
        // msg: options.msg,
        // output: options.msg,
        new: true,
      })
    }
  }

  const handleSocketResponse = (msg, isInit, isTerm) => {
    // console.log('in handle', log);

    if (isInit) {
      console.log('in handle if init');
      setShowInput(false)
      // UpdateLog(true, {output: 'wait'})
    } else if (isTerm) {
      console.log('in handle else term');
      setShowInput(true)
      init.current = true // changing it here because input need it to be know where to put the msg
    } else {
      if (init.current) { // to know if the state is still initiated or not, if init state we need to update the last msg, else add new message
        console.log('in handle msg if', init.current);
        UpdateLog(true, {output: msg})
        init.current = false
      } else {
        console.log('in handle msg else');
        UpdateLog(true, {msg: msg})
      }
    }
  };

  // Socket Connection
  useEffect(() => {
    if (state.current) {
      console.log(`${process.env.REACT_APP_SERVER_URL? 'wss://'+process.env.REACT_APP_SERVER_URL:'ws://localhost:'+process.env.REACT_APP_SERVER_PORT}/terminal`);
      const socket = new WebSocket(`${process.env.REACT_APP_SERVER_URL? 'wss://'+process.env.REACT_APP_SERVER_URL:'ws://localhost:'+process.env.REACT_APP_SERVER_PORT}/terminal`);
      socketRef.current = socket;

  
      socket.onopen = () => {
        console.log('WebSocket connection established');
      };
      socket.onclose = () => {
        console.log('WebSocket connection closed');
      };

      // Receiving data from server
      socket.onmessage = event => {
        console.log(event.data);
        switch (event.data.trim()) {
          case 'initiated':
            // console.log('in initiated', log);
            handleSocketResponse('', true, false)
            break
          case 'terminated': 
            handleSocketResponse('', false, true)
            break
          default :
            handleSocketResponse(event.data.trim(), false, false)   
        }
      };
    } 


    return () => {
      if (socketRef.current && state.current) {
        socketRef.current.close();
      };
      state.current = true;
    };
  }, []);


  // Sending data to server
  useEffect(() => {
    if (socketRef.current && socketRef.current.readyState && state.current) {
      console.log('sending data');
      if (log.length > 0) {
        const cmd = log[log.length - 1].cmd.trim();
        const msg = log[log.length - 1].msg.trim();

        if (cmd !== '') {
          if (showInput) {
            socketRef.current.send(JSON.stringify({
              cmd: cmd,
              code: dataRef.current.code,
              ext: dataRef.current.ext,
              new: true,
            }));
          } else {
            socketRef.current.send(JSON.stringify({
              cmd: null,
              msg: msg,
              new: false,
              // code: '',
              // ext: '',
            }));
          }
        }
      }
    }
  }, [cmdCount]);

  // Updating inputRef.current.trackCurrHistory in sync with cmdCount, for when pressed up/down arrow key, we know where to move in history
  useEffect(() => {
    inputRef.current.updateTrackCurrHistory(cmdCount);
  }, [cmdCount])

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  return (
  <div className='terminal-comp' onClick={focusInput}>
    <div className='terminal'>
      {log.map((element, index) => {
        console.log('element', element);

        const stringWithLineBreaks = element.output? element.output.replace(/\n/g, "<br>") : '';

        return (<>
          <p className='input-lane'>{id} {element.cmd}</p>
          <Message msg={stringWithLineBreaks}/>
        </>)
      })}

      {/* 
      ISSUE: With re-rendering of input every time a command is executed.
      Now I've inplemented change history in input box, with it, it have become quite heavy component relatively. So with every re-render it'll slow app down, without any need.
      Need to stop re-rendering of input box, with every command execution. If the command execution is not going into input msg dialouge, then it should not re-render. And when it is going into input msg dialouge, it should not render with change history feature.
      */}
      {showInput
      ?
      <div className='input-cont'>
        <p className='input-lane'>{id}</p>
        <Input ref={inputRef} config={params.config} cmdCount={cmdCount} setCmdCount={setCmdCount} UpdateLog={UpdateLog} showInput={showInput} init={init.current} history={logRef}/>
      </div>
      :
      <div className='input-cont'>
        <Input ref={inputRef} config={params.config} cmdCount={cmdCount} setCmdCount={setCmdCount} UpdateLog={UpdateLog} showInput={showInput} init={init.current} history={logRef}/>
      </div>
    }
    </div>
  </div>
  )
})

export default Terminal;
