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

const speakSsmlAsync = (ai, ssml) => new Promise((done, err) => {
  ai.speakSsmlAsync(ssml, done, err);
});

const parseDuration = (txt) => txt.split(":").map(parseFloat).reduce((prev, curr) => prev * 60 + curr);

//  "I am %c very happy%% today."
// => {text: "I am"} {command: "%c"} {text: "very happy% today."}
const textToParts = (inputText, textSymbols) => {
  let isAfterPercent = false;
  let text = '';
  let results = [];
  for (const char of inputText) {
    if (char === '%' && !isAfterPercent) {
      isAfterPercent = true;
      continue;
    }

    if (isAfterPercent) {
      const command = '%' + char;
      const maybeTextReplacement = textSymbols?.[command];
      if (maybeTextReplacement) {
        text += maybeTextReplacement;
      } else {
        results.push({text});
        text = '';
        results.push({command});
      }

      isAfterPercent = false;
      continue;
    }

    text += char;
  }

  if (text) results.push({text});
  return results;
}

const makeSSMLPart = ({ text = '', emotion = 'general', pitch = '0%', rate = '0%' }) => {
  return `<prosody rate="${rate}" pitch="${pitch}">${text}</prosody>`
}

// WARNING: Azure only supports changing emotion once per sentence anyways, so we only allow one per segment
const makeSSML = ({ text = '', emotion = 'general', voiceName = 'en-US-JennyNeural', pitch = '0%', rate = '0%', config }) => {
  const origTextParts = textToParts(text, config?.textSymbols);
  const textParts = origTextParts.flatMap(part => {
    if (part.command) {
      const maybePitch = config?.pitchSymbols?.[part.command];
      const maybeRate = config?.rateSymbols?.[part.command];
      const maybeEmotion = config?.emotionSymbols?.[part.command];
      if (maybePitch) pitch = maybePitch;
      if (maybeRate) rate = maybeRate;
      if (maybeEmotion) emotion = maybeEmotion;
      return [];
    } else if (part.text) {
      return [{text: part.text, emotion, voiceName, pitch, rate}];
    } else return [];
  });
  console.log("TEST", origTextParts, textParts);
  const ssmlParts = textParts.map(makeSSMLPart);
  const ssml = `
    <speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US">
    <voice name="${voiceName}">
    <mstts:express-as style="${emotion}" >
    ${ssmlParts.join("")}
    </mstts:express-as>
    </voice></speak>
  `
  console.log("TEST", ssml);
  return ssml;
}

// Calls AI if needed. Returns a Blob / File
const cacheSpeak = async (dirHandle, func, ai, content) => {
  const key = {funcName: func.name, content};
  const cacheHandle = await dirHandle.getDirectoryHandle("audioCache", {create: true});
  const hashRaw = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(key)));
  const hashHex = Array.from(new Uint8Array(hashRaw)).map(b => b.toString(16).padStart(2, '0')).join('');

  if (!hashHex) throw new Error("Unexpected hashing failure: " + hashRaw + " from content: " + JSON.stringify(key));

  const jsonFileHandle = await cacheHandle.getFileHandle(`${hashHex}.json`, {create: true});
  const audioFileHandle = await cacheHandle.getFileHandle(`${hashHex}.dat`, {create: true});
  const jsonFile = await jsonFileHandle.getFile();
  const audioFile = await audioFileHandle.getFile();

  let cacheOk = false;
  try {
    const jsonFileText = await jsonFile.text();
    if (jsonFileText === JSON.stringify(key)) cacheOk = true;
  } catch (err) {cacheOk = false;}

  if (cacheOk) {
    console.log("Using cache at", audioFile.name);
    return audioFile;
  }

  // Update cache
  console.log("Updating cache at", audioFile.name);
  const result = await func(ai, content);
  const blob = new Blob([new Uint8Array(result.audioData, 0, result.audioData.byteLength)]);
  const writeJson = await jsonFileHandle.createWritable({keepExistingData: false});
  const writeAudio = await audioFileHandle.createWritable({keepExistingData: false});
  await writeJson.write(JSON.stringify(key));
  await writeJson.close();
  await writeAudio.write(blob);
  await writeAudio.close();
  return blob;
}


