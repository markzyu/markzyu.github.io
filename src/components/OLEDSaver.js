import React, { useEffect, useRef, useState } from 'react';

import DismissDialog from './DismissDialog';

export const OLEDSaver = props => {
  const [date, setDate] = useState(new Date());
  const dateStr = new Intl.DateTimeFormat('en-US', {timeStyle: 'short'}).format(date);
  const [offsetX, setX] = useState(Math.random() * 100);
  const [offsetY, setY] = useState(Math.random() * 100);
  const refDiv = useRef()

  useEffect(() => {
    const interval = setInterval(() => {
        setDate(new Date());
        setX(Math.random() * window.innerWidth);
        setY(Math.random() * window.innerHeight);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onClick = () => refDiv.current.requestFullscreen();

  return (
    <DismissDialog title="OLED Saver" {...props} className="medium-modal">
      <button onClick={onClick}>Fullscreen</button><br/>
      <div ref={refDiv} style={{width: "200px", height: "200px", backgroundColor: "black", cursor: "url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7), auto"}}>
          <span style={{color: '#333', position: 'relative', left: `${offsetX}px`, top: `${offsetY}px`}}>{dateStr}</span>
      </div>
    </DismissDialog>
  )
};