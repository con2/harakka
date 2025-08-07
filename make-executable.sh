

#!/usr/bin/env bash
# Grant executable permission to every file in the "scripts" folder.
#
# Usage:
#   ./scripts/make-executable.sh        # marks all files executable
#   ./scripts/make-executable.sh --dry  # shows which files *would* be changed
#
# Options:
#   --dry, -n   Preview changes without modifying permissions.
#   -h, --help  Show this help message.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ---------------- Colours ----------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RESET='\033[0m'
# -----------------------------------------

usage() {
  cat <<EOF
Usage: $(basename "$0") [--dry]

Grants executable permission to every file in the "scripts" directory.

Options:
  --dry, -n     Show what would be changed without modifying permissions.
  -h, --help    Show this help message and exit.
EOF
}

# -------- Argument parsing --------
DRY_RUN=false
case "${1:-}" in
  --dry|-n)
    DRY_RUN=true
    ;;
  -h|--help)
    usage
    exit 0
    ;;
  "")
    ;;
  *)
    echo -e "${RED}❌ Unknown option: $1${RESET}"
    usage
    exit 1
    ;;
esac
# ----------------------------------

echo -e "${YELLOW}📂 Target directory:${RESET} ${SCRIPT_DIR}"

mapfile -t FILES < <(find "${SCRIPT_DIR}" -maxdepth 1 -type f ! -name "$(basename "$0")")

if [[ ${#FILES[@]} -eq 0 ]]; then
  echo "No files found in ${SCRIPT_DIR}."
  exit 0
fi

for file in "${FILES[@]}"; do
  if [[ $DRY_RUN == true ]]; then
    echo "Would run: chmod +x \"${file}\""
  else
    chmod +x "${file}"
    echo -e "${GREEN}✅ chmod +x \"${file}\"${RESET}"
  fi
done

if [[ $DRY_RUN == false ]]; then
  echo -e "${GREEN}🎉 All script files are now executable!${RESET}"
fi