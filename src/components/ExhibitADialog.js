import React from 'react';
import ReactMarkdown from 'react-markdown';

import DismissDialog from './DismissDialog';

const content = `
I am currently employed and not seeking new jobs. Current hobby projects:

- Hidden features on this homepage.
`

export const ExhibitADialog = props => {
  return (
    <DismissDialog title="Exhibit A" {...props} className="medium-modal">
      <ReactMarkdown linkTarget='_blank' className='noSelects' children={content}/>
    </DismissDialog>
  )
};