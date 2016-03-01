export default {
    Players: {
        UK: { markerPath: './res/uk_round.png', color: 'beige'},
        US: { markerPng: 'us_round.png', color: 'green'},
        DE: { markerPng: 'german_round.png', color: 'darkbrown'},
        FR: { markerPath: './res/france_round.png', color: 'blue'},
        JP: { markerPng: 'japan_round.png', color: 'orange'},
        IT: { markerPng: 'italy_round.png', color: 'darkgoldenrod'},
        CH: { markerPng: 'china_round.png', color: 'yellow'},
        N: { color: 'gray'},
        RU: { markerPng: 'cccp_round.png', color: 'darkred'}
    },
    Units: {
        DefaultPositions: [
            {type: 'infantry', number: 6, owner: 'FR', region: 'CentralFrance'},
            {type: 'artillery', number: 1, owner: 'FR', region: 'CentralFrance'},
            {type: 'tank', number: 1, owner: 'US', region: 'Normandy'},
            {type: 'tank', number: 1, owner: 'FR', region: 'CentralFrance'},
            {type: 'aaa', number: 1, owner: 'FR', region: 'CentralFrance'},
            {type: 'fighter', number: 1, owner: 'UK', region: 'Normandy'},
            {type: 'infantry', number: 6, owner: 'UK', region: 'Normandy'},
            //{type: 'artillery', number: 6, owner: 'UK', region: 'CentralFrance'},
            {type: 'tank', number: 6, owner: 'UK', region: 'CentralFrance'},
            {type: 'majorIC', number: 1, owner: 'FR', region: 'CentralFrance'},
            //{type: 'airfield', number: 1, owner: 'FR', region: 'CentralFrance'}
        ],
        infantry: {
            width: 10,
            height: 5,
            attack: 1,
            defend: 2,
            move: 1,
            cost: 3,
            svgName: 'infantry.svg',
            scaleFactor: 0.07
        },
        tank: {
            width: 10,
            height: 5,
            attack: 3,
            defend: 3,
            move: 2,
            cost: 5,
            svgName: 'tank.svg',
            scaleFactor: 0.07
        },
        fighter: {
            width: 5,
            height: 5,
            attack: 3,
            defend: 4,
            move: 4,
            cost: 8,
            svgName: 'fighter.svg',
            scaleFactor: 0.13
        },
        bomber: {
            width:40,
            height: 30,
            attack: 6,
            defend: 1,
            move: 6,
            cost: 12,
            svgName: 'bomber.svg'
        },
        artillery: {
            width: 10,
            height: 5,
            attack: 2,
            defend: 2,
            move: 1,
            cost: 6,
            svgName: 'artillery.svg',
            scaleFactor: 0.13
        },
        mechinfantry: {
            width: 30,
            height: 20,
            attack: 1,
            defend: 2,
            move: 2,
            cost: 4,
            svgName: 'mechinfantry.svg',
            scaleFactor: 0.07
        },
        destroyer: {
            width: 40,
            height: 20,
            attack: 2,
            defend: 2,
            move: 3,
            cost: 8,
            svgName: 'destroyer.svg',
            scaleFactor: 0.07
        },
        cruiser: {
            width: 50,
            height: 30,
            attack: 3,
            defend: 3,
            cost: 12,
            svgName: 'cruiser.svg',
            scaleFactor: 0.07
        },
        battleship: {
            width: 60,
            height: 40,
            attack: 4,
            defend: 4,
            cost: 20,
            svgName: 'battleship.svg',
            scaleFactor: 0.07
        },
        transport: {
            width: 50,
            height: 20,
            attack: 0,
            defend: 1,
            cost: 8,
            svgName: 'transport.svg',
            scaleFactor: 0.07
        },
        submarine: {
            width: 30,
            height: 10,
            attack: 2,
            defend: 2,
            cost: 8,
            svgName: 'submarine.svg',
            scaleFactor: 0.07
        },
        aaa: {
            width: 5,
            height: 5,
            attack: 0,
            defend: 1,
            cost: 8,
            svgName: 'aaa.svg',
            scaleFactor: 0.13
        },
        airfield: {
            width: 20,
            height: 20,
            svgName: 'airfield.svg',
            isBuilding: true,
            scaleFactor: 0.07
        },
        majorIC: {
            width: 20,
            height: 20,
            svgName: 'majorIC.svg',
            isBuilding: true,
            scaleFactor: 0.07
        }
    },
    UI: {
    }
}