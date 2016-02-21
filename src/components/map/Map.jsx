import React, { PropTypes } from 'react'
import './Map.css';

const Map = ({ regions, onRegionClick }) => {
    if (regions) {
        return (
            <div className='turnbase-map-outer'>
                <svg>
                    <g>{_getRegionPaths(regions, onRegionClick)}</g>
                </svg>
            </div>);
    }
    else{
        return (<div>No Map</div>);
    }
};

const _getRegionPaths = (regions, onRegionClick) => {
    return regions.map((region) => {
        return (
            <path onClick={() => onRegionClick(region.attributes.id)} d={region.attributes.d} id={region.attributes.id} title={region.attributes.title} className={'turnbase-region ' + _getRegionClassNames(region)}></path>
        )
    });
};

const _getRegionClassNames = (region) => {
    let classes = '';
    if(region.selected) classes += 'selected';
    return classes;
};

Map.propTypes = {
    regions: PropTypes.array,
    onRegionClick: PropTypes.func.isRequired
};

export default Map;