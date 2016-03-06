import Utils from './MapUtils.js';
import Constants from '../Constants.js';

const mapReducer = (state = {}, action) => {
    switch (action.type) {
        case 'REGION_CLICKED':
            return { ...state, viewState: updateViewStateSelectedRegion(state.viewState, action.id, state.units, state.regions), units: updateUnitsDragEnd(state.units, state.viewState.unitDragStart, state.viewState.regionOver, state.viewState.currentPathIsValid) };
        case 'MAP_LOAD':
            return { ...state, regions: action.regions };
        case 'UNIT_LOAD':
            return { ...state, units: action.units, regions: action.regions, staticUnitPaths: action.staticUnitPaths };
        case 'UNIT_PURCHASED':
            return { ...state, playerInfo: updatePlayerInfoUnitPurchased(action.unitType, state.playerInfo)};
        case 'UNIT_UNPURCHASED':
            return { ...state, playerInfo: updatePlayerInfoUnitUnPurchased(action.unitType, state.playerInfo)};
        case 'VIEW_STATE_CHANGED':
            return { ...state, viewState: action.viewState};
        case 'CHIP_MOUSE_OVER':
            return { ...state, units: updateUnitsCountDisplay(state.units, action.unitInfo)};
        case 'MAP_DRAGGED':
            return { ...state, viewState: updateViewStatePanFromEvent(state.viewState, action.e)};
        case 'MAP_DRAG_START':
            return { ...state, viewState: updateViewStateDragStart(state.viewState, action.e)};
        case 'MAP_DRAG_END':
            return { ...state, viewState: updateViewStateDragEnd(state.viewState)};
        case 'MAP_ZOOM':
            return { ...state, viewState: updateViewStateZoom(state.viewState, action.e)};
        case 'UNIT_MOVE':
            return { ...state, units: updateUnitsFromPanEvent(action.e, state.units, state.viewState), viewState: updateViewStateUnitPanFromEvent(state.viewState, action.e, state.regions, state.playerInfo, state.units)};
        case 'UNIT_DRAG_START':
            return { ...state, viewState: updateViewStateUnitDragStart(state.viewState, action.e, action.unitInfo, state.regions), units: updateUnitsDragStart(state.units, action.unitInfo, action.e, state.viewState, state.regions)};
        case 'UNIT_DRAG_END':
            return { ...state, viewState: updateViewStateUnitDragEnd(state.viewState, state.units, state.regions), units: updateUnitsDragEnd(state.units, state.viewState.unitDragStart, state.viewState.regionOver, state.viewState.currentPathIsValid)};
        case 'UNIT_MOVE_CANCELLED':
            return { ...state, units: updateUnitRegionOnMoveCancelled(state.units, action.unitInfo), viewState: updateViewStateRemoveSavedMoveArrows(state.viewState, action.uniqueId)};
        case 'UNIT_PATH_MAP':
            return { ...state, units: updateUnitsPathMap(state.units, action.unitPathMap), unitPathDispatch: true};
        case 'SEND_UNIT_TO_ORIGIN':
            return {...state, units: updateUnitsSendToOrigin(action.unitInfo, state.units)};
        case 'END_PHASE':
            return {...state, playerInfo: updatePlayerInfoPhase(state.playerInfo, action.phaseName), units: updateUnitsPhaseEnd(state.units, action.phaseName),  viewState: updateViewStatePhaseEnd(state.viewState, action.phaseName, state.units, state.regions, state.playerInfo)};
        case 'PLAYER_INFO_LOAD':
            return {...state, playerInfo: action.playerInfo};
        case 'NEXT_COMBAT':
            return {...state, viewState: updateViewStateLoadNextCombat(state.viewState), units: updateUnitsCombatEnd(state.units, action.combatInfo), regions: updateRegionsCombatEnd(state.regions, action.combatInfo)};
        case 'HIGHLIGHT_NEXT_REGION':
            return {...state, viewState: updateViewStateHighlightNextRegion(state.viewState), playerInfo: updatePlayerInfoIncome(state.playerInfo, state.viewState)};
        default:
            return state
    }
};

