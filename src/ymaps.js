/**
 * YMaps
 */

const YReady = new Promise((resolve) => {
    ymaps.ready(resolve);
});

const randomColor = () => '#' + (~~(Math.random() * 0xefffff) + 0x100000).toString(0x10);

export const createLine = (conf = {}) => {
    
    const o = new ymaps.GeoObject({
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
        'strokeOpacity': 0.5
    });

    o.events.add("hover", e => {
        e.originalEvent.target.options.set('strokeColor', "#0000ff");
        e.originalEvent.target.options.set('strokeOpacity', 1);
        e.originalEvent.target.options.set('zIndex', 999);
    });

    o.events.add("mouseleave", e => {
        e.originalEvent.target.options.set('strokeColor', "#ff0000");
        e.originalEvent.target.options.set('strokeOpacity', 0.5);
        e.originalEvent.target.options.set('zIndex', 0);
    });

    return o;
};

export let Ymap = null;
export let collection = null;

const init = () => {

    Ymap = new ymaps.Map('ymap', {
        'center': [0.0, 0.0],
        'zoom': 10,
        'controls': ['zoomControl']
    });

    ymaps.geolocation.get({
        provider: 'browser',
        mapStateAutoApply: true
    }).then(result => {
        result.geoObjects.options.set('preset', 'islands#blueCircleIcon');
        Ymap.geoObjects.add(result.geoObjects);
    });

    Ymap.controls.add('rulerControl');
    Ymap.controls.add('typeSelector');

    collection = new ymaps.GeoObjectCollection();
    Ymap.geoObjects.add(collection);
};

YReady.then(init);