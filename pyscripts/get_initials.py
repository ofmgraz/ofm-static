#!/usr/bin/env python3
import glob
from collections import defaultdict
from acdh_tei_pyutils.tei import TeiReader

results = defaultdict(list)

# Define the target values
target_values = {"initiale_fleuro_lombarde", "initiale_historich"}

# Iterate over all XML files in the specified directory
for file_path in glob.glob('data/editions/*.xml'):
    doc = TeiReader(file_path)
    file_name = file_path.split('/')[-1]
    
    # Find all relevant tei:zone and tei:ab elements
    zones = doc.any_xpath('//tei:zone[@type or @subtype]')
    abs = doc.any_xpath('//tei:ab[@type or @subtype]')
    
    # Process tei:zone elements
    for zone in zones:
        zone_type = zone.get('type')
        zone_subtype = zone.get('subtype')
        if zone_type in target_values or zone_subtype in target_values:
            graphic = zone.getprevious().find('.//tei:graphic', namespaces=doc.nsmap)
            if graphic is not None:
                url = graphic.get('url')
                if url not in results[file_name]:
                    results[file_name].append(url)
    
    # Process tei:ab elements
    for ab in abs:
        ab_type = ab.get('type')
        ab_subtype = ab.get('subtype')
        if ab_type in target_values or ab_subtype in target_values:
            graphic = ab.find('.//tei:graphic', namespaces=doc.nsmap)
            if graphic is not None:
                url = graphic.get('url')
                if url not in results[file_name]:
                    results[file_name].append(url)
    
    # Sort the URLs based on tei:surface/@xml:id
    results[file_name].sort(key=lambda url: doc.any_xpath(f'//tei:graphic[@url="{url}"]/ancestor::tei:surface/@xml:id')[0])

# Print the results
for file_name, urls in results.items():
    print(f"{file_name}: {urls}")