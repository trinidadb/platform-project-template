#!/bin/sh
set -e

# --- Universal Setup ---
# This script works both inside and outside Docker.

if [ -f /.dockerenv ]; then
  echo "Running inside Docker container..."
  TEMPLATE_DIR="/opt/keycloak/custom-scripts"
  OUTPUT_DIR="/opt/keycloak/data/import"
  # Docker provides the environment variables
else
  echo "Running on local machine..."
  # Load variables from .env file if it exists
  if [ -f "$(dirname "$0")/../.env" ]; then
    set -a # Automatically export all variables
    . "$(dirname "$0")/../.env"
    set +a
  else
    echo "Warning: .env file not found. Using existing environment variables."
  fi
  TEMPLATE_DIR="$(dirname "$0")" # Assumes script is in ./keycloak
  OUTPUT_DIR="$TEMPLATE_DIR"
fi

TEMPLATE_FILE="${TEMPLATE_DIR}/${KEYCLOAK_REALM_NAME}-template.json"
OUTPUT_FILE="${OUTPUT_DIR}/${KEYCLOAK_REALM_NAME}-realm.json"

# --- Template Substitution using sed ---
# First, copy the template to the output file
cp "$TEMPLATE_FILE" "$OUTPUT_FILE"
# Then, use sed to replace each placeholder in the new file
sed -i "s|\${KEYCLOAK_REALM_NAME}|${KEYCLOAK_REALM_NAME}|g" "$OUTPUT_FILE"
sed -i "s|\${KEYCLOAK_CLIENT_NAME}|${KEYCLOAK_CLIENT_NAME}|g" "$OUTPUT_FILE"
sed -i "s|\${KEYCLOAK_CLIENT_SECRET}|${KEYCLOAK_CLIENT_SECRET}|g" "$OUTPUT_FILE"

echo "Successfully generated ${OUTPUT_FILE} from template using sed."
# --- Execution ---
# Only try to start Keycloak if we are in Docker
if [ -f /.dockerenv ]; then
  echo "Executing Keycloak start command..."
  # "$@" passes along the `command` from docker-compose (e.g., "start-dev")
  exec /opt/keycloak/bin/kc.sh "$@"
else
  echo "Script finished for local execution."
fi