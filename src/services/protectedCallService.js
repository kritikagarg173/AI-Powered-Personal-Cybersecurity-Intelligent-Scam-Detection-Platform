import Peer from "peerjs";

let peer = null;
let activeCall = null;
let localStream = null;

/*
  Creates this device's Protected Call identity.
  incomingCallHandler will run automatically
  whenever another Protected Call arrives.
*/
export const initializeProtectedCalling = (
  peerId,
  incomingCallHandler
) => {
  if (peer) {
    peer.destroy();
  }

  peer = new Peer(peerId);

  peer.on("open", (id) => {
    console.log("Cyber Shield Protected Call ready:", id);
  });

  peer.on("call", (call) => {
    console.log("Incoming Protected Call from:", call.peer);

    activeCall = call;

    if (incomingCallHandler) {
      incomingCallHandler(call.peer);
    }
  });

  peer.on("error", (error) => {
    console.error("Protected Call error:", error);
  });

  return peer;
};

/*
  Accept incoming Protected Call.
  Microphone is enabled only after user accepts.
*/
export const acceptProtectedCall = async (
  remoteStreamHandler
) => {
  if (!activeCall) {
    throw new Error("No incoming Protected Call.");
  }

  localStream =
    await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

  activeCall.answer(localStream);

  activeCall.on("stream", (remoteStream) => {
    console.log("Protected caller audio received.");

    if (remoteStreamHandler) {
      remoteStreamHandler(remoteStream);
    }
  });

  return localStream;
};

/*
  Reject incoming Protected Call.
*/
export const rejectProtectedCall = () => {
  if (activeCall) {
    activeCall.close();
    activeCall = null;
  }
};

/*
  Start a Protected Call to another Cyber Shield device.
*/
export const startProtectedCall = async (
  remotePeerId,
  remoteStreamHandler
) => {
  if (!peer) {
    throw new Error(
      "Protected Calling has not been initialized."
    );
  }

  localStream =
    await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

  activeCall = peer.call(
    remotePeerId,
    localStream
  );

  activeCall.on("stream", (remoteStream) => {
    console.log("Remote Protected Call audio received.");

    if (remoteStreamHandler) {
      remoteStreamHandler(remoteStream);
    }
  });

  return activeCall;
};

/*
  End current Protected Call.
*/
export const endProtectedCall = () => {
  if (activeCall) {
    activeCall.close();
    activeCall = null;
  }

  if (localStream) {
    localStream.getTracks().forEach((track) => {
      track.stop();
    });

    localStream = null;
  }
};

/*
  Completely stop Protected Calling.
*/
export const destroyProtectedCalling = () => {
  endProtectedCall();

  if (peer) {
    peer.destroy();
    peer = null;
  }
};