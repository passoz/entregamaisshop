FROM quay.io/keycloak/keycloak:26.1
COPY realm/delivery-platform-realm.json /opt/keycloak/data/import/delivery-platform-realm.json
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start-dev", "--import-realm", "--http-port=8080"]
