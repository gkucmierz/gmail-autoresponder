
import { getGapi } from 'gapi-browser';

const EventEmitter = require('events');

const GmailAutoresponder = (CLIENT_ID: string, API_KEY: string = '') => {
  const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'];
  const SCOPES = 'https://www.googleapis.com/auth/gmail.settings.basic';

  const eventEmitter = new EventEmitter();
  let gapi: any;

  const updateSignInStatus = (status: boolean) => {
    const event = status ? 'signIn' : 'signOut';
    eventEmitter.emit(event, status);
  };

  const loadPromise = new Promise((resolve, reject) => {
    getGapi.then((gapiRef: any) => {
      gapi = gapiRef;
      gapi.load('client:auth2', () => {
        gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        }).then(() => {
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
          updateSignInStatus(isSignedInSync());
          resolve();
        }, (error: any) => reject(error));
      }, (error: any) => reject(error));
    });
  });

  const syncMethod = (fn: Function) => {
    let loaded = false;
    loadPromise.then(() => loaded = true);
    return (...args: any[]) => {
      if (loaded) return fn(args);
      return false;
    };
  };

  const asyncMethod = (fn: Function) => {
    return (...args: any[]) => loadPromise.then(() => fn(...args));
  };

  const requireSignin = (fn: Function) => (...args: any[]) => {
    return isSignedIn().then(signedIn => {
      return signedIn ? fn(...args) : signIn().then(() => fn(...args));
    });
  };

  const isSignedInSync = () => {
    if (!gapi || !gapi.auth2) return false;
    return gapi.auth2.getAuthInstance().isSignedIn.get();
  };

  const isSignedIn = asyncMethod(() => new Promise(resolve => resolve(isSignedInSync())));

  const setVacationSetting = (config: any) => new Promise((resolve, reject) => {
    gapi.client.gmail.users.settings.updateVacation({userId: 'me'}, config).execute((res: any) => {
      if ('error' in res) {
        reject(res.error);
      } else {
        resolve(res);
      }
    });
  });

  const setAutoresponder = asyncMethod((message: string, topic = '', restrictToContacts = false) => {
    return setVacationSetting({
      enableAutoReply: true,
      responseSubject: topic,
      responseBodyHtml: message,
      restrictToContacts,
    });
  });

  const resetAutoresponder = asyncMethod(() => setVacationSetting({ enableAutoReply: false }));
  const getAutoresponder = asyncMethod(() => new Promise((resolve, reject) => {
    gapi.client.gmail.users.settings.getVacation({userId: 'me'}).execute((res: any) => {
      if ('error' in res) {
        reject(res.error);
      } else {
        resolve(res);
      }
    });
  }));

  const signIn = asyncMethod(() => new Promise((resolve, reject) => {
    const DELAY = 50;
    const signInObj = gapi.auth2.getAuthInstance().signIn();
    const statusProp = 'Da';
    const errorProp = 'Rf';
    (function loop() {
      const status = signInObj[statusProp];
      if (status === 2) {
        resolve();
      } else if (status === 3) {
        reject(signInObj[errorProp]);
      } else {
        setTimeout(loop, DELAY);
      }
    })();
  }));

  const signOut = asyncMethod(() => new Promise((resolve, reject) => {
    try {
      gapi.auth2.getAuthInstance().signOut();
      resolve(); 
    } catch(error) {
      reject(error);
    }
  }));

  return {
    isSignedInSync: syncMethod(isSignedInSync),
    isSignedIn,
    setAutoresponder: requireSignin(setAutoresponder),
    resetAutoresponder: requireSignin(resetAutoresponder),
    getAutoresponder: requireSignin(getAutoresponder),
    signIn,
    signOut,
    eventEmitter,
  };
};

export {
  GmailAutoresponder,
  getGapi,
}
