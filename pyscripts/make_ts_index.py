#!/usr/bin/env python3
# %%
import glob
import os
from datetime import datetime
from acdh_tei_pyutils.tei import TeiReader
from acdh_tei_pyutils.utils import extract_fulltext
from tqdm import tqdm
from typesense.api_call import ObjectNotFound
import re
# It needs the OS variable TYPESENSE_API_KEY to be set
# Additional vars: TYPESENSE_HOST, TYPESENSE_PORT, TYPESENSE_PROTOCOL.
# Default: http://typesense.acdh-dev.oeaw.ac.at/, "https", "443"
# TYPESENSE_READ_KEY VSMye2GdRZvBRkpYnjXMUfZpOCiSOFLO

from acdh_cfts_pyutils import TYPESENSE_CLIENT as client
# from acdh_cfts_pyutils import CFTS_COLLECTION

files = glob.glob("./data/editions/*.xml")
dateformat = "%Y-%m-%d"
# %%
current_schema = {
    "name": "ofm_graz",
    "fields": [
        {"name": "id", "type": "string"},
        {"name": "rec_id", "type": "string"},
        {"name": "title", "type": "string"},
        {"name": "anchor_link", "type": "string"},
        {"name": "full_text", "type": "string", "optional": True},
        {"name": "context", "type": "string", "optional": True},
        {"name": "notbefore", "type": "int64", "facet": True, "optional": True},
        {"name": "notafter", "type": "int64", "facet": True, "optional": True},
        {"name": "year", "type": "string", "facet": True, "optional": True},
        {"name": "form", "type": "string", "facet": True, "optional": True},
        {"name": "doc_type", "type": "string[]", "facet": True, "optional": True},
        {"name": "liturgy", "type": "string", "facet": True, "optional": True},
        {"name": "provenance", "type": "string[]", "facet": True, "optional": True},
        {"name": "printer", "type": "string", "facet": True, "optional": True},
        {"name": "bildid", "type": "string", "facet": False, "optiona": False },
    ],
}

try:
    client.collections["ofm_graz"].delete()
except ObjectNotFound:
    pass

client.collections.create(current_schema)


def make_date(doc):
    if nb_str := doc.any_xpath("//tei:bibl/tei:date/@notBefore"):
        nb_str = date_str = nb_str[0]
        na_str = doc.any_xpath("//tei:bibl/tei:date/@notAfter")[0]
    elif nb_str := doc.any_xpath("//tei:bibl/tei:date/@when"):
        nb_str = na_str = date_str = nb_str[0]
    elif date_str := doc.any_xpath("//tei:bibl/tei:date/text()"):
        date_str = date_str[0].split("--")[0]
        if len(date_str) > 3:
            na_str = nb_str = date_str
        else:
            date_str = na_str = nb_str = "1970-12-31"
    else:
        nb_str = "1300-01-01"
        na_str = "1799-12-31"
        date_str = "2024-04-02"
    nb_tst = int(datetime.strptime(nb_str, "%Y-%m-%d").timestamp())
    na_tst = int(datetime.strptime(na_str, "%Y-%m-%d").timestamp())
    return date_str, nb_tst, na_tst


def make_type(doc):
    formen = {"print": "Druck", "codex": "Handschrift"}
    provenance = doc.any_xpath("//tei:provenance/tei:placeName/text()")
    if liturgy := doc.any_xpath(".//tei:taxonomy[@xml:id='liturgies']/tei:category/tei:catDesc/text()"):
        liturgy = liturgy[0]
    else:
        liturgy = ""
    genre = doc.any_xpath(".//tei:taxonomy[@xml:id='booktypes']/tei:category/tei:catDesc/text()")
    if form := doc.any_xpath(".//tei:objectDesc/@form"):
        form = formen[form[0]]
    else:
        form = ""
    if printer := doc.any_xpath(".//tei:standOff/tei:listPerson/tei:person/tei:persName/*/text()"):
        printer = " ".join(printer)
    else:
        printer = ""
    return liturgy, genre, provenance, form, printer


def prepare_text(text):
    text = re.sub('\-\s*\n\s*', '', extract_fulltext(text))
    return ' '.join(text.split())

duplicates = {}
contents = nocontents = []
records = []
cfts_records = []
for xml_filepath in tqdm(files, total=len(files)):
    print(xml_filepath)
    doc = TeiReader(xml=xml_filepath)
    pages = 0
    xml_file = os.path.basename(xml_filepath)
    html_file = xml_file.replace(".xml", ".html")
    id = os.path.splitext(xml_file)[0]
    r_title = " ".join(doc.any_xpath('.//tei:titleStmt/tei:title[@type="desc"]/text()'))
    date_str, nb_tst, na_tst = make_date(doc)
    liturgy, doc_type, provenance, form, printer = make_type(doc)

    facs = doc.any_xpath(".//tei:body/tei:div/tei:ab[not(@type='notation')]/@facs")
    for v in facs:
        pids = []
        duplicates[xml_filepath] = []
        p_group = f".//tei:ab[not(@type='notation')]/tei:lb[starts-with(@facs, '{v}')]"
        body = doc.any_xpath(p_group)
        cfts_record = {"project": "ofm_graz"}
        record = {}
        if len(body) > 0:
            # Get context from the ab element
            context_xpath = f".//tei:ab[not(@type='notation') and @facs='{v}']"
            context_elem = doc.any_xpath(context_xpath)[0]
            context = ' '.join((context_elem.text or '').split())
            for child in context_elem:
                if child.tail:
                    context += ' ' + ' '.join(child.tail.split())
            
            for p_aragraph in body:
                #ft = prepare_text(p_aragraph)
                ft = p_aragraph.tail.strip()
                if len(ft) > 0:
                    #print(ft, v)
                    pid = p_aragraph.xpath("./@facs")[0]
                    if pid in pids:
                        duplicates[xml_filepath].append(pid)
                    else:
                        pids.append(pid)
                    r = {"id": f"{id}_{pid.strip('#')}",
                         "resolver": f"{html_file}",
                         "rec_id": os.path.split(xml_file)[-1],
                         "title":  f"{r_title}",  # + " Page {str(pages)}"
                         "anchor_link": pid,
                         "full_text": ft,
                         "provenance": provenance,
                         "doc_type": doc_type,
                         "liturgy": liturgy,
                         "printer": printer,
                         "form": form,
                         "bildid": v ,
                         "context": context,
                         }
                    try:
                        r["year"] = date_str
                        r["notbefore"] = nb_tst
                        r["notafter"] = na_tst
                    except ValueError:
                        pass
                    records.append(r)
                    r["project"] = "ofm_graz"
                    cfts_records.append(r)
make_index = client.collections["ofm_graz"].documents.import_(records)
print("done with indexing ofm_graz")
errors = [msg for msg in make_index if (msg != '"{\\"success\\":true}"' and msg != '""')]
[print(err) if errors else print("No errors") for err in errors]

for i in duplicates:
    print(f"{i}: {duplicates[i]}")
