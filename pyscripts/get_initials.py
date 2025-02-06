#!/usr/bin/env python3
import glob
from collections import defaultdict
from acdh_tei_pyutils.tei import TeiReader
import json
import os

# Remove this line as we'll only create entries when needed:
# results = defaultdict(list)

# Replace with:
results = {}

# Define the target values
target_values = {"initiale_fleuro_lombarde", "initiale_historich"}

# Iterate over all XML files in the specified directory
for file_path in glob.glob('data/editions/*.xml'):
    print(file_path)
    doc = TeiReader(file_path)
    file_name = os.path.splitext(file_path.split('/')[-1])[0]  # Changed this line to remove .xml
    
    # Find all relevant tei:zone and tei:ab elements
    zones = doc.any_xpath('//tei:zone[@type or @subtype]')
    abs = doc.any_xpath('//tei:ab[@type or @subtype]')
    
    # Process tei:zone elements
    for zone in zones:
        zone_type = zone.get('type')
        zone_subtype = zone.get('subtype')
        if zone_type in target_values or zone_subtype in target_values:
            # Look for graphic in previous sibling first
            prev_sibling = zone.getprevious()
            graphic = None
            if prev_sibling is not None:
                graphic = prev_sibling.find('.//tei:graphic', namespaces=doc.nsmap)
            # If not found, look in parent's previous sibling
            if graphic is None and zone.getparent() is not None:
                parent_prev = zone.getparent().getprevious()
                if parent_prev is not None:
                    graphic = parent_prev.find('.//tei:graphic', namespaces=doc.nsmap)
            
            if graphic is not None:
                url = graphic.get('url')
                if url:  # Only proceed if url is not None/empty
                    if file_name not in results:
                        results[file_name] = []
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
                if url:  # Only proceed if url is not None/empty
                    if file_name not in results:
                        results[file_name] = []
                    if url not in results[file_name]:
                        results[file_name].append(url)
    
    # Only sort if the file has results
    if file_name in results and results[file_name]:
        results[file_name].sort(key=lambda url: doc.any_xpath(f'//tei:graphic[@url="{url}"]/ancestor::tei:surface/@xml:id')[0])

# Print only non-empty results
for file_name, urls in results.items():
    if urls:  # Only print if there are URLs
        print(f"{file_name}: {urls}")

# Save results to JSON file
output_file = "html/js/initials.json"  # Fixed path
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print(f"Results saved to {output_file}")