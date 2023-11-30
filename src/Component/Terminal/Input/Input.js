import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'

import './input.scss'

const Input = forwardRef((params, ref) => {
  const inputRef = useRef(null);
  
  const [input, setInput] = useState('');
  
  useImperativeHandle(ref, () => ({
    get: input,
    setInput: (val) => setInput(val),
    focus: () => inputRef.current.focus(),
  }));

  const clearInput = (e) => {
    setInput('');
    e.target.value = '';
  }

  useEffect(() => {
    console.log(params.config);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [])

  return (<>
    <input ref={inputRef} className='input no-design' onChange={(e) => {
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
    }
    }}/>
  </>)
})

export default Input