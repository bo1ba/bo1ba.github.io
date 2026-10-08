import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth, onAuthStateChanged, signInAnonymously, GoogleAuthProvider,
  signInWithPopup, linkWithPopup, signInWithCredential, signOut,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getDatabase, ref, onValue, update, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

export function createBackend(config) {
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getDatabase(app);

  return {
    kind: 'firebase',
    serverTime: () => serverTimestamp(),
    watch(path, cb, onError) {
      return onValue(ref(db, path), snap => cb(snap.val()), err => (onError ? onError(err) : console.warn(path, err)));
    },
    watchConnected(cb) {
      return onValue(ref(db, '.info/connected'), snap => cb(snap.val() === true));
    },
    onAuth(cb) { onAuthStateChanged(auth, cb); },
    currentUser: () => auth.currentUser,
    async ensureUser() {
      if (auth.currentUser) return auth.currentUser.uid;
      return (await signInAnonymously(auth)).user.uid;
    },
    // 匿名使用者(例如先報名過)升級成 Google 帳號時保留同一個 uid
    async captainSignIn() {
      const provider = new GoogleAuthProvider();
      const cur = auth.currentUser;
      if (cur && cur.isAnonymous) {
        try {
          await linkWithPopup(cur, provider);
          return;
        } catch (e) {
          if (e.code !== 'auth/credential-already-in-use') throw e;
          const cred = GoogleAuthProvider.credentialFromError(e);
          if (cred) { await signInWithCredential(auth, cred); return; }
        }
      }
      await signInWithPopup(auth, provider);
    },
    signOut: () => signOut(auth),
    update: patch => update(ref(db), patch),
  };
}