export const TTSApp = props => {
  const [dirHandle, setDirHandle] = useState(null);
  const [speechConfig, setSpeechConfig] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [subtitleData, setSubtitleData] = useState(null);
  const [subtitleIdx, setSubtitleIdx] = useState(0);
  const [voicesJson, setVoicesJson] = useState(null);
  const refKeyInput = useRef();
  const refAudio = useRef();
  const refVideo = useRef();

  const currentSubtitle = subtitleData && subtitleData.length && subtitleData[subtitleIdx];
  const currentLine = String(currentSubtitle?.Text).replace(/\\[nN]/g, " ");
  const currntVoice = String(currentSubtitle?.Name);
  const currntVoiceConfig = voicesJson?.voices && voicesJson?.voices[currntVoice];
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
    const ssml = makeSSML({text: currentLine, ...currntVoiceConfig, config: voicesJson});
    const blob = await cacheSpeak(dirHandle, speakSsmlAsync, ai, ssml);
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

  const onOpenSubtitleFile = async (fileHandle) => {
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

  const onOpenVideoFile = async (fileHandle) => {
    if (fileHandle.kind === 'file') {
      const file = await fileHandle.getFile();
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  }

  const onOpenVoicesJson = async (fileHandle) => {
    if (fileHandle.kind === 'file') {
      const file = await fileHandle.getFile();
      setVoicesJson(JSON.parse(await file.text()));
    }
  }

  const onOpenProject = async () => {
    const newDirHandle = await window.showDirectoryPicker();
    onOpenSubtitleFile(await newDirHandle.getFileHandle('subtitle.ass'));
    onOpenVideoFile(await newDirHandle.getFileHandle('video.mp4'));
    onOpenVoicesJson(await newDirHandle.getFileHandle('voices.json'));
    setDirHandle(newDirHandle);
  }

  const onRefresh = async () => {
    onOpenSubtitleFile(await dirHandle.getFileHandle('subtitle.ass'));
    onOpenVideoFile(await dirHandle.getFileHandle('video.mp4'));
    onOpenVoicesJson(await dirHandle.getFileHandle('voices.json'));
  }

  const onPrev = () => setSubtitleIdx((subtitleIdx + subtitleData.length - 1) % subtitleData.length);
  const onNext = () => setSubtitleIdx((subtitleIdx + 1) % subtitleData.length);

  return (
    <DismissDialog title="TTS/Sub-to-Dub machine" {...props} className="medium-modal">
      <button onClick={onOpenProject}>Open project folder</button> <button onClick={onRefresh}>Refresh</button><br/>
      {videoUrl && <video src={videoUrl} width="100%" ref={refVideo}></video>} <br/>
      Current line: {currentLine} <br/>
      Current voice: {currntVoice} <br/>
      Voice config: {JSON.stringify(currntVoiceConfig)} <br/>
      <button onClick={onPrev}>Prev</button><button onClick={onNext}>Next</button><br/>
      From the developer: I tried my best to make sure your API key will only be temporarily stored on your machine and transmitted only to Microsoft Azure Cloud. But I'm not working full time on this project so bad actors might still be able to retrieve your key through attacks like XSS. <br/> <br/>
      Consent Form: By putting the API key here, (1) I declare that I know the risks, and understand that, to the maximum extend permittable by law, there is NO warranty of security, privacy, merchantability, usability, reliability, or anything like that, and (2) I declare that I won't sue the website owner, or the Github source code owners, for using / temporarily storing the key on this webpage. <br/> <br/>
      I understand and here is my API Key: <input type="password" onChange={updateSpeechConfig} ref={refKeyInput} /><br/>
      {subtitleData && <button onClick={onClick}>Go</button>}
      {audioUrl && <audio ref={refAudio} src={audioUrl} onPause={() => refVideo.current?.pause()}></audio>}
    </DismissDialog>
  )
};