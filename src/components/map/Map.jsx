import React, { PropTypes } from 'react'
import d3 from 'd3';
import './Map.css';
import { fetchUnits, fetchViewState, setAdjacencyMap, fetchUnitPaths, fetchPlayerState } from './MapActions.js';
import Unit from '../unit/Unit.js';
import Player from '../player/Player.js';
import Region from '../region/Region.js';
import Constants from '../Constants.js';

import CombatStateContainer from '../combatPanel/CombatStateContainer.js';

class BaseMap extends React.Component {

    static propTypes: {
        regions: PropTypes.array,
        units: PropTypes.array,
        onRegionClick: PropTypes.func.isRequired,
        onMapDrag: PropTypes.func.isRequired,
        onMapDragStart: PropTypes.func.isRequired,
        onMapDragEnd: PropTypes.func.isRequired,
        onMapZoom: PropTypes.func.isRequired,
        onMoveCancelClick: PropTypes.func.isRequired,
        onUnitClick: PropTypes.func.isRequired,
        onUnitStackClick: PropTypes.func.isRequired,
        onUnitDragStart: PropTypes.func.isRequired,
        onUnitDrag: PropTypes.func.isRequired,
        onUnitDragEnd: PropTypes.func.isRequired,
        onChipMouseOver: PropTypes.func.isRequired,
        sendOneUnitToOrigin: PropTypes.func.isRequired,
        viewState: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.props.store.dispatch(fetchViewState({ zoomLevel: 4, pan: {x: -305, y:-306}}));
        this.props.store.dispatch(fetchPlayerState(Constants.Players.FR));
    }

    componentDidUpdate(){
        if(this.props.regions && !this.props.units){
            let centroidMap = new Map();
            d3.selectAll('.turnbase-region')[0].forEach((path) => {
                let bbox = path.getBBox();
                centroidMap.set(path.attributes.id.nodeValue, {x: bbox.x, y: bbox.y, width:bbox.width, height:bbox.height});
            });
            this.props.store.dispatch(fetchUnits(Constants.Units.DefaultPositions, centroidMap, this.props.regions, Constants.Units.LandUnitTypes, Constants.Units.SeaUnitTypes));
        }
        if(this.props.units && !this.props.unitPathDispatch){
            let unitPathMap = new Map();
            d3.selectAll('.turnbase-unit')[0].forEach((path) =>{
                let bbox = path.getBBox();
                unitPathMap.set(+path.attributes.id.nodeValue, {x: bbox.x, y: bbox.y, width:bbox.width, height:bbox.height});
            });
            this.props.staticUnitPaths.forEach((unitPath) => {
                Constants.Units[unitPath.name].paths = unitPath.paths;
            });
            this.props.store.dispatch(fetchUnitPaths(unitPathMap));
        }
    }

    _getViewTransformString = (viewState) => {
        return viewState ? 'scale('+viewState.zoomLevel+')translate('+viewState.pan.x + ',' + viewState.pan.y + ')' : null;
    };

    _getMapMoveHandler = (viewState) => {
        if(viewState.mapDragStart) return this.props.onMapDrag;
        if(viewState.unitDragStart) return this.props.onUnitDrag;
        return null;
    };

    _getMapMouseUpHandler = (viewState) => {
        if(viewState.mapDragStart) return this.props.onMapDragEnd;
        if(viewState.unitDragStart) return this.props.onUnitDragEnd;
        return null;
    };

    render() {
        if (this.props.regions) {
            return (
                <div className='turnbase-map-outer'>
                    {Player.getPlayerUIEls(this.props.playerInfo, this.props.onEndPhaseClick, this.props.viewState.combatInfo, this.props.units)}
                    <CombatStateContainer store={this.props.store}/>
                    <svg onMouseDown={this.props.onMapDragStart} onMouseMove={this._getMapMoveHandler(this.props.viewState)} onMouseUp={this._getMapMouseUpHandler(this.props.viewState)} onWheel={this.props.onMapZoom} >
                        <g transform={this._getViewTransformString(this.props.viewState)}>
                            {Region.getRegionPaths(this.props.regions, this.props.onRegionClick, this.props.viewState, this.props.highlightNextIncomeRegion)}
                            {this.props.units ? Unit.getUnitPaths(this.props.regions, this.props.units, this.props.onUnitClick,
                                                                  this.props.onUnitStackClick, this.props.onUnitDragStart,
                                                                  this.props.onUnitDragEnd, this.props.viewState, this.props.onMoveCancelClick,
                                                                  this.props.onArmyClick, this.props.unitPathDispatch, this.props.onChipMouseOver,
                                                                  this.props.sendOneUnitToOrigin, this.props.playerInfo) : null}
                        </g>
                    </svg>
                </div>);
        }
        else {
            return (<div>Error Loading Base Map</div>);
        }
    }

}

export default BaseMap;