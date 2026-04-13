<?php

class ActionsFiscalBridge
{
    public $resprints;
    public $results = array();
    public $errors = array();

    public function addMoreActionsButtons($parameters, &$object, &$action, $hookmanager)
    {
        if (empty($object) || empty($object->id)) {
            return 0;
        }

        $contexts = explode(':', (string) $parameters['context']);
        if (!in_array('ordercard', $contexts, true) && !in_array('invoicecard', $contexts, true)) {
            return 0;
        }

        $baseUrl = trim(getDolGlobalString('FISCALBRIDGE_GUI_BASE_URL'));
        if (empty($baseUrl)) {
            return 0;
        }

        $target = rtrim($baseUrl, '/') . '/documents/new?source=dolibarr'
            . '&object_type=' . urlencode($object->element)
            . '&object_id=' . urlencode($object->id)
            . '&object_ref=' . urlencode($object->ref);

        print '<a class="butAction" target="_blank" rel="noopener noreferrer" href="' . dol_escape_htmltag($target) . '">Fiscal Externo</a>';
        return 0;
    }
}
