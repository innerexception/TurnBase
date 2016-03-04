import React from 'react'
import Constants from '../Constants.js';
import './Player.css';

class Player {
    static getPlayerUIEls = (playerInfo, onEndPhaseClick) => {
        return (
            <div className='turnbase-ui-outer' style={{backgroundColor:Constants.Players[playerInfo.id].color}}>
                <img onClick={() => onEndPhaseClick(playerInfo.activePhase)} src={Constants.Players[playerInfo.id].markerPath}/>
                <div className='player-phase'>{playerInfo.activePhase}</div>
            </div>
        )
    };
}

export default Player;