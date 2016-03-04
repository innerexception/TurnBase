import { connect } from 'react-redux'
import {  } from './CombatActions.js';
import CombatPanel from './CombatPanel.jsx'

const mapStateToProps = (state) => {
    return {
        combatInfo: state.mapReducer.viewState.combatInfo
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        //
        //sendOneUnitToOrigin: (unitInfo) => {
        //    dispatch(sendOneUnitToOrigin(unitInfo));
        //}
    }
};

const CombatStateContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(CombatPanel);

export default CombatStateContainer;