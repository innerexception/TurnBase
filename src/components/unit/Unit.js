import React, { PropTypes } from 'react'
import Constants from '../Constants.js';
import Utils from '../map/MapUtils.js';
import d3 from 'd3';

class Unit {

    static getUnitPaths = (regions, unitList, onUnitClick, onUnitStackClick, onUnitDragStart, onUnitDragEnd, viewState, onMoveCancelClick, onArmyClick) => {
        let els = [];
        regions.forEach((region) => {
            let unitsInRegion = unitList.filter((unitInfo) => {
                return unitInfo.region === region.attributes.id;
            });
            if(unitsInRegion.length > 0){
                let regionTestPositions = Unit.getRondelPlacementPositions(unitsInRegion, region.centroid);
                regionTestPositions.forEach((playerPositions) => {
                    if(playerPositions.showRondel) els.push(Unit.getPlayerArmyRondelPath(playerPositions.roundelPosition, playerPositions.player, onArmyClick, region.attributes.id));
                    else els = els.concat(Unit.getPlayerUnitPathsForRegion(region, playerPositions, unitsInRegion, onUnitClick, onUnitStackClick, onUnitDragStart, onUnitDragEnd, viewState, onMoveCancelClick));
                });
            }
        });
        return els;
    };

    static getPlayerUnitPathsForRegion = (region, playerPositions, unitsInRegion, onUnitClick, onUnitStackClick, onUnitDragStart, onUnitDragEnd, viewState, onMoveCancelClick) => {
        let els = [];
        let i = 0;
        unitsInRegion.forEach((unitInfo) => {
            if(unitInfo.owner === playerPositions.player) els.push(Unit.getUnitImageGroup(Unit.getPlacementPosition(viewState, unitInfo, playerPositions, i), unitInfo, onUnitClick, onUnitStackClick, onUnitDragStart, onUnitDragEnd, viewState, onMoveCancelClick));
            i++;
        });
        return els;
    };

    static getRondelPlacementPositions = (unitsInRegion, regionCentroid) => {

        let players = [], numPlayers = 0;
        unitsInRegion.forEach((unit) => { if(players.indexOf(unit.owner) === -1) { players.push(unit.owner); numPlayers++; }});

        let availablePlayerDimensions = { width: regionCentroid.width / numPlayers, height: regionCentroid.height / numPlayers };

        let i=0;

        players = players.map((player) => {
            let playerUnitTypes = [];
            let playerUnits = unitsInRegion.filter((unit) => {
                return unit.owner === player;
            });

            playerUnits.forEach((unit) => {
                if(playerUnitTypes.indexOf(unit.type) === -1) playerUnitTypes.push(unit.type);
            });

            let playerUnitQuadrantDimensions = { width: availablePlayerDimensions.width / playerUnitTypes.length, height: availablePlayerDimensions.height / playerUnitTypes.length };
            let remainingPlayerDimensions = {...availablePlayerDimensions};
            let fit = true;

            playerUnitTypes.forEach((unitType) => {
                if(fit){
                    let currentUnit =playerUnits.filter((unit) => {
                        return unit.type === unitType;
                    })[0];

                    let unitWidth = Constants.Units[currentUnit.type].width;
                    let unitHeight = Constants.Units[currentUnit.type].height;

                    //Will it git into the play unit slots?
                    fit = unitWidth < playerUnitQuadrantDimensions.width;
                    fit = unitHeight < playerUnitQuadrantDimensions.height;

                    //Is there enough space remaining?
                    fit = remainingPlayerDimensions.width > unitWidth;

                    remainingPlayerDimensions.width -= unitWidth;

                }
            });

            i++;

            if(fit){
                return { player, availablePlayerDimensions, unitTypes: playerUnitTypes };
            }
            else{
                return { player, showRondel: true, roundelPosition: { x: regionCentroid.x + ((availablePlayerDimensions.width/4) * (i > 1 ? i*2 : 1)), y: regionCentroid.y + ((availablePlayerDimensions.height/4)) } };
            }
        });


        return players;
    };

    static getPlayerArmyRondelPath = (position, playerId, onArmyClick, regionId) => {
        return (<image width={5} height={5} x={position.x} y={position.y} xlinkHref={Constants.Players[playerId].markerPath} onClick={() => onArmyClick(regionId, playerId)}></image>);
    };

    static getPlacementPosition = (viewState, unitInfo, playerPositions, i) => {
        //TODO, modify position by number of different players and unit types in region
        //i is number of unit types placed in region for current player already
        //gets you playerPositions.xOffset * i etc...
        let position = {x: unitInfo.position.x, y: unitInfo.position.y};
        position.x += ((playerPositions.availablePlayerDimensions.width/(playerPositions.unitTypes.length+2))*i);

        return position;
    };

    static getUnitImageGroup = (position, unitInfo, onUnitClick, onUnitStackClick, onUnitDragStart, onUnitDragEnd, viewState, onMoveCancelClick) => {

        let pathEls = [];
        unitInfo.paths.forEach((path) => {
            pathEls.push((<path  d={path.attributes.d} className='turnbase-unit' fill={Constants.Players[unitInfo.owner].color}
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