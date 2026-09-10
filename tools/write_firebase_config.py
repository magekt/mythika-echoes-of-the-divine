#!/usr/bin/env python3
"""Write the deploy-only Firebase config without committing credentials."""

import argparse
import json
import os
from pathlib import Path
import sys


FIELDS = {
    "apiKey": "FIREBASE_API_KEY",
    "authDomain": "FIREBASE_AUTH_DOMAIN",
    "projectId": "FIREBASE_PROJECT_ID",
    "storageBucket": "FIREBASE_STORAGE_BUCKET",
    "messagingSenderId": "FIREBASE_MESSAGING_SENDER_ID",
    "appId": "FIREBASE_APP_ID",
    "measurementId": "FIREBASE_MEASUREMENT_ID",
}
REQUIRED_ENV = tuple(value for key, value in FIELDS.items() if key != "measurementId")


def main():
    parser = argparse.ArgumentParser(
        description="Generate the ignored Firebase config used by local Pages builds."
    )
    parser.add_argument(
        "--output",
        default="src/engine/firebase-config.js",
        help="output path (default: src/engine/firebase-config.js)",
    )
    args = parser.parse_args()

    missing = [name for name in REQUIRED_ENV if not os.environ.get(name)]
    if missing:
        print(
            "Missing Firebase deployment variables: " + ", ".join(missing),
            file=sys.stderr,
        )
        return 1

    config = {key: os.environ.get(env_name, "") for key, env_name in FIELDS.items()}
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        "// Generated during verification/deployment; do not commit.\n"
        "window.FIREBASE_CONFIG = "
        + json.dumps(config, indent=2, sort_keys=True)
        + ";\n\n"
        "const SAVE_COLLECTION = \"game_saves\";\n",
        encoding="utf-8",
    )
    print("Wrote Firebase deployment config to " + str(output))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
