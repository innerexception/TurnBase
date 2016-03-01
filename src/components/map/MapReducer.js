import Utils from './MapUtils.js';

const mapReducer = (state = {}, action) => {
    switch (action.type) {
        case 'REGION_CLICKED':
            console.log('clicked on '+action.id);
            return { ...state, viewState: updateViewStateSelectedRegion(state.viewState, action.id) };
        case 'MAP_LOAD':
            return { ...state, regions: action.regions };
        case 'UNIT_LOAD':
            return { ...state, units: action.units, regions: action.regions, viewState: initializeViewStateUnits(action.units, action.centroidMap, state.viewState) };
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
            return { ...state, units: updateUnitsFromPanEvent(action.e, state.units, state.viewState), viewState: updateViewStateUnitPanFromEvent(state.viewState, action.e, state.regions)};
        case 'UNIT_DRAG_START':
            return { ...state, viewState: updateViewStateUnitDragStart(state.viewState, action.e, action.unitInfo), units: updateUnitsDragStart(state.units, action.unitInfo)};
        case 'UNIT_DRAG_END':
            return { ...state, viewState: updateViewStateUnitDragEnd(state.viewState, state.units, state.regions), units: updateUnitsDragEnd(state.units, state.viewState.unitDragStart.unitInfo, state.viewState.regionOver, state.viewState.currentPathIsValid)};
        case 'UNIT_MOVE_CANCELLED':
            return { ...state, units: updateUnitRegionOnMoveCancelled(state.units, action.uniqueId, state.viewState), viewState: updateViewStateRemoveSavedMoveArrows(state.viewState, action.uniqueId)};
        case 'UNIT_PATH_MAP':
            return { ...state, units: updateUnitsPathMap(state.units, action.unitPathMap), unitPathDispatch: true};
        default:
            return state
    }
};

const updateUnitsPathMap = (units, unitPathMap) => {
    let newUnits = Array.from(units);
    newUnits.forEach((unit) => {
        unit.bbox = unitPathMap.get(Utils.getUnitUniqueId(unit));
    });
    return newUnits;
};

const updateUnitRegionOnMoveCancelled = (units, uniqueId, viewState) => {
    let newUnits = Array.from(units);
    newUnits.forEach((unit) => {
        if(unit.queuedForMove){
            unit.region = viewState.savedMoveArrows.get(uniqueId).originalRegionId;
            unit.position = viewState.savedMoveArrows.get(uniqueId).unitOriginalStart;
            delete unit.queuedForMove;
        }
    });
    return newUnits;
};

const updateViewStateRemoveSavedMoveArrows = (viewState, uniqueId) => {
    let newState = {...viewState};
    newState.savedMoveArrows.delete(uniqueId);
    return newState;
};

const updateViewStateSelectedRegion = (viewState, regionId) => {
    let newState = {...viewState};
    newState.selectedRegionId = regionId;
    return newState;
};

const initializeViewStateUnits = (units, centroidMap, viewState) => {
    let newState = {...viewState};
    units.forEach((unit) => {
            let bbox = centroidMap.get(unit.region);
            unit.position = { x:bbox.x, y:bbox.y };
        });
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

const updateViewStateUnitPanFromEvent = (viewState, e, regions) => {
    let newState = { ...viewState };

    newState.unitDragStart.x = e.clientX;
    newState.unitDragStart.y = e.clientY;

    newState = Utils.updateUnitPath(newState, e);

    let originRegionId = viewState.lastRegionOver ? viewState.lastRegionOver : viewState.unitDragStart.unitInfo.region;
    let region = regions.filter((regionItem) => {
        return regionItem.attributes.id === originRegionId;
    })[0];

    newState.currentPathIsValid = Utils.getValidMove(originRegionId, viewState.regionOver ? viewState.regionOver : viewState.unitDragStart.unitInfo.region, viewState.unitDragStart.unitInfo, region.adjacencyMap, newState.unitPath);

    return newState;
};

const updateUnitsFromPanEvent = (e, units, viewState) => {
    let newUnits = Array.from(units);

    let uniqueId = viewState.unitDragStart.uniqueId;
    //Update unit position
    let currentX = viewState.unitDragStart.x;
    let currentY = viewState.unitDragStart.y;
    let offset = {x: ((e.clientX - currentX)/viewState.zoomLevel), y: ((e.clientY -  currentY)/viewState.zoomLevel)};

    newUnits.forEach((unit) => {
        if(Utils.getUnitUniqueId(unit) === uniqueId){
            unit.position = {x: unit.position.x + offset.x, y: unit.position.y + offset.y };
        }
    });

    return newUnits;
};

const updateViewStateUnitDragStart = (viewState, e, unitInfo) => {
    let newState = { ...viewState };
    let uniqueId = Utils.getUnitUniqueId(unitInfo);
    newState.unitDragStart = {x: e.clientX, y: e.clientY, uniqueId, unitInfo};
    newState.unitOriginalStart = unitInfo.position;
    return newState;
};

const updateUnitsDragStart = (units, unitInfo) => {
    let newUnits = Array.from(units);
    newUnits.forEach((unit) => {
        if(Utils.getUnitUniqueId(unit) === Utils.getUnitUniqueId(unitInfo)) unit.queuedForMove = true;
    });
    return newUnits;
};

const updateViewStateUnitDragEnd = (viewState, units, regions) => {
    let newState = { ...viewState };
    let unitInfo = viewState.unitDragStart.unitInfo;

    let uniqueId = Utils.getUnitUniqueId(unitInfo);
    let targetRegionId = newState.currentPathIsValid ? viewState.regionOver : unitInfo.region;
    let targetUniqueId = targetRegionId + unitInfo.type + unitInfo.owner + unitInfo.number + '_queued';
    let targetUnit;
    let region = regions.filter((region) => { return region.attributes.id === targetRegionId})[0];
    units.forEach((unit) => {
        if(Utils.getUnitUniqueId(unit) === uniqueId){
            let bbox = region.bbox;
            unit.position = { x:bbox.x, y:bbox.y };
            targetUnit = unit;
        }
    });

    if(newState.currentPathIsValid){
        if(!newState.savedMoveArrows) newState.savedMoveArrows = new Map();
        newState.savedMoveArrows.set(targetUniqueId, {unitOriginalStart: newState.unitOriginalStart, newPosition: targetUnit.position, originalRegionId:unitInfo.region, originalUniqueId: uniqueId})
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
        newUnits.forEach((unit) => {
            if((Utils.getUnitUniqueId(unit)) === uniqueId){
                unit.region = regionOver;
            }
        });
    }

    return newUnits;
};


export default mapReducer;