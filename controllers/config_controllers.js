const scrape_cienciavitae = require("./scrape_cienciavitae");
const scrape = require("./scrape");
const user = require("./user");
const appmenu = require("./appmenu");
const search = require("./search");
const curriculo = require("./curriculo");
const curriculo_actividade = require("./curriculo_actividade");
const curriculo_distincao = require("./curriculo_distincao");
const curriculo_formacao = require("./curriculo_formacao");
const curriculo_percurso_profissional = require("./curriculo_percurso_profissional");
const curriculo_producao = require("./curriculo_producao");
const curriculo_projecto = require("./curriculo_projecto");
const curriculo_proeficiencia_idioma = require("./curriculo_proeficiencia_idioma");
const report_definition = require("./report_definition");

module.exports = {
    scrape_cienciavitae : scrape_cienciavitae,
    scrape : scrape,
    user : user,
    appmenu : appmenu,
    search : search,
    curriculo : curriculo,
    curriculo_actividade : curriculo_actividade,
    curriculo_distincao : curriculo_distincao,
    curriculo_formacao : curriculo_formacao,
    curriculo_percurso_profissional : curriculo_percurso_profissional,
    curriculo_producao : curriculo_producao,
    curriculo_projecto : curriculo_projecto,
    curriculo_proeficiencia_idioma : curriculo_proeficiencia_idioma,
    report_definition : report_definition
}