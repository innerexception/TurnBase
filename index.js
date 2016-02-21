import React from 'react'
import thunkMiddleware from 'redux-thunk'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import mapReducer from './src/components/map/MapReducer.js'
import App from './src/components/App.jsx'

let store = createStore(mapReducer, applyMiddleware(
    thunkMiddleware // lets us dispatch() functions
));

render(
    <App store={store} />,
    document.body
);