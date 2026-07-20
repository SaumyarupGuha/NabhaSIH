import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../lib/api';

const DEFAULT_SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export const useSocket = (serverUrl = DEFAULT_SOCKET_URL) => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(serverUrl);
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [serverUrl]);

  return socketRef.current;
};
