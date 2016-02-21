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
            <path onClick={() => onRegionClick(region.id)} d={region.d} id={region.id} title={region.title} className='turnbase-region'></path>
        )
    });
};

Map.propTypes = {
    regions: PropTypes.array.isRequired,
    onRegionClick: PropTypes.func.isRequired
};

export default Map;