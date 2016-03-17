import React, { PropTypes } from 'react'
import Constants from '../Constants.js';
import Utils from '../map/MapUtils.js';
import d3 from 'd3';

class Unit {

    static getUnitPaths = (regions, unitList, onUnitStackClick, onUnitDragStart, onUnitDragEnd, viewState, onMoveCancelClick, onArmyClick, onChipMouseOver, sendOneUnitToOrigin, playerInfo) => {
        let els = [];
        regions.forEach((region) => {
            let unitsInRegion = unitList.filter((unitInfo) => {
                return unitInfo.region === region.attributes.id && !Constants.Units[unitInfo.type].isBuilding;
            });
            if(unitsInRegion.length > 0){
                let regionTestPositions = Unit.getPlacementPositions(unitsInRegion);
                regionTestPositions.forEach((playerPositions) => {
                    let playerUnitsInRegion = unitsInRegion.filter((unit) => { return unit.owner === playerPositions.player });
                    //els.push(Unit.getPlayerArmyRondelPath(playerPositions.roundelPosition, playerPositions.player, onArmyClick, region.attributes.id));
                    els = els.concat(Unit.getPlayerUnitPathsForRegion(playerPositions, playerUnitsInRegion, onUnitStackClick, onUnitDragStart, onUnitDragEnd, viewState, onMoveCancelClick, onChipMouseOver, sendOneUnitToOrigin, playerInfo));
                });
            }
        });

        return els;
    };

    static getPlacementPositions = (unitsInRegion) => {

        let players = [];
        let regionId;
        unitsInRegion.forEach((unit) => { if(players.indexOf(unit.owner) === -1) { players.push(unit.owner); regionId=unit.region; }});

        players = players.map((player) => {
            let playerUnitTypes = [];
            let playerUnits = unitsInRegion.filter((unit) => {
                return unit.owner === player;
            });

            playerUnits.forEach((unit) => {
                if(playerUnitTypes.indexOf(unit.type) === -1) playerUnitTypes.push(unit.type);
            });

            let unitPositions = [];
            playerUnitTypes.forEach((unitType) => {
                let defaultUnitPosition = Constants.Units.DefaultPositions.filter((unitPosition) => {
                    return unitPosition.region + unitPosition.type + unitPosition.owner === regionId + unitType + player;
                })[0];

                if(defaultUnitPosition && defaultUnitPosition.initialX){
                    unitPositions.push({ x: defaultUnitPosition.initialX, y:defaultUnitPosition.initialY});
                }
            });

            return { player, unitTypes: playerUnitTypes, unitPositions };
        });

        return players;
    };

    static getPlayerArmyRondelPath = (position, playerId, onArmyClick, regionId) => {
        return (<image width={5} height={5} x={position.x} y={position.y} xlinkHref={Constants.Players[playerId].markerPath} onClick={() => onArmyClick(regionId, playerId)}></image>);
    };

    static getPlayerUnitPathsForRegion = (playerPositions, playerUnitsInRegion, onUnitStackClick, onUnitDragStart, onUnitDragEnd, viewState, onMoveCancelClick, onChipMouseOver, sendOneUnitToOrigin, playerInfo) => {
        let els = [];
        let i = 0;
        playerUnitsInRegion.forEach((unitInfo) => {
            els.push(Unit.getUnitImageGroup(Unit.getPlacementPositionInRect(unitInfo, playerPositions, i),
                unitInfo, onUnitStackClick, onUnitDragStart, onUnitDragEnd, viewState, onMoveCancelClick, onChipMouseOver, sendOneUnitToOrigin, playerInfo));
            i++;
        });
        return els;
    };

