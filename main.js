const distance = ([lat1, lon1], [lat2, lon2]) => {
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
    .then(text => {
        return text.split(/[\n\r]+/).filter(e => e);
    });

Object.defineProperty(Array.prototype, 'first', {get () {return this[0];}});
Object.defineProperty(Array.prototype, 'last', {get () {return this.length && this[this.length - 1] || undefined}});
// Object.defineProperty(Array.prototype, 'shuffle', {'value': function () {return this.sort(() => Math.random() - .5)}});

const init = tracks => {

    var myMap = new ymaps.Map("map", {
        'center': [0.0, 0.0],
        'zoom': 10,
        'controls': ['zoomControl']
    });

    tracks = tracks.map(name => fetch('./' + name)
        .then(resp => resp.text())
        .then(raw => {
            let el = document.createElement('div');
            el.innerHTML = raw;
            const name = el.children[0].children[1].children[0].innerText;
            // const date = new Date(el.children[0].children[0].children[0].innerText);
            const date = el.children[0].children[0].children[0].innerText.replace(/[TZ]/g, ' ');
            const segments = [...el.children[0].children[1].children[2].children];
            let data = segments
                .map(item => ([
                    parseFloat(item.attributes[0].value),
                    parseFloat(item.attributes[1].value),
                ]));

            const dist = data.reduce((res, item) => ({
                'sum': (res.prev
                    ? res.sum + distance(res.prev, item)
                    : res.sum
                ),
                'prev': item
            }), {'sum': 0}).sum.toFixed(2);
            
            const duration = ((new Date(segments.last.children[1].innerText) - new Date(segments.first.children[1].innerText)) / 36e5).toFixed(2)
            
            var myGeoObject = new ymaps.GeoObject({
                'geometry': {
                    'type': "LineString",
                    'coordinates': data
                },
                'properties': {
                    'hintContent': `
                        ${name}
                        <div style="color: grey">${date}</div>
                        <div style="color: grey">${dist} km. ${duration} hrs.</div>
                    `,
                }   
            }, {
                'draggable': true,
                'strokeColor': randomColor(),
                'strokeWidth': 3,
                'strokeOpacity': 0.7
            });
        
            myMap.geoObjects.add(myGeoObject);
        }));

    Promise.all(tracks)
        .then(() => {
            myMap.setBounds(myMap.geoObjects.getBounds());
        });
};

Promise.all([
    getFileList,
    YReady
]).then(([tracks]) => init(tracks));