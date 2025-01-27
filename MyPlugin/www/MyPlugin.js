var exec = require('cordova/exec');

exports.location = function (success, error) {
    console.log('Plugin Attivato');
    
    if (cordova && cordova.plugins && cordova.plugins.MyPlugin) {
        exec(
            (data) => {
                success(data);
            },
            error,
            'MyPlugin',
            'getLocation',
            []
        );
    } else {
        console.error('Plugin MyPlugin non trovato');
    }
};
