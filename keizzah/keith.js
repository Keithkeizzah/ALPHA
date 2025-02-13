
var tabCmds = [];
let cm = [];

function keith(obj, fonctions) {
    let infoComs = obj;

    if (!obj.categorie) {
        infoComs.categorie = "General";
    }
    if (!obj.reaction) {
        infoComs.reaction = "⚔️";
    }
    if (!obj.desc) {
        infoComs.desc = "Hello World!!";
    }

    infoComs.fonction = fonctions;
    cm.push(infoComs);

    // console.log('chargement...')
    return infoComs;
}

module.exports = { keith, Module: keith, cm };
