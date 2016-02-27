const mapReducer = (state = {}, action) => {
    switch (action.type) {
        case 'REGION_CLICKED':
            console.log('clicked on '+action.id);
            return { ...state, viewState: updateViewStateSelectedRegion(state.viewState, action.id) };
        case 'MAP_LOAD':
            return { ...state, regions: action.regions, regionAdjacencyMap: action.regionAdjacencyMap };
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
            return { ...state, viewState: updateViewStateUnitDragEnd(state.viewState, state.units, action.unitInfo), units: updateUnitsDragEnd(state.units, action.unitInfo, state.viewState.regionOver)};
        default:
            return state
    }
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
    newState.unitDragStart = {x: e.clientX, y: e.clientY, uniqueId};

    //TODO: elementsFromPoint is hot but only supported on the latest FF/Chrome. Need cross-browser solution...
    let possibleNewRegion = document.elementsFromPoint(e.clientX, e.clientY).filter((element) => {
        return element.attributes.id;
    })[0].attributes.id.textContent;

    //If we entered a new region, save the last region.
    if(newState.regionOver !== possibleNewRegion){
        newState.lastRegionOver = newState.regionOver;
        console.log('calculating adjacency from center of: '+newState.lastRegionOver);
        newState.regionOver = possibleNewRegion;

        //Determine number of region moves so far
        if(!newState.unitPath) newState.unitPath = [newState.regionOver];
        else{
            //If you backtracked, remove last region in path
            if(newState.unitPath[newState.unitPath.length-2] === possibleNewRegion){
                console.log('removed ' +newState.unitPath[newState.unitPath.length-1]+ ' from unit path');
                newState.unitPath.splice(newState.unitPath.length-1, 1);
            }
            else{
                //Check if region exists in path, region can only be in path once.
                let duplicate = newState.unitPath.filter((path) => {
                    return path === possibleNewRegion;
                });
                if(duplicate.length === 0){
                    newState.unitPath.push(possibleNewRegion);
                    console.log('added ' +possibleNewRegion+ ' to unit path');
                }
                else{
                    console.log('possibleNewRegion was already found in path!');
                }

            }
        }
        console.debug('new path is: '+newState.unitPath);

    }

    return newState;
};

const updateViewStateUnitDragStart = (viewState, e, unitInfo) => {
    let newState = { ...viewState };
    let uniqueId = unitInfo.region + unitInfo.type + unitInfo.owner;
    newState.unitDragStart = {x: e.clientX, y: e.clientY, uniqueId};
    newState.unitOriginalStart = newState.unitPositions[uniqueId];
    return newState;
};

const updateViewStateUnitDragEnd = (viewState, units, unitInfo) => {
    let newState = { ...viewState };
    newState.unitDragStart = null;
    newState.unitOriginalStart = null;
    newState.unitPath = null;

    let uniqueId = unitInfo.region + unitInfo.type + unitInfo.owner;

    units.forEach((region) => {
        region.units.forEach((unit) => {
            if(unit.region + unit.type + unit.owner === uniqueId){
                let bbox = viewState.centroidMap.get(viewState.regionOver);
                var x = Math.floor(bbox.x + bbox.width / 4);
                var y = Math.floor(bbox.y + bbox.height / 4);
                newState.unitPositions[viewState.regionOver + unit.type + unit.owner] = { x, y };
            }
        });
    });

    return newState;
};

const updateUnitsDragEnd = (units, unitInfo, regionOver) => {
    let newUnits = Array.from(units);

    let uniqueId = unitInfo.region + unitInfo.type + unitInfo.owner;
    newUnits.forEach((unitList) => {
        unitList.units.forEach((unit) => {
            if((unit.region + unit.type + unit.owner) === uniqueId){
                unit.region = regionOver;
            }
        });
    });

    return newUnits;
};

export default mapReducer;