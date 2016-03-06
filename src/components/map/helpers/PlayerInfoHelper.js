import Constants from '../../Constants.js';
import Utils from '../MapUtils.js';

export const updatePlayerInfoPlacedUnitType = (playerInfo, viewState, units, regionId) => {
    let newInfo = {...playerInfo};
    //TODO: sea unit placement validation
    let hasICInRegion = units.filter((unit) => { return unit.owner === playerInfo.id && unit.region === regionId && (unit.type === 'majorIC' || unit.type === 'minorIC')});
    if(hasICInRegion.length > 0) {
        if (newInfo.purchasedUnits && playerInfo.activePhase === 'Placement') newInfo.purchasedUnits.splice(newInfo.purchasedUnits.indexOf(viewState.placingPurchasedUnitType), 1);
    }
    return newInfo;
};

export const updatePlayerInfoUnitPurchased = (unitType, playerInfo) => {
    let newInfo = {...playerInfo};
    if(!newInfo.purchasedUnits) newInfo.purchasedUnits = [];
    if(newInfo.lastIncome >= Constants.Units[unitType].cost){
        newInfo.purchasedUnits.push(unitType);
        newInfo.lastIncome -= Constants.Units[unitType].cost;
    }
    return newInfo;
};

export const updatePlayerInfoUnitUnPurchased = (unitType, playerInfo) => {
    let newInfo = {...playerInfo};
    if(!newInfo.purchasedUnits) newInfo.purchasedUnits = [];
    let index = newInfo.purchasedUnits.indexOf(unitType);
    if(index !== -1){
        newInfo.purchasedUnits.splice(index, 1);
        newInfo.lastIncome += Constants.Units[unitType].cost;
    }
    return newInfo;
};

export const updatePlayerInfoIncome = (playerInfo, viewState) => {
    let newInfo = {...playerInfo};
    if(!newInfo.income)newInfo.income=0;
    let nextRegion = viewState.incomeRegions.pop();
    if(nextRegion) newInfo.income += parseInt(nextRegion.attributes.value);
    else newInfo.lastIncome += newInfo.income;
    return newInfo;
};

export const updatePlayerInfoPhase = (playerInfo, phaseName) => {
    let newPlayerInfo = {...playerInfo};
    newPlayerInfo.activePhase = Utils.getNextActivePhase(phaseName);
    return newPlayerInfo;
};


