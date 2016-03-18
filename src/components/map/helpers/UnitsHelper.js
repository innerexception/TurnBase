import Constants from '../../Constants.js';
import Utils from '../MapUtils.js';

export const updateUnitsPhaseEnd = (units, phaseName, regions) => {
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
            newUnits = _consolidateUnitStacks(regions, newUnits);
            break;
        case 'Placement':
            //Move phase moves...
            newUnits.forEach((unit) => {
                unit.lastGoodPosition = unit.dragPosition;
                if(unit.queuedForMove) unit.hasMoved = true;
                delete unit.queuedForMove;
            });
            newUnits = _consolidateUnitStacks(regions, newUnits);
            break;
    }
    return newUnits;
};

const _consolidateUnitStacks = (regions, units) => {
    let unitIdsToDelete = [];
    regions.forEach((region) => {
        let unitsInRegion = units.filter((unit) => {
            return unit.region === region.attributes.id;
        });
        let unitsByOwner = new Map();
        unitsInRegion.forEach((unit) => {
            if(!unitsByOwner.get(unit.owner)) unitsByOwner.set(unit.owner, []);
            unitsByOwner.get(unit.owner).push(unit);
        });
        for(var owner of unitsByOwner.keys()){
            let typesInRegion = new Map();
            unitsByOwner.get(owner).forEach((unit) => {
                if(typesInRegion.get(unit.type)){
                    typesInRegion.get(unit.type).number += unit.number;
                    unitIdsToDelete.push(unit.id);
                }
                else{
                    typesInRegion.set(unit.type, unit);
                }
            });
        }

    });
    units = units.filter((unit) => { return unitIdsToDelete.indexOf(unit.id) === -1 });
    return units;
};

export const updateUnitsCombatEnd = (units, combatInfo) => {
    let newUnits = Array.from(units);
    let deleteUnits = [];
    newUnits.forEach((unit) => {
        if(unit.casualtyCount){
            unit.number -= unit.casualtyCount;
            unit.casualtyCount = 0;
        }
        if(unit.number <= 0) deleteUnits.push(unit.id);
    });

    if(combatInfo.retreated){
        combatInfo.attackerUnits.forEach((aunit) => {
            newUnits = updateUnitsSendToOrigin(aunit, newUnits);
            newUnits = newUnits.filter((unit) => {
                return unit.id !== aunit.id;
            });
        });
    }

    return newUnits.filter((unit) => {
        return deleteUnits.indexOf(unit.id) === -1;
    });
};

