import React, { useState, useEffect } from 'react'

const Message = (params) => { // Implement timeout for wait message, to stop loading animation and show error message

  const loadingMessages = ['Loading', 'Loading.', 'Loading..', 'Loading...'];
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Rotate through the loading messages
      setLoadingTextIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 500);
    return () => clearInterval(interval); // Cleanup the interval on unmount
  }, []);

  // console.log('in terminal msg', params.msg);

  if (!params.msg || params.msg === '') {
    return (<br/>)
  }

  if (params.msg !== 'wait') {
    return (
      <div dangerouslySetInnerHTML={{__html: params.msg}}></div>
    )
  }
  
  return (
    <div>{loadingMessages[loadingTextIndex]}</div>
  )
}

export default Message