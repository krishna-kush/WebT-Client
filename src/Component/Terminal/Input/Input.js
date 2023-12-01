import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'

import './input.scss'

const Input = forwardRef((params, ref) => {

  const inputRef = useRef(null);
  const currInputRef = useRef(null);
  const trackCurrHistory = useRef(params.cmdCount);
  
  const [input, setInput] = useState('');
  
  useImperativeHandle(ref, () => ({
    get: input,
    setInput: (val) => setInput(val),
    focus: () => inputRef.current.focus(),
    updateTrackCurrHistory: (val) => trackCurrHistory.current = val, // to update trackCurrHistory.current from parent container, with equal to cmdCount, so we can refresh trackCurrHistory counter when history changes
  }));

  const changeInput = (val) => {
    if (params.history.length === 0) return;

    const updateInput = (val) => {
      setInput(val);
      inputRef.current.value = val;
    }

    if (val === 'up') {
      if (trackCurrHistory.current === 0) return;

      // Up is pressed and We are at the bottom of the history -> Means we are Moving up in the history. So need to save the current input.
      if (trackCurrHistory.current === params.cmdCount) {
        currInputRef.current = input;
      }

      trackCurrHistory.current = trackCurrHistory.current-1;
      
      updateInput(params.history.current[trackCurrHistory.current].cmd)
    
    } else if (val === 'down') {
      if (trackCurrHistory.current === params.cmdCount) return;

      // Down is pressed and We are at the one position top of the bottom of history -> Means we are Moving down to the current input. So need to save update the input.
      if (trackCurrHistory.current === params.cmdCount-1) {
        updateInput(currInputRef.current);
        trackCurrHistory.current = trackCurrHistory.current+1;
        return;
      }

      trackCurrHistory.current = trackCurrHistory.current+1;

      updateInput(params.history.current[trackCurrHistory.current].cmd)
    }
  }

  const clearInput = (e) => {
    setInput('');
    e.target.value = '';
  }

  useEffect(() => {
    // console.log(params.config);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [])

  useEffect(() => {
    return () => {
      console.log('input unmounted');
    }
  }, [])

  return (<>
    <input ref={inputRef} className='input no-design'
    onChange={(e) => {
      setInput(e.target.value);
    }}
    onKeyDown={(e) => {
    if (e.key === 'Enter') {

      if (e.target.value.trim() === '') {
        params.UpdateLog(undefined, {cmd: ''}) // so it won't show loading but move to next line(the Message box)
        return
      } else { 
        if ( !params.showInput || !params.config.allowed.length || params.config.allowed.includes(e.target.value.trim()) ){
          if (params.init) {
            console.log('update log from input init');
            params.UpdateLog(undefined, {cmd: e.target.value, output: 'wait'})
          } else {
            console.log('update log from input else');
            params.UpdateLog(true, {msg: e.target.value})
          }
          params.setCmdCount(params.cmdCount+1);
        } else {
          alert('Invalid Command')
        }

        clearInput(e);
        return
      }

    } else if (e.key === 'ArrowUp') {
      // updating both input and inputRef.current.value to update input variable that is used for sending data and ref that is to show chnage in input box
      changeInput('up')

    } else if (e.key === 'ArrowDown') {
      changeInput('down');
    }
    }}/>
  </>)
})

export default Input