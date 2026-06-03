#!/bin/sh
# Railway (and some Docker runtimes) mount volumes as root after the image
# layers are applied, overriding the chown done at build time. This script
# fixes ownership before dropping to the non-root user.
chown -R appuser:appgroup /app/data 2>/dev/null || true
exec su-exec appuser node server.js
