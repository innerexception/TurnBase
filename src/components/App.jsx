import React from 'react';
import MapStateContainer from './map/MapStateContainer.js';
import { fetchMap } from './map/MapActions.js';

class App extends React.Component {
    constructor(props){
        super(props);

    };

    componentDidMount(){
        const { dispatch } = this.props;
        dispatch(fetchMap('./res/svg/baseMap.svg'));
    }

    render(){
        return (
            <div className='turnbase-app'>
                <MapStateContainer />
            </div>
        );
    }
};

export default App