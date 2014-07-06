# Copyright (c) James Percent. All rights reserved.
# Redistribution and use in source and binary forms, with or without modification,
# are permitted provided that the following conditions are met:
#
#    1. Redistributions of source code must retain the above copyright notice,
#       this list of conditions and the following disclaimer.
#    
#    2. Redistributions in binary form must reproduce the above copyright
#       notice, this list of conditions and the following disclaimer in the
#       documentation and/or other materials provided with the distribution.
#
#    3. The names of contributors may not be used to endorse or promote products
#       derived from this software without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
# ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
# ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
from foneem import parse_config, hvb_connect_db, hvb_close_db
import csv
import re

__author__ = 'jpercent'


class SentenceMeta(object):
    def __init__(self, id, sentence, phonetic):
        self.id = id
        self.sentence = sentence
        self.phonetic = phonetic
        self.phonemes = set([])


def insert_phonemes(phonemes, f):
    for phoneme, id in phonemes.items():
        phoneme_insert = 'insert into phonemes(id, symbol) values('+str(id)+",\'"+str(phoneme)+"\');"
        f.write(phoneme_insert+'\n')



def insert_sentence_phoneme_join_table(phoneme_map, sentence_meta_list, f):
    for sentence_meta in sentence_meta_list:
        for phoneme in list(sentence_meta.phonemes):
            join_table_insert = 'insert into sentence_phoneme(sentence_id, phoneme_id) values('+\
                                str(sentence_meta.id)+','+str(phoneme_map[phoneme])+');'
            f.write(join_table_insert+'\n')


#(3234, 'He_saw_Meg_coming.', '0BHXII<c3>{H}SSAO<c4>{H}MMEHGG<c3>{H}HKAHMM<c1>{HL-}IXNX0E<a6>{L%0}')
# 0BHXII<c3>{H}SSAO<c4>{H}MMEHGG<c3>{H}HKAHMM<c1>{HL-}IXNX0E<a6>{L%0}
# 0B HX II <c3>{H} SS AO <c4>{H} MM EH GG <c3>{H} HK AH MM <c1>{HL-} IX NX 0E<a6>{L%0}
# 0B HX II SS AO MM EH GG HK AH MM IX NX 0E
# HX II SS AO MM EH GG HK AH MM IX NX
def parse_phonemes(meta, phoneme_set):
    remove_brackets =  r'{[^}]*}'
    remove_angle_brackets = r'<[^>]*>'
    partial_parse = re.sub(remove_brackets, '', meta.phonetic)
    partial_parse1 = re.sub(remove_angle_brackets, '', partial_parse)
    assert partial_parse1[0:2] == '0B'
    partial_parse2 = partial_parse1[2:]
    assert partial_parse2[(len(partial_parse2)-2):] == '0E'
    parsed = partial_parse2[:(len(partial_parse2)-2)]
    assert len(parsed) % 2 == 0
    i = 0
    while i < len(parsed):
        phoneme = parsed[i:i+2]
        phoneme_set.add(phoneme)
        meta.phonemes.add(phoneme)
        i += 2


def generate_sentence_metadata(conn, cursor, dml_filepath):
    #conf = parse_config()
    #conn, cursor = hvb_connect_db(conf['db'])
    cursor.execute("""select id, sentence, phonetic from sentences;""")
    sentence_tuples = cursor.fetchall()
    sentence_meta_list = []
    phoneme_set = set([])
    for id, sentence, phonetic in sentence_tuples:
        sentence_meta = SentenceMeta(id, sentence, phonetic)
        parse_phonemes(sentence_meta, phoneme_set)
        sentence_meta_list.append(sentence_meta)

    phoneme_map = {}
    id = 0
    for phoneme in list(phoneme_set):
        phoneme_map[phoneme] = id
        id += 1

    f = open(dml_filepath, "w+")
    insert_phonemes(phoneme_map, f)
    insert_sentence_phoneme_join_table(phoneme_map, sentence_meta_list, f)


def execute_sql(filename, cursor, conn):
    cursor.execute(open(filename, "r").read())
    conn.commit()


def create_sentences_table(csv_filename, cursor, conn):
    id = 0
    with open(csv_filename, 'rU') as csvfile:
        reader = csv.reader(csvfile)
        first_row = True
        for row in reader:
            if first_row:
                schema = row
                print("schema ", schema)
                first_row = False
            else:
                row[1] = row[1].replace('_', ' ')
                cursor.execute("""insert into sentences(id, filename, sentence, phonetic, phonemes, flag) values (%s, %s, %s, %s, %s, %s);""",
                               (str(id), row[0], row[1], row[2], "nothing", row[3]))
                id += 1
        conn.commit()


if __name__ == '__main__':
    conf = parse_config()
    conn, cursor = hvb_connect_db(conf['db'])
    filename = conf['csv']
    execute_sql(conf['drop'], cursor, conn)
    execute_sql(conf['create'], cursor, conn)
    execute_sql(conf['vocalid'], cursor, conn)
    create_sentences_table(filename, cursor, conn)
    #generate_sentence_metadata(conn, cursor, conf['phoneme_dml'])
    execute_sql(conf['phoneme_dml'], cursor, conn)
    execute_sql(conf['grid_dml'], cursor, conn)
    hvb_close_db(conn, cursor)

