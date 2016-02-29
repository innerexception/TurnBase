import Utils from './MapUtils.js';

const mapReducer = (state = {}, action) => {
    switch (action.type) {
        case 'REGION_CLICKED':
            console.log('clicked on '+action.id);
            return { ...state, viewState: updateViewStateSelectedRegion(state.viewState, action.id) };
        case 'MAP_LOAD':
            return { ...state, regions: action.regions, viewState: updateViewStateRegionMap(state.viewState, action.regionAdjacencyMap) };
        case 'UNIT_LOAD':
            return { ...state, units: action.units, viewState: initializeViewStateUnits(action.units, action.centroidMap, state.viewState) };
        case 'VIEW_STATE_CHANGED':
            return { ...state, viewState: action.viewState};
        case 'MAP_DRAGGED':
            return { ...state, viewState: updateViewStatePanFromEvent(state.viewState, action.e)};
        case 'MAP_DRAG_START':
            return { ...state, viewState: updateViewStateDragStart(state.viewState, action.e)};
        case 'MAP_DRAG_END':
            return { ...state, viewState: updateViewStateDragEnd(state.viewState)};
        case 'MAP_ZOOM':
            return { ...state, viewState: updateViewStateZoom(state.viewState, action.e)};
        case 'UNIT_MOVE':
            return { ...state, viewState: updateViewStateUnitPanFromEvent(state.viewState, action.e)};
        case 'UNIT_DRAG_START':
            return { ...state, viewState: updateViewStateUnitDragStart(state.viewState, action.e, action.unitInfo)};
        case 'UNIT_DRAG_END':
            return { ...state, viewState: updateViewStateUnitDragEnd(state.viewState, state.units), units: updateUnitsDragEnd(state.units, state.viewState.unitDragStart.unitInfo, state.viewState.regionOver, state.viewState.currentPathIsValid)};
        case 'UNIT_MOVE_CANCELLED':
            return { ...state, units: updateUnitRegionOnMoveCancelled(state.units, action.uniqueId, state.viewState), viewState: updateViewStateRemoveSavedMoveArrows(state.viewState, action.uniqueId)};
        default:
            return state
    }
};

const updateUnitRegionOnMoveCancelled = (units, uniqueId, viewState) => {
    let newUnits = Array.from(units);
    units.forEach((unit) => {
        if((Utils.getUnitUniqueId(unit)) === uniqueId){
            unit.region = viewState.savedMoveArrows.get(uniqueId).originalRegionId;
        }
    });
    return newUnits;
};

const updateViewStateRemoveSavedMoveArrows = (viewState, uniqueId) => {
    let newState = {...viewState};
    //Set unit position back to origin
    newState.unitPositions[uniqueId] = newState.savedMoveArrows.get(uniqueId).unitOriginalStart;
    newState.savedMoveArrows.delete(uniqueId);
    return newState;
};

const updateViewStateRegionMap = (viewState, regionMap) => {
    let newState = {...viewState};
    newState.adjacencyMap = regionMap;
    return newState;
};

const updateViewStateSelectedRegion = (viewState, regionId) => {
    let newState = {...viewState};
    newState.selectedRegionId = regionId;
    return newState;
};

const updateViewStateAdjMap = (viewState, adjMap) => {
    let newState = {...viewState};
    newState.adjacencyMap = adjMap;
    return newState;
};

const initializeViewStateUnits = (units, centroidMap, viewState) => {
    let newState = {...viewState};
    newState.unitPositions = {};
    units.forEach((unit) => {
            let bbox = centroidMap.get(unit.region);
            var x = Math.floor(bbox.x + bbox.width / 4);
            var y = Math.floor(bbox.y + bbox.height / 4);
            newState.unitPositions[Utils.getUnitUniqueId(unit)] = { x, y };
        });
    newState.centroidMap = centroidMap;
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

const updateViewStateUnitPanFromEvent = (viewState, e) => {
    let newState = { ...viewState };
    let uniqueId = viewState.unitDragStart.uniqueId;

    //Update unit position
    let currentX = newState.unitDragStart.x;
    let currentY = newState.unitDragStart.y;
    let offset = {x: ((e.clientX - currentX)/viewState.zoomLevel), y: ((e.clientY -  currentY)/viewState.zoomLevel)};
    newState.unitPositions[uniqueId] = {x: newState.unitPositions[uniqueId].x + offset.x, y: newState.unitPositions[uniqueId].y + offset.y };
    newState.unitDragStart.x = e.clientX;
    newState.unitDragStart.y = e.clientY;

    newState = Utils.updateUnitPath(newState, e);

    newState.currentPathIsValid = Utils.getValidMove(viewState.lastRegionOver ? viewState.lastRegionOver : viewState.unitDragStart.unitInfo.region, viewState.regionOver ? viewState.regionOver : viewState.unitDragStart.unitInfo.region, viewState.unitDragStart.unitInfo, newState.adjacencyMap, newState.unitPath);

    return newState;
};

const updateViewStateUnitDragStart = (viewState, e, unitInfo) => {
    let newState = { ...viewState };
    let uniqueId = Utils.getUnitUniqueId(unitInfo);
    newState.unitDragStart = {x: e.clientX, y: e.clientY, uniqueId, unitInfo};
    newState.unitOriginalStart = newState.unitPositions[uniqueId];
    newState.savedMoveArrows && newState.savedMoveArrows.set(uniqueId, null);
    return newState;
};

const updateViewStateUnitDragEnd = (viewState, units) => {
    let newState = { ...viewState };
    let unitInfo = viewState.unitDragStart.unitInfo;

    let uniqueId = Utils.getUnitUniqueId(unitInfo);
    let targetRegionId = newState.currentPathIsValid ? viewState.regionOver : unitInfo.region;
    units.forEach((unit) => {
        if(Utils.getUnitUniqueId(unit) === uniqueId){
            let bbox = viewState.centroidMap.get(targetRegionId);
            var x = Math.floor(bbox.x + bbox.width / 4);
            var y = Math.floor(bbox.y + bbox.height / 4);
            newState.unitPositions[targetRegionId + unit.type + unit.owner] = { x, y };
        }
    });

    if(newState.currentPathIsValid){
        if(!newState.savedMoveArrows) newState.savedMoveArrows = new Map();
        newState.savedMoveArrows.set(targetRegionId + unitInfo.type + unitInfo.owner, {unitOriginalStart: newState.unitOriginalStart, newPosition: newState.unitPositions[targetRegionId + unitInfo.type + unitInfo.owner], originalRegionId:unitInfo.region})
    }

    newState.unitDragStart = null;
    newState.unitOriginalStart = null;
    newState.unitPath = null;
    newState.regionOver = null;

    return newState;
};

const updateUnitsDragEnd = (units, unitInfo, regionOver, isValidPath) => {
    let newUnits = Array.from(units);

    if(isValidPath){
        let uniqueId = Utils.getUnitUniqueId(unitInfo);
        units.forEach((unit) => {
            if((Utils.getUnitUniqueId(unit)) === uniqueId){
                unit.region = regionOver;
            }
        });
    }

    return newUnits;
};


export default mapReducer;