import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { Mic, MicOff, Video, VideoOff, Phone } from 'lucide-react';
import { videoCallAPI } from '../lib/api';
import io from 'socket.io-client';

const VideoCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef();

  const servers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    const initializeCall = async () => {
      try {
        // Get user media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Initialize socket
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
        setSocket(newSocket);

        // Initialize peer connection
        const peerConnection = new RTCPeerConnection(servers);
        peerConnectionRef.current = peerConnection;

        // Add local stream to peer connection
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });

        // Handle remote stream
        peerConnection.ontrack = (event) => {
          const [remoteStream] = event.streams;
          setRemoteStream(remoteStream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          setIsConnected(true);
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            newSocket.emit('iceCandidate', {
              roomId,
              candidate: event.candidate
            });
          }
        };

        // Join video room
        newSocket.emit('joinVideoRoom', roomId);

        // Socket event handlers
        newSocket.on('userJoined', async () => {
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          newSocket.emit('offer', { roomId, offer });
        });

        newSocket.on('offer', async (data) => {
          await peerConnection.setRemoteDescription(data.offer);
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          newSocket.emit('answer', { roomId, answer });
        });

        newSocket.on('answer', async (data) => {
          await peerConnection.setRemoteDescription(data.answer);
        });

        newSocket.on('iceCandidate', async (data) => {
          await peerConnection.addIceCandidate(data.candidate);
        });

        newSocket.on('callEnded', () => {
          endCall();
        });

      } catch (error) {
        console.error('Error initializing call:', error);
        alert('Failed to access camera/microphone');
        navigate(-1);
      }
    };

    initializeCall();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (socket) {
        socket.disconnect();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [roomId]);

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const endCall = async () => {
    try {
      const callId = localStorage.getItem('currentCallId');
      
      if (callId) {
        await videoCallAPI.endCall(callId);
        localStorage.removeItem('currentCallId');
      }
    } catch (error) {
      console.error('Error ending call:', error);
    }
    
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* Remote Video */}
        <Card className="relative bg-gray-800 border-gray-700">
          <CardContent className="p-0 h-full min-h-[300px]">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-lg"
            />
            {!isConnected && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
                <p className="text-white">Waiting for other participant...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Local Video */}
        <Card className="relative bg-gray-800 border-gray-700">
          <CardContent className="p-0 h-full min-h-[300px]">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-lg"
            />
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
                <p className="text-white">Video Off</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="p-6 bg-gray-800 border-t border-gray-700">
        <div className="flex justify-center space-x-4">
          <Button
            onClick={toggleMute}
            variant={isMuted ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full w-12 h-12"
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
          
          <Button
            onClick={toggleVideo}
            variant={isVideoOff ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full w-12 h-12"
          >
            {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
          </Button>
          
          <Button
            onClick={endCall}
            variant="destructive"
            size="lg"
            className="rounded-full w-12 h-12"
          >
            <Phone className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;