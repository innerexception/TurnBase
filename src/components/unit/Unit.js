import React, { PropTypes } from 'react'
import Constants from '../Constants.js';
import Utils from '../map/MapUtils.js';
import d3 from 'd3';

class Unit {

    static getUnitPaths = (regions, unitList, onUnitClick, onUnitStackClick, onUnitDragStart, onUnitDragEnd, viewState, onMoveCancelClick, onArmyClick, measurementPass) => {
        let els = [];
        regions.forEach((region) => {
            let unitsInRegion = unitList.filter((unitInfo) => {
                return unitInfo.region === region.attributes.id;
            });
            if(unitsInRegion.length > 0){
                let regionTestPositions = Unit.getRondelPlacementPositions(unitsInRegion, region.bbox, measurementPass);
                regionTestPositions.forEach((playerPositions) => {
                    let playerUnitsInRegion = unitsInRegion.filter((unit) => { return unit.owner === playerPositions.player });
                    if(playerPositions.showRondel && measurementPass) els.push(Unit.getPlayerArmyRondelPath(playerPositions.roundelPosition, playerPositions.player, onArmyClick, region.attributes.id));
                    else els = els.concat(Unit.getPlayerUnitPathsForRegion(playerPositions, playerUnitsInRegion, onUnitClick, onUnitStackClick, onUnitDragStart, onUnitDragEnd, viewState, onMoveCancelClick));
                });
            }
        });
        return els;
    };

