# bin/bash

echo "fetching transkriptions from data_repo"
rm -rf data/editions
rm -rf data/indices && mkdir data/indices
rm -rf data/meta && mkdir data/meta
curl -LO https://github.com/ofmgraz/transkribus-out/archive/refs/heads/main.zip
unzip main
mv ./transkribus-out-main/tei ./data/editions

curl -LO https://github.com/ofmgraz/ofm-para-text/archive/refs/heads/main.zip
unzip main
mv ./ofm-para-text-main/data/meta ./data/

rm main.zip
rm -rf ./transkribus-out-main
