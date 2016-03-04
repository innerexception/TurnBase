import React from 'react'
import thunkMiddleware from 'redux-thunk'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import mapReducer from './src/components/map/MapReducer.js'
import combatReducer from './src/components/combatPanel/CombatReducer.js';
import App from './src/components/App.jsx'

let reducers = combineReducers({ mapReducer, combatReducer});

let store = createStore(reducers, applyMiddleware(
    thunkMiddleware // lets us dispatch() functions
));

render(
    <App store={store} />,
    document.body
);