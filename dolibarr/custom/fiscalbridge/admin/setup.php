<?php

require '../../main.inc.php';
require_once DOL_DOCUMENT_ROOT . '/core/lib/admin.lib.php';
require_once '../lib/fiscalbridge.lib.php';

if (!$user->admin) {
    accessforbidden();
}

$action = GETPOST('action', 'alpha');

if ($action === 'save') {
    dolibarr_set_const($db, 'FISCALBRIDGE_API_BASE_URL', trim(GETPOST('FISCALBRIDGE_API_BASE_URL', 'alphanohtml')), 'chaine', 0, '', $conf->entity);
    dolibarr_set_const($db, 'FISCALBRIDGE_GUI_BASE_URL', trim(GETPOST('FISCALBRIDGE_GUI_BASE_URL', 'alphanohtml')), 'chaine', 0, '', $conf->entity);
    dolibarr_set_const($db, 'FISCALBRIDGE_API_TOKEN', trim(GETPOST('FISCALBRIDGE_API_TOKEN', 'alphanohtml')), 'chaine', 0, '', $conf->entity);
    dolibarr_set_const($db, 'FISCALBRIDGE_ENTITY_MAP', trim(GETPOST('FISCALBRIDGE_ENTITY_MAP', 'alphanohtml')), 'chaine', 0, '', $conf->entity);
    setEventMessages('Configuracao do bridge fiscal atualizada.', null, 'mesgs');
}

$page_name = 'FiscalBridgeSetup';
llxHeader('', $page_name);

$linkback = '<a href="' . DOL_URL_ROOT . '/admin/modules.php?restore_lastsearch_values=1">' . $langs->trans('BackToModuleList') . '</a>';
print load_fiche_titre('Fiscal Bridge', $linkback, 'technic');

$head = fiscalbridgeAdminPrepareHead();
print dol_get_fiche_head($head, 'settings', 'FiscalBridge', -1, 'technic');

print '<form method="post" action="' . $_SERVER['PHP_SELF'] . '">';
print '<input type="hidden" name="action" value="save">';

print '<table class="noborder centpercent">';
print '<tr class="liste_titre"><td colspan="2">Bridge do modulo fiscal externo</td></tr>';

print '<tr><td class="fieldrequired">URL base da API fiscal</td><td><input class="minwidth500" type="text" name="FISCALBRIDGE_API_BASE_URL" value="' . dol_escape_htmltag(getDolGlobalString('FISCALBRIDGE_API_BASE_URL')) . '"></td></tr>';
print '<tr><td>URL da GUI fiscal</td><td><input class="minwidth500" type="text" name="FISCALBRIDGE_GUI_BASE_URL" value="' . dol_escape_htmltag(getDolGlobalString('FISCALBRIDGE_GUI_BASE_URL')) . '"></td></tr>';
print '<tr><td>Token da API</td><td><input class="minwidth500" type="text" name="FISCALBRIDGE_API_TOKEN" value="' . dol_escape_htmltag(getDolGlobalString('FISCALBRIDGE_API_TOKEN')) . '"></td></tr>';
print '<tr><td>Mapa de entidade</td><td><input class="minwidth500" type="text" name="FISCALBRIDGE_ENTITY_MAP" value="' . dol_escape_htmltag(getDolGlobalString('FISCALBRIDGE_ENTITY_MAP')) . '" placeholder="1=matriz-rj,2=filial-sp"></td></tr>';

print '</table>';
print '<div class="tabsAction">';
print '<button class="butAction" type="submit">Salvar</button>';
print '</div>';
print '</form>';

print '<div class="opacitymedium">';
print '<p>Este bridge expoe a configuracao minima para o Dolibarr abrir o simulador fiscal externo e compartilhar parametros de integracao.</p>';
print '<p>O motor fiscal completo roda fora do ERP, em Go, e deve receber payloads comerciais para calcular, persistir snapshot e conduzir emissao.</p>';
print '</div>';

print dol_get_fiche_end();
llxFooter();
$db->close();
