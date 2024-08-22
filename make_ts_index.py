#!/usr/bin/env python3
# %%
import glob
import os
from datetime import datetime
from acdh_tei_pyutils.tei import TeiReader, ET
from acdh_tei_pyutils.utils import extract_fulltext
from tqdm import tqdm
from typesense.api_call import ObjectNotFound
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
        {"name": "notbefore", "type": "int64", "facet": True, "optional": True},
        {"name": "notafter", "type": "int64", "facet": True, "optional": True},
        {"name": "year", "type": "string", "facet": True, "optional": True},
        {"name": "form", "type": "string", "facet": True, "optional": True},
        {"name": "doc_type", "type": "string[]", "facet": True, "optional": True},
        {"name": "liturgy", "type": "string", "facet": True, "optional": True},
        {"name": "provenance", "type": "string[]", "facet": True, "optional": True},
        {"name": "printer", "type": "string", "facet": True, "optional": True},

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


contents = nocontents = []
# %%
# msContents class="#ofm #graduale #sequentiar"
# <objectDesc form="codex">
records = []
cfts_records = []
for xml_filepath in tqdm(files, total=len(files)):
    doc = TeiReader(xml=xml_filepath)
    pages = 0
    xml_file = os.path.basename(xml_filepath)
    html_file = xml_file.replace(".xml", ".html")
    id = os.path.splitext(xml_file)[0]
    r_title = " ".join(
        " ".join(
            doc.any_xpath('.//tei:titleStmt/tei:title[@type="main"]/text()')
        ).split()
    )
    date_str, nb_tst, na_tst = make_date(doc)
    liturgy, doc_type, provenance, form, printer = make_type(doc)


    facs = doc.any_xpath(".//tei:body/tei:div/tei:pb/@facs")
    for v in facs:
        p_group = f".//tei:body/tei:div/tei:ab[preceding-sibling::tei:pb[1]/@facs='{v}']"
        body = doc.any_xpath(p_group)
        cfts_record = {"project": "ofm_graz"}
        record = {}
        if len(body) > 0:
            p_aragraph = doc.any_xpath(p_group)[0]
            ft =  ' '.join(extract_fulltext(p_aragraph).split())
            if len(ft) > 0:
                pid = p_aragraph.xpath("./@facs")[0]
                r = {"id": pid.strip('#'),
                     "resolver": f"/{html_file}",
                     "rec_id": os.path.split(xml_file)[-1],
                     "title":  f"{r_title}",  # + " Page {str(pages)}"
                     "anchor_link": pid,
                     "full_text": ft,
                     "provenance": provenance,
                     "doc_type": doc_type,
                     "liturgy": liturgy,
                     "printer": printer,
                     "form": form,
                     "anchor_link": pid
                     }    
                try:
                    r["year"] = date_str
                    r["notbefore"] = nb_tst
                    r["notafter"] = na_tst
                except ValueError:
                    pass
                records.append(r)
                r["project"]: "ofm_graz"
                cfts_records.append(r)
make_index = client.collections["ofm_graz"].documents.import_(records)
# print(make_index)
print("done with indexing ofm_graz")
# %%
# make_index = CFTS_COLLECTION.documents.import_(cfts_records, {"action": "upsert"})

#make_index = client.collections["ofm_graz"].documents.import_(cfts_records, {"action": "upsert"})
# %%
# print(make_index)
print("done with cfts-index STB")
errors = [msg for msg in make_index if (msg != '"{\\"success\\":true}"' and msg != '""')]
[print(err) if errors else print("No errors") for err in errors]
# %%
