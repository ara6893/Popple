import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import App from './App';
import {MessageDisplayBoundary} from './contexts/MessagingContext';
import {UserBoundary} from './contexts/UserContext'

ReactDOM.render(
<UserBoundary children={
    <MessageDisplayBoundary children={
        <>
            <link href="https://fonts.googleapis.com/css2?family=Rufina:wght@700&display=swap" rel="stylesheet"></link>
            <App/>
        </>
    }/>
}/>, document.getElementById('root')) 

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
