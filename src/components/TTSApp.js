import { AudioConfig, AudioOutputStream, SpeechConfig, SpeechSynthesizer } from 'microsoft-cognitiveservices-speech-sdk';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import DismissDialog from '../components/DismissDialog';
import parseAss from 'ass-parser';

let secretsJson = null;
try {
  secretsJson = require('../secrets.json');
} catch (error) {}

const speakFuncs = {
  speakTextAsync: (ai, text) => new Promise((done, err) => {
    ai.speakTextAsync(text, done, err);
  }),
  speakSsmlAsync: (ai, ssml) => new Promise((done, err) => {
    ai.speakSsmlAsync(ssml, done, err);
  }),
};

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

const addPercentStrings = (a, b) => {
  return `${parseInt(a) + parseInt(b)}%`;
}

// WARNING: Azure only supports changing emotion once per sentence anyways, so we only allow one per segment
const makeSSML = ({ text = '', emotion = 'general', voiceName = 'en-US-JennyNeural', pitch = '0%', rate = '0%', volume='100%', config }) => {
  const origTextParts = textToParts(text, config?.textSymbols);
  const textParts = origTextParts.flatMap(part => {
    if (part.command) {
      const maybePitch = config?.pitchSymbols?.[part.command];
      const maybeRate = config?.rateSymbols?.[part.command];
      const maybeEmotion = config?.emotionSymbols?.[part.command];
      const maybeVol = config?.volumeSymbols?.[part.command];
      if (maybePitch) pitch = addPercentStrings(pitch, maybePitch);
      if (maybeRate) rate = addPercentStrings(rate, maybeRate);
      if (maybeVol) volume = addPercentStrings(volume, maybeVol);
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
  return [ssml, volume];
}

// Calls AI if needed. Returns a Blob / File
const cacheSpeak = async (dirHandle, funcName = "speakTextAsync", ai, content) => {
  const func = speakFuncs[funcName];
  if (!func) return;

  const key = {funcName, content};
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

const audioCtx = new AudioContext();
const audioElemToAudioNode = new WeakMap();

const lookupAudioNode = (audioElem) => {
  const maybeExistingNode = audioElemToAudioNode.get(audioElem);
  if (maybeExistingNode) return maybeExistingNode;

  const newNode = audioCtx.createMediaElementSource(audioElem);
  audioElemToAudioNode.set(audioElem, newNode);
  return newNode;
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
  const [triggerPlay, setTriggerPlay] = useState(false);

  const currentSubtitle = subtitleData && subtitleData.length && subtitleData[subtitleIdx];
  const currentLine = String(currentSubtitle?.Text).replace(/\\[nN]/g, " ");
  const currntVoice = String(currentSubtitle?.Name);
  const currntVoiceConfig = voicesJson?.voices && voicesJson?.voices[currntVoice];
  const startTime = currentSubtitle?.Start && parseDuration(currentSubtitle?.Start);
  const endTime = currentSubtitle?.End && parseDuration(currentSubtitle?.End);

  // This must be a list of jsons: [{type: "lowshelf", frequency: 1000, gain: 25}]
  const currentEqConfig = Array.from(voicesJson?.equalizerConfig || []).map(({type, frequency, gain, Q}) => {
    const filter = audioCtx.createBiquadFilter();
    filter.type = type;
    if (frequency) filter.frequency.value = frequency;
    if (gain) filter.gain.value = gain;
    if (Q) filter.Q.value = Q;
    return filter;
  });

  useEffect(() => {
    const key = secretsJson?.azure_tts_key?.key;
    if (key) refKeyInput.current.value = key;
  }, [refKeyInput]);

  const updateSpeechConfig = () => {
    const key = refKeyInput.current?.value;
    const config = SpeechConfig.fromSubscription(key, "centralus");
    setSpeechConfig(config);
  };

  const fetchVoiceURL = useCallback(async (idx) => {
    const Subtitle = subtitleData && subtitleData.length && subtitleData[idx];
    const Line = String(Subtitle?.Text).replace(/\\[nN]/g, " ");
    const Voice = String(Subtitle?.Name);
    const VoiceConfig = voicesJson?.voices && voicesJson?.voices[Voice];
    const stream = AudioOutputStream.createPullStream();
    const audioConfig = AudioConfig.fromStreamOutput(stream);
    const ai = new SpeechSynthesizer(speechConfig, audioConfig);
    const [ssml, volume] = makeSSML({text: Line, ...VoiceConfig, config: voicesJson});
    const blob = await cacheSpeak(dirHandle, "speakSsmlAsync", ai, ssml);
    return [URL.createObjectURL(blob), volume];
  }, [subtitleData, voicesJson, speechConfig, dirHandle]);

  const onClick = async (avoidPlayingVideo) => {
    const [url, volume] = await fetchVoiceURL(subtitleIdx);
    setAudioUrl(url);
    setTimeout(() => {
      // Setup audio & video volumes.
      const audioPlaybackRate = refAudio.current.duration / (endTime - startTime);
      if (!avoidPlayingVideo) refVideo.current.currentTime = startTime;
      refAudio.current.volume = parseInt(volume) / 100;
      refAudio.current.playbackRate = audioPlaybackRate;

      avoidPlayingVideo || refVideo.current.play();
      refAudio.current.play();
    }, 100);
  }

  if (triggerPlay) {
    onClick(true);
    setTriggerPlay(false);
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
    const newDirHandle = await window.showDirectoryPicker({mode: "readwrite"});
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

  const isContinuousPlay = useRef(false);
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isContinuousPlay.current) return;
      if (!subtitleData || !subtitleData.length) return;
      if (!refVideo.current) return;
      const relatedIdxs = subtitleData.flatMap((data, idx) => {
        if (Math.abs(parseDuration(data.Start) - refVideo.current.currentTime) >= 0.1)
          return [];
        return [idx];
      });
      const fetchingIdxs = subtitleData.flatMap((data, idx) => {
        if (Math.abs(parseDuration(data.Start) - refVideo.current.currentTime) >= 3)
          return [];
        return [idx];
      });
      fetchingIdxs.forEach(fetchVoiceURL);
      if (relatedIdxs && relatedIdxs.length) {
        setSubtitleIdx(relatedIdxs[0]);
        setTriggerPlay(true);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [subtitleData, fetchVoiceURL]);

  const onPrev = () => {
    refAudio.current?.pause();
    refVideo.current?.pause();
    isContinuousPlay.current = false;
    setSubtitleIdx((subtitleIdx + subtitleData.length - 1) % subtitleData.length)
  };
  const onNext = () => {
    refAudio.current?.pause();
    refVideo.current?.pause();
    isContinuousPlay.current = false;
    setSubtitleIdx((subtitleIdx + 1) % subtitleData.length);
  }
  const onPlay = () => {
    // Setup equalizer for the video
    const audioNode = lookupAudioNode(refVideo.current);
    const addNodes = Array.from(currentEqConfig);
    addNodes.push(audioCtx.destination);
    let prevNode = audioNode;
    for (const addNode of addNodes) {
      console.log("Connecting audio node:", addNode);
      prevNode.connect(addNode);
      prevNode = addNode;
    }
    refVideo.current.volume = voicesJson?.videoVolume || 0.4;

    refVideo.current?.play();
    isContinuousPlay.current = true;
    updateSpeechConfig();
  }

  return (
    <DismissDialog title="TTS/Sub-to-Dub machine" {...props} className="medium-modal">
      <button onClick={onOpenProject}>Open project folder</button> <button onClick={onRefresh}>Refresh</button><br/>
      {videoUrl && <video controls={isContinuousPlay.current || undefined} src={videoUrl} width="100%" ref={refVideo}></video>} <br/>
      <button onClick={onPrev}>Prev</button> <button onClick={() => onClick(false)}>Play One Line</button> <button onClick={onPlay}>Play</button> <button onClick={onNext}>Next</button><br/>
      <hr />
      Current line: {currentLine} <br/>
      Current voice: {currntVoice} <br/>
      Voice config: {JSON.stringify(currntVoiceConfig)} <br/>
      <hr />
      From the developer: I tried my best to make sure your API key will only be temporarily stored on your machine and transmitted only to Microsoft Azure Cloud. But I'm not working full time on this project so bad actors might still be able to retrieve your key through attacks like XSS. <br/> <br/>
      Consent Form: By putting the API key here, (1) I declare that I know the risks, and understand that, to the maximum extend permittable by law, there is NO warranty of security, privacy, merchantability, usability, reliability, or anything like that, and (2) I declare that I won't sue the website owner, or the Github source code owners, for using / temporarily storing the key on this webpage. <br/> <br/>
      I understand and here is my API Key: <input type="password" onChange={updateSpeechConfig} ref={refKeyInput} /><br/>
      {audioUrl && <audio ref={refAudio} src={audioUrl} onPause={() => isContinuousPlay.current || refVideo.current?.pause()}></audio>}
    </DismissDialog>
  )
};