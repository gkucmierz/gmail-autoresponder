
import { getGapi } from 'gapi-browser';

const EventEmitter = require('events');

const GmailAddon = (CLIENT_ID: string, API_KEY: string) => {
  const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'];
  const SCOPES = 'https://www.googleapis.com/auth/gmail.settings.basic';

  const eventEmitter = new EventEmitter();
  let gapi: any;

  const updateSigninStatus = (status: boolean) => {
    const event = status ? 'signIn' : 'signOut';
    eventEmitter.emit(event, status);
  };

  const setVacationSetting = (config: any) => new Promise((resolve, reject) => {
    gapi.client.gmail.users.settings.updateVacation({userId: 'me'}, config).execute((res: any) => {
      if ('error' in res) {
        reject(res.error);
      } else {
        resolve(res);
      }
    });
  });

  const isSignedIn = () => gapi.auth2.getAuthInstance().isSignedIn.get();
  const setAutoresponder = (message: string, topic = '', restrictToContacts = false) => {
    return setVacationSetting({
      enableAutoReply: true,
      responseSubject: topic,
      responseBodyHtml: message,
      restrictToContacts,
    });
  };
  const resetAutoresponder = () => setVacationSetting({ enableAutoReply: false });
  const signIn = () => new Promise((resolve, reject) => {
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
  });
  const signOut = () => new Promise((resolve, reject) => {
    try {
      gapi.auth2.getAuthInstance().signOut();
      resolve(); 
    } catch(error) {
      reject(error);
    }
  });
  const getAutoresponder = () => new Promise((resolve, reject) => {
    gapi.client.gmail.users.settings.getVacation({userId: 'me'}).execute((res: any) => {
      if ('error' in res) {
        reject(res.error);
      } else {
        resolve(res);
      }
    });
  });
  const getUserInfo = () => {
    if (!isSignedIn()) return false;
    const props: any = {
      fullname: 'Bd',
      email: 'Du',
      lastname: 'FU',
      name: 'FW',
      image: 'hL',
    };
    const res: any = {};
    const userInfo: any = gapi.auth2.getAuthInstance().currentUser.ke.Tt;
    Object.keys(props).map((prop: string) => res[prop] = userInfo[props[prop]]);
    return res;
  };

  new Promise((resolve, reject) => {
    getGapi.then((gapiRef: any) => {
      gapi = gapiRef;
      gapi.load('client:auth2', () => {
        gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        }).then(() => {
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
          updateSigninStatus(isSignedIn());
          resolve();
        }, (error: any) => {
          reject(error);
        });
      });
    });
  });

  return {
    isSignedIn,
    setAutoresponder,
    resetAutoresponder,
    getAutoresponder,
    signIn,
    signOut,
    getUserInfo,
    eventEmitter,
  };
};

export {
  GmailAddon,
  getGapi,
}
