import React from 'react';
import ReactMarkdown from 'react-markdown';

import DismissDialog from '../components/DismissDialog';

const content = `
These projects are currently put on hold but I might still
come back to them later.

- [MentalGraph](https://drive.google.com/file/d/1r0YbH673z542_SLlGRUMaHkUNgwGeN9t/view?usp=sharing): 
This app is invite-only. It enables multiple users to edit or view Markdown documents together. 
For those with an invite, [here is a link to the website](https://markzyu.netlify.app/MentalGraph/).

- [Password hasher](https://markzyu.github.io/password-hasher/): a password manager that doesn't store the passwords directly.

- BackupTrackerSheet: A Python program that can be used to track important files and their
backups across multiple hard drives.

- BarcodeDB: A phone app that scans barcodes and builds a database of my belongings.
`

export const ExhibitBDialog = props => {
  return (
    <DismissDialog title="Exhibit B" {...props} className="medium-modal">
      <ReactMarkdown linkTarget='_blank' className='noSelects' children={content}/>
    </DismissDialog>
  )
};