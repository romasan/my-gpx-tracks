const calcDistance = ([lat1, lon1], [lat2, lon2]) => {
    const {sin, cos, acos, PI} = Math;
	const radlat1 = PI * lat1 / 180;
	const radlat2 = PI * lat2 / 180;
	const theta = lon1 - lon2;
    const radtheta = PI * theta / 180;
	let dist = sin(radlat1) * sin(radlat2) + cos(radlat1) * cos(radlat2) * cos(radtheta);
    dist = dist > 1 ? 1 : dist;
	dist = acos(dist);
	dist = dist * 180 / PI;
    dist = dist * 60 * 1.1515;
    dist = dist * 1.60934;
	return dist;
};

const randomColor = () => '#' + (~~(Math.random() * 0xefffff) + 0x100000).toString(0x10);

const YReady = new Promise((resove) => {
    ymaps.ready(resove);
});

const getFileList = fetch('./tracks.list')
    .then(resp => resp.text())
    .then(text => text.split(/[\n\r]+/).filter(e => e));

const handleFileSelect = e => new Promise(resolve => {

    let file = e.target.files[0];

    const reader = new FileReader();

    reader.onload = e => {
        resolve(e.target.result);
    };

    if (file.name.includes('.gpx')) {
        reader.readAsText(file);
    }
});

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
            'draggable': true,
            'strokeColor': conf.color,
            'strokeWidth': 3,
            'strokeOpacity': 0.7
        })
    );
};

const parseGPX = raw => {
    let el = document.createElement('div');
    el.innerHTML = raw;
    const label = el.children[0].children[1].children[0].innerText;
    const date = el.children[0].children[0].children[0].innerText.replace(/[TZ]/g, ' ');
    const segments = [...el.children[0].children[1].children[2].children];
    let coordinates = segments
        .map(item => ([
            parseFloat(item.attributes[0].value),
            parseFloat(item.attributes[1].value),
        ]));

    const distance = coordinates.reduce((res, item) => ({
        'sum': (res.prev
            ? res.sum + calcDistance(res.prev, item)
            : res.sum
        ),
        'prev': item
    }), {'sum': 0}).sum.toFixed(2);
    
    const duration = ((
        new Date(segments[segments.length - 1].children[1].innerText) -
        new Date(segments[0].children[1].innerText)
    ) / 36e5).toFixed(2);

    return {coordinates, label, date, distance, duration};
};

const init = tracks => {

    var myMap = new ymaps.Map("map", {
        'center': [0.0, 0.0],
        'zoom': 10,
        'controls': ['zoomControl']
    });

    document.querySelector('input').addEventListener('change', e => {
        handleFileSelect(e)
            .then(raw => {

                const {coordinates, label, date, distance, duration} = parseGPX(raw);

                addLineString(myMap, {
                    coordinates,
                    'label': `
                        ${label}
                        <div style="color: grey">${date}</div>
                        <div style="color: grey">${distance} km. ${duration} hrs.</div>
                    `,
                    'color': randomColor()
                });

                myMap.setBounds(myMap.geoObjects.getBounds());
            })
    }, false);

    tracks = tracks.map(name => fetch(name)
        .then(resp => resp.text())
        .then(raw => {

            if (raw) {

                const {coordinates, label, date, distance, duration} = parseGPX(raw);

                addLineString(myMap, {
                    coordinates,
                    'label': `
                        ${label}
                        <div style="color: grey">${date}</div>
                        <div style="color: grey">${distance} km. ${duration} hrs.</div>
                    `,
                    'color': randomColor()
                });
            }

        }));

    Promise.all(tracks)
        .then(() => {
            const bounds = myMap.geoObjects.getBounds();
            bounds && myMap.setBounds(bounds);
        });
};

Promise.all([
    getFileList,
    YReady
]).then(([tracks]) => init(tracks));