const updatePlayerInfoUnitPurchased = (unitType, playerInfo) => {
    let newInfo = {...playerInfo};
    if(!newInfo.purchasedUnits) newInfo.purchasedUnits = [];
    if(newInfo.lastIncome >= Constants.Units[unitType].cost){
        newInfo.purchasedUnits.push(unitType);
        newInfo.lastIncome -= Constants.Units[unitType].cost;
    }
    return newInfo;
};

const updatePlayerInfoUnitUnPurchased = (unitType, playerInfo) => {
    let newInfo = {...playerInfo};
    if(!newInfo.purchasedUnits) newInfo.purchasedUnits = [];
    let index = newInfo.purchasedUnits.indexOf(unitType);
    if(index !== -1){
        newInfo.purchasedUnits.splice(index, 1);
        newInfo.lastIncome += Constants.Units[unitType].cost;
    }
    return newInfo;
};

const updatePlayerInfoIncome = (playerInfo, viewState) => {
    let newInfo = {...playerInfo};
    if(!newInfo.income)newInfo.income=0;
    let nextRegion = viewState.incomeRegions.pop();
    if(nextRegion) newInfo.income += parseInt(nextRegion.attributes.value);
    else newInfo.lastIncome += newInfo.income;
    return newInfo;
};

const updateViewStateHighlightNextRegion = (viewState) => {
    let newState = {...viewState};
    newState.activeIncomeRegion = newState.incomeRegions.pop();
    if(!newState.activeIncomeRegion) delete newState.incomeRegions;
    return newState;
};

const updateRegionsCombatEnd = (regions, combatInfo) => {
    let newRegions = Array.from(regions);

    let winnerId = combatInfo.victor.units[0].owner;
    let regionId = combatInfo.defenderUnits[0].owner = winnerId ? combatInfo.defenderUnits[0].region : combatInfo.attackerUnits[0].region;

    newRegions.forEach((region) => {
        if(region.attributes.id === regionId) region.attributes.defaultOwner = winnerId;
    });

    return newRegions;
};

const updatePlayerInfoPhase = (playerInfo, phaseName) => {
    let newPlayerInfo = {...playerInfo};
    newPlayerInfo.activePhase = Utils.getNextActivePhase(phaseName);
    return newPlayerInfo;
};

const updateUnitsPhaseEnd = (units, phaseName) => {
    let newUnits = Array.from(units);
    let phase = Utils.getNextActivePhase(phaseName);
    switch(phase){
        case 'Purchase': break;
        case 'Research':
            //Reset unit mobility
            newUnits.forEach((unit) => {
                delete unit.hasMoved
            });
            break;
        case 'Move':
            //Combat moves...
            newUnits.forEach((unit) => {
                unit.lastGoodPosition = unit.dragPosition;
                if(unit.queuedForMove) unit.hasMoved = true;
                delete unit.queuedForMove;
            });
            break;
        case 'Placement':
            //Move phase moves...
            newUnits.forEach((unit) => {
                unit.lastGoodPosition = unit.dragPosition;
                if(unit.queuedForMove) unit.hasMoved = true;
                delete unit.queuedForMove;
            });
            break;
    }
    return newUnits;
};

