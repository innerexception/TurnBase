import React, { PropTypes } from 'react'
import Constants from '../Constants.js';
import d3 from 'd3';

class Unit {

    static getUnitPaths = (regions, unitList, onUnitClick, onUnitStackClick, onUnitDragStart, onUnitDragEnd, viewState) => {
        let els = [];
        unitList.forEach((list) => {
            let i = 0;
            list.units.forEach((unitInfo) => {
                els.push(Unit.getUnitImageGroup(Unit.getPlacementPosition(viewState, unitInfo), unitInfo, i, onUnitClick, onUnitStackClick, onUnitDragStart, onUnitDragEnd, viewState));
                i++;
            });
        });
        return els;
    };

    static getPlacementPosition = (viewState, unitInfo) => {
        //TODO, modify position by number of different unit types in region
        return viewState.unitPositions[unitInfo.region + unitInfo.type + unitInfo.owner];
    };

    static getUnitImageGroup = (position, unitInfo, i, onUnitClick, onUnitStackClick, onUnitDragStart, onUnitDragEnd, viewState) => {

        //TODO: place stack marker if no room in region
        //if (nextValidY > initialPlacementPosition.maxHeight) {
        //    return (
        //        <g><path d={Constants.Units['UnitStack'].d} x={nextValidX} y={nextValidY} width={20} height={20} onClick={()=>onUnitStackClick(unitRegion)}></path></g>
        //    )
        //}

        let pathEls = [];
        unitInfo.paths.forEach((path) => {
            pathEls.push((<path  d={path.attributes.d} className='turnbase-unit'
                                 onClick={()=> onUnitClick(unitInfo)}></path>));
        });
        let pathEl, moveFill;
        if(viewState.unitDragStart && viewState.unitDragStart.uniqueId === (unitInfo.region + unitInfo.type + unitInfo.owner)){
            //let angleToMouse = (Math.atan2(position.x - viewState.unitOriginalStart.x, position.y - viewState.unitOriginalStart.y )*(180/Math.PI));
            let dist = Math.sqrt( ((viewState.unitOriginalStart.x-position.x)*(viewState.unitOriginalStart.x - position.x)) + ((viewState.unitOriginalStart.y-position.y)*(viewState.unitOriginalStart.y-position.y)) );

            //let scale = Math.max(dist/200, 0.01);

            let x2 = -(viewState.unitOriginalStart.x-position.x);
            let y2 = -(viewState.unitOriginalStart.y-position.y);

            pathEl=(<g transform={'scale('+Math.min(Math.max(dist/20, 0.6), 0.9)+')translate(0,5)'}>
                         <line markerEnd="url(#arrowhead)" x1={0} y1={5} x2={x2} y2={y2} stroke={viewState.currentPathIsValid ? 'green' : 'red'}/>
                    </g>);
        }

        return (<svg>
                    <svg x={position.x} y={position.y}><g onMouseDown={(e) => onUnitDragStart(e, unitInfo)}
                       onMouseUp={onUnitDragEnd}
                       transform={'scale(0.07)'}>{pathEls}</g></svg>
                    {pathEl ? <svg x={viewState.unitOriginalStart.x} y={viewState.unitOriginalStart.y}>
                        <defs dangerouslySetInnerHTML={{__html: '<marker id="arrowhead" markerWidth="5" markerHeight="5" orient="auto" refX="0" refY="2.5"><polygon fill="'+moveFill+'" points="0,0 5,2.5 0,5"/></marker>'}}></defs>{pathEl}</svg> : null}
                </svg>);
    };
}

export default Unit;