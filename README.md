
# gmail-autoresponder

### Install

```bash
npm i gmail-autoresponder --save
```

### Using
```js
import { GmailAutoresponder } from 'gmail-autoresponder';

// API_KEY is optional
const gmailAutoresponder = new GmailAutoresponder(CLIENT_ID, API_KEY);

const restrictContacts = false; // default

// set vacation settings
gmailAutoresponder.setAutoresponder('HTML Message', 'Topic', restrictContacts).then(
  res => console.log('Set Autoresponder', res),
  err => console.log('Error while setAutoresponder', err)
);

// reset - turn off vacation settings
gmailAutoresponder.resetAutoresponder().then(
  res => console.log('Reset Autoresponder', res),
  err => console.log('Error while resetAutoresponder', err)
);

// get autoresponder settings
gmailAutoresponder.getAutoresponder().then(
  res => console.log('Get Autoresponder', res),
  err => console.log('Error while getAutoresponder', err)
);
```

### Create *API_KEY* & *CLIENT_ID*
[Google console](https://console.developers.google.com/apis/credentials)

### Gmail Autoresponder Proof of Concept:
- https://github.com/gkucmierz/gmail-autoresponder-poc
- https://autoresponder-poc.web.app/basic
