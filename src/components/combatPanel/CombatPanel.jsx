import React, { PropTypes } from 'react'
import d3 from 'd3';
import './CombatPanel.css';
import {  } from './CombatActions.js';
import Unit from '../unit/Unit.js';
import Region from '../region/Region.js';
import Dice from './../dice/Dice.jsx';
import Constants from '../Constants.js';

class CombatPanel extends React.Component {

    static propTypes: {
        combatInfo: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
    };

    _getCombatContent = (combatInfo) => {
        let attackerEls = [];
        let attackerUnitTypes = new Map();
        let i=0;
        combatInfo.attackerUnits.forEach((unit) => {
            attackerEls.push(this._getUnitPortrait(unit, combatInfo.attackerUnits.length, combatInfo)); i++;
            if(!attackerUnitTypes.get(unit.type)) attackerUnitTypes.set(unit.type, 1);
            else attackerUnitTypes.set(unit.type, attackerUnitTypes.get(unit.type)+1);
        });
        i=0;
        let defenderEls = [];
        combatInfo.defenderUnits.forEach((unit) => {defenderEls.push(this._getUnitPortrait(unit, combatInfo.attackerUnits.length, combatInfo)); i++;});

        //auto roll for later
        //this.setTimeout(()=>this.props.unitTypeHasRolled(combatInfo.activePlayer.activeUnitType), 5000);

        if(combatInfo.combatTransition) setTimeout(()=>{this.props.onRollClick(combatInfo)}, 500);

        let diceEls = [];
        combatInfo.activePlayer && combatInfo.activePlayer.activeUnitType.unitDice.forEach((dieRoll) => {
            diceEls.push(<Dice className={'roll'+dieRoll}/>);
        });

        if(!combatInfo.victor){
            return (<div style={{height:'100%'}}>
                <div onClick={()=>{this.props.onRollClick(combatInfo)}} className='turnbase-rollbutton'>
                    <Dice className='static1 no-events'/>
                    <Dice className='static2 no-events'/>
                </div>
                <div className='turnbase-dicefield'>
                    { diceEls }
                </div>
                <div className='turnbase-fields'>
                    <div className='turnbase-field'>
                        <div>
                            { attackerEls }
                        </div>
                    </div>
                    <div className='turnbase-field'>
                        <div>
                            { defenderEls }
                        </div>
                    </div>
                </div>
            </div>);
        }
        else{
            return (<div className='victor-holder'>
                        <h2>Winner</h2>
                        <img src={Constants.Players[combatInfo.victor.units[0].owner].markerPath}/>
                        <h3 onClick={()=>this.props.onNextCombatClick(combatInfo)}>Click to Continue</h3>
                    </div>
                );
        }

    };

    _getUnitPortrait = (unit, total, combatInfo) => {
        let pathEls = [];
        unit.paths.forEach((path) => {
            pathEls.push((<path d={path.attributes.d} id={'combat_'+unit.id} fill={Constants.Players[unit.owner].color}></path>));
        });


        let shouldHighlight;
        if(combatInfo.activePlayer) shouldHighlight = combatInfo.activePlayer.activeUnitType.type === unit.type && combatInfo.activePlayer.units[0].owner === unit.owner;

        pathEls.push((<text x={10} y={50} fontSize="20">{(unit.number - (unit.casualtyCount ? unit.casualtyCount : 0)) + 'x'}</text>));
        return (<svg className='turnbase-combat-portrait' style={{width: (100/total)+'%', backgroundColor: shouldHighlight ? 'yellow' : null}}>
                    <g>{pathEls}</g>
                </svg>);
    };

    _getInOutState = (combatInfo) => {
        if(combatInfo){
            if(combatInfo.combatTransition) return ' out';
            else return ' in';
        }
        else{
            return ' out';
        }
    };

    render() {
        return (
            <div className={'turnbase-combat-outer '+(this._getInOutState(this.props.combatInfo))}>
                {this.props.combatInfo ? this._getCombatContent(this.props.combatInfo) : null}
            </div>);
    };

}

export default CombatPanel;