import React, { PropTypes } from 'react'
import Constants from '../Constants.js';
import Utils from '../map/MapUtils.js';
import d3 from 'd3';

class Unit {

    static getUnitPaths = (regions, unitList, onUnitStackClick, onUnitDragStart, onUnitDragEnd, viewState, onMoveCancelClick, onArmyClick, measurementPassDone, onChipMouseOver, sendOneUnitToOrigin, playerInfo) => {
        let els = [];
        regions.forEach((region) => {
            let unitsInRegion = unitList.filter((unitInfo) => {
                return unitInfo.region === region.attributes.id;
            });
            if(unitsInRegion.length > 0){
                let regionBbox = Utils.getPathBoundingRectById(region.attributes.id);
                region.bbox.pxWidth = regionBbox.width;
                region.bbox.pxHeight = regionBbox.height;
                region.bbox.px = regionBbox.left;
                region.bbox.py = regionBbox.top;

                let regionTestPositions = Unit.getPlacementPositions(unitsInRegion, region.bbox, measurementPassDone);
                regionTestPositions.forEach((playerPositions) => {
                    let playerUnitsInRegion = unitsInRegion.filter((unit) => { return unit.owner === playerPositions.player });
                    if(playerPositions.showRondel && measurementPassDone) els.push(Unit.getPlayerArmyRondelPath(playerPositions.roundelPosition, playerPositions.player, onArmyClick, region.attributes.id));
                    else els = els.concat(Unit.getPlayerUnitPathsForRegion(playerPositions, playerUnitsInRegion, onUnitStackClick, onUnitDragStart, onUnitDragEnd, viewState, onMoveCancelClick, onChipMouseOver, sendOneUnitToOrigin, playerInfo));
                });
            }
        });

        return els;
    };

