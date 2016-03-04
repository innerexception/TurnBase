import React, { PropTypes } from 'react'
import d3 from 'd3';
import './CombatPanel.css';
import {  } from './CombatActions.js';
import Unit from '../unit/Unit.js';
import Region from '../region/Region.js';
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
        let i=0;
        combatInfo.attackerUnits.forEach((unit) => { if(Constants.Units[unit.type].attack > 0){ attackerEls.push(this._getUnitPortrait(unit, i)); i++;}});
        i=0;
        let defenderEls = [];
        combatInfo.defenderUnits.forEach((unit) => { if(!unit.isBuilding && unit.type !== 'aaa'){defenderEls.push(this._getUnitPortrait(unit, i)); i++;} });
        return (<div className='turnbase-fields'>
                    <div className='turnbase-field'>
                        <svg><g>
                            { attackerEls }
                        </g></svg>
                    </div>
                    <div className='turnbase-field'>
                        <svg><g>
                            { defenderEls }
                        </g></svg>
                    </div>
                </div>);
    };

    _getUnitPortrait = (unit, i) => {
        let pathEls = [];
        unit.paths.forEach((path) => {
            pathEls.push((<path d={path.attributes.d} id={'combat_'+unit.id} fill={Constants.Players[unit.owner].color}></path>));
        });
        pathEls.push((<text x={10} y={50} fontSize="20">{unit.number + 'x'}</text>));
        return (<svg x={i*150} y={0}><g>{pathEls}</g></svg>);
    };

    render() {
        return (
            <div className={'turnbase-combat-outer '+(this.props.combatInfo ? ' in' : ' out')}>
                {this.props.combatInfo ? this._getCombatContent(this.props.combatInfo) : null}
            </div>);
    };

}

export default CombatPanel;