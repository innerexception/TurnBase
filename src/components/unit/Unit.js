import React, { PropTypes } from 'react'
import Constants from '../Constants.js';

class Unit {

    static getUnitPaths = (regions, unitList, onUnitClick, onUnitStackClick, centroidMap, onUnitDragStart, onUnitDragEnd, onUnitMove) => {
        let els = [];
        unitList.forEach((list) => {
            let unitRegion = regions.filter((region) => {
                return region.attributes.id === list.region
            })[0];
            let initialPlacementPosition = Unit.getInitialPlacementPosition(centroidMap.get(unitRegion.attributes.id));
            let i = 0;
            list.units.forEach((unitInfo) => {
                els.push(Unit.getUnitImageGroup(initialPlacementPosition, unitInfo, i, onUnitClick, onUnitStackClick, onUnitDragStart, onUnitDragEnd, onUnitMove));
                i++;
            });
        });
        return els;
    };

    static getInitialPlacementPosition = (bbox) => {
        var x = Math.floor(bbox.x + bbox.width / 2.0);
        var y = Math.floor(bbox.y + bbox.height / 2.0);
        return {x, y, maxWidth: bbox.width, maxHeight: bbox.height};
    };

    static getUnitImageGroup = (initialPlacementPosition, unitInfo, i, onUnitClick, onUnitStackClick, onUnitDragStart, onUnitDragEnd, onUnitMove) => {
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
        let pathEls = [];
        unitInfo.paths.forEach((path) => {
            pathEls.push((<path  d={path.attributes.d} className='turnbase-unit'
                                 onClick={()=> onUnitClick(unitInfo)}></path>));
        });
        return (<g onMouseDown={onUnitDragStart}
                   onMouseUp={onUnitDragEnd}
                   onMouseMove={onUnitMove}
                   transform={'translate('+nextValidX+','+nextValidY+')scale(0.1)'}>{pathEls}</g>);
    };
}

export default Unit;