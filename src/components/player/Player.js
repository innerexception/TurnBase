import React from 'react'
import Constants from '../Constants.js';
import './Player.css';

class Player {
    static getPlayerUIEls = (playerInfo, onEndPhaseClick, combatInfo, units, onUnitTypePurchased) => {
        return (
            <div className='turnbase-ui-frame'>
                <div className='turnbase-ui-outer' style={{backgroundColor:Constants.Players[playerInfo.id].color}}>
                    <img className={combatInfo ? 'no-events' : null} onClick={() => onEndPhaseClick(playerInfo.activePhase)} src={Constants.Players[playerInfo.id].markerPath}/>
                    <div className='player-phase'>{playerInfo.activePhase}</div>
                    <div className='player-bank'>{playerInfo.lastIncome}</div>
                </div>
                <div className={'turnbase-ui-panel ' + (playerInfo.activePhase === 'Income' ? 'in' : 'out')}>
                    {Player.getIncomeEl(playerInfo)}
                </div>
                <div className={'turnbase-ui-panel ' + (playerInfo.activePhase === 'Purchase' || playerInfo.activePhase === 'Placement'? 'in' : 'out')}>
                    {units ? Player.getPurchaseEl(playerInfo, units, onUnitTypePurchased) : null}
                </div>
                <div className={'turnbase-ui-panel ' + (playerInfo.activePhase === 'Research' ? 'in' : 'out')}>
                    {Player.getResearchEl(playerInfo)}
                </div>
            </div>
        )
    };

    static getPurchaseEl = (playerInfo, units, onUnitTypePurchased) => {
        let unitTypePortraitEls = [];

        let playerUnits = units.filter((unit) => {
            return unit.owner === playerInfo.id;
        });

        let hasAnyIC = playerUnits.filter((unit) => {
            return unit.type === 'majorIC' || unit.type === 'minorIC';
        });

        let i=0;
        if(hasAnyIC.length > 0){
            Constants.Units.LandUnitTypes.forEach((landUnitType) => {
                unitTypePortraitEls.push(Player.getPortraitforUnitType(onUnitTypePurchased, landUnitType, i, playerInfo));
                i++;
            });
        }

        let hasAnyHarbor = playerUnits.filter((unit) => {
            return unit.type === 'harbor'
        });

        i=0;
        if(hasAnyHarbor.length > 0){
            Constants.Units.SeaUnitTypes.forEach((seaUnitType) => {
                unitTypePortraitEls.push(Player.getPortraitforUnitType(onUnitTypePurchased, seaUnitType, i, playerInfo, 100));
                i++;
                if(i > 6) i=0;
            });
        }

        return (
            <div className='turnbase-purchase-frame'>
                <svg><g>{ unitTypePortraitEls }</g></svg>
            </div>
        );
    };

    static getResearchEl = (playerInfo) => {

    };

    static getIncomeEl = (playerInfo) => {
        return (
            <div className='turnbase-income-outer'>
                <div>+{playerInfo.income ? playerInfo.income : 0}</div>
            </div>
        );
    };

    static getPortraitforUnitType = (unitTypePurchased, unitType, i, playerInfo, y) => {
        let pathEls = [];
        let unitInfo = Constants.Units[unitType];
        if(unitInfo.paths){
            unitInfo.paths.forEach((path) => {
                pathEls.push((<path d={path.attributes.d} className='turnbase-unit' fill={Constants.Players[playerInfo.id].color}></path>));
            });
        }
        return (
            <svg onClick={()=>unitTypePurchased(unitType)} x={i*150} y={ y?y:5}>
                <g>
                    <text x={-20} y={20}>{Player.getTypeCount(playerInfo) + ' x'}</text>
                </g>
                <g transform={'scale('+Constants.Units[unitType].staticScaleFactor+')'}>
                    {pathEls}
                </g>
            </svg>
        );
    };

    static getTypeCount = (playerInfo) => {
        if(playerInfo.puchasedUnits){
            if(playerInfo.puchasedUnits[unitType]) return playerInfo.puchasedUnits[unitType].number;
        }
        return 0;
    };


}

export default Player;