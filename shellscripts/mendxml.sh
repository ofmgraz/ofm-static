#!/bin/bash
for teifile in data/editions/*xml; do
awk '
{
    # Capture the last seen _number_number only if the ID matches the expected format
    if ($0 ~ /xml:id="facs_[0-9]+_(TextRegion|region)_[0-9]+_[0-9]+"/) {
        match($0, /xml:id="facs_([0-9]+)_(TextRegion|region)_([0-9]+_[0-9]+)"/, arr)
        last_facs = arr[1]      # Extract facs_<number>
        last_suffix = arr[3]    # Extract _number_number
    }
    # Reset last_suffix if the ID does not follow the expected pattern (e.g., facs_4_r)
    else if ($0 ~ /xml:id="facs_[0-9]+_[a-zA-Z]+"/) {
        last_suffix = ""
    }

    # Replace only facs_*_tl_ when there is a valid last_suffix
    if ($0 ~ /xml:id="facs_[0-9]+_tl_"/ && last_facs != "" && last_suffix != "") {
        sub(/xml:id="facs_[0-9]+_tl_"/, "xml:id=\"facs_" last_facs "_tl_" last_suffix "\"")
    }

    print
}' $teifile > tmp.xml
	mv tmp.xml  $teifile
done
rm -f tmp.xml

