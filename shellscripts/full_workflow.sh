#!/bin/bash
./shellscripts/script.sh
./fetch_data.sh
ant
./pyscripts/update_favicons.py
./pyscripts/make_translations.py
