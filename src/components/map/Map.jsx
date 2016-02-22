import React, { PropTypes } from 'react'
import './Map.css';
import { fetchUnits, fetchViewState } from './MapActions.js';
import Constants from '../Constants.js';

class Map extends React.Component {

    static propTypes: {
        regions: PropTypes.array,
        units: PropTypes.array,
        onRegionClick: PropTypes.func.isRequired,
        onMapDrag: PropTypes.func.isRequired,
        onMapDragStart: PropTypes.func.isRequired,
        onMapDragEnd: PropTypes.func.isRequired,
        onMapZoom: PropTypes.func.isRequired,
        onUnitClick: PropTypes.func.isRequired,
        onUnitStackClick: PropTypes.func.isRequired,
        viewState: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.props.store.dispatch(fetchViewState({ zoomLevel: 2.5, pan: {x: 100, y:100}}));
    }

    componentDidUpdate(){
        if(!this.props.units){
            console.log('would dispatch for units here...');
            //this.props.store.dispatch(fetchUnits(Constants.Units.DefaultPositions));
        }
    }

    _getUnitImages = (regions, unitList, onUnitClick, onUnitStackClick) => {
        let els = [];
        unitList.forEach((list) => {
            let unitRegion = regions.filter((region) => {
                return region.attributes.id === list.region
            })[0];
            let initialPlacementPosition = this._getInitialPlacementPosition(document.getElementById(unitRegion.id));
            let i = 0;
            list.units.forEach((unitInfo) => {
                els.push(this._getUnitImage(initialPlacementPosition, unitInfo, i, onUnitClick, onUnitStackClick, unitRegion));
                i++;
            });
        });
        return els;
    };

    _getInitialPlacementPosition = (region) => {
        var bbox = region.getBBox();
        var x = Math.floor(bbox.x + bbox.width / 2.0);
        var y = Math.floor(bbox.y + bbox.height / 2.0);
        return {x, y, maxWidth: bbox.width, maxHeight: bbox.height};
    };

    _getUnitImage = (initialPlacementPosition, unitInfo, i, onUnitClick, onUnitStackClick, unitRegion) => {
        let nextValidX = initialPlacementPosition.x + (i * 20);
        let nextValidY = 0;
        while (nextValidX > initialPlacementPosition.maxWidth) {
            nextValidX = nextValidX - Math.round(initialPlacementPosition.maxWidth);
            nextValidY += 20;
        }
        if (nextValidY > initialPlacementPosition.maxHeight) {
            return (
                <image src='./res/svg/unitStack.svg' onClick={()=>onUnitStackClick(unitRegion)}></image>
            )
        }
        let unitData = Constants.Units[unitInfo.type];
        return (
            <image src={unitData.imgPath}
                   onClick={()=> onUnitClick(unitInfo)}
                   x={nextValidX} y={nextValidY}
                   width={unitData.width} height={unitData.height}></image>
        )
    };

    _getRegionPaths = (regions, onRegionClick) => {
        return regions.map((region) => {
            return (
                <path onClick={() => onRegionClick(region.attributes.id)} d={region.attributes.d}
                      id={region.attributes.id} title={region.attributes.title}
                      className={'turnbase-region ' + this._getRegionClassNames(region)}></path>
            )
        });
    };

    _getRegionClassNames = (region) => {
        let classes = '';
        if (region.selected) classes += 'selected';
        return classes;
    };

    _getViewTransformString = (viewState) => {
        return viewState ? 'scale('+viewState.zoomLevel+')translate('+viewState.pan.x + ',' + viewState.pan.y + ')' : null;
    };

    render() {
        if (this.props.regions) {
            return (
                <div className='turnbase-map-outer'>
                    <svg onMouseDown={this.props.onMapDragStart} onMouseMove={this.props.viewState.mapDragStart ? this.props.onMapDrag : null} onMouseUp={this.props.onMapDragEnd} onWheel={this.props.onMapZoom} >
                        <g transform={this._getViewTransformString(this.props.viewState)}>
                            {this._getRegionPaths(this.props.regions, this.props.onRegionClick)}
                            {this.props.units ? this._getUnitImages(this.props.regions, this.props.units, this.props.onUnitClick, this.props.onUnitStackClick) : null}
                        </g>
                    </svg>
                </div>);
        }
        else {
            return (<div>No Map</div>);
        }
    }

}

export default Map;