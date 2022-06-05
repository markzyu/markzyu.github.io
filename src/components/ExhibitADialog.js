import React from 'react';
import ReactMarkdown from 'react-markdown';

import DismissDialog from './DismissDialog';

const content = `
I'm currently working on these projects:

- This homepage.
- [Password hasher](https://markzyu.github.io/password-hasher/): a password manager that doesn't store the passwords directly.
- Twitch streamer's helper app: it discreetly notifies a streamer about stream quality, chats, and new
followers, in real time, and has proven useful in 110+ Twitch streams
`

export const ExhibitADialog = props => {
  return (
    <DismissDialog title="Exhibit A" {...props} className="medium-modal">
      <ReactMarkdown linkTarget='_blank' className='noSelects' children={content}/>
    </DismissDialog>
  )
};