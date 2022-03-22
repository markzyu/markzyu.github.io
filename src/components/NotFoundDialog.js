import React from 'react';
import ReactMarkdown from 'react-markdown';

import DismissDialog from '../components/DismissDialog';

const content = `
Uh-oh! You opened a link that doesn't exist. So we moved you back to the homepage.
`

export const NotFoundDialog = props => {
  return (
    <DismissDialog title="Error" {...props} className="medium-modal">
      <ReactMarkdown linkTarget='_blank' className='noSelects' children={content}/>
    </DismissDialog>
  )
};