const updateViewStatePhaseEnd = (viewState, phaseName, units, regions, playerInfo) => {
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
            //Resolve player combat moves...
            if(newState.savedMoveArrows){
                units.forEach((unit) => {
                    newState.savedMoveArrows.delete(unit.id);
                });
            }

            //Check for combats...
            regions.forEach((region) => {
                let unitsInRegion = units.filter((unit) => { return unit.region === region.attributes.id});
                let combat = false;
                unitsInRegion.forEach((unit) => { if(Constants.Players[unit.owner].team !== playerInfo.team) combat = true; });
                if(combat){
                    if(!newState.combatQueue) newState.combatQueue = [];
                    let playerUnitsInRegion = unitsInRegion.filter((unit) => { return unit.owner === playerInfo.id && unit.type !== 'aaa'});
                    let otherTeamUnitsInRegion = unitsInRegion.filter((unit) => { return Constants.Players[unit.owner].team !== playerInfo.team && unit.type !== 'aaa'});
                    if(region.attributes.defaultOwner === playerInfo.id) newState.combatQueue.push({ defenderUnits: playerUnitsInRegion, attackerUnits: otherTeamUnitsInRegion });
                    else newState.combatQueue.push({ attackerUnits: playerUnitsInRegion, defenderUnits: otherTeamUnitsInRegion });
                }
            });
            //Load first combat
            newState.combatInfo = newState.combatQueue && newState.combatQueue.pop();
            //TODO: show flaire for move phase start
            break;
        case 'Placement':
            //TODO: set state to show placement UI, clear moves
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

const updateUnitsCombatEnd = (units, combatInfo) => {
    let newUnits = Array.from(units);
    let deleteUnits = [];
    newUnits.forEach((unit) => {
        combatInfo.attackerUnits.forEach((aunit) => {
            if(aunit.id === unit.id){
                unit.number -= aunit.casualtyCount;
                if(unit.number <= 0) deleteUnits.push(unit.id);
            }
        });
        combatInfo.defenderUnits.forEach((dunit) => {
            if(dunit.id === unit.id){
                unit.number -= dunit.casualtyCount;
                if(unit.number <= 0) deleteUnits.push(unit.id);
            }
        });
    });

    return newUnits.filter((unit) => {
        return deleteUnits.indexOf(unit.id) === -1;
    });
};

const updateViewStateLoadNextCombat = (viewState) => {
    let newState = {...viewState};
    newState.combatInfo = newState.combatQueue.pop();
    if(newState.combatInfo) newState.combatInfo.combatTransition = true;
    return newState;
};

const updateUnitsSendToOrigin = (unitInfo, units) => {
    let newUnits = Array.from(units);
    newUnits.forEach((unit)=>{
        if(unit.id === unitInfo.id){
            if(unit.number > 1){
                unit.number -= 1;
            }
            let regionTypeUnits = newUnits.filter((unit) => {return unit.region === unitInfo.lastRegion && unit.type === unitInfo.type;});
            if(regionTypeUnits.length > 0){
                regionTypeUnits[0].number++;
            }
            else{
                let newUnit = {...unit, number:1, region:unit.lastRegion, queuedForMove:false, id:Math.random(), dragPosition:null, showUnitCount:false};
                newUnits.push(newUnit);
            }
        }
    });
    return newUnits
};

const updateUnitsCountDisplay = (units, unitInfo) => {
    let newUnits = Array.from(units);
    newUnits.forEach((unit) => {
        if(unitInfo.id === unit.id){
            unit.showUnitCount = !unit.showUnitCount;
        }
    });
    return newUnits;
};

const updateUnitsPathMap = (units, unitPathMap) => {
    let newUnits = Array.from(units);
    newUnits.forEach((unit) => {
        unit.bbox = unitPathMap.get(unit.id);
    });
    return newUnits;
};

const updateUnitRegionOnMoveCancelled = (units, unitInfo) => {
    let newUnits = Array.from(units);
    let deleteId;
    newUnits.forEach((unit) => {
        if(unit.id === unitInfo.id){
            let regionTypeUnits = newUnits.filter((unit) => {return unit.region === unitInfo.lastRegion && unit.type === unitInfo.type;});
            if(regionTypeUnits.length > 0){
                regionTypeUnits[0].number += unitInfo.number;
                deleteId = unit.id;
            }
            unit.region = unitInfo.lastRegion;
            delete unit.queuedForMove;


        }
    });

    if(deleteId) return newUnits.filter((unit) => { return unit.id !== deleteId});

    return newUnits;
};

const updateViewStateRemoveSavedMoveArrows = (viewState, uniqueId) => {
    let newState = {...viewState};
    newState.savedMoveArrows.delete(uniqueId);
    return newState;
};

const updateViewStateSelectedRegion = (viewState, regionId, units, regions) => {
    let newState = {...viewState};
    newState.selectedRegionId = regionId;
    if(newState.unitDragStart) updateViewStateUnitDragEnd(newState, units, regions);
    return newState;
};

const updateViewStateZoom = (viewState, e) => {
    let newState = { ...viewState };
    newState.zoomLevel += e.deltaY*0.001;
    newState.pan.x += e.deltaY > 0 ? -10/newState.zoomLevel : 10/newState.zoomLevel;
    return newState;
};

const updateViewStatePanFromEvent = (viewState, e) => {
    let newState = { ...viewState };
    let currentX = newState.mapDragStart.x;
    let currentY = newState.mapDragStart.y;
    newState.pan = {x: newState.pan.x + ((e.clientX - currentX)/viewState.zoomLevel), y: newState.pan.y + ((e.clientY -  currentY)/viewState.zoomLevel)};
    newState.mapDragStart = {x: e.clientX, y: e.clientY};
    return newState;
};

const updateViewStateDragStart = (viewState, e) => {
    let newState = { ...viewState };
    newState.mapDragStart = {x: e.clientX, y: e.clientY};
    return newState;
};

const updateViewStateDragEnd = (viewState) => {
    let newState = { ...viewState };
    newState.mapDragStart = null;
    return newState;
};

//////////////////UNIT_MOVE

const updateViewStateUnitPanFromEvent = (viewState, e, regions, playerInfo, units) => {
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

    newState.currentPathIsValid = Utils.getValidMove(originRegionId, viewState.regionOver ? viewState.regionOver : viewState.unitDragStart.unitInfo.region, viewState.unitDragStart.unitInfo, region.adjacencyMap, newState.unitPath, activePhase, units, playerTeam);

    return newState;
};

const updateUnitsFromPanEvent = (e, units, viewState) => {
    let newUnits = Array.from(units);

    //Update unit position
    let currentX = viewState.unitDragStart.x;
    let currentY = viewState.unitDragStart.y;
    let offset = {x: ((e.clientX - currentX)/viewState.zoomLevel), y: ((e.clientY -  currentY)/viewState.zoomLevel)};

    newUnits.forEach((unit) => {
        if(unit.id === viewState.unitDragStart.unitInfo.id){
            unit.dragPosition = {x: unit.dragPosition.x + offset.x, y: unit.dragPosition.y + offset.y };
        }
    });

    return newUnits;
};


////////////UNIT_DRAG_START

const updateViewStateUnitDragStart = (viewState, e, unitInfo, regions) => {
    let newState = { ...viewState };
    newState.unitDragStart = {x: e.clientX, y: e.clientY, unitInfo};
    let startbox = regions.filter((region) => region.attributes.id === unitInfo.region)[0].bbox;
    newState.unitOriginalStart = {x: startbox.x + (startbox.width/2), y: startbox.y};
    return newState;
};

const updateUnitsDragStart = (units, unitInfo) => {
    let newUnits = Array.from(units);
    newUnits.forEach((unit) => {
        if(unit.id === unitInfo.id){
            unit.queuedForMove = true;
            unit.dragPosition = {x: unit.lastGoodPosition.x, y: unit.lastGoodPosition.y };
        }
    });
    return newUnits;
};

//////////////UNIT_DRAG_END

const updateViewStateUnitDragEnd = (viewState, units) => {
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
            newState.savedMoveArrows.set(unitInfo.id, {unitOriginalStart: newState.unitOriginalStart, newPosition: targetUnit.dragPosition, originalRegionId:unitInfo.region})
        }
    }

    newState.unitDragStart = null;
    newState.unitOriginalStart = null;
    newState.unitPath = null;
    newState.regionOver = null;
    newState.currentPathIsValid = null;

    return newState;
};

const updateUnitsDragEnd = (units, unitDragStart, regionOver, isValidPath) => {
    let newUnits = Array.from(units);
    let unitInfo = unitDragStart && unitDragStart.unitInfo;
    if(unitInfo){
        newUnits.forEach((unit) => {
            if(unit.id === unitInfo.id){
                unit.lastRegion = unit.region;
                if(isValidPath) unit.region = regionOver;
                else{
                    if(regionOver === unitInfo.region){
                        unit.lastGoodPosition = unit.dragPosition;
                    }
                    else{
                        unit.dragPosition = unit.lastGoodPosition;
                    }
                    delete unit.queuedForMove;
                }

            }
        });
    }

    return newUnits;
};


export default mapReducer;