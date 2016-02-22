import { connect } from 'react-redux'
import { regionClicked, mapDragged, mapDragEnd, mapDragStart, mapZoom } from './MapActions.js';
import Map from './Map.jsx'

const mapStateToProps = (state) => {
    return {
        regions: state.regions,
        units: state.units,
        viewState: state.viewState
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
        }
    }
};

const MapStateContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Map);

export default MapStateContainer;