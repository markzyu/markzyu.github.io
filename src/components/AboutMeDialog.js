import React from 'react';
import ReactMarkdown from 'react-markdown';

import DismissDialog from '../components/DismissDialog';

const content = `
Mark is yet another wanna-be artisan coder. 

Most of his "artwork" is worthless and half finished. See Exhibit B and C for examples.
`

export const AboutMeDialog = props => {
  return (
    <DismissDialog title="About Me" {...props} className="medium-modal">
      <ReactMarkdown linkTarget='_blank' className='noSelects' children={content}/>
    </DismissDialog>
  )
};