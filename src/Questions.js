import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import firebaseUpload from "./UploadToFirebase";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import useScreenRecording from "use-screen-recording";
import Speech from "speak-tts";

const endpoint = "endpoint/question.json";
const axios = require("axios");
const speech = new Speech();
if (speech.hasBrowserSupport()) {
  console.log("speech synthesis supported");
}
speech.init({
  volume: 1,
  lang: "en-GB",
  rate: 1,
  pitch: 1,
  voice: "Google UK English Male",
  splitSentences: true,
  listeners: {
    onvoiceschanged: (voices) => {
      console.log("Event voiceschanged", voices);
    },
  },
});
function Questions() {
  const [list, setList] = useState();
  const { transcript, resetTranscript } = useSpeechRecognition();
  const [isListening, setIsListening] = useState(false);
  const [currentQues, setCurrentQues] = useState();
  const { isRecording, recording, toggleRecording } = useScreenRecording();
  useEffect(() => {
    getUser();
  }, [isListening]);
  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return (
      <div className="mircophone-container">
        Browser is not Support Speech Recognition.
      </div>
    );
  }
  async function getUser() {
    try {
      const response = await axios.get(endpoint);
      setList(response.data);
    } catch (error) {
      console.error(error);
    }
  }
  function speakQues(event) {
    speech
      .speak({
        text: event.target.value,
        listeners: {
          onstart: () => {
            document.getElementById(event.target.id).classList.add("blink");
          },
          onend: () => {
            document.getElementById(event.target.id).classList.remove("blink");
          },
        },
      })
      .then(() => {
        console.log("Success !");
      })
      .catch((e) => {
        console.error("An error occurred :", e);
      });
  }
  function handleListing(event, i) {
    setCurrentQues(i + 1);
    if (!isListening) {
      for (let i = 0; i <= list.length - 1; i++) {
        document.getElementById("a" + i).classList.remove("listening");
      }
      document.getElementById(event.target.id).classList.add("listening");
      document.getElementById("answerBlock").classList.remove("hide");
      SpeechRecognition.startListening({
        continuous: true,
      });
    } else if (i === currentQues - 1) {
      document.getElementById("a" + i).classList.remove("listening");
      handleReset();
    }
  }
  const handleReset = () => {
    resetTranscript();
    setCurrentQues();
    stopListening();
  };
  function handleRecording() {
    toggleRecording();
    if (recording) {
      console.log(firebaseUpload(recording && URL.createObjectURL(recording)));
      firebaseUpload(recording && URL.createObjectURL(recording));
    }
  }
  function stopListening() {
    for (let i = 0; i <= list.length - 1; i++) {
      document.getElementById("a" + i).classList.remove("listening");
    }
    setIsListening(false);
  }
  function saveAns() {
    if (transcript.length >= 1){
        let tempAns = (list[currentQues - 1].Answer).toLowerCase();
        let tempTrans = transcript.toLowerCase();
        let tempList = [...list];
        if (tempTrans.indexOf(tempAns) > -1){
            tempList[currentQues - 1].Status = "Correct";
            setList(tempList);
        } else {
            tempList[currentQues - 1].Status = "Incorrect";
            setList(tempList);            
        }
    }
  }
  return (
    <div className="container">
      <table className="table">
        <thead className="thead-dark">
          <tr>
            <th scope="col"></th>
            <th scope="col">Questions</th>
            <th scope="col">Speaks</th>
            <th scope="col">Submit Answer</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {list
            ? list.map((q, i) => (
                <tr key={"q" + i}>
                  <th scope="row">{i + 1}</th>
                  <td>{q.Question} ?</td>
                  <td>
                    <button
                      type="button"
                      id={"s" + i}
                      value={q.Question}
                      className="btn btn-info mic"
                      onClick={(e) => speakQues(e)}
                    ></button>
                  </td>
                  <td>
                    <button
                      type="button"
                      id={"a" + i}
                      value={q.Question}
                      className="btn btn-success mic answer"
                      onClick={(e) => handleListing(e, i)}
                    ></button>
                  </td>
                  <td>
                    <b>{q.Status ? q.Status : ""}</b>
                  </td>
                </tr>
              ))
            : null}
        </tbody>
      </table>
      <div className="row">
        <div className="col-sm-2">
          <button onClick={() => handleRecording()} className="btn btn-info">
            {isRecording ? "Stop" : "Start Recording"}
          </button>
        </div>
        <div className="col-sm-5">
          <div className="hide" id="answerBlock">
            {currentQues ? (
              <>
                <b>Ques.</b> {list[currentQues - 1].Question} <br />
                <b> Ans: </b> {transcript}
              </>
            ) : null}
          </div>
        </div>
        <div className="col-sm-2">
          {currentQues ? (
            <>
              <button className="btn btn-success" onClick={() => saveAns()}>
                Submit this answer
              </button>
            </>
          ) : null}
        </div>
        <div className="col-sm-1">
          <div>
            <button className="btn btn-danger" onClick={() => handleReset()}>
              Reset
            </button>
          </div>
        </div>
        <div className="col-sm-2">
          <div className="pull-right">
            <button className="btn btn-danger" onClick={() => stopListening()}>
              Stop Listening
            </button>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-6">
          {!!recording && (
            <video width="320" height="240" controls>
              <source
                src={recording && URL.createObjectURL(recording)}
                type="video/mp4"
              />
            </video>
          )}
        </div>
        <div className="col-sm-6 log"></div>
      </div>
    </div>
  );
}

export default Questions;
