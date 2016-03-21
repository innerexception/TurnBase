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

        if(combatInfo.allowRetreat){
            return (
                <div>
                    <div onClick={this.props.onRetreatClick}>Retreat</div>
                    <div onClick={this.props.noRetreatClick}>Naw</div>
                </div>
            );
        }
        else{
            if(!combatInfo.victor){
                let attackerEls = [];
                combatInfo.attackerUnits.forEach((unit) => {
                    attackerEls.push(this._getUnitPortrait(unit, combatInfo.attackerUnits.length, combatInfo));
                });
                let defenderEls = [];
                if(combatInfo.defenderUnits) combatInfo.defenderUnits.forEach((unit) => {defenderEls.push(this._getUnitPortrait(unit, combatInfo.defenderUnits.length, combatInfo));});

                //auto roll for later
                //this.setTimeout(()=>this.props.unitTypeHasRolled(combatInfo.activePlayer.activeUnitType), 5000);

                if(combatInfo.combatTransition) setTimeout(()=>{this.props.onRollClick(combatInfo)}, 500);

                let diceEls = [];
                if(combatInfo.activePlayerId && !combatInfo.retreated){
                    if(combatInfo.activePlayerId === combatInfo.attackerUnits[0].owner){
                        if(combatInfo.attackerUnits[combatInfo.activeUnitIndex].unitDice){
                            combatInfo.attackerUnits[combatInfo.activeUnitIndex].unitDice.forEach((dieRoll) => {
                                diceEls.push(<Dice className={'roll'+dieRoll}/>);
                            });
                        }
                    }
                    else{
                        if(combatInfo.defenderUnits[combatInfo.activeUnitIndex].unitDice){
                            combatInfo.defenderUnits[combatInfo.activeUnitIndex].unitDice.forEach((dieRoll) => {
                                diceEls.push(<Dice className={'roll'+dieRoll}/>);
                            });
                        }
                    }
                }

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
                        <h2>{combatInfo.message ? combatInfo.message : 'Winner'}</h2>
                        <img src={Constants.Players[combatInfo.victor].markerPath}/>
                        <h3 onClick={()=>this.props.onNextCombatClick(combatInfo)}>Click to Continue</h3>
                    </div>
                );
            }
        }
    };

    _getUnitPortrait = (unit, total, combatInfo) => {
        let pathEls = [];
        if(unit.paths){
            unit.paths.forEach((path) => {
                pathEls.push((<path d={path.attributes.d} id={'combat_'+unit.id} fill={Constants.Players[unit.owner].color}></path>));
            });
        }

        let shouldHighlight;
        if(combatInfo.activePlayerId && !combatInfo.retreated){
            let activeUnit = combatInfo.activePlayerId === combatInfo.attackerUnits[0].owner ? combatInfo.attackerUnits[combatInfo.activeUnitIndex] : combatInfo.defenderUnits[combatInfo.activeUnitIndex];
            shouldHighlight = activeUnit.type === unit.type && combatInfo.activePlayerId === unit.owner;
        }

        if(unit.paths){
            pathEls.push((<text x={10} y={50} fontSize="20">{(unit.number - (unit.casualtyCount ? unit.casualtyCount : 0)) + 'x'}</text>));
            pathEls.push((<text x={10} y={25} fontSize="12">{'('+(unit.unconfirmedCasualtyCount ? unit.unconfirmedCasualtyCount : 0) + ')'}</text>));
            return (<svg className='turnbase-combat-portrait' style={{width: (100/total)+'%', backgroundColor: shouldHighlight ? 'yellow' : null}}>
                <g>{pathEls}</g>
            </svg>);
        }
        else{
            return (
                <img width={'50px'} height={'50px'} src={Constants.Units[unit.type].imagePath}/>
            );
        }
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