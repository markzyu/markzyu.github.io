import React from 'react';
import ReactMarkdown from 'react-markdown';

import DismissDialog from './DismissDialog';

const content = `
I'm currently actively working on these projects:

- This homepage.
- Twitch streamer's helper app: it discreetly notifies a streamer about stream quality, chats, and new
followers, in real time, and has proven useful in 110+ Twitch streams
- Password hasher: a password manager that doesn't store the passwords directly.
- Pcontainer: A rewrite of proot in Rust.
`

export const ExhibitADialog = props => {
  return (
    <DismissDialog title="Exhibit A" {...props} className="medium-modal">
      <ReactMarkdown linkTarget='_blank' className='noSelects' children={content}/>
    </DismissDialog>
  )
};