import Constants from '../../Constants.js';
import Utils from '../MapUtils.js';

export const updateViewStatePlacementPortrait = (viewState, e) => {
    let newState = {...viewState};

    if(newState.placingPurchasedUnitPosition){
        //Update unit position
        let currentX = newState.placingPurchasedUnitPosition.x;
        let currentY = newState.placingPurchasedUnitPosition.y;
        let offset = {x: (((e.clientX-15) - currentX)/viewState.zoomLevel), y: (((e.clientY-15) -  currentY)/viewState.zoomLevel)};

        newState.placingPurchasedUnitPosition = {x:currentX + offset.x, y:currentY + offset.y};
    }

    return newState;
};

export const updateViewStatePlacingUnitType = (unitType, viewState, e) => {
    let newState = {...viewState};
    newState.placingPurchasedUnitType = unitType;
    newState.placingPurchasedUnitPosition = {x: e.clientX, y:e.clientY};
    return newState;
};

export const updateViewStateHighlightNextRegion = (viewState) => {
    let newState = {...viewState};
    if(newState.incomeRegions){
        newState.activeIncomeRegion = newState.incomeRegions.pop();
        if(!newState.activeIncomeRegion) delete newState.incomeRegions;
    }
    return newState;
};

export const updateViewStatePhaseEnd = (viewState, phaseName, units, regions, playerInfo) => {
    let newState = {...viewState};
    let phase = Utils.getNextActivePhase(phaseName);
    switch(phase){
        case 'Purchase':
            break;
        case 'Research':
            break;
        case 'Combat':
            //TODO: show flaire for combat phase start
            //Player performs combat moves...
            break;
        case 'Move':
            if(newState.savedMoveArrows){
                units.forEach((unit) => {
                    newState.savedMoveArrows.delete(unit.id);
                });
            }
            //Check for combats...
            regions.forEach((region) => {
                let unitsInRegion = units.filter((unit) => { return unit.region === region.attributes.id});
                let myUnitsInRegion = unitsInRegion.filter((unit) => { return unit.owner === playerInfo.id});
                if(myUnitsInRegion.length > 0){
                    let combat = false;
                    unitsInRegion.forEach((unit) => { if(Constants.Players[unit.owner].team !== playerInfo.team) combat = true; });
                    if(combat){
                        if(!newState.combatQueue) newState.combatQueue = [];
                        let playerUnitsInRegion = unitsInRegion.filter((unit) => { return unit.owner === playerInfo.id && unit.type !== 'aaa'});
                        let otherTeamUnitsInRegion = unitsInRegion.filter((unit) => { return Constants.Players[unit.owner].team !== playerInfo.team && unit.type !== 'aaa'});
                        if(region.attributes.defaultOwner === playerInfo.id) newState.combatQueue.push({ defenderUnits: playerUnitsInRegion, attackerUnits: otherTeamUnitsInRegion });
                        else newState.combatQueue.push({ attackerUnits: playerUnitsInRegion, defenderUnits: otherTeamUnitsInRegion });
                    }
                }
            });
            //Load first combat
            newState.combatInfo = newState.combatQueue && newState.combatQueue.pop();
            //TODO: show flaire for move phase start
            break;
        case 'Placement':
            if(newState.savedMoveArrows){
                units.forEach((unit) => {
                    newState.savedMoveArrows.delete(unit.id);
                });
            }
            break;
        case 'Income':
            newState.incomeRegions = regions.filter((region) => {
                return region.attributes.defaultOwner === playerInfo.id;
            });
            break;
    }
    return newState;
};

export const updateViewStateLoadNextCombat = (viewState) => {
    let newState = {...viewState};
    newState.combatInfo = newState.combatQueue.pop();
    if(newState.combatInfo) newState.combatInfo.combatTransition = true;
    return newState;
};

export const updateViewStateRemoveSavedMoveArrows = (viewState, uniqueId) => {
    let newState = {...viewState};
    newState.savedMoveArrows.delete(uniqueId);
    newState.savedMoveArrows.delete(uniqueId + '_returnPath');
    return newState;
};

export const updateViewStateSelectedRegion = (viewState, regionId, units, regions, playerInfo) => {
    let newState = {...viewState};
    //newState.selectedRegionId = regionId;
    if(newState.unitDragStart) updateViewStateUnitDragEnd(newState, units, regions);

    if(playerInfo.purchasedUnits){
        let unitsOfType = playerInfo.purchasedUnits.filter((unitType) => { return unitType === newState.placingPurchasedUnitType});
        //Placed the last one.
        if(unitsOfType.length === 0){
            delete newState.placingPurchasedUnitType;
            delete newState.placingPurchasedUnitPosition;
        }
    }

    return newState;
};

