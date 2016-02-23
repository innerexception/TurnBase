import React, { PropTypes } from 'react'
import d3 from 'd3';
import './Map.css';
import { fetchUnits, fetchViewState } from './MapActions.js';
import Constants from '../Constants.js';

class BaseMap extends React.Component {

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
        this.props.store.dispatch(fetchViewState({ zoomLevel: 3, pan: {x: -145, y:-126}}));
    }

    componentDidUpdate(){
        if(this.props.regions && !this.props.units){
            let centroidMap = new Map();
            d3.select('svg').selectAll('path')[0].forEach((path) => {
                centroidMap.set(path.attributes.id.nodeValue, path.getBBox());
            });
            this.props.store.dispatch(fetchUnits(Constants.Units.DefaultPositions, centroidMap));
        }
    }

    _getUnitPaths = (regions, unitList, onUnitClick, onUnitStackClick, centroidMap) => {
        let els = [];
        unitList.forEach((list) => {
            let unitRegion = regions.filter((region) => {
                return region.attributes.id === list.region
            })[0];
            let initialPlacementPosition = this._getInitialPlacementPosition(centroidMap.get(unitRegion.attributes.id));
            let i = 0;
            list.units.forEach((unitInfo) => {
                els.push(this._getUnitImageGroup(initialPlacementPosition, unitInfo, i, onUnitClick, onUnitStackClick, unitRegion));
                i++;
            });
        });
        return els;
    };

    _getInitialPlacementPosition = (bbox) => {
        var x = Math.floor(bbox.x + bbox.width / 2.0);
        var y = Math.floor(bbox.y + bbox.height / 2.0);
        return {x, y, maxWidth: bbox.width, maxHeight: bbox.height};
    };

    _getUnitImageGroup = (initialPlacementPosition, unitInfo, i, onUnitClick, onUnitStackClick, unitRegion) => {
        let nextValidX = initialPlacementPosition.x + (i * 20);
        let nextValidY = initialPlacementPosition.y;
        while (nextValidX > nextValidX + initialPlacementPosition.maxWidth) {
            nextValidX = nextValidX - Math.round(initialPlacementPosition.maxWidth);
            nextValidY += 20;
        }
        //if (nextValidY > initialPlacementPosition.maxHeight) {
        //    return (
        //        <g><path d={Constants.Units['UnitStack'].d} x={nextValidX} y={nextValidY} width={20} height={20} onClick={()=>onUnitStackClick(unitRegion)}></path></g>
        //    )
        //}
        let unitData = Constants.Units[unitInfo.type];
        let pathEls = [];
        unitInfo.paths.forEach((path) => {
            pathEls.push((<path  d={path.attributes.d} className='turnbase-unit'
                                 onClick={()=> onUnitClick(unitInfo)}></path>));
        });
        return (<g transform={'translate('+nextValidX+','+nextValidY+')scale(0.1)'}>{pathEls}</g>);
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
                            {this.props.units ? this._getUnitPaths(this.props.regions, this.props.units, this.props.onUnitClick, this.props.onUnitStackClick, this.props.centroidMap) : null}
                        </g>
                    </svg>
                </div>);
        }
        else {
            return (<div>No Map</div>);
        }
    }

}

export default BaseMap;