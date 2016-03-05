import React, { PropTypes } from 'react'
import Constants from '../Constants.js';

class Region {

    static getRegionPaths = (regions, onRegionClick, viewState, highlightNextIncomeRegion) => {

        if(viewState.incomeRegions) setTimeout(highlightNextIncomeRegion, 500);

        return regions.map((region) => {
            return (
                <path onClick={() => onRegionClick(region.attributes.id)}
                      d={region.attributes.d}
                      fill={Constants.Players[region.attributes.defaultOwner ? region.attributes.defaultOwner : 'N'].color}
                      stroke={Region.getRegionStroke(viewState, region)}
                      id={region.attributes.id} title={region.attributes.title}
                      className={'turnbase-region ' + Region.getRegionClassNames(region, viewState)}></path>
            )
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