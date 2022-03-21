import React from 'react';
import ReactMarkdown from 'react-markdown';

import DismissDialog from '../components/DismissDialog';

const content = `
These are my abandoned projects. Please feel free to use these ideas for your own purposes,
but make sure to mention me somewhere in the products. I'd also love to work with others on
any of these, if similar projects already exist.

- A programming platform that connects all programming languages together,
into one single Runtime that shares one memory space and process id. Programmers can 
then balance between development speed, and the resulting product's performance, by 
selecting different programming languages for different parts of the program. (This
requires the creation of multiple entirely new runtimes, with different choices of memory 
management schemes. I do not have the man power needed to do this. )

- A note-taking app that enables multiple users to edit or view Markdown documents in the Firebase database.

- A retro css library that makes webpages look like old Linux console UIs. There are already 
well-established libraries for this purpose, such as [BOOTSTRA.386](https://github.com/kristopolous/BOOTSTRA.386).
`

export const ExhibitCDialog = props => {
  return (
    <DismissDialog title="Exhibit C" {...props} className="medium-modal">
      <ReactMarkdown linkTarget='_blank' className='noSelects' children={content}/>
    </DismissDialog>
  )
};