import React from 'react'
import Constants from '../Constants.js';
import './Player.css';

class Player {
    static getPlayerUIEls = (playerInfo, onEndPhaseClick, combatInfo) => {
        return (
            <div className='turnbase-ui-frame'>
                <div className='turnbase-ui-outer' style={{backgroundColor:Constants.Players[playerInfo.id].color}}>
                    <img className={combatInfo ? 'no-events' : null} onClick={() => onEndPhaseClick(playerInfo.activePhase)} src={Constants.Players[playerInfo.id].markerPath}/>
                    <div className='player-phase'>{playerInfo.activePhase}</div>
                </div>
                <div className={'turnbase-ui-panel ' + (playerInfo.activePhase === 'Income' ? 'in' : 'out')}>
                    {Player.getIncomeEl(playerInfo)}
                </div>
                <div className={'turnbase-ui-panel ' + (playerInfo.activePhase === 'Purchase' || playerInfo.activePhase === 'Placement'? 'in' : 'out')}>
                    {Player.getPurchaseEl(playerInfo)}
                </div>
                <div className={'turnbase-ui-panel ' + (playerInfo.activePhase === 'Research' ? 'in' : 'out')}>
                    {Player.getResearchEl(playerInfo)}
                </div>
            </div>
        )
    };

    static getPurchaseEl = (playerInfo) => {

    };

    static getResearchEl = (playerInfo) => {

    };

    static getIncomeEl = (playerInfo) => {

    };
}

export default Player;