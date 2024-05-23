import React, { useState, useEffect, useRef } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'; // JavaScript 모드 추가

function App() {
  const [code, setCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const stompClient = useRef(null); // stompClient를 useRef로 선언

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient.current = Stomp.over(socket);

    stompClient.current.connect({}, () => {
      setIsConnected(true);
      stompClient.current.subscribe('/topic/code', (message) => {
        setCode(message.body);
      });
    });

    return () => {
      if (stompClient.current && isConnected) {
        stompClient.current.disconnect();
      }
    };
  }, [isConnected]);

  const handleCodeChange = (editor, data, value) => {
    setCode(value);
    if (isConnected) {
      stompClient.current.send('/app/code', {}, value);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Code Share</h1>
      <CodeMirror
        value={code}
        options={{
          mode: 'javascript',
          theme: 'default',
          lineNumbers: true
        }}
        onBeforeChange={handleCodeChange}
        className="border rounded"
      />
    </div>
  );
}

export default App;