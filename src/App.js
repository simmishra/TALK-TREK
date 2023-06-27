import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyD6kl5Ed7AKBMIP6iKH7h9t7dsozOuFAh8",
  authDomain: "chat-room-d9745.firebaseapp.com",
  projectId: "chat-room-d9745",
  storageBucket: "chat-room-d9745.appspot.com",
  messagingSenderId: "716018322277",
  appId: "1:716018322277:web:8523d9f5a7ab043258ef8c"
});

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

// Rest of your code...



function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Talk Trek</h1>
        <SignOut/>
      </header>
      <section>
          {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  
  const signInWithGoogle = () =>{
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className='sign-in' onClick={signInWithGoogle}>Sign in with Google</button>
      
    </>

  )
}

function SignOut(){
  // Check if there is  a current user in that case we return a button that triggers the sign out method

  return auth.currentUser && (
    <button className='sign-out' onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {

  const dummy= useRef()

  const messageRef = firestore.collection('messages'); //reference to the database
  const query = messageRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query,{idField: 'id'}); //listen to update in data at real time with the useCollection data hook it returns an array of object where each object is the chat message in the databse and any time data changes react will re render with the latest data


  const [formValue, setFormValue] = useState('')

  const sendMessage = async(e) =>{
    e.preventDefault();

    const {uid,displayName} = auth.currentUser // grab userid from the currently logged in user


    // below line write a new document to the database takes a javascript object as an argument with the values we want to write to the adatabase 

    await messageRef.add({
      text:formValue,
      name: displayName,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid
    });
    setFormValue('')

    dummy.current.scrollIntoView({behavior: 'smooth'});
  }


  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message= {msg} />)}

        <div ref={dummy}></div>

      </main>

      {/* //trigger an event handeler called sendMessage */}
      <form onSubmit={sendMessage}> 
            <input type="text" value={formValue}  onChange={(e) => setFormValue(e.target.value)} placeholder="Type your message"/>
            <button type="submit"  disabled={!formValue}>Send</button>
        </form>
    </>
  )

}

function ChatMessage({message}){

  const { text,displayName, uid} = message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'; //distinguish between messages sent and received here uid of the firestore document is compared to the currently loggedin user if equal current user sent the message

  return (

    <>
        <div className={`message ${messageClass}`}>
          <p className="display">{displayName}</p>
          <p className="text">{text}</p>
        </div>

    </>   
  )


}

export default App;
