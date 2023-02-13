import { AudioConfig, AudioOutputStream, SpeechConfig, SpeechSynthesizer } from 'microsoft-cognitiveservices-speech-sdk';
import React, { useRef, useState } from 'react';
import DismissDialog from '../components/DismissDialog';
import parseAss from 'ass-parser';

const content = `
Mark is a full stack programmer coming from a DevOps background, 
looking to focus more on software development, with 3 years of 
professional experience developing containerized backend services, 
and with casual, self-motivated frontend projects in Javascript, 
React, Redux, Android, and Firebase.

For more information, please refer to his [Resume](/Resume.pdf).`

const speakTextAsync = (ai, text) => new Promise((done, err) => {
  ai.speakTextAsync(text, done, err);
});

const parseDuration = (txt) => txt.split(":").map(parseFloat).reduce((prev, curr) => prev * 60 + curr);


export const TTSApp = props => {
  const [speechConfig, setSpeechConfig] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [subtitleData, setSubtitleData] = useState(null);
  const [subtitleIdx, setSubtitleIdx] = useState(0);
  const refKeyInput = useRef();
  const refAudio = useRef();
  const refVideo = useRef();

  const currentSubtitle = subtitleData && subtitleData.length && subtitleData[subtitleIdx];
  const currentLine = String(currentSubtitle?.Text).replace(/\\[nN]/g, " ");
  const currntVoice = String(currentSubtitle?.Name);
  const startTime = currentSubtitle?.Start && parseDuration(currentSubtitle?.Start);
  const endTime = currentSubtitle?.End && parseDuration(currentSubtitle?.End);

  if (refVideo.current) refVideo.current.volume = 0.6;

  const updateSpeechConfig = (event) => {
    const key = refKeyInput.current?.value;
    const config = SpeechConfig.fromSubscription(key, "centralus");
    setSpeechConfig(config);
  };

  const onClick = async () => {
    const stream = AudioOutputStream.createPullStream();
    const audioConfig = AudioConfig.fromStreamOutput(stream);
    const ai = new SpeechSynthesizer(speechConfig, audioConfig);
    const result = await speakTextAsync(ai, currentLine);

    const blob = new Blob([new Uint8Array(result.audioData, 0, result.audioData.byteLength)]);
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    setTimeout(() => {
      const audioPlaybackRate = refAudio.current.duration / (endTime - startTime);
      refVideo.current.currentTime = startTime;
      refAudio.current.playbackRate = audioPlaybackRate;
      refVideo.current.play();
      refAudio.current.play();
    }, 100);
  }

  const onOpenSubtitleFile = async () => {
    const [fileHandle] = await window.showOpenFilePicker();
    if (fileHandle.kind === 'file') {
      const file = await fileHandle.getFile();
      const subtitle = parseAss(await file.text());
      const eventSections = subtitle.filter(item => item.section === 'Events');
      if (!eventSections || !eventSections.length) return setSubtitleData(null);

      const results = eventSections[0].body
        .filter(item => item.key === 'Dialogue')
        .map(item => item.value);
      if (!results || !results.length) return setSubtitleData(null);

      setSubtitleData(results);
    }
  }

  const onOpenVideoFile = async () => {
    const [fileHandle] = await window.showOpenFilePicker();
    if (fileHandle.kind === 'file') {
      const file = await fileHandle.getFile();
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  }

  const onPrev = () => setSubtitleIdx((subtitleIdx + subtitleData.length - 1) % subtitleData.length);
  const onNext = () => setSubtitleIdx((subtitleIdx + 1) % subtitleData.length);

  return (
    <DismissDialog title="About Me" {...props} className="medium-modal">
      <button onClick={onOpenSubtitleFile}>Open subtitle file</button><button onClick={onOpenVideoFile}>Open video file</button><br/>
      {videoUrl && <video src={videoUrl} width="100%" ref={refVideo}></video>} <br/>
      Current line: {currentLine} <br/>
      Current voice: {currntVoice} <br/>
      <button onClick={onPrev}>Prev</button><button onClick={onNext}>Next</button><br/>
      Test: <input type="password" onChange={updateSpeechConfig} ref={refKeyInput} /><br/>
      {subtitleData && <button onClick={onClick}>Go</button>}
      {audioUrl && <audio ref={refAudio} src={audioUrl} onPause={() => refVideo.current?.pause()}></audio>}
    </DismissDialog>
  )
};