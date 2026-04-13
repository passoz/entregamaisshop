<?php

require_once DOL_DOCUMENT_ROOT . '/core/modules/DolibarrModules.class.php';

class modFiscalBridge extends DolibarrModules
{
    public function __construct($db)
    {
        global $langs, $conf;

        $this->db = $db;
        $this->numero = 106240;
        $this->rights_class = 'fiscalbridge';
        $this->family = 'interface';
        $this->module_position = '90';
        $this->name = preg_replace('/^mod/i', '', get_class($this));
        $this->description = 'Bridge fino entre o Dolibarr e o modulo fiscal externo em Go.';
        $this->version = '0.1.0';
        $this->const_name = 'MAIN_MODULE_' . strtoupper($this->name);
        $this->picto = 'technic';

        $this->module_parts = array(
            'hooks' => array('invoicecard', 'ordercard', 'admin'),
        );

        $this->config_page_url = array('setup.php@fiscalbridge');
        $this->dirs = array('/fiscalbridge/temp');

        $this->rights = array();
        $r = 0;
        $this->rights[$r][0] = 1062401;
        $this->rights[$r][1] = 'Visualizar bridge fiscal';
        $this->rights[$r][4] = 'read';
        $r++;
        $this->rights[$r][0] = 1062402;
        $this->rights[$r][1] = 'Configurar bridge fiscal';
        $this->rights[$r][4] = 'write';
        $r++;
    }

    public function init($options = '')
    {
        return $this->_init(array(), $options);
    }

    public function remove($options = '')
    {
        return $this->_remove(array(), $options);
    }
}
