import React from 'react';
import ReactMarkdown from 'react-markdown';

import DismissDialog from '../components/DismissDialog';

const content = `
Mark is a full stack programmer coming from a DevOps background, 
looking to focus more on software development, with 3 years of 
professional experience developing containerized backend services, 
and with casual, self-motivated frontend projects in Javascript, 
React, Redux, Android, and Firebase.
`

export const AboutMeDialog = props => {
  return (
    <DismissDialog title="About Me" {...props} className="medium-modal">
      <ReactMarkdown linkTarget='_blank' className='noSelects' children={content}/>
    </DismissDialog>
  )
};