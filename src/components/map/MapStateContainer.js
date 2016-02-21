import { connect } from 'react-redux'
import { regionClicked } from './MapActions.js';
import Map from './Map.jsx'

const mapStateToProps = (state) => {
    return {
        regions: state.regions
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onRegionClick: (id) => {
            dispatch(regionClicked(id))
        }
    }
};

const MapStateContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Map);

export default MapStateContainer;