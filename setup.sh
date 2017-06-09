#!/bin/bash
command -v brew >/dev/null 2>&1 || { echo >&2 "Missing hombrew - installing it now..."; /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"; }

command -v node >/dev/null 2>&1 || { echo >&2 "Missing node - installing it now..."; brew install node; }
command -v npm >/dev/null 2>&1 || { echo >&2 "Missing npm - installing it now..."; curl -L https://www.npmjs.com/install.sh | sh; }
command -v ncu >/dev/null 2>&1 || { echo >&2 "Missing ncu - installing it now..."; npm i -g npm-check-updates; }
command -v concurrently >/dev/null 2>&1 || { echo >&2 "Missing concurrently - installing it now..."; npm i -g concurrently; }

command -v python >/dev/null 2>&1 || { echo >&2 "Missing python - installing it now..."; brew install python; }
command -v pip >/dev/null 2>&1 || { echo >&2 "Missing pip - installing it now..."; sudo easy_install pip; }

if [ -f requirements.txt ]; then
  pip install -r requirements.txt
fi

command -v ruby >/dev/null 2>&1 || { echo >&2 "Missing rubuy - installing it now..."; brew install ruby; }
command -v rake >/dev/null 2>&1 || { echo >&2 "Missing rake - installing it now..."; gem install rake; }

REBUILD=1;

if [ -d "node_modules" ]
then
  echo "The project has already been built. Would you like to rebuild?"
  select yn in "Yes" "No"; do
    case $yn in
      Yes ) break;;
      No ) REBUILD=0; break;;
    esac
  done
fi

if [ $REBUILD -eq 1 ]
then
  npm install
fi
