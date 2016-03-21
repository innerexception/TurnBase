import Constants from '../Constants.js';
import { getUnitType } from './helpers/UnitsHelper.js';

let Utils = {

    getPathBoundingRectById: (pathId) => {
        let pathEl = d3.select('path#'+pathId)[0][0];
        return pathEl && pathEl.getBoundingClientRect();
    },

    getNextActivePhase: (phaseName) => {
        let index = Constants.UI.Phases.indexOf(phaseName)+1;
        if(index >= Constants.UI.Phases.length) index = 0;
        return Constants.UI.Phases[index];
    },

    getValidMove: (originRegionId, targetRegionId, unitInfo, adjacencyMap, unitPath, activePhase, units, playerTeam, regions, targetUnitIds, playerId) => {

        let isValid = false;
        let unitType = getUnitType(unitInfo.type);
        let targetRegion = regions.filter((region) => {
            return region.attributes.id === targetRegionId;
        })[0];

        if(targetRegionId && (originRegionId !== targetRegionId) && targetRegionId !== unitInfo.region){

            isValid = adjacencyMap.filter((adjObject) => { return targetRegionId === adjObject.name; }).length > 0;

            if(targetRegion.attributes.id.indexOf('Sea') === -1){
                //Nobody owns space. Stop acting like you do.
                if(activePhase === 'Combat'){
                    //Must drop on an enemy region
                    isValid = Constants.Players[targetRegion.attributes.defaultOwner].team !== playerTeam;
                    if(!isValid) console.debug('combat phase, moves only into enemy spaces');
                }

                if(activePhase === 'Move'){
                    //Must drop on a friendly region
                    isValid = Constants.Players[targetRegion.attributes.defaultOwner].team === playerTeam;
                    if(!isValid) console.debug('move phase, moves only into spaces with no enemies');
                }
            }

            //land units can never move on water and vv
            unitPath.forEach((regionId) => {
                let pathRegion = regions.filter((region) => region.attributes.id === regionId)[0];
                if(unitType === 'land' && pathRegion.attributes.id.indexOf('Sea') !== -1) isValid = false;
                if(unitType === 'sea' && pathRegion.attributes.id.indexOf('Sea') === -1) isValid = false;
            });

            if(unitType === 'air'){
                //In the move phase, simply assure the end point is a friendly region or a sea zone or a carrier.
                if(activePhase === 'Move'){
                    isValid = targetRegionId.indexOf('Sea') !== -1 || Constants.Players[targetRegion.attributes.defaultOwner].team === playerTeam;
                    if(!isValid) console.debug('air unit must end turn on sea or friendly during move');
                    //Friendly carrier with room is a valid target
                    isValid = Utils.containsFriendlyUnitTypeWithSpace(targetUnitIds,'carrier', units, playerId, unitInfo).length > 0;
                    if(isValid) unitInfo.overCarrier = Utils.containsFriendlyUnitTypeWithSpace(targetUnitIds,'carrier', units, playerId, unitInfo)[0];
                }
                if(activePhase === 'Combat'){
                    if(!unitInfo.firstMove){
                        //In the combat phase, the aircraft is dropped on an enemy region.
                        isValid = targetRegionId.indexOf('Sea') === -1 && Constants.Players[targetRegion.attributes.defaultOwner].team !== playerTeam;
                        if(!isValid) console.debug('air unit must end first move on an enemy region during combat phase.');
                    }
                    //Then, a second move is made for the return trip.
                    //The return trip must end in a friendly region OR a sea zone
                    //If a friendly carrier never arrives in the sea zone or has no room, the aircraft is lost when the combat or move phase resolves
                    if(unitInfo.firstMove){
                        //Friendly carrier with room is a valid target for return trip only
                        isValid = Utils.containsFriendlyUnitTypeWithSpace(targetUnitIds,'carrier', units, playerId, unitInfo).length > 0;
                        if(isValid) unitInfo.overCarrier = Utils.containsFriendlyUnitTypeWithSpace(targetUnitIds,'carrier', units, playerId, unitInfo)[0];

                        isValid = targetRegionId.indexOf('Sea') !== -1 || Constants.Players[targetRegion.attributes.defaultOwner].team === playerTeam;
                        if(!isValid) console.debug('air unit must end turn on sea or friendly region or carrier during second move during combat.');
                    }
                }
            }
            else if(unitType === 'land'){
                //Transport might be a valid target
                isValid = Utils.containsFriendlyUnitTypeWithSpace(targetUnitIds,'transport', units, playerId, unitInfo).length > 0;
                if(isValid) unitInfo.overTransport = Utils.containsFriendlyUnitTypeWithSpace(targetUnitIds,'transport', units, playerId, unitInfo)[0];
            }
        }
        else if(unitType === 'land'){
            //Transport might be a valid target in the SAME region
            isValid = Utils.containsFriendlyUnitTypeWithSpace(targetUnitIds,'transport', units, playerId, unitInfo).length > 0;
            if(isValid) unitInfo.overTransport = Utils.containsFriendlyUnitTypeWithSpace(targetUnitIds,'transport', units, playerId, unitInfo)[0];
        }

        //Remaining moves supersedes all other limitations except transport drop-off which is free
        if(unitPath.length-1 > Constants.Units[unitInfo.type].move) isValid = false;

        //special case, transports with units in them can be dropped on land regions.
        //Transport path can contain 1 land region at the end. Both units inside are dropped on that region.
        //Transport position is set to center of lastRegionOver.
        if(unitInfo.type === 'transport' && targetRegion.attributes.id.indexOf('Sea')===-1){
            if(unitPath.length === 2){
                if(targetRegion.attributes.id === unitPath[1]){
                    //first move is to land region
                    unitInfo.dropUnits = true;
                    unitInfo.carriedUnits.forEach((cunit) =>{
                        cunit.lastGoodPosition = { x: targetRegion.bbox.x + (targetRegion.bbox.width/2), y: targetRegion.bbox.y + (targetRegion.bbox.height/2) };
                        cunit.dragPosition = { x: targetRegion.bbox.x + (targetRegion.bbox.width/2), y: targetRegion.bbox.y + (targetRegion.bbox.height/2) };
                        cunit.inTransport = false;
                    });

                    //TODO: get last region in path center point and set transport to it

                    isValid = true;
                }
            }
            if(unitPath.length === 3){
                if(targetRegion.attributes.id === unitPath[2]){
                    //second move is to land region and last move was a sea region
                    if(unitPath[1].indexOf('Sea')!==-1){
                        unitInfo.dropUnits = true;
                        unitInfo.carriedUnits.forEach((cunit) =>{
                            cunit.lastGoodPosition = { x: targetRegion.bbox.x + (targetRegion.bbox.width/2), y: targetRegion.bbox.y + (targetRegion.bbox.height/2) };
                            cunit.dragPosition = { x: targetRegion.bbox.x + (targetRegion.bbox.width/2), y: targetRegion.bbox.y + (targetRegion.bbox.height/2) };
                            cunit.inTransport = false;
                        });
                        isValid = true;

                        //TODO: get last region in path center point and set transport to it

                    }
                }
            }
        }

        return isValid;
    },

    containsFriendlyUnitTypeWithSpace: (unitIds, unitType, units, playerId, droppedUnit) => {
        let targetUnits = units.filter((unit) => unitIds.indexOf(unit.id.toString()) !== -1);
        let myUnitsOfTypeWithSpace = targetUnits.filter((unit) => unit.owner === playerId && unit.type === unitType && unit.space >= droppedUnit.number);
        //TODO: set flag to display message showing target transport unit is full
        return myUnitsOfTypeWithSpace;
    },

    updateUnitPath: (newState, e) => {
        //TODO: elementsFromPoint is hot but only supported on the latest FF/Chrome. Need cross-browser solution...
        let elements = document.elementsFromPoint(e.clientX, e.clientY);
        let possibleNewRegion = elements.filter((element) => {
            return element.classList.contains('turnbase-region');
        })[0].attributes.id.textContent;
        let possibleTargetUnits = elements.filter((element) => {
            return element.classList.contains('turnbase-unit');
        });
        newState.overUnitIds = possibleTargetUnits.map((element) => {
            return element.attributes.id.textContent;
        });

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
    }
};

export default Utils;