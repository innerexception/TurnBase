import Constants from '../../Constants.js';
import Utils from '../MapUtils.js';
import { getUnitType } from './UnitsHelper.js';

export const updatePlayerInfoPlacedUnitType = (playerInfo, viewState, units, regionId, regions) => {
    let newInfo = {...playerInfo};

    if(viewState.placingPurchasedUnitType){
        let type = getUnitType(viewState.placingPurchasedUnitType);

        //TODO: maximum number of units per turn for major/minor IC

        if(type === 'sea' && regionId.indexOf('Sea') !== -1){
            let hasHarborAdjacent;
            //Must check all adjacent regions to see if there is a harbor
            let region = regions.filter((region) => region.attributes.id === regionId)[0];
            region.adjacencyMap.forEach((adjregion) => {
                if(!hasHarborAdjacent) hasHarborAdjacent = units.filter((unit) => { return unit.owner === playerInfo.id && unit.region === adjregion.name && (unit.type === 'harbor')}).length > 0;
            });
            if(hasHarborAdjacent){
                if (newInfo.purchasedUnits && playerInfo.activePhase === 'Placement') newInfo.purchasedUnits.splice(newInfo.purchasedUnits.indexOf(viewState.placingPurchasedUnitType), 1);
            }
        }
        if(type === 'land' || type === 'air'){
            let hasICInRegion = units.filter((unit) => { return unit.owner === playerInfo.id && unit.region === regionId && (unit.type === 'majorIC' || unit.type === 'minorIC')});
            if(hasICInRegion.length > 0) {
                if (newInfo.purchasedUnits && playerInfo.activePhase === 'Placement') newInfo.purchasedUnits.splice(newInfo.purchasedUnits.indexOf(viewState.placingPurchasedUnitType), 1);
            }
        }
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
    if(viewState.incomeRegions){
        let nextRegion = viewState.incomeRegions.pop();
        if(nextRegion) newInfo.income += parseInt(nextRegion.attributes.value);
        else newInfo.lastIncome += newInfo.income;
    }
    return newInfo;
};

export const updatePlayerInfoPhase = (playerInfo, phaseName) => {
    let newPlayerInfo = {...playerInfo};
    newPlayerInfo.activePhase = Utils.getNextActivePhase(phaseName);
    return newPlayerInfo;
};


