import { useEffect, useRef, useState } from "react";
import {
  initializeProtectedCalling,
  startProtectedCall,
  endProtectedCall,
} from "../services/protectedCallService";

function ProtectedCaller() {
  const [targetId, setTargetId] = useState("");
  const [myCallerId, setMyCallerId] = useState("");
  const [callActive, setCallActive] = useState(false);
  const [status, setStatus] = useState("Ready to call");

  const remoteAudioRef = useRef(null);

  useEffect(() => {
    const callerId =
      localStorage.getItem("cyber_caller_id") ||
      `caller-${Math.random().toString(36).substring(2, 9)}`;

    localStorage.setItem("cyber_caller_id", callerId);

    setMyCallerId(callerId);

    initializeProtectedCalling(callerId);

    return () => {
      endProtectedCall();
    };
  }, []);

  const handleStartCall = async () => {
    if (!targetId.trim()) {
      setStatus("Enter receiver Cyber Shield ID");
      return;
    }

    try {
      setStatus("Connecting...");

      await startProtectedCall(
        targetId.trim(),
        (remoteStream) => {
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream;
            remoteAudioRef.current.play().catch(() => {});
          }

          setCallActive(true);
          setStatus("Protected Call connected");
        }
      );

      setStatus("Calling Cyber Shield...");
    } catch (error) {
      console.error(error);
      setStatus("Unable to start Protected Call");
    }
  };

  const handleEndCall = () => {
    endProtectedCall();

    setCallActive(false);
    setStatus("Call ended");
  };

  return (
    <div className="mx-auto max-w-lg space-y-5 p-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Cyber Shield Protected Call
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Secure AI-enabled calling channel
        </p>
      </div>

      <div className="rounded-2xl bg-blue-50 p-4">
        <p className="text-xs font-semibold text-blue-700">
          YOUR CALLER ID
        </p>

        <p className="mt-1 break-all font-mono text-sm font-bold text-blue-950">
          {myCallerId}
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <label className="text-sm font-semibold text-gray-700">
          Receiver Cyber Shield ID
        </label>

        <input
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          placeholder="Example: cyber-ab12xyz"
          className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
        />

        {!callActive ? (
          <button
            onClick={handleStartCall}
            className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white"
          >
            Start Protected Call
          </button>
        ) : (
          <button
            onClick={handleEndCall}
            className="mt-4 w-full rounded-xl bg-red-600 px-4 py-3 font-bold text-white"
          >
            End Call
          </button>
        )}
      </div>

      <div className="rounded-xl bg-gray-100 p-3 text-center">
        <p className="text-sm font-medium text-gray-700">
          {status}
        </p>
      </div>

      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
        className="hidden"
      />

    </div>
  );
}

export default ProtectedCaller;