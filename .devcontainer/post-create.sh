#!/bin/bash

npm install -g @anthropic-ai/claude-code
npm install -g prettier
npm install -g baedal

if [ -f /workspaces/baedal/.env ]; then
  grep -v '^#' /workspaces/baedal/.env | sed 's/^/export /' >> ~/.bashrc
fi
