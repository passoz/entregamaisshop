<?php

$enabled = getenv('DOLI_KEYCLOAK_ENABLED');
if ($enabled !== '1') {
    return;
}

$confFile = '/var/www/html/conf/conf.php';
if (file_exists($confFile)) {
    $content = file_get_contents($confFile);
    $needle = "\n\$dolibarr_main_authentication='openid_connect,dolibarr';\n";
    if (strpos($content, $needle) === false) {
        file_put_contents($confFile, rtrim($content) . $needle);
    }
}

$dbHost = getenv('DOLI_DB_HOST') ?: 'dolibarr-db';
$dbPort = getenv('DOLI_DB_HOST_PORT') ?: '3306';
$dbName = getenv('DOLI_DB_NAME') ?: 'dolidb';
$dbUser = getenv('DOLI_DB_USER') ?: 'dolibarr';
$dbPassword = getenv('DOLI_DB_PASSWORD') ?: 'dolibarr';

$keycloakBase = rtrim(getenv('KEYCLOAK_PUBLIC_URL') ?: 'http://localhost:8081', '/');
$realm = getenv('KEYCLOAK_REALM') ?: 'delivery-platform';
$dolibarrPublicURL = rtrim(getenv('DOLIBARR_PUBLIC_URL') ?: 'http://localhost:8088', '/');
$clientId = getenv('DOLIBARR_OIDC_CLIENT_ID') ?: 'dolibarr';
$clientSecret = getenv('DOLIBARR_OIDC_CLIENT_SECRET') ?: '';
$loginClaim = getenv('DOLIBARR_OIDC_LOGIN_CLAIM') ?: 'email';

$constants = array(
    'MAIN_AUTHENTICATION_OIDC_CLIENT_ID' => $clientId,
    'MAIN_AUTHENTICATION_OIDC_CLIENT_SECRET' => $clientSecret,
    'MAIN_AUTHENTICATION_OIDC_AUTHORIZE_URL' => $keycloakBase . '/realms/' . $realm . '/protocol/openid-connect/auth',
    'MAIN_AUTHENTICATION_OIDC_TOKEN_URL' => $keycloakBase . '/realms/' . $realm . '/protocol/openid-connect/token',
    'MAIN_AUTHENTICATION_OIDC_USERINFO_URL' => $keycloakBase . '/realms/' . $realm . '/protocol/openid-connect/userinfo',
    'MAIN_AUTHENTICATION_OIDC_REDIRECT_URL' => $dolibarrPublicURL . '/?openid_mode=true',
    'MAIN_AUTHENTICATION_OIDC_LOGIN_CLAIM' => $loginClaim,
    'MAIN_LOGOUT_GOTO_URL' => $keycloakBase . '/realms/' . $realm . '/protocol/openid-connect/logout?client_id=' . rawurlencode($clientId) . '&post_logout_redirect_uri=' . rawurlencode($dolibarrPublicURL),
    'MAIN_MODULE_FISCALBRIDGE' => '1',
);

$dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $dbHost, $dbPort, $dbName);

for ($i = 0; $i < 20; $i++) {
    try {
        $pdo = new PDO($dsn, $dbUser, $dbPassword, array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
        foreach ($constants as $name => $value) {
            $stmt = $pdo->prepare("INSERT INTO llx_const (name, type, value, note, visible, entity) VALUES (?, 'chaine', ?, '', 0, 1) ON DUPLICATE KEY UPDATE value = VALUES(value)");
            $stmt->execute(array($name, $value));
        }
        break;
    } catch (Throwable $e) {
        sleep(3);
    }
}