    static getRondelPlacementPositions = (unitsInRegion, regionCentroid, measurementPassDone) => {

        let players = [], numPlayers = 0;
        let regionId;
        unitsInRegion.forEach((unit) => { if(players.indexOf(unit.owner) === -1) { players.push(unit.owner); numPlayers++; regionId=unit.region; }});

        let availablePlayerDimensions = { width: regionCentroid.pxWidth / numPlayers, height: regionCentroid.pxHeight / numPlayers };

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

            //Construct unitPositions array as you go
            let unitPositions = [];
            let playerRect = {x:regionCentroid.x, y: regionCentroid.y + ((regionCentroid.height/(numPlayers))*i), width: regionCentroid.width, height: regionCentroid.height/numPlayers, px: regionCentroid.px, py: regionCentroid.py + ((regionCentroid.pxHeight/(numPlayers))*i)};

            playerUnitTypes.forEach((unitType) => {
                if(fit || !(measurementPassDone)){

                    let potentialPosition = { x: playerRect.x + (numCols*7), y: playerRect.y + 5*numRows };

                    let currentUnit =playerUnits.filter((unit) => {
                        return unit.type === unitType;
                    })[0];

                    let unitWidth = currentUnit.bbox ? currentUnit.bbox.width : 0;
                    let unitHeight = currentUnit.bbox? currentUnit.bbox.height : 0;

                    if(currentUnit.bbox){
                        //test this point to see if it actually overlaps the region polygon
                        let possibleNewRegion = document.elementsFromPoint(playerRect.px + (currentUnit.bbox.pxWidth/2), playerRect.py + (currentUnit.pxHeight/2)).filter((element) => {
                            return element.attributes.id && element.attributes.id.nodeValue === regionId;
                        });

                        fit  = possibleNewRegion.length === 1;
                    }

                    if(fit){
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
                    }

                    if(fit || !(measurementPassDone)) unitPositions.push(potentialPosition);
                    numCols++;
                }
            });

            i++;

            if(fit || !measurementPassDone){
                return { player, availablePlayerDimensions, unitTypes: playerUnitTypes, rect: playerRect, unitPositions };
            }
            else{
                return { player, showRondel: true, roundelPosition: { x: playerRect.x + (playerRect.width/2) - 2.5, y: playerRect.y + (playerRect.height/2) - 2.5 } };
            }
        });


        return players;
    };

    static getPlayerArmyRondelPath = (position, playerId, onArmyClick, regionId) => {
        return (<image width={5} height={5} x={position.x} y={position.y} xlinkHref={Constants.Players[playerId].markerPath} onClick={() => onArmyClick(regionId, playerId)}></image>);
    };

    static getPlayerUnitPathsForRegion = (playerPositions, playerUnitsInRegion, onUnitClick, onUnitStackClick, onUnitDragStart, onUnitDragEnd, viewState, onMoveCancelClick) => {
        let els = [];
        let i = 0;
        playerUnitsInRegion.forEach((unitInfo) => {
            els.push(Unit.getUnitImageGroup(Unit.getPlacementPositionInRect(unitInfo, playerPositions, i, viewState), unitInfo, onUnitClick, onUnitStackClick, onUnitDragStart, onUnitDragEnd, viewState, onMoveCancelClick));
            i++;
        });
        return els;
    };

    static getPlacementPositionInRect = (unitInfo, playerPositions, i, viewState) => {
        //TODO, modify position by number of different players and unit types in region
        //i is number of unit types placed in region for current player already
        //gets you playerPositions.xOffset * i etc...
        if(viewState.unitDragStart && viewState.unitDragStart.uniqueId === (Utils.getUnitUniqueId(unitInfo))){
            return unitInfo.dragPosition;
        }
        else{
            let staticPosition = {x: playerPositions.unitPositions[i].x, y: playerPositions.unitPositions[i].y};
            unitInfo.staticPosition = staticPosition;
            return staticPosition;
        }
    };

    static getUnitImageGroup = (position, unitInfo, onUnitClick, onUnitStackClick, onUnitDragStart, onUnitDragEnd, viewState, onMoveCancelClick) => {

        let pathEls = [];
        unitInfo.paths.forEach((path) => {
            pathEls.push((<path  d={path.attributes.d} className='turnbase-unit' id={Utils.getUnitUniqueId(unitInfo)} fill={Constants.Players[unitInfo.owner].color}
                                 onClick={()=> onUnitClick(unitInfo)}></path>));
        });
        let pathEl, moveFill;

        //Drawing move arrows
        if(viewState.unitDragStart && viewState.unitDragStart.uniqueId === (Utils.getUnitUniqueId(unitInfo))){
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
            let uniqueId = Utils.getUnitUniqueId(unitInfo) + '_queued';
            savedMoveArrowInfo = viewState.savedMoveArrows.get(uniqueId);
            if(savedMoveArrowInfo){
                let dist = Math.sqrt( ((savedMoveArrowInfo.unitOriginalStart.x-savedMoveArrowInfo.newPosition.x)*(savedMoveArrowInfo.unitOriginalStart.x - savedMoveArrowInfo.newPosition.x))
                    + ((savedMoveArrowInfo.unitOriginalStart.y-savedMoveArrowInfo.newPosition.y)*(savedMoveArrowInfo.unitOriginalStart.y-savedMoveArrowInfo.newPosition.y)) );

                moveFill = 'green';

                let x2 = -(savedMoveArrowInfo.unitOriginalStart.x-savedMoveArrowInfo.newPosition.x);
                let y2 = -(savedMoveArrowInfo.unitOriginalStart.y-savedMoveArrowInfo.newPosition.y);

                pathEl=(<g transform={'scale('+Math.min(Math.max(dist/20, 0.6), 0.9)+')translate(0,5)'}>
                    <line onClick={()=>onMoveCancelClick(uniqueId)} markerEnd="url(#arrowhead)" x1={0} y1={5} x2={x2} y2={y2} stroke={moveFill} strokeWidth={1.5}/>
                </g>);
            }
        }

        return (<svg>
                    {pathEl ? <svg x={viewState.unitOriginalStart ? viewState.unitOriginalStart.x : savedMoveArrowInfo.unitOriginalStart.x} y={viewState.unitOriginalStart ? viewState.unitOriginalStart.y : savedMoveArrowInfo.unitOriginalStart.y}>
                        <defs dangerouslySetInnerHTML={{__html: '<marker id="arrowhead" markerWidth="5" markerHeight="5" orient="auto" refX="0" refY="2.5"><polygon fill="'+moveFill+'" points="0,0 5,2.5 0,5"/></marker>'}}></defs>{pathEl}</svg> : null}
                    <svg className={savedMoveArrowInfo ? 'no-events' : null} x={position.x} y={position.y}><g onMouseDown={(e) => onUnitDragStart(e, unitInfo)}
                               onMouseUp={onUnitDragEnd}
                               transform={'scale('+Constants.Units[unitInfo.type].scaleFactor+')'}>{pathEls}</g></svg>
                </svg>);
    };
}

export default Unit;