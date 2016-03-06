import Constants from '../../Constants.js';
import Utils from '../MapUtils.js';

export const updateUnitsPhaseEnd = (units, phaseName) => {
    let newUnits = Array.from(units);
    let phase = Utils.getNextActivePhase(phaseName);
    switch(phase){
        case 'Purchase': break;
        case 'Research':
            //Reset unit mobility
            newUnits.forEach((unit) => {
                delete unit.hasMoved
            });
            break;
        case 'Move':
            //Combat moves...
            newUnits.forEach((unit) => {
                unit.lastGoodPosition = unit.dragPosition;
                if(unit.queuedForMove) unit.hasMoved = true;
                delete unit.queuedForMove;
            });
            //TODO: consolidate owned unit type stacks in all regions
            break;
        case 'Placement':
            //Move phase moves...
            newUnits.forEach((unit) => {
                unit.lastGoodPosition = unit.dragPosition;
                if(unit.queuedForMove) unit.hasMoved = true;
                delete unit.queuedForMove;
            });
            //TODO: consolidate owned unit type stacks in all regions
            break;
    }
    return newUnits;
};

export const updateUnitsCombatEnd = (units, combatInfo) => {
    let newUnits = Array.from(units);
    let deleteUnits = [];
    newUnits.forEach((unit) => {
        combatInfo.attackerUnits.forEach((aunit) => {
            if(aunit.id === unit.id){
                unit.number -= aunit.casualtyCount;
                if(unit.number <= 0) deleteUnits.push(unit.id);
            }
        });
        combatInfo.defenderUnits.forEach((dunit) => {
            if(dunit.id === unit.id){
                unit.number -= dunit.casualtyCount;
                if(unit.number <= 0) deleteUnits.push(unit.id);
            }
        });
    });

    return newUnits.filter((unit) => {
        return deleteUnits.indexOf(unit.id) === -1;
    });
};

export const updateUnitsSendToOrigin = (unitInfo, units) => {
    let newUnits = Array.from(units);
    newUnits.forEach((unit)=>{
        if(unit.id === unitInfo.id){
            if(unit.number > 1){
                unit.number -= 1;
            }
            let regionTypeUnits = newUnits.filter((unit) => {return unit.region === unitInfo.lastRegion && unit.type === unitInfo.type;});
            if(regionTypeUnits.length > 0){
                regionTypeUnits[0].number++;
            }
            else{
                let newUnit = {...unit, number:1, region:unit.lastRegion, queuedForMove:false, id:Math.random(), dragPosition:null, showUnitCount:false};
                newUnits.push(newUnit);
            }
        }
    });
    return newUnits
};

export const updateUnitsCountDisplay = (units, unitInfo) => {
    let newUnits = Array.from(units);
    newUnits.forEach((unit) => {
        if(unitInfo.id === unit.id){
            unit.showUnitCount = !unit.showUnitCount;
        }
    });
    return newUnits;
};

export const updateUnitsPathMap = (units, unitPathMap) => {
    let newUnits = Array.from(units);
    newUnits.forEach((unit) => {
        unit.bbox = unitPathMap.get(unit.id);
    });
    return newUnits;
};

export const updateUnitsFromPanEvent = (e, units, viewState) => {
    let newUnits = Array.from(units);

    //Update unit position
    let currentX = viewState.unitDragStart.x;
    let currentY = viewState.unitDragStart.y;
    let offset = {x: ((e.clientX - currentX)/viewState.zoomLevel), y: ((e.clientY -  currentY)/viewState.zoomLevel)};

    newUnits.forEach((unit) => {
        if(unit.id === viewState.unitDragStart.unitInfo.id){
            unit.dragPosition = {x: unit.dragPosition.x + offset.x, y: unit.dragPosition.y + offset.y };
        }
    });

    return newUnits;
};

export const updateUnitsDragStart = (units, unitInfo) => {
    let newUnits = Array.from(units);
    newUnits.forEach((unit) => {
        if(unit.id === unitInfo.id){
            unit.queuedForMove = true;
            unit.dragPosition = {x: unit.lastGoodPosition.x, y: unit.lastGoodPosition.y };
        }
    });
    return newUnits;
};

export const updateUnitsDragEnd = (units, unitDragStart, regionOver, isValidPath, placingPurchasedUnitType, playerId, regionId, regions) => {
    let newUnits = Array.from(units);
    let unitInfo = unitDragStart && unitDragStart.unitInfo;
    if(unitInfo){
        newUnits.forEach((unit) => {
            if(unit.id === unitInfo.id){
                unit.lastRegion = unit.region;
                if(isValidPath) unit.region = regionOver;
                else{
                    if(regionOver === unitInfo.region){
                        unit.lastGoodPosition = unit.dragPosition;
                    }
                    else{
                        unit.dragPosition = unit.lastGoodPosition;
                    }
                    delete unit.queuedForMove;
                }

            }
        });
    }

    if(placingPurchasedUnitType){
        let unitsOfTypeInRegionForOwner = newUnits.filter((unit) => { return unit.owner === playerId && unit.type === placingPurchasedUnitType && unit.region === regionId })[0];
        //TODO: sea unit placement validation
        let hasICInRegion = newUnits.filter((unit) => { return unit.owner === playerId && unit.region === regionId && (unit.type === 'majorIC' || unit.type === 'minorIC')});
        if(hasICInRegion.length > 0){
            if(unitsOfTypeInRegionForOwner){
                unitsOfTypeInRegionForOwner.number++;
            }
            else{
                let region = regions.filter((region) => {return region.attributes.id === regionId})[0];
                let position = {x: region.bbox.x+region.bbox.width/3, y: region.bbox.y+region.bbox.height/3 };
                newUnits.push({type: placingPurchasedUnitType, number: 1, owner: playerId, region: regionId,
                    id:Math.random(), paths: Constants.Units[placingPurchasedUnitType].paths, lastGoodPosition:position, dragPosition:position});
            }
        }

    }


    return newUnits;
};

export const updateUnitRegionOnMoveCancelled = (units, unitInfo) => {
    let newUnits = Array.from(units);
    let deleteId;
    newUnits.forEach((unit) => {
        if(unit.id === unitInfo.id){
            let regionTypeUnits = newUnits.filter((unit) => {return unit.region === unitInfo.lastRegion && unit.type === unitInfo.type;});
            if(regionTypeUnits.length > 0){
                regionTypeUnits[0].number += unitInfo.number;
                deleteId = unit.id;
            }
            unit.region = unitInfo.lastRegion;
            delete unit.queuedForMove;


        }
    });

    if(deleteId) return newUnits.filter((unit) => { return unit.id !== deleteId});

    return newUnits;
};



