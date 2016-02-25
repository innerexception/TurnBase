const mapReducer = (state = {}, action) => {
    switch (action.type) {
        case 'REGION_CLICKED':
            let regions = state.regions.map((region) => {
                region.attributes.id === action.id ? region.selected = true : region.selected = false;
                return region;
            });
            console.log('clicked on '+action.id);
            return { ...state, regions };
        case 'MAP_LOAD':
            return { ...state, regions: action.regions };
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
            return { ...state, viewState: updateViewStateUnitDragStart(state.viewState, action.e)};
        case 'UNIT_DRAG_END':
            return { ...state, viewState: updateViewStateUnitDragEnd(state.viewState)};
        default:
            return state
    }
};

const initializeViewStateUnits = (regions, centroidMap, viewState) => {
    let newState = {...viewState};
    newState.unitPositions = {};
    regions.forEach((region) => {
        region.units.forEach((unit) => {
            let bbox = centroidMap.get(unit.region);
            var x = Math.floor(bbox.x + bbox.width / 4);
            var y = Math.floor(bbox.y + bbox.height / 4);
            newState.unitPositions[unit.region + unit.type + unit.owner] = { x, y };
        });
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

const updateViewStateUnitPanFromEvent = (viewState, e) => {
    let newState = { ...viewState };
    let uniqueId = e.unitInfo.region + e.unitInfo.type + e.unitInfo.owner;

    //Update unit position
    let currentX = newState.unitDragStart.x;
    let currentY = newState.unitDragStart.y;
    let offset = {x: ((e.clientX - currentX)/viewState.zoomLevel), y: ((e.clientY -  currentY)/viewState.zoomLevel)};
    newState.unitPositions[uniqueId] = {x: newState.unitPositions[uniqueId].x + offset.x, y: newState.unitPositions[uniqueId].y + offset.y };
    newState.unitDragStart = {x: e.clientX, y: e.clientY, uniqueId};

    return newState;
};

const updateViewStateUnitDragStart = (viewState, e) => {
    let newState = { ...viewState };
    let uniqueId = e.unitInfo.region + e.unitInfo.type + e.unitInfo.owner;
    newState.unitDragStart = {x: e.clientX, y: e.clientY, uniqueId};
    newState.unitOriginalStart = newState.unitPositions[uniqueId];
    return newState;
};

const updateViewStateUnitDragEnd = (viewState) => {
    let newState = { ...viewState };
    newState.unitDragStart = null;
    newState.unitOriginalStart = null;
    return newState;
};

export default mapReducer;