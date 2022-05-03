import React from 'react';
import ReactMarkdown from 'react-markdown';

import DismissDialog from '../components/DismissDialog';

const content = `
These are my abandoned projects. They were too big for me to work on. 
I'd love to work with others on any of these ideas, if similar projects already exist.

- A programming platform that connects all programming languages together,
into one single Runtime that shares one memory space and process id. Programmers can 
then balance between development speed, and the resulting product's performance, by 
selecting different programming languages for different parts of the program. (This
requires the creation of multiple entirely new runtimes, with different choices of memory 
management schemes. I do not have the man power needed to do this. )

- GrandOverworld: A network protocol that can connect multiple Minecraft Java servers in a way
that divides one single Minecraft world into multiple chunks, and served by different servers.
I stopped working on this project because solutions like WorldQL already exist.
`

export const ExhibitCDialog = props => {
  return (
    <DismissDialog title="Exhibit C" {...props} className="medium-modal">
      <ReactMarkdown linkTarget='_blank' className='noSelects' children={content}/>
    </DismissDialog>
  )
};