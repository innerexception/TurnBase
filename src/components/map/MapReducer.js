import {updateViewStatePlacementPortrait, updateViewStatePlacingUnitType, updateViewStateHighlightNextRegion,
        updateViewStatePhaseEnd, updateViewStateLoadNextCombat, updateViewStateRemoveSavedMoveArrows, updateViewStateSelectedRegion,
        updateViewStateZoom, updateViewStatePanFromEvent, updateViewStateDragStart, updateViewStateDragEnd,
        updateViewStateUnitPanFromEvent, updateViewStateUnitDragStart, updateViewStateUnitDragEnd} from './helpers/ViewStateHelper.js';
import {updatePlayerInfoPlacedUnitType, updatePlayerInfoUnitPurchased, updatePlayerInfoUnitUnPurchased, updatePlayerInfoIncome,
        updatePlayerInfoPhase} from './helpers/PlayerInfoHelper.js';
import {updateUnitsPhaseEnd, updateUnitsCombatEnd, updateUnitsSendToOrigin, updateUnitsCountDisplay, updateUnitsPathMap,
        updateUnitsFromPanEvent, updateUnitsDragStart, updateUnitsDragEnd, updateUnitRegionOnMoveCancelled} from './helpers/UnitsHelper.js';
import {updateRegionsCombatEnd} from './helpers/RegionHelper.js';


const mapReducer = (state = {}, action) => {
    switch (action.type) {
        case 'REGION_CLICKED':
            return { ...state, playerInfo: updatePlayerInfoPlacedUnitType(state.playerInfo, state.viewState, state.units, action.id, state.regions),
                                viewState: updateViewStateSelectedRegion(state.viewState, action.id, state.units, state.regions, state.playerInfo),
                                units: updateUnitsDragEnd(state.units, state.viewState.unitDragStart, state.viewState.regionOver, state.viewState.currentPathIsValid,
                                    state.viewState.placingPurchasedUnitType, state.playerInfo.id, action.id, state.regions, state.viewState.placingPurchasedUnitPosition) };
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
            return {...state, playerInfo: updatePlayerInfoPhase(state.playerInfo, action.phaseName), units: updateUnitsPhaseEnd(state.units, action.phaseName, state.regions),  viewState: updateViewStatePhaseEnd(state.viewState, action.phaseName, state.units, state.regions, state.playerInfo)};
        case 'PLAYER_INFO_LOAD':
            return {...state, playerInfo: action.playerInfo};
        case 'NEXT_COMBAT':
            return {...state, viewState: updateViewStateLoadNextCombat(state.viewState), units: updateUnitsCombatEnd(state.units, action.combatInfo), regions: updateRegionsCombatEnd(state.regions, action.combatInfo)};
        case 'HIGHLIGHT_NEXT_REGION':
            return {...state, viewState: updateViewStateHighlightNextRegion(state.viewState), playerInfo: updatePlayerInfoIncome(state.playerInfo, state.viewState)};
        case 'GRAB_PURCHASED_UNIT':
            return {...state, viewState: updateViewStatePlacingUnitType(action.unitType, state.viewState, action.e)};
        case 'UPDATE_PLACEMENT_PORTRAIT':
            return {...state, viewState: updateViewStatePlacementPortrait(state.viewState, action.e)};
        default:
            return state
    }
};

export default mapReducer;