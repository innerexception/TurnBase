export default {
    Players: {
        UK: { markerPath: './res/uk_round.png', color: 'beige', team: 'AL'},
        US: { markerPath: './res/us_round.png', color: 'green', team: 'AL'},
        DE: { markerPath: './res/german_round.png', color: 'darkbrown', team: 'AX'},
        FR: { markerPath: './res/france_round.png', color: 'blue', id: 'FR', lastIncome: 17, activePhase: 'Combat', team: 'AL'},
        JP: { markerPng: 'japan_round.png', color: 'orange', team: 'AX'},
        IT: { markerPng: 'italy_round.png', color: 'darkgoldenrod', team: 'AX'},
        CH: { markerPng: 'china_round.png', color: 'yellow', team: 'AL'},
        N: { color: 'gray'},
        RU: { markerPng: 'cccp_round.png', color: 'darkred', team: 'AL'}
    },
    Units: {
        LandUnitTypes: ['infantry', 'mechinfantry', 'artillery', 'tank', 'fighter', 'bomber', 'aaa' ],
        SeaUnitTypes: ['transport', 'destroyer', 'submarine', 'cruiser', 'battleship', 'carrier'],
        DefaultPositions: [
            {type: 'infantry', number: 8, casualtyCount:0, unconfirmedCasualtyCount:0, owner: 'FR', region: 'CentralFrance', id:Math.random()},
            //{type: 'tank', number: 3, owner: 'DE', region: 'CentralFrance', id:Math.random()},
            {type: 'tank', number: 2,casualtyCount:0, unconfirmedCasualtyCount:0, owner: 'DE', region: 'Spain', id:Math.random()},
            {type: 'aaa', number: 1,casualtyCount:0, unconfirmedCasualtyCount:0, owner: 'FR', region: 'CentralFrance', id:Math.random()},
            {type: 'fighter', number: 1,casualtyCount:0, unconfirmedCasualtyCount:0, owner: 'FR', region: 'CentralFrance', id:Math.random()},
            {type: 'majorIC', number: 1,casualtyCount:0, unconfirmedCasualtyCount:0, owner: 'FR', region: 'CentralFrance', id:Math.random()},
            //{type: 'airfield', number: 1, owner: 'FR', region: 'CentralFrance'}
            //{type: 'artillery', number: 1, owner: 'IT', region: 'UnitedKingdom', id:Math.random()},
            {type: 'infantry', number: 2,casualtyCount:0, unconfirmedCasualtyCount:0, owner: 'FR', region: 'UnitedKingdom', initialX:458, initialY:295, id:Math.random()},
            {type: 'fighter', number: 1,casualtyCount:0, unconfirmedCasualtyCount:0, owner: 'FR', region: 'UnitedKingdom', id:Math.random()},
            {type: 'infantry', number: 1,casualtyCount:0, unconfirmedCasualtyCount:0, owner: 'FR', region: 'Normandy', initialX:459, initialY:316, id:Math.random()},
            {type: 'artillery', number: 1,casualtyCount:0, unconfirmedCasualtyCount:0, owner: 'FR', region: 'Normandy', initialX:466, initialY:319, id:Math.random()},
            //{type: 'harbor', number: 1, owner: 'FR', region: 'Normandy'},
            //{type: 'minorIC', number: 1, owner: 'FR', region: 'Normandy'},
            {type: 'infantry', number: 2,casualtyCount:0, unconfirmedCasualtyCount:0, owner: 'FR', region: 'SouthernFrance', id:Math.random()},
            {type: 'artillery', number: 2,casualtyCount:0, unconfirmedCasualtyCount:0, owner: 'FR', region: 'SouthernFrance', id:Math.random()},
            {type: 'harbor', number: 1,casualtyCount:0, unconfirmedCasualtyCount:0, owner: 'FR', region: 'SouthernFrance', id:Math.random()},
            //{type: 'minorIC', number: 1, owner: 'FR', region: 'SouthernFrance'},
            {type: 'infantry', number: 1,casualtyCount:0, unconfirmedCasualtyCount:0, owner: 'FR', region: 'WestAfrica', initialX:435, initialY:394, id:Math.random()},
            {type: 'infantry', number: 1,casualtyCount:0, unconfirmedCasualtyCount:0, owner: 'FR', region: 'MOR', initialX:460, initialY:369, id:Math.random()},
            {type: 'infantry', number: 1,casualtyCount:0, unconfirmedCasualtyCount:0, owner: 'FR', region: 'Algeria', initialX:478, initialY:374, id:Math.random()},
            {type: 'infantry', number: 1,casualtyCount:0, unconfirmedCasualtyCount:0, owner: 'FR', region: 'TN', id:Math.random()},
            {type: 'infantry', number: 1,casualtyCount:0, unconfirmedCasualtyCount:0, owner: 'FR', region: 'SY', id:Math.random()},
            //{type: 'fighter', number: 1, owner: 'FR', region: 'Normandy'},
            //{type: 'infantry', number: 6, owner: 'UK', region: 'Switzerland'},
            //{type: 'artillery', number: 6, owner: 'UK', region: 'Normandy'},
            //{type: 'tank', number: 6, owner: 'UK', region: 'Normandy'},
            //{type: 'aaa', number: 6, owner: 'UK', region: 'Normandy'},
        ],
        infantry: {
            width: 10,
            height: 5,
            attack: 1,
            defend: 2,
            move: 1,
            cost: 3,
            svgName: 'infantry.svg',
            scaleFactor: 0.07,
            staticScaleFactor: 0.5
        },
        tank: {
            width: 10,
            height: 5,
            attack: 3,
            defend: 3,
            move: 2,
            cost: 5,
            svgName: 'tank.svg',
            scaleFactor: 0.07,
            staticScaleFactor: 0.5
        },
        fighter: {
            width: 5,
            height: 5,
            attack: 3,
            defend: 4,
            move: 4,
            cost: 8,
            svgName: 'fighter.svg',
            scaleFactor: 0.13,
            staticScaleFactor: 1
        },
        bomber: {
            width:40,
            height: 30,
            attack: 6,
            defend: 1,
            move: 6,
            cost: 12,
            svgName: 'bomber.svg',
            scaleFactor: 0.07,
            staticScaleFactor: 0.5
        },
        artillery: {
            width: 10,
            height: 5,
            attack: 2,
            defend: 2,
            move: 1,
            cost: 6,
            svgName: 'artillery.svg',
            scaleFactor: 0.13,
            staticScaleFactor: 1
        },
        mechinfantry: {
            width: 30,
            height: 20,
            attack: 1,
            defend: 2,
            move: 2,
            cost: 4,
            svgName: 'mechinfantry.svg',
            scaleFactor: 0.07,
            staticScaleFactor: 0.5
        },
        destroyer: {
            width: 40,
            height: 20,
            attack: 2,
            defend: 2,
            move: 3,
            cost: 8,
            svgName: 'destroyer.svg',
            scaleFactor: 0.07,
            staticScaleFactor: 1
        },
        cruiser: {
            width: 50,
            height: 30,
            attack: 3,
            defend: 3,
            cost: 12,
            svgName: 'cruiser.svg',
            scaleFactor: 0.07,
            staticScaleFactor: 0.5
        },
        battleship: {
            width: 60,
            height: 40,
            attack: 4,
            defend: 4,
            cost: 20,
            svgName: 'battleship.svg',
            scaleFactor: 0.07,
            staticScaleFactor: 0.5
        },
        carrier: {
            width: 60,
            height: 40,
            attack: 1,
            defend: 4,
            cost: 18,
            svgName: 'carrier.svg',
            scaleFactor: 0.07,
            staticScaleFactor: 0.5
        },
        transport: {
            width: 50,
            height: 20,
            attack: 0,
            defend: 1,
            cost: 8,
            svgName: 'transport.svg',
            scaleFactor: 0.07,
            staticScaleFactor: 1
        },
        submarine: {
            width: 30,
            height: 10,
            attack: 2,
            defend: 2,
            cost: 8,
            svgName: 'submarine.svg',
            scaleFactor: 0.07,
            staticScaleFactor: 0.5
        },
        aaa: {
            width: 5,
            height: 5,
            attack: 0,
            defend: 1,
            cost: 8,
            svgName: 'aaa.svg',
            scaleFactor: 0.13,
            staticScaleFactor: 1
        },
        airfield: {
            width: 20,
            height: 20,
            svgName: 'airfield.svg',
            isBuilding: true,
            scaleFactor: 0.07,
            staticScaleFactor: 0.5
        },
        majorIC: {
            width: 20,
            height: 20,
            svgName: 'majorIC.svg',
            isBuilding: true,
            scaleFactor: 0.07,
            staticScaleFactor: 0.5
        },
        harbor: {
            width: 20,
            height: 20,
            svgName: 'harbor.svg',
            isBuilding: true,
            scaleFactor: 0.003,
            staticScaleFactor: 0.5
        }
    },
    UI: {
        Chip1: {markerPath: './res/chip.png'},
        Chip10: {markerPath: './res/chip10.png'},
        Chip5: {markerPath: './res/chip5.png'},
        Phases: ['Combat', 'Move', 'Purchase', 'Placement', 'Research',  'Income']
    }

}