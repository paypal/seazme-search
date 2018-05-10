'use strict';

//TODO: why dev and prod middleware "view engines" use "dust" and "js" and there is copy paste?
module.exports = function IndexModel() {
    return function (req) {
        return {"name2": "unknown"};
    }
};