    static getPlacementPositionInRect = (unitInfo, playerPositions, i) => {
        if(unitInfo.dragPosition && unitInfo.queuedForMove){
            return unitInfo.dragPosition;
        }
        else if(unitInfo.dragPosition && !unitInfo.queuedForMove){
            if(unitInfo.airUnitCancelPosition) unitInfo.dragPosition = unitInfo.airUnitCancelPosition;
            else unitInfo.dragPosition = unitInfo.lastGoodPosition;
            return unitInfo.dragPosition;
        }
        else{
            if(playerPositions.unitPositions[i]) {
                let initialPosition = {x: playerPositions.unitPositions[i].x, y: playerPositions.unitPositions[i].y};
                unitInfo.lastGoodPosition = initialPosition;
                return unitInfo.lastGoodPosition;
            }
            else{
                return unitInfo.lastGoodPosition;
            }
        }
    };

    static getUnitClickHandler = (playerInfo, func, unitInfo) => {
        if(playerInfo){
            if(playerInfo.activePhase === 'Move' || playerInfo.activePhase === 'Combat') {
                if(!unitInfo.hasMoved && unitInfo.owner === playerInfo.id){
                    return func;
                }
            }
        }
        return null;
    };

    static getUnitImageGroup = (position, unitInfo, onUnitStackClick, onUnitDragStart, onUnitDragEnd, viewState, onMoveCancelClick, onChipMouseOver, sendOneUnitToOrigin, playerInfo) => {

        let pathEls = [];

        unitInfo.paths.forEach((path) => {
            pathEls.push((<path  d={path.attributes.d} className='turnbase-unit' id={unitInfo.id} fill={Constants.Players[unitInfo.owner].color}></path>));
        });

        let pathEl, returnPathEl, moveFill;

        //Drawing move arrows
        if(viewState.unitDragStart && (viewState.unitDragStart.unitInfo.id) === unitInfo.id && unitInfo.queuedForMove){
            //let angleToMouse = (Math.atan2(position.x - viewState.unitOriginalStart.x, position.y - viewState.unitOriginalStart.y )*(180/Math.PI));
            let dist = Math.sqrt( ((viewState.unitOriginalStart.x-position.x)*(viewState.unitOriginalStart.x - position.x)) + ((viewState.unitOriginalStart.y-position.y)*(viewState.unitOriginalStart.y-position.y)) );

            //let scale = Math.max(dist/200, 0.01);
            moveFill = viewState.currentPathIsValid ? 'lightgreen' : 'red';

            let x2 = -(viewState.unitOriginalStart.x-position.x);
            let y2 = -(viewState.unitOriginalStart.y-position.y);

            pathEl=(<g transform={'scale('+Math.min(Math.max(dist/20, 0.6), 0.9)+')translate(0,5)'}>
                         <line markerEnd="url(#arrowhead)" x1={0} y1={5} x2={x2} y2={y2} stroke={moveFill} />
                    </g>);
        }
        let savedMoveArrowInfo, savedReturnMoveArrowInfo;
        if((!viewState.unitDragStart) && viewState.savedMoveArrows){
            savedMoveArrowInfo = viewState.savedMoveArrows.get(unitInfo.id);
            if(savedMoveArrowInfo && unitInfo.queuedForMove){
                moveFill = 'lightgreen';
                pathEl = Unit._getPathEl(savedMoveArrowInfo, moveFill, onMoveCancelClick, unitInfo);
            }
            savedReturnMoveArrowInfo = viewState.savedMoveArrows.get(unitInfo.id + '_returnPath');
            if(savedReturnMoveArrowInfo && unitInfo.queuedForMove){
                returnPathEl = Unit._getPathEl(savedReturnMoveArrowInfo, 'whitesmoke', onMoveCancelClick, unitInfo);
            }
        }

        let num = unitInfo.number;
        let numTens = Math.floor(num/10);
        num -= numTens*10;
        let numFives = Math.floor(num/5);
        num -= numFives*5;
        let numOnes = num;

        let chipEls = [], startY=3.5;
        for(var i=0; i<numTens; i++){
            chipEls.push(<image width={6} height={6} x={1} y={startY-(0.3*chipEls.length)} xlinkHref={Constants.UI.Chip10.markerPath}></image>);
        }
        for(i=0; i<numFives; i++){
            chipEls.push(<image width={5.5} height={5.5} x={1.25} y={startY-(0.5*chipEls.length)} xlinkHref={Constants.UI.Chip5.markerPath}></image>);
        }
        for(i=0; i<numOnes-1; i++){
            chipEls.push(<image width={5} height={5} x={1.5} y={startY-(0.7*chipEls.length)} xlinkHref={Constants.UI.Chip1.markerPath}></image>);
        }

        if(unitInfo.showUnitCount) chipEls.push(<text x={0} y={0} width={1} height={1} fontSize="3">{unitInfo.number}</text>);

        return (<svg onContextMenu={(e) => {e.preventDefault(); if(!unitInfo.queuedForMove) onChipMouseOver(unitInfo); if(unitInfo.queuedForMove) sendOneUnitToOrigin(unitInfo);}} >
            {pathEl ? <svg x={viewState.unitOriginalStart ? viewState.unitOriginalStart.x : savedMoveArrowInfo.unitOriginalStart.x} y={viewState.unitOriginalStart ? viewState.unitOriginalStart.y : savedMoveArrowInfo.unitOriginalStart.y}>
                <defs dangerouslySetInnerHTML={{__html: '<marker id="arrowhead" markerWidth="5" markerHeight="5" orient="auto" refX="0" refY="2.5"><polygon fill="'+moveFill+'" points="0,0 5,2.5 0,5"/></marker>'}}></defs>{pathEl}</svg> : null}
            {returnPathEl ? <svg x={savedReturnMoveArrowInfo.unitOriginalStart.x} y={savedReturnMoveArrowInfo.unitOriginalStart.y}>
                <defs dangerouslySetInnerHTML={{__html: '<marker id="arrowhead" markerWidth="5" markerHeight="5" orient="auto" refX="0" refY="2.5"><polygon fill="whitesmoke" points="0,0 5,2.5 0,5"/></marker>'}}></defs>{returnPathEl}</svg> : null}

                    <svg x={position.x} y={position.y + (unitInfo.number > 3 ? unitInfo.number*0.2 : 0)}>
                        <g>{chipEls}</g>
                    </svg>

                    <svg className={unitInfo.queuedForMove && !unitInfo.firstMove ? 'no-events' : null} x={position.x} y={position.y}>
                        <g onMouseDown={Unit.getUnitClickHandler(playerInfo, (e) => { if(e.button!==2) onUnitDragStart(e, unitInfo);}, unitInfo)}
                           onMouseUp={()=>{onUnitDragEnd()}}
                           transform={'scale('+Constants.Units[unitInfo.type].scaleFactor+')'}>{pathEls}</g>
                    </svg>

                </svg>);
    };

    static _getPathEl = (savedMoveArrowInfo, moveFill, onMoveCancelClick, unitInfo) => {
        let dist = Math.sqrt( ((savedMoveArrowInfo.unitOriginalStart.x-savedMoveArrowInfo.newPosition.x)*(savedMoveArrowInfo.unitOriginalStart.x - savedMoveArrowInfo.newPosition.x))
            + ((savedMoveArrowInfo.unitOriginalStart.y-savedMoveArrowInfo.newPosition.y)*(savedMoveArrowInfo.unitOriginalStart.y-savedMoveArrowInfo.newPosition.y)) );

        let x2 = -(savedMoveArrowInfo.unitOriginalStart.x-savedMoveArrowInfo.newPosition.x);
        let y2 = -(savedMoveArrowInfo.unitOriginalStart.y-savedMoveArrowInfo.newPosition.y);

        return (<g transform={'scale('+Math.min(Math.max(dist/20, 0.6), 0.9)+')translate(0,5)'}>
            <line onClick={()=>onMoveCancelClick(unitInfo)} markerEnd="url(#arrowhead)" x1={0} y1={5} x2={x2} y2={y2} stroke={moveFill} strokeOpacity="0.4" strokeWidth={1.5}/>
        </g>);
    };
}

export default Unit;