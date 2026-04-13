<?php

function fiscalbridgeAdminPrepareHead()
{
    global $langs, $conf;

    $langs->loadLangs(array('admin'));

    $head = array();
    $head[] = array(
        dol_buildpath('/custom/fiscalbridge/admin/setup.php', 1),
        'Configuracao',
        'settings',
    );

    return $head;
}
