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

    getValidMove: (originRegionId, targetRegionId, unitInfo, adjacencyMap, unitPath, activePhase, units, playerTeam, regions) => {
        // for unit move value, get adjacent regions of origin and return true if target region is one of them.

        let isValid = false;

        if(targetRegionId && (originRegionId !== targetRegionId) && targetRegionId !== unitInfo.region){

            isValid = adjacencyMap.filter((adjObject) => { return targetRegionId === adjObject.name; }).length > 0;
            let targetRegion = regions.filter((region) => {
                return region.attributes.id === targetRegionId;
            })[0];
            if(targetRegion.attributes.id.indexOf('Sea') === -1){
                //Nobody owns space
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

            if(unitPath.length-1 > Constants.Units[unitInfo.type].move) isValid = false;

            let unitType = getUnitType(unitInfo.type);
            //land units can never move on water and vv
            unitPath.forEach((regionId) => {
                let pathRegion = regions.filter((region) => region.attributes.id === regionId)[0];
                if(unitType === 'land' && pathRegion.attributes.id.indexOf('Sea') !== -1) isValid = false;
                if(unitType === 'sea' && pathRegion.attributes.id.indexOf('Sea') === -1) isValid = false;

            });

            if(unitType === 'air'){
                //In the move phase, simply assure the end point is a friendly region or a sea zone.
                if(activePhase === 'Move'){
                    isValid = Constants.Players[targetRegion.attributes.defaultOwner].team === playerTeam || targetRegionId.indexOf('Sea') !== -1;
                    if(!isValid) console.debug('air unit must end turn on sea or friendly during move');
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
                        isValid = Constants.Players[targetRegion.attributes.defaultOwner].team === playerTeam || targetRegionId.indexOf('Sea') !== -1;
                        if(!isValid) console.debug('air unit must end turn on sea or friendly during second move during combat.');
                    }
                }

            }

        }

        //TODO: Transport might be a valid target in the same region



        return isValid;
    },

    updateUnitPath: (newState, e) => {
        //TODO: elementsFromPoint is hot but only supported on the latest FF/Chrome. Need cross-browser solution...
        let possibleNewRegion = document.elementsFromPoint(e.clientX, e.clientY).filter((element) => {
            return element.classList.contains('turnbase-region');
        })[0].attributes.id.textContent;

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