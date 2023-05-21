import React, { useRef, useState } from 'react';
import RemarkGfm from 'remark-gfm';

import DismissDialog from './DismissDialog';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import { getStoneStats, setStoneStats } from '../store';

export const StoneRow = ({numDots, refTotal, name, minWidth, prob, setProb}) => {
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
  refTotal.current = {value: total};

  return (
    <div style={{display: 'flex', justifyContent: 'space-around', width: '100%'}}>
      <span><b>{total}</b></span>
      {markers}
      <button style={{minWidth}} onClick={onClick}>{name}</button> 
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

const listStones = [
  '6 6', '7 5', '7 6', '7 7', '9 6', '9 7', 'Total'
]

const Stats = () => {
  const stats = getStoneStats() || {};
  const listStones = [
    '6 6', '7 5', '7 6', '7 7', '9 6', '9 7', 'Total'
  ]
  const list = listStones.map(name => `| ${name} | ${stats[name] || 0} |`).join('\n');
  const statsMarkdown = `
  | Stone | Times |
  | -- | -- |
  ${list}
  `;

  return <ReactMarkdown className='noSelects' children={statsMarkdown} remarkPlugins={RemarkGfm}/>;
};

const addStat = (result1, result2, result3) => {
  const stats = getStoneStats() || {};
  for (const txt of listStones) {
    if (txt === 'Total') continue;
    const [threshold1, threshold2] = txt.split(' ').map(x => parseInt(x));
    if (result1 < threshold1) continue;
    if (result2 < threshold2) continue;
    if (result3 >= 5) continue;
    console.log(result1, result2, threshold1, threshold2);
    stats[txt] = (stats[txt] || 0) + 1;
  }
  stats.Total = (stats.Total || 0) + 1;
  setStoneStats(stats);
}

export const StonePractice = props => {
  const [numDots, setNumDots] = useState(DEFAULT_DOTS);
  const [stoneRowKey, setStoneRowKey] = useState(0);
  const [stoneStatsKey, setStoneStatsKey] = useState(0);
  const [prob, setProb] = useState(DEFAULT_PROB);
  const refStoneRow1 = useRef();
  const refStoneRow2 = useRef();
  const refStoneRow3 = useRef();
  const [history, setHistory] = useState('');

  const reset = () => {
    const vals= [
      refStoneRow1.current?.value || 0,
      refStoneRow2.current?.value || 0,
      refStoneRow3.current?.value || 0,
    ];
    
    if (vals.filter(v => v).length > 0) {
      addStat(...vals);
      setHistory(`- ${vals.join(', ')}\n` + history);
    }
    setStoneRowKey(Date.now());
    setStoneStatsKey(Date.now());
    setProb(DEFAULT_PROB);
  }

  return (
    <DismissDialog title="Lost Ark Stone Practice" {...props} className="medium-modal">
      Num of dots: <input value={numDots} onChange={e => {
        setNumDots(parseInt(e.target.value) || 0);
        reset();
      }}></input> <br/> <br/>
      <div key={`stoneRow-${stoneRowKey}`}>
        <StoneRow refTotal={refStoneRow1} numDots={numDots} name="1" minWidth={40} setProb={setProb} prob={prob}/> <br/>
        <StoneRow refTotal={refStoneRow2} numDots={numDots} name="2" minWidth={40} setProb={setProb} prob={prob}/> <br/>
        <StoneRow refTotal={refStoneRow3} numDots={numDots} name="R" minWidth={40} setProb={setProb} prob={prob}/> <br/>
      </div>
      Probability: {prob}% <br/> <br/>
      <button onClick={reset}>RESET</button> <br/>
      <hr />
      <details className='noSelects' >
        <summary>Stats / History of rolls</summary>
        <div style={{maxHeight: 150, overflowY: 'scroll', paddingRight: '4px'}}>
          <Stats key={`stoneStats-${stoneStatsKey}`} />
          <hr />
          <ReactMarkdown className='noSelects' children={history || 'No history.'} />
        </div>
      </details>
    </DismissDialog>
  )
};