import React from 'react';
import ReactMarkdown from 'react-markdown';

import DismissDialog from '../components/DismissDialog';

const content = `
This web app wouldn't be possible without the following artworks.

- Wallpaper credits to [Remedy](https://www.remedygames.com/)
- [React.js](https://github.com/facebook/react)
- [XP.css](https://github.com/botoxparty/XP.css)
- [All other open source dependencies](https://github.com/markzyu/markzyu.github.io/blob/master/package.json#L5-L20)
`

export const CreditsDialog = props => {
  return (
    <DismissDialog title="Credits" {...props} className="medium-modal">
      <ReactMarkdown linkTarget='_blank' className='noSelects' children={content}/>
    </DismissDialog>
  )
};