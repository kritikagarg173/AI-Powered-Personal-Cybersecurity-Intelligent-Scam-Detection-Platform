import { useState } from "react";
import {
  Mic,
  MicOff,
} from "lucide-react";

function VoiceSafetyAssistant({
  onSOS,
  primaryContact,
}) {
  const [listening, setListening] =
    useState(false);

  const [lastCommand, setLastCommand] =
    useState("");

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice commands are not supported in this browser."
      );
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-IN";

    recognition.continuous = false;

    recognition.interimResults =
      false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onresult = (
      event
    ) => {
      const command =
        event.results[0][0].transcript
          .toLowerCase()
          .trim();

      setLastCommand(command);

      handleVoiceCommand(command);
    };

    recognition.start();
  };


  const handleVoiceCommand = (
    command
  ) => {

    // SOS COMMANDS
    if (
      command.includes("help me") ||
      command.includes("emergency") ||
      command.includes("sos")
    ) {
      onSOS();
      return;
    }


    // CALL FAMILY
    if (
      command.includes(
        "call family"
      ) ||
      command.includes(
        "call my daughter"
      ) ||
      command.includes(
        "call my son"
      )
    ) {

      if (
        primaryContact?.phone
      ) {

        window.location.href =
          `tel:${primaryContact.phone}`;

      } else {

        alert(
          "No primary trusted contact available."
        );

      }

      return;
    }


    // CALLER SAFETY
    if (
      command.includes(
        "is this call safe"
      ) ||
      command.includes(
        "check caller"
      )
    ) {

      window.location.href =
        "/caller-verification";

      return;
    }


    // LINK CHECK
    if (
      command.includes(
        "check link"
      )
    ) {

      window.location.href =
        "/link-scanner";

      return;
    }


    // TRUSTED CONTACTS
    if (
      command.includes(
        "trusted contacts"
      )
    ) {

      window.location.href =
        "/trusted-contacts";

      return;
    }


    alert(
      `Command not recognized: "${command}"`
    );
  };


  return (
    <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between gap-5">

        <div>

          <h2 className="text-lg font-bold text-slate-900">
            🎙️ Voice Safety Assistant
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Say “Help me”, “Call family”
            or “Is this call safe?”
          </p>

        </div>


        <button
          onClick={startListening}
          className={`flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition ${
            listening
              ? "bg-red-600 animate-pulse"
              : "bg-blue-700 hover:bg-blue-800"
          }`}
        >

          {listening ? (
            <MicOff size={27} />
          ) : (
            <Mic size={27} />
          )}

        </button>

      </div>


      {listening && (
        <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm font-semibold text-blue-700">
          🎧 Listening...
        </div>
      )}


      {lastCommand && (
        <div className="mt-4 rounded-xl bg-slate-50 p-4">

          <p className="text-xs text-slate-400">
            Last voice command
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            “{lastCommand}”
          </p>

        </div>
      )}

    </div>
  );
}

export default VoiceSafetyAssistant;