export const updateUnitsSendToOrigin = (unitInfo, units) => {
    let newUnits = Array.from(units);
    newUnits.forEach((unit)=>{
        if(unit.id === unitInfo.id){
            //if(unit.number > 1){
            //    unit.number -= 1;
            //}
            let regionTypeUnits = newUnits.filter((unit) => {return unit.region === unitInfo.lastRegion && unit.type === unitInfo.type;});
            if(regionTypeUnits.length > 0){
                regionTypeUnits[0].number++;
            }
            else{
                let newUnit = {...unit, number:unitInfo.number, region:unit.lastRegion, queuedForMove:false, id:Math.random(), dragPosition:null, showUnitCount:false};
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

export const updateUnitsDragEnd = (units, unitDragStart, regionOver, isValidPath, activePhase) => {
    let newUnits = Array.from(units);
    let unitInfo = unitDragStart && unitDragStart.unitInfo;
    if(unitInfo){
        newUnits.forEach((unit) => {
            if(unit.id === unitInfo.id){
                if(getUnitType(unitInfo.type) === 'air' && activePhase === 'Combat' && unit.firstMove){
                    //Air unit placed over return region. Do not update lastRegion.
                    console.debug('Air unit placed over return region. Do not update lastRegion.');
                }
                else{
                    unit.lastRegion = unit.region;
                }
                if(isValidPath){
                    if(getUnitType(unitInfo.type) === 'air' && activePhase === 'Combat'){
                        if(!unit.firstMove){
                            unit.firstMove = regionOver;
                            //save position in case entire move series is cancelled
                            unit.airUnitCancelPosition = unit.lastGoodPosition;
                            //save position for next move arrow start point
                            unit.lastGoodPosition = unit.dragPosition;
                        }
                        else if(unit.firstMove){
                            unit.secondMove = true;
                        }
                    }
                    unit.region = regionOver;
                }
                else{
                    if(regionOver === unitInfo.region){
                        //Allow nudge
                        unit.lastGoodPosition = unit.dragPosition;
                    }
                    else{
                        //Reset to original position
                        unit.dragPosition = unit.lastGoodPosition;
                    }
                    delete unit.queuedForMove;
                }

            }
        });
    }

    return newUnits;
};


export const updateUnitsRegionClick = (units, placingPurchasedUnitType, playerId, regionId, regions, purchaseUnitScreenPosition) => {
    let newUnits = Array.from(units);

    if(placingPurchasedUnitType){

        let p = document.getElementById(regionId);
        let svg = document.getElementById('mapSvg');
        let rect = svg.getBoundingClientRect();
        let matrix = p.getScreenCTM().inverse();
        let position = {
            x: (matrix.a * purchaseUnitScreenPosition.x) + (matrix.c * purchaseUnitScreenPosition.y) + matrix.e - rect.left,
            y: (matrix.b * purchaseUnitScreenPosition.x) + (matrix.d * purchaseUnitScreenPosition.y) + matrix.f - rect.top
        };

        let type = getUnitType(placingPurchasedUnitType);

        //TODO: maximum number of units per turn for major/minor IC

        if(type === 'sea' && regionId.indexOf('Sea') !== -1){
            let hasHarborAdjacent;
            //Must check all adjacent regions to see if there is a harbor
            let region = regions.filter((region) => region.attributes.id === regionId)[0];
            region.adjacencyMap.forEach((adjregion) => {
                if(!hasHarborAdjacent) hasHarborAdjacent = units.filter((unit) => { return unit.owner === playerId && unit.region === adjregion.name && (unit.type === 'harbor')}).length > 0;
            });
            if(hasHarborAdjacent){
                let unitsOfTypeInRegionForOwner = newUnits.filter((unit) => { return unit.owner === playerId && unit.type === placingPurchasedUnitType && unit.region === regionId })[0];
                if(unitsOfTypeInRegionForOwner){
                    unitsOfTypeInRegionForOwner.number++;
                }
                else{
                    //let position = {x: region.bbox.x+region.bbox.width/3, y: region.bbox.y+region.bbox.height/3 };
                    newUnits.push({type: placingPurchasedUnitType, number: 1, owner: playerId, region: regionId,
                        id:Math.random(), paths: Constants.Units[placingPurchasedUnitType].paths, lastGoodPosition:position, dragPosition:position});
                }
            }
        }
        if(type === 'land' || type === 'air'){
            let hasICInRegion = newUnits.filter((unit) => { return unit.owner === playerId && unit.region === regionId && (unit.type === 'majorIC' || unit.type === 'minorIC')});
            if(hasICInRegion.length > 0){
                let unitsOfTypeInRegionForOwner = newUnits.filter((unit) => { return unit.owner === playerId && unit.type === placingPurchasedUnitType && unit.region === regionId })[0];
                if(unitsOfTypeInRegionForOwner){
                    unitsOfTypeInRegionForOwner.number++;
                }
                else{
                    let region = regions.filter((region) => {return region.attributes.id === regionId})[0];
                    //let position = {x: region.bbox.x+region.bbox.width/3, y: region.bbox.y+region.bbox.height/3 };
                    newUnits.push({type: placingPurchasedUnitType, number: 1, owner: playerId, region: regionId,
                        id:Math.random(), paths: Constants.Units[placingPurchasedUnitType].paths, lastGoodPosition:position, dragPosition:position});
                }
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
            if(regionTypeUnits.length > 0 && regionTypeUnits[0].id !== unitInfo.id){
                regionTypeUnits[0].number += unitInfo.number;
                deleteId = unit.id;
            }
            if(unit.airUnitCancelPosition) unit.lastGoodPosition = unit.airUnitCancelPosition;
            unit.region = unitInfo.lastRegion;
            delete unit.queuedForMove;
            delete unit.firstMove;
            delete unit.secondMove;
        }
    });

    if(deleteId) return newUnits.filter((unit) => { return unit.id !== deleteId});

    return newUnits;
};

export const getUnitType = (unitType) => {
    return Constants.Units[unitType].type;
};




