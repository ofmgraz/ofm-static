#!/usr/bin/env python3
# %%
import glob
import os
from datetime import datetime
from acdh_tei_pyutils.tei import TeiReader
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
        {"name": "persons", "type": "string[]", "facet": True, "optional": True},

    ],
}


# %%
try:
    client.collections["ofm_graz"].delete()
except ObjectNotFound:
    pass

# %%
# client.collections["STB"].delete()

# %%
client.collections.create(current_schema)


# ent_type="person", ent_node="person", ent_name="persName", index_file=persons_idx, modifier='@type="label"'
# %% person ??person  persName
def get_entities(ent_type, ent_node, ent_name, index_file, modifier):
    entities = []
    e_path = f'.//tei:rs[@type="{ent_type}"]/@ref'
    for p in body:
        ent = p.xpath(e_path, namespaces={"tei": "http://www.tei-c.org/ns/1.0"})
        ref = [ref.replace("#", "") for e in ent if len(ent) > 0 for ref in e.split()]
        for r in ref:
            p_path = f'.//tei:{ent_node}[@xml:id="{r}"]//tei:{ent_name}[{modifier}][1]'
            en = index_file.any_xpath(p_path)
            if en:
                entity = " ".join(" ".join(en[0].xpath(".//text()")).split())
                if len(entity) != 0:
                    entities.append(entity)
                else:
                    with open("log-entities.txt", "a") as f:
                        f.write(f"{r} in {record['id']}\n")
    return [ent for ent in sorted(set(entities))]



def make_date(doc):
    if nb_str := doc.any_xpath("//tei:bibl/tei:date/@notBefore"):
        nb_str = date_str = nb_str[0]
        na_str = doc.any_xpath("//tei:bibl/tei:date/@notAfter")[0]
    elif nb_str := doc.any_xpath("//tei:bibl/tei:date/@when"):
        nb_str = na_str = date_str = nb_str[0]
    elif date_str := doc.any_xpath("//tei:bibl/tei:date/text()"):
        date_str = date_str[0].split("--")[0]
        if len(date_str) > 3:
            na_str = nb = date_str
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
    provenance = doc.any_xpath("//tei:provenance/placeName/text()")
    if liturgy := doc.any_xpath("//tei:classDecl/tei:taxonomy[@xml:id='liturgies']/tei:catDesc/text()"):
        liturgy = liturgy[0]
    else:
        liturgy = ""
    genre = doc.any_xpath("//tei:classDecl/tei:taxonomy[@xml:id='booktypes']/tei:catDesc/text()")
    if form := doc.any_xpath("//tei:objectDesc/@form"):
        form = form[0]
    else:
        form = ""
    return liturgy, genre, provenance, form

contents = nocontents = []
# %%
# msContents class="#ofm #graduale #sequentiar"
# <objectDesc form="codex">
records = []
cfts_records = []
for xml_filepath in tqdm(files, total=len(files)):
    doc = TeiReader(xml=xml_filepath)
    facs = doc.any_xpath(".//tei:body/tei:div/tei:pb/@facs")
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
    liturgy, doc_type, provenance, form = make_type(doc)
    for v in facs:
        # p_group = f".//tei:body/tei:div/tei:p[preceding-sibling::tei:pb[1]/@facs='{v}']|"\
        #    f".//tei:body/tei:div/tei:lg[preceding-sibling::tei:pb[1]/@facs='{v}']"
        p_group = f".//tei:body/tei:div/tei:lb[following-sibling::tei:ab[1]/@facs='{v}']|"\
            f".//tei:body/tei:div/tei:lb[following-sibling::tei:pb[1]/@facs='{v}']"
        p_group = f".//tei:body/tei:div/tei:ab/tei:lb"
        p_group = f".//tei:body/tei:div/tei:pb[@facs='{v}']"
        body = doc.any_xpath(p_group)
        pages += 1
        cfts_record = {
            "project": "ofm_graz",
        }
        record = {}
        record["id"] = id
        cfts_record["id"] = id
        cfts_record["resolver"] = f"/{html_file}"
        record["rec_id"] = os.path.split(xml_file)[-1]
        cfts_record["rec_id"] = record["rec_id"]
        record["title"] = f"{r_title}"  # + " Page {str(pages)}"
        cfts_record["title"] = record["title"]
        try:
            record["year"] = cfts_record["year"] = date_str
            record["notbefore"] = cfts_record["notbefore"] = nb_tst
            record["notafter"] = cfts_record["notafter"] = na_tst
        except ValueError:
            pass
        record["provenance"] = provenance
        cfts_record["provenance"] = provenance
        record["doc_type"] = doc_type
        cfts_record["doc_type"] = doc_type
        record["liturgy"] = liturgy
        cfts_record["liturgy"] = liturgy

        record["form"] = form
        cfts_record["form"] = form
        if paragraph := doc.any_xpath(".//tei:body/tei:div/tei:ab"):
            paragraph = paragraph[0]
            full_text = extract_fulltext(paragraph)
            record["full_text"] = full_text
            cfts_record["full_text"] = full_text
            anchor_link = t.xpath("./@facs")[0]
            record["anchor_link"] = anchor_link
            cfts_record["anchor_link"] = anchor_link
            records.append(record)
            cfts_records.append(cfts_record)
make_index = client.collections["ofm_graz"].documents.import_(records)
# print(make_index)
print("done with indexing ofm_graz")
# %%
# make_index = CFTS_COLLECTION.documents.import_(cfts_records, {"action": "upsert"})

make_index = client.collections["ofm_graz"].documents.import_(cfts_records, {"action": "upsert"})
# %%
#print(make_index)
print("done with cfts-index STB")
errors = [msg for msg in make_index if (msg != '"{\\"success\\":true}"' and msg != '""')]
[print(err) if errors else print("No errors") for err in errors]
# %%