export const updateViewStateZoom = (viewState, e) => {
    let newState = { ...viewState };
    newState.zoomLevel += e.deltaY*0.001;
    newState.zoomLevel = Math.max(2.5, newState.zoomLevel);
    newState.pan.x += e.deltaY > 0 ? -10/newState.zoomLevel : 10/newState.zoomLevel;
    return newState;
};

export const updateViewStatePanFromEvent = (viewState, e, regions) => {
    let newState = { ...viewState };
    let currentX = newState.mapDragStart.x;
    let currentY = newState.mapDragStart.y;
    //Clamp pan values to a maximum so they wrap
    // if you roll over 1180, reset pan to 0,
    // if you roll under -1555, reset to -485
    let xVal = newState.pan.x + ((e.clientX - currentX)/viewState.zoomLevel);
    if(xVal > 1030){
        xVal = 0;
        //reset to normal position
        regions.forEach((region) => {
            delete region.translate;
        });
    }
    if(xVal < -1555){
        xVal = -485;
        //reset to normal position
        regions.forEach((region) => {
            delete region.translate;
        });
    }
    let yVal = newState.pan.y + ((e.clientY -  currentY)/viewState.zoomLevel);
    newState.pan = {x: xVal, y: yVal};
    newState.mapDragStart = {x: e.clientX, y: e.clientY};

    if(xVal > -30){
        //Start bringing regions over from japan pacific
        let regionRange = 970-(xVal+30);
        regions.forEach((region) => {
            if(region.bbox.x > regionRange){
                //Move this region over to the us pacific
               if(!region.translate) region.translate = -1030;
            }
        });
    }
    else if(xVal < -485){
        //Start bringing over regions from us pacific
        let regionRange = Math.abs(xVal)-485;
        regions.forEach((region) => {
            if(region.bbox.x < regionRange){
                //Move this region over to the japon pacific
                if(!region.translate) region.translate = 1030;
            }
        });
    }
    else{
        //reset to normal position
        regions.forEach((region) => {
            delete region.translate;
        });
    }

    return newState;
};

export const updateViewStateDragStart = (viewState, e) => {
    let newState = { ...viewState };
    newState.mapDragStart = {x: e.clientX, y: e.clientY};
    return newState;
};

export const updateViewStateDragEnd = (viewState) => {
    let newState = { ...viewState };
    newState.mapDragStart = null;
    return newState;
};

export const updateViewStateUnitPanFromEvent = (viewState, e, regions, playerInfo, units) => {
    let newState = { ...viewState };

    newState.unitDragStart.x = e.clientX;
    newState.unitDragStart.y = e.clientY;

    newState = Utils.updateUnitPath(newState, e);

    let originRegionId = viewState.lastRegionOver ? viewState.lastRegionOver : viewState.unitDragStart.unitInfo.region;
    let region = regions.filter((regionItem) => {
        return regionItem.attributes.id === originRegionId;
    })[0];
    let activePhase = playerInfo.activePhase;
    let playerTeam = Constants.Players[playerInfo.id].team;

    newState.currentPathIsValid = Utils.getValidMove(originRegionId, viewState.regionOver ? viewState.regionOver : viewState.unitDragStart.unitInfo.region, viewState.unitDragStart.unitInfo, region.adjacencyMap, newState.unitPath, activePhase, units, playerTeam, regions);

    return newState;
};

export const updateViewStateUnitDragStart = (viewState, e, unitInfo, regions) => {
    let newState = { ...viewState };
    newState.unitDragStart = {x: e.clientX, y: e.clientY, unitInfo};
    let startbox = regions.filter((region) => region.attributes.id === unitInfo.region)[0].bbox;
    newState.unitOriginalStart = {x: startbox.x + (startbox.width/2), y: startbox.y};
    return newState;
};

export const updateViewStateUnitDragEnd = (viewState, units) => {
    let newState = { ...viewState };
    if(viewState.unitDragStart){
        let unitInfo = viewState.unitDragStart.unitInfo;

        let targetUnit;
        units.forEach((unit) => {
            if(unit.id === unitInfo.id){
                targetUnit = unit;
            }
        });

        if(newState.currentPathIsValid){
            if(!newState.savedMoveArrows) newState.savedMoveArrows = new Map();
            if(!unitInfo.firstMove) newState.savedMoveArrows.set(unitInfo.id, {unitOriginalStart: newState.unitOriginalStart, newPosition: targetUnit.dragPosition, originalRegionId:unitInfo.region});
            else newState.savedMoveArrows.set(unitInfo.id + '_returnPath', {unitOriginalStart: newState.unitOriginalStart, newPosition: targetUnit.dragPosition, originalRegionId:unitInfo.region});}
    }

    newState.unitDragStart = null;
    newState.unitOriginalStart = null;
    newState.unitPath = null;
    newState.regionOver = null;
    newState.currentPathIsValid = null;

    return newState;
};