    static getPlacementPositions = (unitsInRegion, regionCentroid, measurementPassDone) => {

        let players = [], numPlayers = 0;
        let regionId;
        unitsInRegion.forEach((unit) => { if(players.indexOf(unit.owner) === -1) { players.push(unit.owner); numPlayers++; regionId=unit.region; }});

        let i=0;

        players = players.map((player) => {
            let playerUnitTypes = [];
            let playerUnits = unitsInRegion.filter((unit) => {
                return unit.owner === player;
            });

            playerUnits.forEach((unit) => {
                if(playerUnitTypes.indexOf(unit.type) === -1) playerUnitTypes.push(unit.type);
            });

            let fit = true;
            let numRows = 0;
            let numCols = 0;

            let unitPositions = [];
            let playerRect = {x: regionCentroid.x, y: regionCentroid.y + ((regionCentroid.height/(numPlayers))*i), width: regionCentroid.width, height: regionCentroid.height/numPlayers, px: regionCentroid.px, py: regionCentroid.py + ((regionCentroid.pxHeight/(numPlayers))*i)};

            playerUnitTypes.forEach((unitType) => {
                //if(fit || !(measurementPassDone)){

                    let defaultUnitPosition = Constants.Units.DefaultPositions.filter((unitPosition) => {
                        return unitPosition.region + unitPosition.type + unitPosition.owner === regionId + unitType + player;
                    })[0];

                    if(defaultUnitPosition && defaultUnitPosition.initialX){
                        unitPositions.push({ x: defaultUnitPosition.initialX, y:defaultUnitPosition.initialY});
                    }
                    else{
                        let potentialPosition = { x: playerRect.x + (numCols*7), y: playerRect.y + (5*numRows) };

                        let currentUnit =playerUnits.filter((unit) => {
                            return unit.type === unitType;
                        })[0];

                        let unitWidth = currentUnit.bbox ? currentUnit.bbox.width : 0;
                        let unitHeight = currentUnit.bbox ? currentUnit.bbox.height : 0;

                        //Will it fit into the player unit slots?
                        let fitBeforeWrap = (potentialPosition.x + ((playerRect.width/unitWidth)*15)) < playerRect.width + playerRect.x;

                        if(!fitBeforeWrap){
                            //We need to try wrapping before we give up
                            numRows++;
                            numCols = 0;
                            potentialPosition.y += 5;
                            potentialPosition.x = playerRect.x;
                        }

                        //If we don't fit the height, we don't continue
                        fit = (potentialPosition.y + ((playerRect.height/unitHeight)*15)) < playerRect.height + playerRect.y;


                        unitPositions.push(potentialPosition);
                    }
                    numCols++;
                //}
            });

            i++;

            //if(fit || !measurementPassDone){
                return { player, unitTypes: playerUnitTypes, rect: playerRect, unitPositions };
            //}
            //else{
            //    return { player, showRondel: true, roundelPosition: { x: playerRect.x + (playerRect.width/2) - 2.5, y: playerRect.y + (playerRect.height/2) - 2.5 } };
            //}
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
            unitInfo.dragPosition = unitInfo.lastGoodPosition;
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


        let pathEl, moveFill;

        //Drawing move arrows
        if(viewState.unitDragStart && (viewState.unitDragStart.unitInfo.id) === unitInfo.id && unitInfo.queuedForMove){
            //let angleToMouse = (Math.atan2(position.x - viewState.unitOriginalStart.x, position.y - viewState.unitOriginalStart.y )*(180/Math.PI));
            let dist = Math.sqrt( ((viewState.unitOriginalStart.x-position.x)*(viewState.unitOriginalStart.x - position.x)) + ((viewState.unitOriginalStart.y-position.y)*(viewState.unitOriginalStart.y-position.y)) );

            //let scale = Math.max(dist/200, 0.01);
            moveFill = viewState.currentPathIsValid ? 'green' : 'red';

            let x2 = -(viewState.unitOriginalStart.x-position.x);
            let y2 = -(viewState.unitOriginalStart.y-position.y);

            pathEl=(<g transform={'scale('+Math.min(Math.max(dist/20, 0.6), 0.9)+')translate(0,5)'}>
                         <line markerEnd="url(#arrowhead)" x1={0} y1={5} x2={x2} y2={y2} stroke={moveFill} />
                    </g>);
        }
        let savedMoveArrowInfo;
        if((!viewState.unitDragStart) && viewState.savedMoveArrows){
            savedMoveArrowInfo = viewState.savedMoveArrows.get(unitInfo.id);
            if(savedMoveArrowInfo && unitInfo.queuedForMove){
                let dist = Math.sqrt( ((savedMoveArrowInfo.unitOriginalStart.x-savedMoveArrowInfo.newPosition.x)*(savedMoveArrowInfo.unitOriginalStart.x - savedMoveArrowInfo.newPosition.x))
                    + ((savedMoveArrowInfo.unitOriginalStart.y-savedMoveArrowInfo.newPosition.y)*(savedMoveArrowInfo.unitOriginalStart.y-savedMoveArrowInfo.newPosition.y)) );

                moveFill = 'green';

                let x2 = -(savedMoveArrowInfo.unitOriginalStart.x-savedMoveArrowInfo.newPosition.x);
                let y2 = -(savedMoveArrowInfo.unitOriginalStart.y-savedMoveArrowInfo.newPosition.y);

                pathEl=(<g transform={'scale('+Math.min(Math.max(dist/20, 0.6), 0.9)+')translate(0,5)'}>
                    <line onClick={()=>onMoveCancelClick(unitInfo)} markerEnd="url(#arrowhead)" x1={0} y1={5} x2={x2} y2={y2} stroke={moveFill} strokeWidth={1.5}/>
                </g>);
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

                    <svg x={position.x} y={position.y + (unitInfo.number > 3 ? unitInfo.number*0.2 : 0)}>
                        <g>{chipEls}</g>
                    </svg>

                    <svg className={unitInfo.queuedForMove ? 'no-events' : null} x={position.x} y={position.y}>
                        <g onMouseDown={Unit.getUnitClickHandler(playerInfo, (e) => { if(e.button!==2) onUnitDragStart(e, unitInfo);}, unitInfo)}
                           onMouseUp={()=>{onUnitDragEnd()}}
                           transform={'scale('+Constants.Units[unitInfo.type].scaleFactor+')'}>{pathEls}</g>
                    </svg>

                </svg>);
    };
}

export default Unit;