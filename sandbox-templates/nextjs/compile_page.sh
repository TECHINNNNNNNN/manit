#!/bin/bash

# This script starts a simple HTTP server for serving static files
echo "Starting HTTP server on port 3000..."
cd /home/user && python3 -m http.server 3000