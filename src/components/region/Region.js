import React, { PropTypes } from 'react'
import Constants from '../Constants.js';

class Region {

    static getRegionPaths = (regions, onRegionClick) => {
        return regions.map((region) => {
            return (
                <path onClick={() => onRegionClick(region.attributes.id)} d={region.attributes.d}
                      id={region.attributes.id} title={region.attributes.title}
                      className={'turnbase-region ' + Region.getRegionClassNames(region)}></path>
            )
        });
    };

    static getRegionClassNames = (region) => {
        let classes = '';
        if (region.selected) classes += 'selected';
        return classes;
    };
}

export default Region;