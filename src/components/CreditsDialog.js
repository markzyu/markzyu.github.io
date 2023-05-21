import React from 'react';
import ReactMarkdown from 'react-markdown';

import DismissDialog from '../components/DismissDialog';
import packageJson from '../../package.json';

const dependencies = Object.keys(packageJson.dependencies).map(name => `- ${name}`);

const content = `
This web app wouldn't be possible without the following artworks.

- Wallpaper is from the game "Control". Credits to [Remedy](https://www.remedygames.com/)
- [React.js](https://github.com/facebook/react)
- [XP.css](https://github.com/botoxparty/XP.css)
- [Fontawesome icons](https://fontawesome.com/v6/search)
`

export const CreditsDialog = props => {
  return (
    <DismissDialog title="Credits" {...props} className="medium-modal">
      <ReactMarkdown linkTarget='_blank' className='noSelects' children={content}/>
      <details className='noSelects'>
        <summary>All open source dependencies</summary>
        <ReactMarkdown className='noSelects' children={dependencies.join('\n')} />
      </details>
    </DismissDialog>
  )
};