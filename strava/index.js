/**
 * Maps
 */
const YReady = new Promise((resolve) => {
    ymaps.ready(resolve);
});

const randomColor = () => '#' + (~~(Math.random() * 0xefffff) + 0x100000).toString(0x10);

const addLineString = (map, conf = {}) => {
    
    map.geoObjects.add(
        new ymaps.GeoObject({
            'geometry': {
                'type': "LineString",
                'coordinates': conf.coordinates
            },
            'properties': {
                'hintContent': conf.label,
            }   
        }, {
            'strokeColor': conf.color,
            'strokeWidth': 3,
            'strokeOpacity': 0.7
        })
    );
};

let myMap = null;

const init = () => {

    myMap = new ymaps.Map("map", {
        'center': [0.0, 0.0],
        'zoom': 10,
        'controls': ['zoomControl']
    });
};

YReady.then(init);


/**
 * Strava
 */

const get = (url, token) => fetch(url, {
    method: 'GET',
    headers: new Headers({
        Authorization: 'Bearer ' + token
    })
});

const search = [...(new URL(location.href)).searchParams.entries()].reduce((l, [k, e])=>({...l, [k]: e}), {});

if (search.code) {

    let token = null;

    fetch(
        'https://www.strava.com/oauth/token?' + [{
            client_id: 29536,
            client_secret: '37c9da3a9b91852ab74f08d70259d5be24ca7a48',
            code: search.code,
            grant_type: 'authorization_code'
        }]
        .reduce((x,o)=>(Object.entries(o)), 0)
        .map(([k,e])=>k+'='+e)
        .join('&'),
        {
            method: 'POST'
        }
    )
    .then(e => e.json())
    .then(e => (
        token = e.access_token,
        get('https://www.strava.com/api/v3/athlete/activities?per_page=99'.replace('{id}', e.athlete.id), token)
    ))
    .then(e => e.json())
    .then(list => list
        .filter(e => e.type === 'Ride')
        .forEach(({ id, name, type, start_date, distance, elapsed_time, map }, i) => {

            const coordinates = polyline.decode(map.summary_polyline);

            addLineString(myMap, {
                coordinates,
                'label': `
                    ${name}
                    <div style="color: grey">${start_date}</div>
                    <div style="color: grey">${distance} km. ${elapsed_time / 60 /60} hrs.</div>
                `,
                'color': 'rgba(255, 0, 0, 0.5)' // randomColor()
            });

            myMap.setBounds(myMap.geoObjects.getBounds());
        })
    )
} else {
    location.href = 'https://www.strava.com/oauth/authorize?' + [{
        client_id: 29536,
        redirect_uri: location.href.split('?')[0],
        response_type: 'code',
        scope: 'read,activity:read_all,profile:read_all,read_all'
    }]
    .reduce((x,o)=>(Object.entries(o)), 0)
    .map(([k,e])=>k+'='+e)
    .join('&')
}