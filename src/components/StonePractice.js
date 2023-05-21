import React, { useRef, useState } from 'react';
import RemarkGfm from 'remark-gfm';

import DismissDialog from './DismissDialog';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import { getStoneStats, setStoneStats } from '../store';

export const StoneRow = ({numDots, refTotal, name, minWidth, prob, setProb, onStart, onFinish}) => {
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
    onStart();

    const roll = Math.random();
    const target = prob / 100;
    console.log(`Rolled ${roll}, target: 0 to ${target}`)
    let total = 0;
    if (roll > target) {
      vals[currIdx] = false;
      total = vals.filter(v => v).length;
      setVals(vals);
      setCurrIdx(currIdx + 1);
      setProb(regulateMinMaxProb(prob + FAIL_PROB));
    } else {
      vals[currIdx] = true;
      total = vals.filter(v => v).length;
      setVals(vals);
      setCurrIdx(currIdx + 1);
      setProb(regulateMinMaxProb(prob + SUCCESS_PROB));
    }

    refTotal.current = {value: total};
    if (currIdx + 1 >= numDots) onFinish();
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
  const history = getStoneStats() instanceof Array ? getStoneStats() : [];
  const stats = {};
  const listStones = new Set();
  for (const [v1, v2, red] of history) {
    if (v1 < 6 || v2 < 6) continue;
    const [s1, s2] = [v1, v2].sort();
    listStones.add(`${s2} ${s1}`);
    if (red < 5) {
      const key = `${s2} ${s1}NoRed`;
      stats[key] = (stats[key] || 0) + 1;
    } else {
      const key = `${s2} ${s1}Red`;
      stats[key] = (stats[key] || 0) + 1;
    }
  }
  const list = Array.from(listStones).sort().map(name => `| ${name} | ${stats[name+'Red'] || 0} | ${stats[name+'NoRed'] || 0} |`).join('\n');
  const statsMarkdown = `
  | Stone | Times Red | Times NoRed |
  | -- | -- | -- |
  | Total | ${history.length} | ${history.length} |
  ${list}
  `;

  return <ReactMarkdown className='noSelects' children={statsMarkdown} remarkPlugins={RemarkGfm}/>;
};

export const StonePractice = props => {
  const [numDots, setNumDots] = useState(DEFAULT_DOTS);
  const [stoneRowKey, setStoneRowKey] = useState(0);
  const [stoneStatsKey, setStoneStatsKey] = useState(0);
  const [prob, setProb] = useState(DEFAULT_PROB);
  const refStoneRow1 = useRef();
  const refStoneRow2 = useRef();
  const refStoneRow3 = useRef();
  const [history, setHistory] = useState('');
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(0);

  const saveHistory = () => {
    const vals= [
      refStoneRow1.current?.value || 0,
      refStoneRow2.current?.value || 0,
      refStoneRow3.current?.value || 0,
    ];
    const history2 = getStoneStats() instanceof Array ? getStoneStats() : [];
    history2.push(vals);
    setStoneStats(history2)
    setHistory(`- ${vals.join(', ')}\n` + history);
  }

  const reset = () => {
    if (started && finished !== 3) {
      saveHistory();
    }
    setStoneRowKey(Date.now());
    setStoneStatsKey(Date.now());
    setProb(DEFAULT_PROB);
    setStarted(false);
    setFinished(0);
  }

  const onStart = () => setStarted(true);
  const onFinish = () => {
    if (finished + 1 === 3) {
      saveHistory();
    }
    setFinished(finished + 1);
  }
  const rowProps = {minWidth: 40, onStart, onFinish, numDots, prob, setProb};

  return (
    <DismissDialog title="Lost Ark Stone Practice" {...props} className="medium-modal">
      Num of dots: <input value={numDots} onChange={e => {
        setNumDots(parseInt(e.target.value) || 0);
        reset();
      }}></input> <br/> <br/>
      <div key={`stoneRow-${stoneRowKey}`}>
        <StoneRow refTotal={refStoneRow1} name="1" {...rowProps}/> <br/>
        <StoneRow refTotal={refStoneRow2} name="2" {...rowProps}/> <br/>
        <StoneRow refTotal={refStoneRow3} name="R" {...rowProps}/> <br/>
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