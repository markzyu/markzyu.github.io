import React from 'react';
import ReactMarkdown from 'react-markdown';

import DismissDialog from '../components/DismissDialog';

const content = `
A full stack programmer coming from a DevOps background.
`

export const AboutMeDialog = props => {
  return (
    <DismissDialog title="About Me" {...props} className="medium-modal">
      <ReactMarkdown linkTarget='_blank' className='noSelects' children={content}/>
    </DismissDialog>
  )
};