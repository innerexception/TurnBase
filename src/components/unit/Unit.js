import React, { PropTypes } from 'react'
import Constants from '../Constants.js';

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

        if(viewState.unitDragStart){
            let angleToMouse = (Math.atan2(position.x- viewState.unitOriginalStart.x, position.y- viewState.unitOriginalStart.y )*(180/Math.PI));
            let d = Math.sqrt( ((viewState.unitOriginalStart.x-position.x)*(viewState.unitOriginalStart.x - position.x)) + ((viewState.unitOriginalStart.y-position.y)*(viewState.unitOriginalStart.y-position.y)) );
            console.log(angleToMouse + ' d:' + d);

            pathEls.push((<polygon transform={'scale(0.2)rotate('+(angleToMouse)+')translate(-1250,-400)'} points={Constants.UI.Arrow.polygonPoints}/> ));
        }

        return (<svg x={position.x} y={position.y}><g onMouseDown={(e) => onUnitDragStart(e, unitInfo)}
                   onMouseUp={onUnitDragEnd}
                   transform={'scale(0.1)'}>{pathEls}</g></svg>);
    };
}

export default Unit;