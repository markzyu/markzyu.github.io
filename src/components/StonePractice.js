import React, { useState } from 'react';

import DismissDialog from './DismissDialog';

export const StoneRow = ({numDots, name, minWidth, prob, setProb}) => {
  const [vals, setVals] = useState(new Array(numDots).fill(null));
  const [currIdx, setCurrIdx] = useState(0);
  const markers = vals.map((v, i) => {
    let text = '?';
    if (v === true) text = '+';
    else if (v === false) text = '_';
    return <span key={i}>{text}</span>
  })
  const onClick = () => {
    if (currIdx >= numDots) return;
    const roll = Math.random();
    const target = prob / 100;
    console.log(`Rolled ${roll}, target: 0 to ${target}`)
    if (roll > target) {
      vals[currIdx] = false;
      setVals(vals);
      setCurrIdx(currIdx + 1);
      setProb(regulateMinMaxProb(prob + FAIL_PROB));
    } else {
      vals[currIdx] = true;
      setVals(vals);
      setCurrIdx(currIdx + 1);
      setProb(regulateMinMaxProb(prob + SUCCESS_PROB));
    }
  };

  const total = vals.filter(v => v).length;

  return (
    <div style={{display: 'flex', justifyContent: 'space-around', width: '100%'}}>
      <button style={{minWidth}} onClick={onClick}>{name}</button> 
      {markers}
      <span><b>{total}</b></span>
    </div>
  )
}

const DEFAULT_DOTS = 10;
const DEFAULT_PROB = 75;
const SUCCESS_PROB = -10;
const FAIL_PROB = 10;
const MAX_PROB = 75;
const MIN_PROB = 25;

const regulateMinMaxProb = (v) => {
  if (v > MAX_PROB) return MAX_PROB;
  if (v < MIN_PROB) return MIN_PROB;
  return v;
}

export const StonePractice = props => {
  const [numDots, setNumDots] = useState(DEFAULT_DOTS);
  const [stoneRowKey, setStoneRowKey] = useState(0);
  const [prob, setProb] = useState(DEFAULT_PROB);

  const reset = () => {
    setStoneRowKey(Date.now());
    setProb(DEFAULT_PROB);
  }

  return (
    <DismissDialog title="Lost Ark Stone Practice" {...props} className="medium-modal">
      Num of dots: <input value={numDots} onChange={e => {
        setNumDots(parseInt(e.target.value) || 0);
        reset();
      }}></input> <br/> <br/>
      <div key={stoneRowKey}>
        <StoneRow numDots={numDots} name="1" minWidth={40} setProb={setProb} prob={prob}/> <br/>
        <StoneRow numDots={numDots} name="2" minWidth={40} setProb={setProb} prob={prob}/> <br/>
        <StoneRow numDots={numDots} name="R" minWidth={40} setProb={setProb} prob={prob}/> <br/>
      </div>
      Probability: {prob}% <br/> <br/>
      <button onClick={reset}>RESET</button> <br/>
    </DismissDialog>
  )
};