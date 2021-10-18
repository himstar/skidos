import * as firebase from 'firebase';
import "firebase/storage";
import 'firebase/firestore';

let firebaseConfig = {
    apiKey: "AIzaSyAaOmnH4ICvPo-GWYG3R-e22ysD4iZFmlU",
    authDomain: "skidos-9356d.firebaseapp.com",
    projectId: "skidos-9356d",
    storageBucket: "skidos-9356d.appspot.com",
    messagingSenderId: "746729368672",
    appId: "1:746729368672:web:d2c29b8ab3ebb0cd61e705",
    measurementId: "G-61TD3G19C8"
};
firebase.initializeApp(firebaseConfig);
export default function firebaseUpload(recording) {
  const ref = firebase.storage().ref();
  const file = recording;
  const name = +new Date() + "-" + 'vd';
  // const metadata = {
  //   contentType: file.type,
  // };
  const task = ref.child(name).put(file);
  task
    .then((snapshot) => snapshot.ref.getDownloadURL())
    .then((url) => {
      console.log(url);
      document.querySelector("#image").src = url;
    })
    .catch(console.error);
}
