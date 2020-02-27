var register = function(Handlebars) {
    var helpers = {
    select: function(value, options) {
        return options.fn(this).replace(
            new RegExp(' value=\"' + value + '\"'),
            '$& selected="selected"');
    }
};

if (Handlebars && typeof Handlebars.registerHelper === "function") {
    for (var prop in helpers) {
        Handlebars.registerHelper(prop, helpers[prop]);
    }
} else {
    return helpers;
}

};

module.exports.register = register;
module.exports.helpers = register(null); 