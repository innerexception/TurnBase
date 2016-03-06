import { connect } from 'react-redux'
import { regionClicked, regionMouseEnter, mapDragged,
    mapDragEnd, mapDragStart, mapZoom, unitDragStart,
    unitDragEnd, unitMove, moveCancel, chipOut, chipOver,
    sendOneUnitToOrigin, endPhase, highlightNextRegion } from './MapActions.js';
import Map from './Map.jsx'

const mapStateToProps = (state) => {
    return {
        regions: state.mapReducer.regions,
        units: state.mapReducer.units,
        viewState: state.mapReducer.viewState,
        unitPathDispatch : state.mapReducer.unitPathDispatch,
        playerInfo: state.mapReducer.playerInfo,
        staticUnitPaths: state.mapReducer.staticUnitPaths
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onRegionClick: (id) => {
            dispatch(regionClicked(id))
        },
        onUnitClick: (id) => {
            dispatch(unitClicked(id))
        },
        onUnitStackClick: (region) => {
            dispatch(unitStackClicked(region))
        },
        onMapDrag: (e) => {
            dispatch(mapDragged(e))
        },
        onMapDragEnd: (e) => {
            dispatch(mapDragEnd(e))
        },
        onMapDragStart: (e) => {
            dispatch(mapDragStart(e))
        },
        onMapZoom: (e) => {
            dispatch(mapZoom(e))
        },
        onUnitDrag: (e) => {
            dispatch(unitMove(e))
        },
        onUnitDragStart: (e, unitInfo) => {
            dispatch(unitDragStart(e, unitInfo))
        },
        onUnitDragEnd: (e) => {
            dispatch(unitDragEnd(e))
        },
        onMoveCancelClick: (unitInfo) => {
            dispatch(moveCancel(unitInfo))
        },
        onChipMouseOver: (unitInfo) => {
            dispatch(chipOver(unitInfo));
        },
        sendOneUnitToOrigin: (unitInfo) => {
            dispatch(sendOneUnitToOrigin(unitInfo));
        },
        onEndPhaseClick: (phaseName) => {
            dispatch(endPhase(phaseName));
        },
        highlightNextIncomeRegion: () => {
            dispatch(highlightNextRegion());
        }
    }
};

const MapStateContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Map);

export default MapStateContainer;