import React, { PropTypes } from 'react'
import Constants from '../Constants.js';
import { getUnitType } from '../map/helpers/UnitsHelper.js';

class Region {

    static getRegionPaths = (regions, onRegionClick, viewState, highlightNextIncomeRegion, units) => {

        if(viewState.incomeRegions) setTimeout(highlightNextIncomeRegion, 500);


        return regions.map((region) => {
            let buildings = [];
            if(units) buildings = units.filter((unit) => {return Constants.Units[unit.type].isBuilding && unit.region === region.attributes.id});
            return (
                <svg x={region.translate}>
                    <g>
                        <path onClick={() => onRegionClick(region.attributes.id)}
                              d={region.attributes.d}
                              fill={Region.getFillColor(viewState, region, buildings)}
                              stroke={Region.getRegionStroke(viewState, region)}
                              id={region.attributes.id} title={region.attributes.title}
                              className={'turnbase-region ' + Region.getRegionClassNames(region, viewState)}></path>
                        <image xlinkHref={Constants.Players[region.attributes.defaultOwner] ? Constants.Players[region.attributes.defaultOwner].markerPath : null}
                               x={region.bbox ? region.bbox.x + (region.bbox.width/3) : 0} y={region.bbox ? region.bbox.y + (region.bbox.height/3) : 0} opacity="0.2" height="5px" width="5px"/>
                        { Region.getBuildingImages(buildings, region) }
                    </g>
                </svg>

            )
        });
    };

    static getFillColor = (viewState, region, buildings) => {
        let defaultColor = Constants.Players[region.attributes.defaultOwner ? region.attributes.defaultOwner : 'N'].color;
        if(viewState.placingPurchasedUnitType){
            let unitDomain = getUnitType(viewState.placingPurchasedUnitType);
            if(unitDomain === 'sea'){
                if(buildings.filter((building => building.type === 'harbor')).length > 0){
                    return 'green';
                }
                else return defaultColor;
            }
            else{
                if(buildings.filter((building => building.type === 'majorIC' || building.type === 'minorIC')).length > 0){
                    return 'green';
                }
                else return defaultColor;
            }
        }
        else return defaultColor;
    };

    static getBuildingImages = (buildings, region) => {
        return buildings.map((building) => {
            return (
                <image xlinkHref={Constants.Units[building.type].imageName}
                       x={region.bbox ? region.bbox.x + (region.bbox.width/8) : 0} y={region.bbox ? region.bbox.y + (region.bbox.height/2) : 0}
                       opacity="0.6" height="5px" width="5px"/>
            );
        });
    };

    static getRegionStroke = (viewState, region) => {
        if(viewState.activeIncomeRegion){
            if(viewState.activeIncomeRegion.attributes.id === region.attributes.id){
                return 'red';
            }
        }
        return 'darkgrey';
    };

    static getRegionClassNames = (region, viewState) => {
        let classes = '';
        if (region.attributes.id === viewState.selectedRegionId) classes += 'selected';
        if (region.attributes.id.indexOf('Sea') !== -1) classes += ' turnbase-sea';
        if (Region.isInPath(region, viewState)) classes += ' unit-path-region';
        return classes;
    };

    static isInPath = (region, viewState) => {
        if(viewState.unitPath){
            return viewState.unitPath.filter((pathId) => {
                    return pathId === region.attributes.id;
                }).length > 0;
        }
        return false;
    };
}

export default Region;