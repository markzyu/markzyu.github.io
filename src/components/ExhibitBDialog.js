import React from 'react';
import ReactMarkdown from 'react-markdown';

import DismissDialog from '../components/DismissDialog';

const content = `
These projects are currently put on hold but you can help 
restart them by starring them or simply leaving a comment. 
Please feel free to use these ideas for your own purposes,
but make sure to mention me somewhere in the products.

- BackupTrackerSheet: A Python program that can be used to track important files and their
backups across multiple hard drives. Instead of using a UI, this program displays the results
through an Excel sheet. 

- GrandOverworld: A network protocol that can connect multiple Minecraft Java servers in a way
that divides one single Minecraft world into multiple chunks, and served by different servers.
I stopped working on this project because solutions like WorldQL already exist.
`

export const ExhibitBDialog = props => {
  return (
    <DismissDialog title="Exhibit B" {...props} className="medium-modal">
      <ReactMarkdown linkTarget='_blank' className='noSelects' children={content}/>
    </DismissDialog>
  )
};